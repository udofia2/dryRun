-- CreateEnum
CREATE TYPE "POLICYSPECIFIER" AS ENUM ('client', 'vendor');

-- CreateEnum
CREATE TYPE "REFUNDPOLICY" AS ENUM ('refundable', 'non_refundable');

-- AlterTable
ALTER TABLE "PaymentStructure" ADD COLUMN     "amount" DOUBLE PRECISION,
ADD COLUMN     "cancellation_policy_id" TEXT,
ADD COLUMN     "due_date" TIMESTAMP(3),
ADD COLUMN     "title_of_deliverable" TEXT,
ALTER COLUMN "offer_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Cancellation" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "STATUSTYPE" NOT NULL DEFAULT 'pending',
    "refund_policy" "REFUNDPOLICY" NOT NULL,
    "notice_days" INTEGER NOT NULL,
    "percentage_of_fee" DOUBLE PRECISION NOT NULL,
    "specified_by" "POLICYSPECIFIER" NOT NULL,
    "client_email" TEXT NOT NULL,
    "specification_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cancellation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cancellation_specification_id_key" ON "Cancellation"("specification_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cancellation_event_id_key" ON "Cancellation"("event_id");

-- AddForeignKey
ALTER TABLE "PaymentStructure" ADD CONSTRAINT "PaymentStructure_cancellation_policy_id_fkey" FOREIGN KEY ("cancellation_policy_id") REFERENCES "Cancellation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cancellation" ADD CONSTRAINT "Cancellation_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "Client"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cancellation" ADD CONSTRAINT "Cancellation_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "Specification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cancellation" ADD CONSTRAINT "Cancellation_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
