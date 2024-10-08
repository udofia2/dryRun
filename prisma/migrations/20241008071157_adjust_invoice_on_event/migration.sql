/*
  Warnings:

  - You are about to drop the column `event_id` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `contract_id` on the `PaymentSchedule` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_event_id_fkey";

-- DropForeignKey
ALTER TABLE "PaymentSchedule" DROP CONSTRAINT "PaymentSchedule_contract_id_fkey";

-- DropIndex
DROP INDEX "Invoice_event_id_key";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "event_id";

-- AlterTable
ALTER TABLE "PaymentSchedule" DROP COLUMN "contract_id";
