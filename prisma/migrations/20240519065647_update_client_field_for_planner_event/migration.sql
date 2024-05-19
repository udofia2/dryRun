-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_client_email_fkey";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "client_email" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "Client"("email") ON DELETE SET NULL ON UPDATE CASCADE;
