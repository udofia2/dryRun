/*
  Warnings:

  - A unique constraint covering the columns `[offer_id]` on the table `Specification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `offer_id` to the `Specification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PAYMENTSTRUCTURE" AS ENUM ('lump_sum', 'per_specification');

-- AlterTable
ALTER TABLE "Specification" ADD COLUMN     "offer_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "client_id" TEXT NOT NULL,
    "prospect_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "exhibitor_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "structure" "PAYMENTSTRUCTURE" NOT NULL,
    "initial_deposit" BOOLEAN NOT NULL DEFAULT false,
    "initial_deposit_amount" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Offer_client_id_key" ON "Offer"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_prospect_id_key" ON "Offer"("prospect_id");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_event_id_key" ON "Offer"("event_id");

-- CreateIndex
CREATE INDEX "Offer_id_idx" ON "Offer"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Specification_offer_id_key" ON "Specification"("offer_id");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "Prospect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_exhibitor_id_fkey" FOREIGN KEY ("exhibitor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specification" ADD CONSTRAINT "Specification_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
