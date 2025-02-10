/*
  Warnings:

  - Added the required column `user_id` to the `EntryPass` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EntryPass" ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Attendee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "affiliation_or_organization" TEXT NOT NULL,
    "organization_name" TEXT,
    "organization_contact" TEXT,
    "representative_name" TEXT,
    "entry_pass_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendee_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EntryPass" ADD CONSTRAINT "EntryPass_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_entry_pass_id_fkey" FOREIGN KEY ("entry_pass_id") REFERENCES "EntryPass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
