/*
  Warnings:

  - You are about to drop the column `city` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[prospect_id]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `event_date` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_type` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location_type` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prospect_id` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CLIENTTYPE" AS ENUM ('Individual', 'Company');

-- CreateEnum
CREATE TYPE "STATUSTYPE" AS ENUM ('Pending', 'Converted', 'Rejected');

-- CreateEnum
CREATE TYPE "PROSPECTTYPE" AS ENUM ('host', 'exhibitor');

-- CreateEnum
CREATE TYPE "SOURCETYPE" AS ENUM ('Offline', 'Online');

-- CreateEnum
CREATE TYPE "LOCATIONTYPE" AS ENUM ('In_person', 'Virtual', 'Hybrid');

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "city",
DROP COLUMN "date",
DROP COLUMN "description",
DROP COLUMN "location",
DROP COLUMN "name",
DROP COLUMN "state",
ADD COLUMN     "event_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "event_name" TEXT NOT NULL DEFAULT 'undecided',
ADD COLUMN     "event_type" TEXT NOT NULL,
ADD COLUMN     "location_address" TEXT NOT NULL DEFAULT 'undecided',
ADD COLUMN     "location_type" "LOCATIONTYPE" NOT NULL,
ADD COLUMN     "prospect_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "client_name" TEXT NOT NULL,
    "source" "SOURCETYPE" NOT NULL,
    "status" "STATUSTYPE" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" "CLIENTTYPE" NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "prospect_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specification" (
    "id" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provision" (
    "id" TEXT NOT NULL,
    "provision" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "exhibitor_name" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "specification_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "exhibitor_name" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "specification_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventToSpecification" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Prospect_id_idx" ON "Prospect"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Client_prospect_id_key" ON "Client"("prospect_id");

-- CreateIndex
CREATE UNIQUE INDEX "_EventToSpecification_AB_unique" ON "_EventToSpecification"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToSpecification_B_index" ON "_EventToSpecification"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Event_prospect_id_key" ON "Event"("prospect_id");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "Prospect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "Prospect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provision" ADD CONSTRAINT "Provision_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "Specification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "Specification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToSpecification" ADD CONSTRAINT "_EventToSpecification_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToSpecification" ADD CONSTRAINT "_EventToSpecification_B_fkey" FOREIGN KEY ("B") REFERENCES "Specification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
