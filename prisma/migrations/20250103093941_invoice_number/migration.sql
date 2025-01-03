/*
  Warnings:

  - A unique constraint covering the columns `[invoice_no]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "invoice_no" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoice_no_key" ON "Invoice"("invoice_no");
