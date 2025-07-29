/*
  Warnings:

  - You are about to drop the column `invoice_id` on the `checkout_clients` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[client_secret]` on the table `checkout_clients` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `client_secret` to the `checkout_clients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "checkout_clients" DROP COLUMN "invoice_id",
ADD COLUMN     "client_secret" TEXT NOT NULL,
ADD COLUMN     "stripe_invoice_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "checkout_clients_client_secret_key" ON "checkout_clients"("client_secret");
