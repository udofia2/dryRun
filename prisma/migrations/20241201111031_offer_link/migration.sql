/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Offer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[offer_link]` on the table `Offer` will be added. If there are existing duplicate values, this will fail.
  - The required column `token` was added to the `Offer` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "offer_link" TEXT,
ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Offer_token_key" ON "Offer"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_offer_link_key" ON "Offer"("offer_link");
