/*
  Warnings:

  - A unique constraint covering the columns `[invoice_id]` on the table `PaymentDetails` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invoice_id]` on the table `Specification` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Contract" ALTER COLUMN "contract_link" DROP NOT NULL,
ALTER COLUMN "token" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "contract_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PaymentDetails" ADD COLUMN     "invoice_id" TEXT;

-- AlterTable
ALTER TABLE "Specification" ADD COLUMN     "invoice_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentDetails_invoice_id_key" ON "PaymentDetails"("invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "Specification_invoice_id_key" ON "Specification"("invoice_id");

-- AddForeignKey
ALTER TABLE "Specification" ADD CONSTRAINT "Specification_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentDetails" ADD CONSTRAINT "PaymentDetails_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
