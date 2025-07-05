-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "deal_id" TEXT,
    "deal_name" TEXT,
    "contact_id" TEXT,
    "contact_name" TEXT,
    "company_id" TEXT,
    "company_name" TEXT,
    "pandadoc_id" TEXT,
    "agreement_id" TEXT,
    "agreement_name" TEXT,
    "agreement_required" TEXT,
    "payment_link" JSONB,
    "stripe_required" TEXT,
    "intake_meeting_required" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_external_id_key" ON "clients"("external_id");
