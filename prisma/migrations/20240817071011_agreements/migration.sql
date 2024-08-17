/*
  Warnings:

  - You are about to drop the column `amount` on the `PaymentStructure` table. All the data in the column will be lost.
  - You are about to drop the column `contract_id` on the `PaymentStructure` table. All the data in the column will be lost.
  - You are about to drop the column `due_date` on the `PaymentStructure` table. All the data in the column will be lost.
  - You are about to drop the column `title_of_deliverable` on the `PaymentStructure` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PaymentStructure" DROP CONSTRAINT "PaymentStructure_contract_id_fkey";

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "confidentiality" TEXT NOT NULL DEFAULT 'This agreement constitutes the entire agreement between the parties are commercial secrets and guarantees to not disclose such information to others without correct authorization.',
ADD COLUMN     "entire_agreement" TEXT NOT NULL DEFAULT 'This agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, understandings, and agreements between the parties.',
ADD COLUMN     "indemnification" TEXT NOT NULL DEFAULT 'This Client agrees to indemnify and hold the event exhibitor harmless from any claims, liabilities, damages, or expenses arising out of or related to the scope of service, excluding those caused by the exhibitor’s negligence or willful misconduct.',
ADD COLUMN     "photography_and_publicity_laws" TEXT NOT NULL DEFAULT 'The client would allow the exhibitor to take pictures with consent for their brand publicity.';

-- AlterTable
ALTER TABLE "PaymentStructure" DROP COLUMN "amount",
DROP COLUMN "contract_id",
DROP COLUMN "due_date",
DROP COLUMN "title_of_deliverable";

-- CreateTable
CREATE TABLE "PaymentSchedule" (
    "id" TEXT NOT NULL,
    "title_of_deliverable" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "contract_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentSchedule" ADD CONSTRAINT "PaymentSchedule_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
