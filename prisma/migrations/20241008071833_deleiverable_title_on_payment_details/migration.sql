/*
  Warnings:

  - Added the required column `title_of_deliverable` to the `PaymentDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentDetails" ADD COLUMN     "title_of_deliverable" TEXT NOT NULL;
