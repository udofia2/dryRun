/*
  Warnings:

  - You are about to drop the column `client_email` on the `Cancellation` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Cancellation` table. All the data in the column will be lost.
  - You are about to drop the column `event_id` on the `Cancellation` table. All the data in the column will be lost.
  - You are about to drop the column `specification_id` on the `Cancellation` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Cancellation` table. All the data in the column will be lost.
  - You are about to drop the column `cancellation_policy_id` on the `PaymentStructure` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contract_id]` on the table `Cancellation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contract_id` to the `Cancellation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Cancellation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `policy` to the `Cancellation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cancellation" DROP CONSTRAINT "Cancellation_client_email_fkey";

-- DropForeignKey
ALTER TABLE "Cancellation" DROP CONSTRAINT "Cancellation_event_id_fkey";

-- DropForeignKey
ALTER TABLE "Cancellation" DROP CONSTRAINT "Cancellation_specification_id_fkey";

-- DropForeignKey
ALTER TABLE "PaymentStructure" DROP CONSTRAINT "PaymentStructure_cancellation_policy_id_fkey";

-- DropIndex
DROP INDEX "Cancellation_event_id_key";

-- DropIndex
DROP INDEX "Cancellation_specification_id_key";

-- AlterTable
ALTER TABLE "Cancellation" DROP COLUMN "client_email",
DROP COLUMN "date",
DROP COLUMN "event_id",
DROP COLUMN "specification_id",
DROP COLUMN "status",
ADD COLUMN     "contract_id" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "policy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PaymentStructure" DROP COLUMN "cancellation_policy_id",
ADD COLUMN     "contract_id" TEXT;

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "STATUSTYPE" NOT NULL DEFAULT 'pending',
    "client_email" TEXT NOT NULL,
    "specification_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contract_specification_id_key" ON "Contract"("specification_id");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_event_id_key" ON "Contract"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cancellation_contract_id_key" ON "Cancellation"("contract_id");

-- AddForeignKey
ALTER TABLE "PaymentStructure" ADD CONSTRAINT "PaymentStructure_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "Client"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "Specification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cancellation" ADD CONSTRAINT "Cancellation_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
