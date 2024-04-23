/*
  Warnings:

  - You are about to drop the column `event_date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `event_name` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `event_type` on the `Event` table. All the data in the column will be lost.
  - Added the required column `date` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "event_date",
DROP COLUMN "event_name",
DROP COLUMN "event_type",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'undecided',
ADD COLUMN     "state" TEXT,
ADD COLUMN     "type" TEXT NOT NULL;
