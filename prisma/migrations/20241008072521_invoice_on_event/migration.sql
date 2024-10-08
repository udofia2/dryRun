/*
  Warnings:

  - A unique constraint covering the columns `[event_id]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `event_id` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "event_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_event_id_key" ON "Invoice"("event_id");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
