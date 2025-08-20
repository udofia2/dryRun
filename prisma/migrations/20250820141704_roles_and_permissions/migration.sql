/*
  Warnings:

  - The `provider` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `read` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SYSTEM_ROLE_TYPE" AS ENUM ('admin', 'support', 'moderator');

-- CreateEnum
CREATE TYPE "ORG_ROLE_TYPE" AS ENUM ('owner', 'admin', 'manager', 'member');

-- CreateEnum
CREATE TYPE "PERMISSION_TYPE" AS ENUM ('event_sourcing', 'planner', 'backoffice', 'crm', 'event_create', 'event_edit', 'event_delete', 'event_view', 'prospect_create', 'prospect_edit', 'prospect_view', 'offer_create', 'offer_edit', 'offer_send', 'offer_view', 'contract_create', 'contract_edit', 'contract_send', 'contract_view', 'invoice_create', 'invoice_edit', 'invoice_send', 'invoice_view', 'collaborator_invite', 'collaborator_manage', 'role_assign', 'permission_grant');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('info', 'warning', 'critical');

-- CreateEnum
CREATE TYPE "PROVIDER" AS ENUM ('local', 'google', 'facebook', 'apple', 'github', 'twitter', 'linkedin');

-- CreateEnum
CREATE TYPE "PROSPECTTYPE" AS ENUM ('host', 'vendor');

-- AlterEnum
ALTER TYPE "USERTYPE" ADD VALUE 'internal';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "read" BOOLEAN NOT NULL,
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
DROP COLUMN "provider",
ADD COLUMN     "provider" "PROVIDER";

-- CreateTable
CREATE TABLE "SystemRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SYSTEM_ROLE_TYPE" NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemPermission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PERMISSION_TYPE" NOT NULL,
    "description" TEXT,
    "resource" TEXT,
    "action" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemRolePermission" (
    "id" TEXT NOT NULL,
    "system_role_id" TEXT NOT NULL,
    "system_permission_id" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ORG_ROLE_TYPE" NOT NULL,
    "description" TEXT,
    "organization_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationPermission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PERMISSION_TYPE" NOT NULL,
    "description" TEXT,
    "resource" TEXT,
    "action" TEXT,
    "organization_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationRolePermission" (
    "id" TEXT NOT NULL,
    "org_role_id" TEXT NOT NULL,
    "org_permission_id" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSystemRole" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "system_role_id" TEXT NOT NULL,
    "assigned_by" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserSystemRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collaboration" (
    "id" TEXT NOT NULL,
    "collaborator_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "STATUSTYPE" NOT NULL DEFAULT 'pending',
    "invited_by" TEXT NOT NULL,
    "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Collaboration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOrganizationRole" (
    "id" TEXT NOT NULL,
    "collaboration_id" TEXT NOT NULL,
    "org_role_id" TEXT NOT NULL,
    "assigned_by" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserOrganizationRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "permission_id" TEXT,
    "org_permission_id" TEXT,
    "organization_id" TEXT,
    "granted_by" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemRole_name_key" ON "SystemRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SystemRole_type_key" ON "SystemRole"("type");

-- CreateIndex
CREATE UNIQUE INDEX "SystemPermission_name_key" ON "SystemPermission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SystemPermission_type_key" ON "SystemPermission"("type");

-- CreateIndex
CREATE UNIQUE INDEX "SystemRolePermission_system_role_id_system_permission_id_key" ON "SystemRolePermission"("system_role_id", "system_permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_ownerId_key" ON "Organization"("name", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_userId_organizationId_key" ON "Member"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationRole_name_organization_id_key" ON "OrganizationRole"("name", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationPermission_name_organization_id_key" ON "OrganizationPermission"("name", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationRolePermission_org_role_id_org_permission_id_key" ON "OrganizationRolePermission"("org_role_id", "org_permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserSystemRole_user_id_system_role_id_key" ON "UserSystemRole"("user_id", "system_role_id");

-- CreateIndex
CREATE INDEX "Collaboration_email_idx" ON "Collaboration"("email");

-- CreateIndex
CREATE INDEX "Collaboration_organization_id_idx" ON "Collaboration"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "Collaboration_collaborator_id_organization_id_key" ON "Collaboration"("collaborator_id", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserOrganizationRole_collaboration_id_org_role_id_key" ON "UserOrganizationRole"("collaboration_id", "org_role_id");

-- CreateIndex
CREATE INDEX "UserPermission_user_id_idx" ON "UserPermission"("user_id");

-- CreateIndex
CREATE INDEX "UserPermission_organization_id_idx" ON "UserPermission"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "SystemRolePermission" ADD CONSTRAINT "SystemRolePermission_system_role_id_fkey" FOREIGN KEY ("system_role_id") REFERENCES "SystemRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemRolePermission" ADD CONSTRAINT "SystemRolePermission_system_permission_id_fkey" FOREIGN KEY ("system_permission_id") REFERENCES "SystemPermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationRole" ADD CONSTRAINT "OrganizationRole_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationPermission" ADD CONSTRAINT "OrganizationPermission_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationRolePermission" ADD CONSTRAINT "OrganizationRolePermission_org_role_id_fkey" FOREIGN KEY ("org_role_id") REFERENCES "OrganizationRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationRolePermission" ADD CONSTRAINT "OrganizationRolePermission_org_permission_id_fkey" FOREIGN KEY ("org_permission_id") REFERENCES "OrganizationPermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSystemRole" ADD CONSTRAINT "UserSystemRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSystemRole" ADD CONSTRAINT "UserSystemRole_system_role_id_fkey" FOREIGN KEY ("system_role_id") REFERENCES "SystemRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSystemRole" ADD CONSTRAINT "UserSystemRole_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganizationRole" ADD CONSTRAINT "UserOrganizationRole_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "Collaboration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganizationRole" ADD CONSTRAINT "UserOrganizationRole_org_role_id_fkey" FOREIGN KEY ("org_role_id") REFERENCES "OrganizationRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganizationRole" ADD CONSTRAINT "UserOrganizationRole_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "SystemPermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_org_permission_id_fkey" FOREIGN KEY ("org_permission_id") REFERENCES "OrganizationPermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
