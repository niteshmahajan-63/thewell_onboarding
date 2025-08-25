/*
  Warnings:

  - You are about to drop the `checkout_clients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `checkout_invoice_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "checkout_invoice_items" DROP CONSTRAINT "checkout_invoice_items_checkoutClientId_fkey";

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "deactivated_link" TEXT;

-- DropTable
DROP TABLE "checkout_clients";

-- DropTable
DROP TABLE "checkout_invoice_items";
