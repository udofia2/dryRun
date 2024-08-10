-- DropForeignKey
ALTER TABLE "PaymentStructure" DROP CONSTRAINT "PaymentStructure_offer_id_fkey";

-- AddForeignKey
ALTER TABLE "PaymentStructure" ADD CONSTRAINT "PaymentStructure_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
