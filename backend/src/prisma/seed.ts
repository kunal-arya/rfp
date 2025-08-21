import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const buyerPermissions = {
  dashboard: { view: true },
  rfp: {
    create: { allowed: true },
    view: { allowed: true, scope: 'own' },
    edit: { allowed: true, scope: 'own', allowed_statuses: ['Draft'] },
    publish: { allowed: true, scope: 'own', allowed_statuses: ['Draft'] },
    review_responses: { allowed: true, scope: 'own' },
    change_status: { allowed: true, scope: 'own', allowed_transitions: { Under_Review: ['Approved', 'Rejected'] } }
  },
  supplier_response: {
    submit: { allowed: false },
    view: { allowed: true, scope: 'rfp_owner' },
    edit: { allowed: false }
  },
  documents: {
    upload_for_rfp: { allowed: true, scope: 'own' },
    upload_for_response: { allowed: false }
  },
  search: { allowed: true },
  admin: { manage_users: false, manage_roles: false }
};

const supplierPermissions = {
  dashboard: { view: true },
  rfp: {
    create: { allowed: false },
    view: { allowed: true, scope: 'published' },
    edit: { allowed: false },
    publish: { allowed: false },
    review_responses: { allowed: false },
    change_status: { allowed: false }
  },
  supplier_response: {
    submit: { allowed: true, allowed_rfp_statuses: ['Published'] },
    view: { allowed: true, scope: 'own' },
    edit: { allowed: true, scope: 'own', allowed_rfp_statuses: ['Published'] }
  },
  documents: {
    upload_for_rfp: { allowed: false },
    upload_for_response: { allowed: true, scope: 'own' }
  },
  search: { allowed: true },
  admin: { manage_users: false, manage_roles: false }
};


async function main() {
  console.log(`Start seeding ...`);

  await prisma.role.upsert({
    where: { name: 'Buyer' },
    update: { permissions: buyerPermissions },
    create: {
      name: 'Buyer',
      description: 'Users who can create and manage RFPs.',
      permissions: buyerPermissions,
    },
  });
  console.log('Buyer role created/updated.');

  await prisma.role.upsert({
    where: { name: 'Supplier' },
    update: { permissions: supplierPermissions },
    create: {
      name: 'Supplier',
      description: 'Users who can respond to RFPs.',
      permissions: supplierPermissions,
    },
  });
  console.log('Supplier role created/updated.');

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
