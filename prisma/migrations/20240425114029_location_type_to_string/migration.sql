/*
  Warnings:

  - Changed the type of `location_type` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "location_type",
ADD COLUMN     "location_type" TEXT NOT NULL;

-- DropEnum
DROP TYPE "LOCATIONTYPE";
