-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_prospect_id_fkey";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "prospect_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;
