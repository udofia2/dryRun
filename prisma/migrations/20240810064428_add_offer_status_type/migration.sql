/*
  Warnings:

  - The `status` column on the `Offer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "STATUSTYPE" AS ENUM ('pending', 'accepted', 'rejected');

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "status",
ADD COLUMN     "status" "STATUSTYPE" NOT NULL DEFAULT 'pending';
