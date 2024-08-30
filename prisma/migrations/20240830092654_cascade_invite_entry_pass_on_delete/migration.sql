-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_entry_pass_id_fkey";

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_entry_pass_id_fkey" FOREIGN KEY ("entry_pass_id") REFERENCES "EntryPass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
