-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_event_id_fkey";

-- DropForeignKey
ALTER TABLE "EntryPass" DROP CONSTRAINT "EntryPass_event_id_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_prospect_id_fkey";

-- DropForeignKey
ALTER TABLE "Specification" DROP CONSTRAINT "Specification_event_id_fkey";

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specification" ADD CONSTRAINT "Specification_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryPass" ADD CONSTRAINT "EntryPass_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
