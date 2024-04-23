/*
  Warnings:

  - The primary key for the `Event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `_EventToSpecification` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[event_id]` on the table `Specification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `event_id` to the `Specification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "CLIENTTYPE" ADD VALUE 'Organization';

-- DropForeignKey
ALTER TABLE "_EventToSpecification" DROP CONSTRAINT "_EventToSpecification_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventToSpecification" DROP CONSTRAINT "_EventToSpecification_B_fkey";

-- AlterTable
ALTER TABLE "Event" DROP CONSTRAINT "Event_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Event_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Event_id_seq";

-- AlterTable
ALTER TABLE "Specification" ADD COLUMN     "event_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "_EventToSpecification";

-- CreateIndex
CREATE UNIQUE INDEX "Specification_event_id_key" ON "Specification"("event_id");

-- AddForeignKey
ALTER TABLE "Specification" ADD CONSTRAINT "Specification_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
