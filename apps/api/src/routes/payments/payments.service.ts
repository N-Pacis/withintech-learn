import { prisma } from "../../db/prisma";
import { badRequest, conflict, notFound } from "../../utils/errors";
import * as xentripay from "../../services/xentripay.service";
import { sendReceiptEmail } from "../../services/email.service";

type PaymentType = "COURSE_ACCESS" | "CERTIFICATE";

// ─── Shared helper ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applySuccessfulPayment = async (
  tx: any,
  paymentId: string,
  type: PaymentType,
  userId: string,
  courseId: string,
  paidAt: Date,
) => {
  await tx.payment.update({ where: { id: paymentId }, data: { status: "PAID", paidAt } });

  if (type === "COURSE_ACCESS") {
    await tx.studentCourse.upsert({
      where: { studentId_courseId: { studentId: userId, courseId } },
      create: { studentId: userId, courseId, status: "ENROLLED" },
      update: { status: "ENROLLED" },
    });
  } else if (type === "CERTIFICATE") {
    await Promise.all([
      tx.certificate.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: { userId, courseId },
        update: {},
      }),
      tx.studentCourse.upsert({
        where: { studentId_courseId: { studentId: userId, courseId } },
        create: { studentId: userId, courseId, status: "PASSED" },
        update: { status: "PASSED" },
      }),
    ]);
  }
};

// ─── initiatePayment ──────────────────────────────────────────────────────────

export const initiatePayment = async ({
  userId,
  courseId,
  type,
  phone,
  provider,
}: {
  userId: string;
  courseId: string;
  type: PaymentType;
  phone: string;
  provider: "MTN" | "AIRTEL";
}) => {
  const [course, user] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  if (!course) throw notFound("Course not found");
  if (!user) throw notFound("User not found");
  if (course.status !== "published") throw badRequest("Course is not available");

  const amount = type === "COURSE_ACCESS" ? course.price : course.certificatePrice;
  if (!amount || amount < 100) throw badRequest("This course does not require payment for the requested type");

  // Certificate payment requires completing the course first — status must be
  // PASSED (set by completeCourse) before a certificate can be purchased.
  if (type === "CERTIFICATE") {
    const enrollment = await prisma.studentCourse.findUnique({
      where: { studentId_courseId: { studentId: userId, courseId } },
      select: { status: true },
    });
    if (!enrollment) throw badRequest("You must be enrolled in this course before purchasing a certificate");
    if (enrollment.status !== "PASSED") throw badRequest("You must complete the course before purchasing a certificate");
  }

  const existing = await prisma.payment.findFirst({
    where: {
      userId,
      courseId,
      type,
      OR: [
        { status: "PAID" },
        { status: "PENDING", expiresAt: { gt: new Date() } },
      ],
    },
  });
  if (existing?.status === "PAID") throw conflict("You have already paid for this");
  if (existing?.status === "PENDING") {
    return { transactionId: existing.xentripayRefId };
  }

  const { refid } = await xentripay.initiateCollection({
    amount,
    phone,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
  });

  await prisma.payment.create({
    data: {
      userId,
      courseId,
      type,
      amount,
      xentripayRefId: refid,
      phoneNumber: phone,
      paymentProvider: provider,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  return { transactionId: refid };
};

// ─── getPaymentStatus ─────────────────────────────────────────────────────────

export const getPaymentStatus = async (transactionId: string, userId: string) => {
  const payment = await prisma.payment.findFirst({
    where: { xentripayRefId: transactionId, userId },
    select: {
      id: true,
      status: true,
      amount: true,
      type: true,
      courseId: true,
      course: { select: { slug: true, title: true } },
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });
  if (!payment) throw notFound("Payment not found");

  if (payment.status === "PENDING") {
    const remoteStatus = await xentripay.checkCollectionStatus(transactionId);

    if (remoteStatus === "SUCCESS") {
      const paidAt = new Date();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.$transaction(async (tx: any) =>
        applySuccessfulPayment(tx, payment.id, payment.type as PaymentType, userId, payment.courseId, paidAt)
      );

      sendReceiptEmail({
        firstName: payment.user.firstName,
        lastName: payment.user.lastName,
        email: payment.user.email,
        courseTitle: payment.course.title,
        courseSlug: payment.course.slug,
        userId,
        type: payment.type,
        amount: payment.amount,
        refid: transactionId,
        paidAt,
      }).catch((err) => console.error("Receipt email failed:", err));

      return { ...payment, status: "PAID" as const };
    }

    if (remoteStatus === "FAILED") {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
      return { ...payment, status: "FAILED" as const };
    }
  }

  return payment;
};

// ─── syncPendingPayments ──────────────────────────────────────────────────────

export interface SyncedPayment {
  transactionId: string;
  status: "PAID" | "FAILED" | "PENDING";
  type: PaymentType;
  courseSlug: string;
  courseTitle: string;
}

export const syncPendingPayments = async (userId: string): Promise<SyncedPayment[]> => {
  const pending = await prisma.payment.findMany({
    where: { userId, status: "PENDING" },
    select: {
      id: true,
      type: true,
      amount: true,
      courseId: true,
      xentripayRefId: true,
      course: { select: { slug: true, title: true } },
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  if (pending.length === 0) return [];

  const results = await Promise.allSettled(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pending.map(async (payment: any): Promise<SyncedPayment> => {
      const remoteStatus = await xentripay.checkCollectionStatus(payment.xentripayRefId);

      if (remoteStatus === "SUCCESS") {
        const paidAt = new Date();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await prisma.$transaction(async (tx: any) =>
          applySuccessfulPayment(tx, payment.id, payment.type as PaymentType, userId, payment.courseId, paidAt)
        );

        sendReceiptEmail({
          firstName: payment.user.firstName,
          lastName: payment.user.lastName,
          email: payment.user.email,
          courseTitle: payment.course.title,
          courseSlug: payment.course.slug,
          userId,
          type: payment.type,
          amount: payment.amount,
          refid: payment.xentripayRefId,
          paidAt,
        }).catch((err) => console.error("Receipt email failed:", err));

        return { transactionId: payment.xentripayRefId, status: "PAID", type: payment.type as PaymentType, courseSlug: payment.course.slug, courseTitle: payment.course.title };
      }

      if (remoteStatus === "FAILED") {
        await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
        return { transactionId: payment.xentripayRefId, status: "FAILED", type: payment.type as PaymentType, courseSlug: payment.course.slug, courseTitle: payment.course.title };
      }

      return { transactionId: payment.xentripayRefId, status: "PENDING", type: payment.type as PaymentType, courseSlug: payment.course.slug, courseTitle: payment.course.title };
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settled = results as any[];
  return settled
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value as SyncedPayment);
};

// ─── listPayments ─────────────────────────────────────────────────────────────

export const listPayments = async ({
  page,
  limit,
  status,
  type,
  courseId,
  userId,
}: {
  page: number;
  limit: number;
  status?: string;
  type?: string;
  courseId?: string;
  userId?: string;
}) => {
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (courseId) where.courseId = courseId;
  if (userId) where.userId = userId;

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    }),
  ]);

  return { total, page, limit, payments };
};
