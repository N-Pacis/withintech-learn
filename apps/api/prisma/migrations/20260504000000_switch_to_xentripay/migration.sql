-- Switch payment gateway from IremboPay to XentriPay.
-- Handles two cases:
--   1. Fresh DB (shadow DB / new environment): creates the Payment table with xentripayRefId
--   2. Existing DB with old IremboPay columns: renames + drops obsolete columns

DO $$
BEGIN

  -- ── CASE 1: Payment table does not exist yet (fresh / shadow DB) ──────────
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Payment'
  ) THEN

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentType') THEN
      CREATE TYPE "PaymentType" AS ENUM ('COURSE_ACCESS', 'CERTIFICATE');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
      CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED');
    END IF;

    CREATE TABLE "Payment" (
      "id"              TEXT          NOT NULL,
      "userId"          TEXT          NOT NULL,
      "courseId"        TEXT          NOT NULL,
      "type"            "PaymentType" NOT NULL,
      "status"          "PaymentStatus" NOT NULL DEFAULT 'PENDING',
      "amount"          DOUBLE PRECISION NOT NULL,
      "currency"        TEXT          NOT NULL DEFAULT 'RWF',
      "xentripayRefId"  TEXT          NOT NULL,
      "phoneNumber"     TEXT,
      "paymentProvider" TEXT,
      "paymentMethod"   TEXT,
      "paymentReference" TEXT,
      "paidAt"          TIMESTAMP(3),
      "expiresAt"       TIMESTAMP(3),
      "createdAt"       TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"       TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
    );

  -- ── CASE 2: Table exists with old IremboPay column names ─────────────────
  ELSE

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Payment'
        AND column_name = 'irembopayTransactionId'
    ) THEN
      ALTER TABLE "Payment" RENAME COLUMN "irembopayTransactionId" TO "xentripayRefId";
      DROP INDEX IF EXISTS "Payment_irembopayTransactionId_key";
    END IF;

    DROP INDEX IF EXISTS "Payment_irembopayInvoiceNumber_idx";

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Payment'
        AND column_name = 'irembopayInvoiceNumber'
    ) THEN
      ALTER TABLE "Payment" DROP COLUMN "irembopayInvoiceNumber";
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Payment'
        AND column_name = 'paymentLinkUrl'
    ) THEN
      ALTER TABLE "Payment" DROP COLUMN "paymentLinkUrl";
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Payment'
        AND column_name = 'webhookPayload'
    ) THEN
      ALTER TABLE "Payment" DROP COLUMN "webhookPayload";
    END IF;

  END IF;

END $$;

-- Add foreign keys and indexes (idempotent) ───────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_xentripayRefId_key" ON "Payment"("xentripayRefId");
CREATE INDEX IF NOT EXISTS "Payment_userId_courseId_idx"        ON "Payment"("userId", "courseId");
CREATE INDEX IF NOT EXISTS "Payment_status_idx"                 ON "Payment"("status");
