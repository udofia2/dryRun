-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_specification_id_fkey";

-- DropForeignKey
ALTER TABLE "Provision" DROP CONSTRAINT "Provision_specification_id_fkey";

-- AddForeignKey
ALTER TABLE "Provision" ADD CONSTRAINT "Provision_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "Specification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "Specification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
