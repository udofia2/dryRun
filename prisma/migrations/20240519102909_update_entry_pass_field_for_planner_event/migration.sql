/*
  Warnings:

  - Added the required column `name` to the `EntryPass` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EntryPass" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "transfer_processing_fee_to_guest" BOOLEAN NOT NULL DEFAULT false;
