/*
  Warnings:

  - You are about to drop the column `offer_id` on the `Specification` table. All the data in the column will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Specification" DROP CONSTRAINT "Specification_offer_id_fkey";

-- DropIndex
DROP INDEX "Specification_offer_id_key";

-- AlterTable
ALTER TABLE "Specification" DROP COLUMN "offer_id";

-- DropTable
DROP TABLE "Payment";

-- CreateTable
CREATE TABLE "PaymentStructure" (
    "id" TEXT NOT NULL,
    "structure" "PAYMENTSTRUCTURE" NOT NULL,
    "initial_deposit" BOOLEAN NOT NULL DEFAULT false,
    "initial_deposit_amount" DOUBLE PRECISION,
    "offer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentStructure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentStructure_offer_id_key" ON "PaymentStructure"("offer_id");

-- AddForeignKey
ALTER TABLE "PaymentStructure" ADD CONSTRAINT "PaymentStructure_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
