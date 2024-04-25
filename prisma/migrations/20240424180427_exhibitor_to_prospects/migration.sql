/*
  Warnings:

  - Added the required column `exhibitor_id` to the `Prospect` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN     "exhibitor_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_exhibitor_id_fkey" FOREIGN KEY ("exhibitor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
