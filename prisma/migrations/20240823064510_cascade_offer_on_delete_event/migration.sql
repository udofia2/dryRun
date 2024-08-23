-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_event_id_fkey";

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
