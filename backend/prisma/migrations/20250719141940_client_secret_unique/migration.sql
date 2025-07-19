/*
  Warnings:

  - A unique constraint covering the columns `[client_secret]` on the table `stripe_payments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "stripe_payments_client_secret_key" ON "stripe_payments"("client_secret");
