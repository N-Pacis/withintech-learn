import { z } from "zod";

export const initiatePaymentSchema = z.object({
  courseId: z.string().uuid(),
  type: z.enum(["COURSE_ACCESS", "CERTIFICATE"]),
  phone: z.string().regex(/^07\d{8}$/, "Phone must be a valid Rwanda number (07XXXXXXXX)"),
  provider: z.enum(["MTN", "AIRTEL"]),
});

export const listPaymentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["PENDING", "PAID", "FAILED", "EXPIRED"]).optional(),
  type: z.enum(["COURSE_ACCESS", "CERTIFICATE"]).optional(),
  courseId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
});
