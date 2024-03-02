/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - Added the required column `type` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "USERTYPE" AS ENUM ('host', 'exhibitor');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "type" "USERTYPE" NOT NULL;

-- DropEnum
DROP TYPE "USERROLE";
