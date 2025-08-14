/*
  Warnings:

  - You are about to drop the `checkout_clients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `checkout_invoice_items` table. If the table is not empty, all the data it contains will be lost.

*/

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "customer_email" TEXT;
