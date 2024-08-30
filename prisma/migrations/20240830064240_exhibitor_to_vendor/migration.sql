/*
  Warnings:

  - The values [exhibitor] on the enum `PROSPECTTYPE` will be removed. If these variants are still used in the database, this will fail.
  - The values [exhibitor] on the enum `USERTYPE` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `exhibitor_name` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `exhibitor_id` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `exhibitor_id` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `exhibitor_id` on the `Prospect` table. All the data in the column will be lost.
  - You are about to drop the column `exhibitor_name` on the `Provision` table. All the data in the column will be lost.
  - Added the required column `vendor_id` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendor_id` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendor_id` to the `Prospect` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PROSPECTTYPE_new" AS ENUM ('host', 'vendor');
ALTER TYPE "PROSPECTTYPE" RENAME TO "PROSPECTTYPE_old";
ALTER TYPE "PROSPECTTYPE_new" RENAME TO "PROSPECTTYPE";
DROP TYPE "PROSPECTTYPE_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "USERTYPE_new" AS ENUM ('host', 'vendor');
ALTER TABLE "User" ALTER COLUMN "type" TYPE "USERTYPE_new" USING ("type"::text::"USERTYPE_new");
ALTER TYPE "USERTYPE" RENAME TO "USERTYPE_old";
ALTER TYPE "USERTYPE_new" RENAME TO "USERTYPE";
DROP TYPE "USERTYPE_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_exhibitor_id_fkey";

-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_exhibitor_id_fkey";

-- DropForeignKey
ALTER TABLE "Prospect" DROP CONSTRAINT "Prospect_exhibitor_id_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "exhibitor_name";

-- AlterTable
ALTER TABLE "Contract" ALTER COLUMN "indemnification" SET DEFAULT 'This Client agrees to indemnify and hold the event vendor harmless from any claims, liabilities, damages, or expenses arising out of or related to the scope of service, excluding those caused by the vendor’s negligence or willful misconduct.',
ALTER COLUMN "photography_and_publicity_laws" SET DEFAULT 'The client would allow the vendor to take pictures with consent for their brand publicity.';

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "exhibitor_id",
ADD COLUMN     "vendor_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "exhibitor_id",
ADD COLUMN     "vendor_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Prospect" DROP COLUMN "exhibitor_id",
ADD COLUMN     "vendor_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Provision" DROP COLUMN "exhibitor_name";

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
