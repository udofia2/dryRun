/*
  Warnings:

  - You are about to drop the column `specification_id` on the `Contract` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_specification_id_fkey";

-- DropIndex
DROP INDEX "Contract_specification_id_key";

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "specification_id";
