-- CreateEnum
CREATE TYPE "TICKETTYPE" AS ENUM ('free', 'paid');

-- CreateEnum
CREATE TYPE "STOCKTYPE" AS ENUM ('unlimited', 'limited');

-- CreateEnum
CREATE TYPE "ENTRYPASSTYPE" AS ENUM ('free', 'paid', 'invite_only');

-- CreateEnum
CREATE TYPE "SCHEDULETYPE" AS ENUM ('one_time', 'recurring');

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "vendor_name" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "cover_art_url" TEXT,
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "end_time" TEXT,
ADD COLUMN     "facebook_link" TEXT,
ADD COLUMN     "instagram_link" TEXT,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "recurring_frequency" TEXT,
ADD COLUMN     "schedule_type" "SCHEDULETYPE",
ADD COLUMN     "start_date" TIMESTAMP(3),
ADD COLUMN     "start_time" TEXT,
ADD COLUMN     "virtual_meeting_link" TEXT,
ADD COLUMN     "website_link" TEXT,
ADD COLUMN     "x_link" TEXT,
ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Provision" ADD COLUMN     "vendor_name" TEXT;

-- CreateTable
CREATE TABLE "EntryPass" (
    "id" TEXT NOT NULL,
    "type" "ENTRYPASSTYPE" NOT NULL,
    "stock_type" "STOCKTYPE" NOT NULL DEFAULT 'unlimited',
    "reservation_limit" INTEGER,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "ticket_type" "TICKETTYPE",
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntryPass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "sender_email" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "recipients_emails" TEXT[],
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entry_pass_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EntryPass_event_id_key" ON "EntryPass"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_entry_pass_id_key" ON "Invite"("entry_pass_id");

-- AddForeignKey
ALTER TABLE "EntryPass" ADD CONSTRAINT "EntryPass_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_entry_pass_id_fkey" FOREIGN KEY ("entry_pass_id") REFERENCES "EntryPass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
