-- CreateTable
CREATE TABLE "checkout_clients" (
    "id" SERIAL NOT NULL,
    "zoho_record_id" TEXT NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "subscription_scheduled_days" TEXT,
    "invoice_id" TEXT,
    "invoice_name" TEXT,
    "payment_source" TEXT,
    "payment_date" TIMESTAMP(3),
    "stripe_payment_id" TEXT,
    "payment_status" TEXT,
    "crm_payment_record_id" TEXT,
    "invoice_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkout_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkout_invoice_items" (
    "id" SERIAL NOT NULL,
    "zoho_record_id" TEXT NOT NULL,
    "invoice_item_id" TEXT NOT NULL,
    "stripe_price_id" TEXT,
    "stripe_product_id" TEXT,
    "product_name" TEXT,
    "amount" TEXT,
    "quantity" TEXT,
    "product_description" TEXT,
    "stripe_discount_id" TEXT,
    "zc_display_value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "checkoutClientId" INTEGER NOT NULL,

    CONSTRAINT "checkout_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "checkout_clients_zoho_record_id_key" ON "checkout_clients"("zoho_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "checkout_invoice_items_zoho_record_id_key" ON "checkout_invoice_items"("zoho_record_id");

-- AddForeignKey
ALTER TABLE "checkout_invoice_items" ADD CONSTRAINT "checkout_invoice_items_checkoutClientId_fkey" FOREIGN KEY ("checkoutClientId") REFERENCES "checkout_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
