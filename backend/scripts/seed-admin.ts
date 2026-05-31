import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const dbUrl = new URL(process.env.DATABASE_URL as string);

const pool = new Pool({
  user: dbUrl.username,
  password: dbUrl.password,
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port, 10),
  database: dbUrl.pathname.slice(1),
  max: 5,
});

const adapter = new PrismaPg(pool, { schema: 'public' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'admin@lefer.com.br';
  const password = 'admin';



  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      isSuperAdmin: true,
      password: hashedPassword,
    },
    create: {
      email,
      name: 'Super Admin Lefer',
      password: hashedPassword,
      isSuperAdmin: true,
    },
  });

  console.log(`Super Admin criado com sucesso!`);
  console.log(`Email: ${user.email}`);
  console.log(`Senha: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
