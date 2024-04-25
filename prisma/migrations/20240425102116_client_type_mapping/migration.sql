/*
  Warnings:

  - The values [Company,Organization] on the enum `CLIENTTYPE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CLIENTTYPE_new" AS ENUM ('Individual', 'Company/Organization');
ALTER TABLE "Client" ALTER COLUMN "type" TYPE "CLIENTTYPE_new" USING ("type"::text::"CLIENTTYPE_new");
ALTER TYPE "CLIENTTYPE" RENAME TO "CLIENTTYPE_old";
ALTER TYPE "CLIENTTYPE_new" RENAME TO "CLIENTTYPE";
DROP TYPE "CLIENTTYPE_old";
COMMIT;
