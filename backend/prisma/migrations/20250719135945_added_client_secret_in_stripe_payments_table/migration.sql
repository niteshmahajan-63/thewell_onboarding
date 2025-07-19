/*
  Warnings:

  - Added the required column `client_secret` to the `stripe_payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stripe_payments" ADD COLUMN     "client_secret" TEXT NOT NULL,
ALTER COLUMN "payment_date" DROP NOT NULL,
ALTER COLUMN "payment_status" DROP NOT NULL,
ALTER COLUMN "payment_id" DROP NOT NULL,
ALTER COLUMN "payment" DROP NOT NULL,
ALTER COLUMN "amount" DROP NOT NULL,
ALTER COLUMN "payment_source" DROP NOT NULL;
