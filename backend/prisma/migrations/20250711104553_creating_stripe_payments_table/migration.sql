-- CreateTable
CREATE TABLE "stripe_payments" (
    "id" SERIAL NOT NULL,
    "zoho_record_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "payment_status" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "payment" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_source" TEXT NOT NULL,
    "invoice_id" TEXT,
    "hosted_invoice_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stripe_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stripe_payments_zoho_record_id_key" ON "stripe_payments"("zoho_record_id");
