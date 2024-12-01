/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Offer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[offer_link]` on the table `Offer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `offer_link` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "offer_link" TEXT NOT NULL,
ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Offer_token_key" ON "Offer"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_offer_link_key" ON "Offer"("offer_link");
