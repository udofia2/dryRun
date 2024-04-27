/*
  Warnings:

  - You are about to drop the column `client_id` on the `Prospect` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[client_email]` on the table `Prospect` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `client_email` to the `Prospect` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Prospect" DROP CONSTRAINT "Prospect_client_id_fkey";

-- DropIndex
DROP INDEX "Prospect_client_id_key";

-- AlterTable
ALTER TABLE "Prospect" DROP COLUMN "client_id",
ADD COLUMN     "client_email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_email_idx" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Prospect_client_email_key" ON "Prospect"("client_email");

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "Client"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
