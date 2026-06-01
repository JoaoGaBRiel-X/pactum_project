const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const newPass = 'admin';
  const hash = await bcrypt.hash(newPass, 10);
  
  const admin = await prisma.user.findFirst({ where: { isSuperAdmin: true } });
  if (!admin) {
    console.log('No super admin found.');
    await prisma.$disconnect();
    return;
  }
  
  console.log('Found super admin:', admin.email);
  
  // Verify current password matches 'admin'
  const matches = await bcrypt.compare('admin', admin.password);
  console.log('Password "admin" matches:', matches);
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
