import { PrismaClient } from '@prisma/client';
import { RFP_STATUS, SUPPLIER_RESPONSE_STATUS } from '../utils/enum';

const prisma = new PrismaClient();

const buyerPermissions = {
  dashboard: { view: true },
  rfp: {
    create: { allowed: true },
    view: { allowed: true, scope: 'own' },
    edit: { allowed: true, scope: 'own', allowed_rfp_statuses: ['Draft'] },
    publish: { allowed: true, scope: 'own', allowed_rfp_statuses: ['Draft'] },
    review_responses: { allowed: true, scope: 'own' },
    read_responses: {allowed: true, scope: "own"},
    manage_documents: { allowed: true, scope: 'own' },
    change_status: { allowed: true, scope: 'own', allowed_transitions: { "Under Review": ['Approved', 'Rejected'] } }
  },
  supplier_response: {
    submit: { allowed: false },
    view: { allowed: true, scope: 'rfp_owner' },
    edit: { allowed: false },
    create: { allowed: false },
    manage_documents: { allowed: false },
    review: { allowed: true, scope: 'rfp_owner' },
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
        read_responses: {allowed: false},
        publish: { allowed: false },
        review_responses: { allowed: false },
        manage_documents: { allowed: false },
        change_status: { allowed: false },
    },
    supplier_response: {
        create: { allowed: true, allowed_rfp_statuses: ['Published'] },
        submit: { allowed: true, scope: 'own', allowed_response_statuses: ['Draft'] },
        view: { allowed: true, scope: 'own' },
        edit: { allowed: true, scope: 'own', allowed_response_statuses: ['Draft'] },
        manage_documents: { allowed: true, scope: 'own' },
    },
    documents: {
        upload_for_rfp: { allowed: false },
        upload_for_response: { allowed: true, scope: 'own' },
    },
    search: { allowed: true },
    admin: {
        manage_users: false,
        manage_roles: false,
    },
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

  for (const status of Object.values(RFP_STATUS)) {
    await prisma.rFPStatus.upsert({
        where: { code: status },
        update: {},
        create: {
            code: status,
            label: status,
        },
    });
  }
  console.log('RFP statuses seeded.');

  for (const status of Object.values(SUPPLIER_RESPONSE_STATUS)) {
    await prisma.supplierResponseStatus.upsert({
        where: { code: status },
        update: {},
        create: {
            code: status,
            label: status,
        },
    });
  }
  console.log('Supplier response statuses seeded.');

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