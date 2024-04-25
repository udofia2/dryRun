/*
  Warnings:

  - The values [In_person] on the enum `LOCATIONTYPE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LOCATIONTYPE_new" AS ENUM ('Physical', 'Virtual', 'Hybrid');
ALTER TABLE "Event" ALTER COLUMN "location_type" TYPE "LOCATIONTYPE_new" USING ("location_type"::text::"LOCATIONTYPE_new");
ALTER TYPE "LOCATIONTYPE" RENAME TO "LOCATIONTYPE_old";
ALTER TYPE "LOCATIONTYPE_new" RENAME TO "LOCATIONTYPE";
DROP TYPE "LOCATIONTYPE_old";
COMMIT;
