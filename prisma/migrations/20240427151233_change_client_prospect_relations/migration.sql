/*
  Warnings:

  - You are about to drop the column `prospect_id` on the `Client` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[client_id]` on the table `Prospect` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `client_id` to the `Prospect` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_prospect_id_fkey";

-- DropIndex
DROP INDEX "Client_prospect_id_key";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "prospect_id";

-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN     "client_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Prospect_client_id_key" ON "Prospect"("client_id");

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
