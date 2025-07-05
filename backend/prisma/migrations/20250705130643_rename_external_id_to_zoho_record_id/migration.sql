/*
  Warnings:

  - You are about to drop the column `external_id` on the `clients` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[zoho_record_id]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `zoho_record_id` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "clients_external_id_key";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "external_id",
ADD COLUMN     "zoho_record_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clients_zoho_record_id_key" ON "clients"("zoho_record_id");
