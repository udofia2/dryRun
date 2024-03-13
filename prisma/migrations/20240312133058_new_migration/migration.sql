-- CreateEnum
CREATE TYPE "USERTYPE" AS ENUM ('host', 'exhibitor');

-- CreateEnum
CREATE TYPE "EXHIBITTYPE" AS ENUM ('event_venues', 'event_planner', 'bar_services_and_beverages', 'photography', 'beauty_professional', 'fashion_designers_and_stylists', 'decorators', 'videographer', 'clothing_and_accessories', 'event_staffs', 'caterer', 'baker', 'printing_service', 'event_rental', 'favours_and_gifts', 'music_and_entertainment', 'lighting_and_av', 'dancing_instructor', 'health_and_fitness', 'accomodation', 'transportation_service', 'model', 'social_media_influencer');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "type" "USERTYPE",
    "city" TEXT,
    "state" TEXT,
    "booked_dates" TIMESTAMP(3)[],
    "exhibit" "EXHIBITTYPE",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "exhibitor_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_exhibitor_id_fkey" FOREIGN KEY ("exhibitor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
