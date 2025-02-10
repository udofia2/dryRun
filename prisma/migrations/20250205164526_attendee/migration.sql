/*
  Warnings:

  - Added the required column `attendee_type` to the `Attendee` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ATTENDEETYPE" AS ENUM ('individual', 'organization');

-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN     "attendee_type" "ATTENDEETYPE" NOT NULL;
