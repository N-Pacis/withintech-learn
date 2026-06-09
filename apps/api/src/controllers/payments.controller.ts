import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { badRequest } from "../utils/errors";
import * as service from "../routes/payments/payments.service";
import { listPaymentsSchema } from "../routes/payments/payments.schemas";

export const postInitiatePayment = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.initiatePayment({
    userId: req.user!.userId,
    ...req.body,
  });
  sendSuccess(res, result, "Payment initiated — check your phone", 201);
});

export const getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getPaymentStatus(req.params.txId, req.user!.userId);
  sendSuccess(res, result);
});

export const getSyncPendingPayments = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.syncPendingPayments(req.user!.userId);
  sendSuccess(res, result);
});

export const getListPayments = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listPaymentsSchema.safeParse(req.query);
  if (!parsed.success) throw badRequest(parsed.error.errors[0]?.message ?? "Validation error");
  const result = await service.listPayments(parsed.data);
  sendSuccess(res, result);
});
