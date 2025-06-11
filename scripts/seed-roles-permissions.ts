import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedRolesAndPermissions() {
  console.log("🌱 Seeding roles and permissions...");

  try {
    // Seed System Roles
    console.log("Creating system roles...");
    const systemRoles = await Promise.all([
      prisma.systemRole.upsert({
        where: { type: "admin" },
        update: {},
        create: {
          id: "sr_platform_admin",
          name: "Platform Admin",
          type: "admin",
          description: "Full platform administration access"
        }
      }),
      prisma.systemRole.upsert({
        where: { type: "support" },
        update: {},
        create: {
          id: "sr_support_agent",
          name: "Support Agent",
          type: "support",
          description: "Customer support and assistance"
        }
      }),
      prisma.systemRole.upsert({
        where: { type: "moderator" },
        update: {},
        create: {
          id: "sr_content_moderator",
          name: "Content Moderator",
          type: "moderator",
          description: "Content moderation and review"
        }
      })
    ]);

    console.log(`✅ Created ${systemRoles.length} system roles`);

    // Seed System Permissions
    console.log("Creating system permissions...");
    const systemPermissions = await Promise.all([
      // Platform Administration
      prisma.systemPermission.upsert({
        where: { type: "permission_grant" },
        update: {},
        create: {
          id: "sp_permission_grant",
          name: "Grant Permissions",
          type: "permission_grant",
          description: "Grant and revoke permissions to users",
          resource: "permissions",
          action: "grant"
        }
      }),
      prisma.systemPermission.upsert({
        where: { type: "collaborator_manage" },
        update: {},
        create: {
          id: "sp_user_management",
          name: "User Management",
          type: "collaborator_manage",
          description: "Manage platform users",
          resource: "users",
          action: "manage"
        }
      }),
      prisma.systemPermission.upsert({
        where: { type: "backoffice" },
        update: {},
        create: {
          id: "sp_system_config",
          name: "System Configuration",
          type: "backoffice",
          description: "Configure system settings",
          resource: "system",
          action: "configure"
        }
      }),
      prisma.systemPermission.upsert({
        where: { type: "crm" },
        update: {},
        create: {
          id: "sp_support_access",
          name: "Support Access",
          type: "crm",
          description: "Access support features",
          resource: "support",
          action: "access"
        }
      }),
      // Event Management
      prisma.systemPermission.upsert({
        where: { type: "event_create" },
        update: {},
        create: {
          id: "sp_event_create",
          name: "Create Events",
          type: "event_create",
          description: "Create new events",
          resource: "events",
          action: "create"
        }
      }),
      prisma.systemPermission.upsert({
        where: { type: "event_edit" },
        update: {},
        create: {
          id: "sp_event_edit",
          name: "Edit Events",
          type: "event_edit",
          description: "Edit existing events",
          resource: "events",
          action: "edit"
        }
      }),
      prisma.systemPermission.upsert({
        where: { type: "event_view" },
        update: {},
        create: {
          id: "sp_event_view",
          name: "View Events",
          type: "event_view",
          description: "View events",
          resource: "events",
          action: "view"
        }
      }),
      // Role Management
      prisma.systemPermission.upsert({
        where: { type: "role_assign" },
        update: {},
        create: {
          id: "sp_role_assign",
          name: "Assign Roles",
          type: "role_assign",
          description: "Assign roles to users",
          resource: "roles",
          action: "assign"
        }
      }),
      // Collaboration
      prisma.systemPermission.upsert({
        where: { type: "collaborator_invite" },
        update: {},
        create: {
          id: "sp_collaborator_invite",
          name: "Invite Collaborators",
          type: "collaborator_invite",
          description: "Invite new collaborators",
          resource: "collaborators",
          action: "invite"
        }
      })
    ]);

    console.log(`✅ Created ${systemPermissions.length} system permissions`);

    // Assign permissions to system roles
    console.log("Assigning permissions to system roles...");

    // Platform Admin gets all permissions
    const adminRole = systemRoles.find((r) => r.type === "admin");
    const adminPermissions = await Promise.all(
      systemPermissions.map((permission) =>
        prisma.systemRolePermission.upsert({
          where: {
            system_role_id_system_permission_id: {
              system_role_id: adminRole.id,
              system_permission_id: permission.id
            }
          },
          update: {},
          create: {
            system_role_id: adminRole.id,
            system_permission_id: permission.id
          }
        })
      )
    );

    // Support Agent gets limited permissions
    const supportRole = systemRoles.find((r) => r.type === "support");
    const supportPermissionTypes = ["collaborator_manage", "crm", "event_view"];
    const supportPermissions = await Promise.all(
      systemPermissions
        .filter((p) => supportPermissionTypes.includes(p.type))
        .map((permission) =>
          prisma.systemRolePermission.upsert({
            where: {
              system_role_id_system_permission_id: {
                system_role_id: supportRole.id,
                system_permission_id: permission.id
              }
            },
            update: {},
            create: {
              system_role_id: supportRole.id,
              system_permission_id: permission.id
            }
          })
        )
    );

    // Content Moderator gets backoffice access
    const moderatorRole = systemRoles.find((r) => r.type === "moderator");
    const moderatorPermissions = await Promise.all(
      systemPermissions
        .filter((p) => ["backoffice", "event_view"].includes(p.type))
        .map((permission) =>
          prisma.systemRolePermission.upsert({
            where: {
              system_role_id_system_permission_id: {
                system_role_id: moderatorRole.id,
                system_permission_id: permission.id
              }
            },
            update: {},
            create: {
              system_role_id: moderatorRole.id,
              system_permission_id: permission.id
            }
          })
        )
    );

    console.log(`✅ Assigned permissions to roles`);
    console.log(`   - Admin: ${adminPermissions.length} permissions`);
    console.log(`   - Support: ${supportPermissions.length} permissions`);
    console.log(`   - Moderator: ${moderatorPermissions.length} permissions`);

    console.log("🎉 Roles and permissions seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding roles and permissions:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Function to create default organization setup for a user
async function createDefaultOrganizationSetup(userId: string) {
  console.log(`🏢 Creating default organization setup for user: ${userId}`);

  try {
    const organization = await prisma.organization.upsert({
      where: {
        organization_owner_unique: {
          name: "E-vent Corporation",
          ownerId: userId
        }
      },
      update: {},
      create: {
        name: "Default Organization",
        ownerId: userId
      }
    });

    console.log(
      `🏢 Creating default organization setup for organization with id: ${organization.id}`
    );

    // Create default organization permissions
    const orgPermissions = await Promise.all([
      prisma.organizationPermission.upsert({
        where: {
          name_organization_id: {
            name: "Event Sourcing",
            organization_id: organization.id
          }
        },
        update: {},
        create: {
          name: "Event Sourcing",
          type: "event_sourcing",
          description: "Access to event sourcing features",
          resource: "events",
          action: "source",
          organization_id: organization.id
        }
      }),
      prisma.organizationPermission.upsert({
        where: {
          name_organization_id: {
            name: "Planner Access",
            organization_id: organization.id
          }
        },
        update: {},
        create: {
          name: "Planner Access",
          type: "planner",
          description: "Access to planning features",
          resource: "planning",
          action: "access",
          organization_id: organization.id
        }
      }),
      prisma.organizationPermission.upsert({
        where: {
          name_organization_id: {
            name: "Backoffice Access",
            organization_id: organization.id
          }
        },
        update: {},
        create: {
          name: "Backoffice Access",
          type: "backoffice",
          description: "Access to backoffice features",
          resource: "backoffice",
          action: "access",
          organization_id: organization.id
        }
      }),
      prisma.organizationPermission.upsert({
        where: {
          name_organization_id: {
            name: "CRM Access",
            organization_id: organization.id
          }
        },
        update: {},
        create: {
          name: "CRM Access",
          type: "crm",
          description: "Access to CRM features",
          resource: "crm",
          action: "access",
          organization_id: organization.id
        }
      }),
      prisma.organizationPermission.upsert({
        where: {
          name_organization_id: {
            name: "Invite Collaborators",
            organization_id: organization.id
          }
        },
        update: {},
        create: {
          name: "Invite Collaborators",
          type: "collaborator_invite",
          description: "Invite new collaborators",
          resource: "collaborators",
          action: "invite",
          organization_id: organization.id
        }
      }),
      prisma.organizationPermission.upsert({
        where: {
          name_organization_id: {
            name: "Manage Collaborators",
            organization_id: organization.id
          }
        },
        update: {},
        create: {
          name: "Manage Collaborators",
          type: "collaborator_manage",
          description: "Manage collaborators",
          resource: "collaborators",
          action: "manage",
          organization_id: organization.id
        }
      })
    ]);

    // Create default organization roles
    const adminRole = await prisma.organizationRole.upsert({
      where: {
        name_organization_id: {
          name: "Admin",
          organization_id: organization.id
        }
      },
      update: {},
      create: {
        name: "Admin",
        type: "admin",
        description: "Full access to all organization features",
        organization_id: organization.id
      }
    });

    const managerRole = await prisma.organizationRole.upsert({
      where: {
        name_organization_id: {
          name: "Manager",
          organization_id: organization.id
        }
      },
      update: {},
      create: {
        name: "Manager",
        type: "manager",
        description: "Management access with limited administrative rights",
        organization_id: organization.id
      }
    });

    const memberRole = await prisma.organizationRole.upsert({
      where: {
        name_organization_id: {
          name: "Member",
          organization_id: organization.id
        }
      },
      update: {},
      create: {
        name: "Member",
        type: "member",
        description: "Basic access to organization features",
        organization_id: organization.id
      }
    });

    // Assign permissions to roles
    // Admin gets all permissions
    const adminRolePermissions = await Promise.all(
      orgPermissions.map((permission) =>
        prisma.organizationRolePermission.upsert({
          where: {
            org_role_id_org_permission_id: {
              org_role_id: adminRole.id,
              org_permission_id: permission.id
            }
          },
          update: {},
          create: {
            org_role_id: adminRole.id,
            org_permission_id: permission.id
          }
        })
      )
    );

    // Manager gets selected permissions
    const managerPermissions = orgPermissions.filter((p) =>
      ["event_sourcing", "planner", "crm", "collaborator_manage"].includes(
        p.type
      )
    );
    const managerRolePermissions = await Promise.all(
      managerPermissions.map((permission) =>
        prisma.organizationRolePermission.upsert({
          where: {
            org_role_id_org_permission_id: {
              org_role_id: managerRole.id,
              org_permission_id: permission.id
            }
          },
          update: {},
          create: {
            org_role_id: managerRole.id,
            org_permission_id: permission.id
          }
        })
      )
    );

    // Member gets basic permissions
    const memberPermissions = orgPermissions.filter((p) =>
      ["event_sourcing", "planner"].includes(p.type)
    );
    const memberRolePermissions = await Promise.all(
      memberPermissions.map((permission) =>
        prisma.organizationRolePermission.upsert({
          where: {
            org_role_id_org_permission_id: {
              org_role_id: memberRole.id,
              org_permission_id: permission.id
            }
          },
          update: {},
          create: {
            org_role_id: memberRole.id,
            org_permission_id: permission.id
          }
        })
      )
    );

    console.log(`✅ Created organization setup:`);
    console.log(`   - Permissions: ${orgPermissions.length}`);
    console.log(`   - Roles: 3 (Admin, Manager, Member)`);
    console.log(`   - Admin permissions: ${adminRolePermissions.length}`);
    console.log(`   - Manager permissions: ${managerRolePermissions.length}`);
    console.log(`   - Member permissions: ${memberRolePermissions.length}`);

    return {
      permissions: orgPermissions,
      roles: [adminRole, managerRole, memberRole]
    };
  } catch (error) {
    console.error(
      `❌ Error creating organization setup for user ${userId}:`,
      error
    );
    throw error;
  }
}

// Function to assign platform admin role to a user
async function assignPlatformAdmin(userEmail: string) {
  console.log(`👑 Assigning platform admin role to: ${userEmail}`);

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.error(`❌ User not found: ${userEmail}`);
      return;
    }

    const adminRole = await prisma.systemRole.findUnique({
      where: { type: "admin" }
    });

    if (!adminRole) {
      console.error("❌ Platform admin role not found");
      return;
    }

    await prisma.userSystemRole.upsert({
      where: {
        user_id_system_role_id: {
          user_id: user.id,
          system_role_id: adminRole.id
        }
      },
      update: {
        is_active: true,
        assigned_at: new Date()
      },
      create: {
        user_id: user.id,
        system_role_id: adminRole.id,
        assigned_by: user.id // Self-assigned for initial setup
      }
    });

    console.log(`✅ Platform admin role assigned to ${userEmail}`);
  } catch (error) {
    console.error(`❌ Error assigning platform admin role:`, error);
    throw error;
  }
}

// Main execution
async function main() {
  console.log("🚀 Starting roles and permissions setup...");

  // Seed basic system roles and permissions
  await seedRolesAndPermissions();

  // Optional: Create organization setup for a specific user
  // Uncomment and replace with actual user ID if needed
  // await createDefaultOrganizationSetup('your-user-id-here');

  // Optional: Assign platform admin to a specific user
  // Uncomment and replace with actual email if needed
  // await assignPlatformAdmin('admin@yourplatform.com');

  console.log("🎉 Setup completed successfully!");
}

// Export functions for use in other scripts
export {
  seedRolesAndPermissions,
  createDefaultOrganizationSetup,
  assignPlatformAdmin
};

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });
}
