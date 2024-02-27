-- CreateEnum
CREATE TYPE "USERTYPE" AS ENUM ('HOST', 'EXHIBITOR');

-- CreateEnum
CREATE TYPE "EVENTTYPE" AS ENUM ('Event_venues', 'Event_planner');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "type" "USERTYPE" NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "booked_dates" TIMESTAMP(3)[],
    "event_type" "EVENTTYPE" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
