/*
  Warnings:

  - Added the required column `stock_available` to the `EntryPass` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EntryPass" DROP CONSTRAINT "EntryPass_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_vendor_id_fkey";

-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "EntryPass" ADD COLUMN     "stock_available" INTEGER NOT NULL,
ADD COLUMN     "stock_limit" INTEGER,
ALTER COLUMN "event_id" DROP NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "vendor_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "UserPurchase" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "entry_pass_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPurchase_entry_pass_id_idx" ON "UserPurchase"("entry_pass_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserPurchase_user_id_entry_pass_id_key" ON "UserPurchase"("user_id", "entry_pass_id");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryPass" ADD CONSTRAINT "EntryPass_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPurchase" ADD CONSTRAINT "UserPurchase_entry_pass_id_fkey" FOREIGN KEY ("entry_pass_id") REFERENCES "EntryPass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPurchase" ADD CONSTRAINT "UserPurchase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
