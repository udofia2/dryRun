/*
  Warnings:

  - You are about to drop the column `client_id` on the `Offer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[client_email]` on the table `Offer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `client_email` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_client_id_fkey";

-- DropIndex
DROP INDEX "Offer_client_id_key";

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "client_id",
ADD COLUMN     "client_email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_email_idx" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_client_email_key" ON "Offer"("client_email");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "Client"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
