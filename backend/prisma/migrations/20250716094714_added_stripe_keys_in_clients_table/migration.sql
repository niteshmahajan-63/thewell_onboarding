-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "amount" TEXT,
ADD COLUMN     "pandadoc_agreement_completed" TEXT,
ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "stripe_payment_completed" TEXT;
