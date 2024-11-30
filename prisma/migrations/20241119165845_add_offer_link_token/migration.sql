/*
  Warnings:

  - You are about to drop the column `client_email` on the `Offer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_client_email_fkey";

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "client_email";
