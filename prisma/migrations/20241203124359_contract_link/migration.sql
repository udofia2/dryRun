/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Contract` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contract_link]` on the table `Contract` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contract_link` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "contract_link" TEXT NOT NULL,
ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Contract_token_key" ON "Contract"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contract_link_key" ON "Contract"("contract_link");
