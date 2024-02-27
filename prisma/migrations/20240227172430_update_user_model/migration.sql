/*
  Warnings:

  - You are about to drop the column `event_type` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `User` table. All the data in the column will be lost.
  - Added the required column `exhibit` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "USERROLE" AS ENUM ('host', 'exhibitor');

-- CreateEnum
CREATE TYPE "EXHIBITTYPE" AS ENUM ('event_venues', 'event_planner', 'bar_services_and_beverages', 'photography', 'beauty_professional', 'fashion_designers_and_stylists', 'decorators', 'videographer', 'clothing_and_accessories', 'event_staffs', 'caterer', 'baker', 'printing_service', 'event_rental', 'favours_and_gifts', 'music_and_entertainment', 'lighting_and_av', 'dancing_instructor', 'health_and_fitness', 'accomodation', 'transportation_service', 'model', 'social_media_influencer');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "event_type",
DROP COLUMN "type",
ADD COLUMN     "exhibit" "EXHIBITTYPE" NOT NULL,
ADD COLUMN     "role" "USERROLE" NOT NULL;

-- DropEnum
DROP TYPE "EVENTTYPE";

-- DropEnum
DROP TYPE "USERTYPE";
