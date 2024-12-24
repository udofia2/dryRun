-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "vendor_id" TEXT;

-- AlterTable
ALTER TABLE "Specification" ALTER COLUMN "event_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
