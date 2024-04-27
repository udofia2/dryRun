/*
  Warnings:

  - You are about to drop the column `client_email` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `prospect_id` on the `Offer` table. All the data in the column will be lost.
  - Added the required column `client_email` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_client_email_fkey";

-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_prospect_id_fkey";

-- DropIndex
DROP INDEX "Offer_prospect_id_key";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "client_email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "client_email",
DROP COLUMN "prospect_id";

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "Client"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
