import { prisma } from "../../db/prisma";
import { badRequest, conflict, notFound } from "../../utils/errors";
import * as xentripay from "../../services/xentripay.service";
import { sendReceiptEmail } from "../../services/email.service";

export const initiatePayment = async ({
  userId,
  courseId,
  type,
  phone,
  provider,
}: {
  userId: string;
  courseId: string;
  type: "COURSE_ACCESS" | "CERTIFICATE";
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

  const existing = await prisma.payment.findFirst({
    where: { userId, courseId, type, status: { in: ["PENDING", "PAID"] } },
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

  // For pending payments, poll XentriPay and update status in real time
  if (payment.status === "PENDING") {
    const remoteStatus = await xentripay.checkCollectionStatus(transactionId);

    if (remoteStatus === "SUCCESS") {
      const paidAt = new Date();
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "PAID", paidAt },
        });

        if (payment.type === "COURSE_ACCESS") {
          await tx.studentCourse.upsert({
            where: { studentId_courseId: { studentId: userId, courseId: payment.courseId } },
            create: { studentId: userId, courseId: payment.courseId, status: "ENROLLED" },
            update: { status: "ENROLLED" },
          });
        } else if (payment.type === "CERTIFICATE") {
          await Promise.all([
            tx.certificate.upsert({
              where: { userId_courseId: { userId, courseId: payment.courseId } },
              create: { userId, courseId: payment.courseId },
              update: {},
            }),
            tx.studentCourse.update({
              where: { studentId_courseId: { studentId: userId, courseId: payment.courseId } },
              data: { status: "PASSED" },
            }),
          ]);
        }
      });

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
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      return { ...payment, status: "FAILED" as const };
    }
  }

  return payment;
};

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
