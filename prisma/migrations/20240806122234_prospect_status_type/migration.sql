/*
  Warnings:

  - The `status` column on the `Prospect` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PROSPECTSTATUSTYPE" AS ENUM ('pending', 'converted');

-- AlterTable
ALTER TABLE "Prospect" DROP COLUMN "status",
ADD COLUMN     "status" "PROSPECTSTATUSTYPE" NOT NULL DEFAULT 'pending';
