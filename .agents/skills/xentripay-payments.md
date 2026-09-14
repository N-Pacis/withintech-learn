# Skill: XentriPay payments

## Where this lives
- `apps/api/src/services/xentripay.service.ts` — XentriPay API client.
- `apps/api/src/routes/payments/payments.service.ts` — payment business logic (creating payments, handling status updates, unlocking access).

## Config
- `XENTRIPAY_API_KEY` — never log it, never send it to the client, never commit a real value.
- `XENTRIPAY_BASE_URL` — points at XentriPay's test or live environment depending on deploy target.

## Rules
- All XentriPay calls happen server-side, only from the files above. Never call XentriPay from `apps/web`.
- Payment status is a fixed state machine: `pending` → `paid` / `failed` / `expired`. Reuse these statuses; don't invent new ones.
- Course or certificate access unlocks off the *confirmed* payment status stored in Postgres, never off a client-supplied flag or query param.
- If XentriPay sends a callback/webhook, verify it server-side before trusting it — don't update payment status from an unverified request.
- When touching this flow, check `apps/api/prisma/schema.prisma` for the actual Payment model fields before assuming a shape.
