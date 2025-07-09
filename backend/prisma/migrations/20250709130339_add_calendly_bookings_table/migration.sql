-- CreateTable
CREATE TABLE "calendly_bookings" (
    "id" SERIAL NOT NULL,
    "zoho_record_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendly_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "calendly_bookings_zoho_record_id_key" ON "calendly_bookings"("zoho_record_id");
