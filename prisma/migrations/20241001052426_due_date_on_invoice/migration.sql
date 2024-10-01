/*
  Warnings:

  - Added the required column `due_date` to the `PaymentDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentDetails" ADD COLUMN     "due_date" TIMESTAMP(3) NOT NULL;
