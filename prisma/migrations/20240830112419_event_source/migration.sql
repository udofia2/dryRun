/*
  Warnings:

  - Changed the type of `source` on the `Prospect` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EVENTSOURCE" AS ENUM ('offline', 'online');

-- AlterTable
ALTER TABLE "Prospect" DROP COLUMN "source",
ADD COLUMN     "source" "EVENTSOURCE" NOT NULL;
