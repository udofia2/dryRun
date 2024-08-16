/*
  Warnings:

  - You are about to drop the column `description` on the `Cancellation` table. All the data in the column will be lost.
  - You are about to drop the column `policy` on the `Cancellation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cancellation" DROP COLUMN "description",
DROP COLUMN "policy";
