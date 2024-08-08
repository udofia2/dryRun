/*
  Warnings:

  - The values [pending,converted] on the enum `PROSPECTSTATUSTYPE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PROSPECTSTATUSTYPE_new" AS ENUM ('Pending', 'Converted', 'Rejected');
ALTER TABLE "Prospect" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Prospect" ALTER COLUMN "status" TYPE "PROSPECTSTATUSTYPE_new" USING ("status"::text::"PROSPECTSTATUSTYPE_new");
ALTER TYPE "PROSPECTSTATUSTYPE" RENAME TO "PROSPECTSTATUSTYPE_old";
ALTER TYPE "PROSPECTSTATUSTYPE_new" RENAME TO "PROSPECTSTATUSTYPE";
DROP TYPE "PROSPECTSTATUSTYPE_old";
ALTER TABLE "Prospect" ALTER COLUMN "status" SET DEFAULT 'Pending';
COMMIT;

-- AlterTable
ALTER TABLE "Prospect" ALTER COLUMN "status" SET DEFAULT 'Pending';
