/*
  Warnings:

  - The values [Pending,Converted,Rejected] on the enum `PROSPECTSTATUSTYPE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PROSPECTSTATUSTYPE_new" AS ENUM ('pending', 'converted', 'rejected');
ALTER TABLE "Prospect" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Prospect" ALTER COLUMN "status" TYPE "PROSPECTSTATUSTYPE_new" USING ("status"::text::"PROSPECTSTATUSTYPE_new");
ALTER TYPE "PROSPECTSTATUSTYPE" RENAME TO "PROSPECTSTATUSTYPE_old";
ALTER TYPE "PROSPECTSTATUSTYPE_new" RENAME TO "PROSPECTSTATUSTYPE";
DROP TYPE "PROSPECTSTATUSTYPE_old";
ALTER TABLE "Prospect" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "Prospect" ALTER COLUMN "status" SET DEFAULT 'pending';
