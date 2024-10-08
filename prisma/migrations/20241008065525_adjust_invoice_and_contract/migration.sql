/*
  Warnings:

  - You are about to drop the column `invoice_id` on the `PaymentDetails` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contract_id]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contract_id` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PaymentDetails" DROP CONSTRAINT "PaymentDetails_invoice_id_fkey";

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "contract_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PaymentDetails" DROP COLUMN "invoice_id",
ADD COLUMN     "contractId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_contract_id_key" ON "Invoice"("contract_id");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentDetails" ADD CONSTRAINT "PaymentDetails_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
