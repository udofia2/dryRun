/*
  Warnings:

  - Added the required column `client_email` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "client_email" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "Client"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
