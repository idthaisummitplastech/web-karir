import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function run() {
  const admins = await p.recruitmentAdmin.findMany();
  console.log('KARIR_ADMINS:', JSON.stringify(admins.map(a => ({ username: a.username, email: a.email, role: a.role, isMfaEnabled: a.isMfaEnabled }))));
}

run().catch(console.error).finally(() => p.$disconnect());
