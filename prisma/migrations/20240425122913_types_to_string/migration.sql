/*
  Warnings:

  - The `status` column on the `Prospect` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `source` on the `Prospect` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Prospect" DROP COLUMN "source",
ADD COLUMN     "source" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Pending';

-- DropEnum
DROP TYPE "SOURCETYPE";

-- DropEnum
DROP TYPE "STATUSTYPE";
