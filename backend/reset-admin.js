const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// Uses DATABASE_URL from env (reads .env automatically via prisma)
const prisma = new PrismaClient();

async function main() {
  const newPass = 'admin123';
  const hash = await bcrypt.hash(newPass, 10);
  
  // Find super admin
  const admin = await prisma.user.findFirst({ where: { isSuperAdmin: true } });
  if (!admin) {
    console.log('No super admin found. Creating one...');
    const created = await prisma.user.create({
      data: {
        email: 'admin@lefer.com.br',
        name: 'Super Admin',
        password: hash,
        isSuperAdmin: true,
      }
    });
    console.log('Created super admin:', created.email);
  } else {
    console.log('Found super admin:', admin.email);
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hash, email: 'admin@lefer.com.br' }
    });
    console.log('Password reset to: admin123');
  }
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
