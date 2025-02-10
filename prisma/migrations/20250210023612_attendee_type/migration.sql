/*
  Warnings:

  - The values [individual,organization] on the enum `ATTENDEETYPE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ATTENDEETYPE_new" AS ENUM ('INDIVIDUAL', 'ORGANIZATION');
ALTER TABLE "Attendee" ALTER COLUMN "attendee_type" TYPE "ATTENDEETYPE_new" USING ("attendee_type"::text::"ATTENDEETYPE_new");
ALTER TYPE "ATTENDEETYPE" RENAME TO "ATTENDEETYPE_old";
ALTER TYPE "ATTENDEETYPE_new" RENAME TO "ATTENDEETYPE";
DROP TYPE "ATTENDEETYPE_old";
COMMIT;
