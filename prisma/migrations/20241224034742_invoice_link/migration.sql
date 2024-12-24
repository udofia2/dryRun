/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invoice_link]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "invoice_link" TEXT,
ADD COLUMN     "token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_token_key" ON "Invoice"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoice_link_key" ON "Invoice"("invoice_link");
