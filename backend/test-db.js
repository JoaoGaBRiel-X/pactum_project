const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const schema = 'tenant_8fad7a08-ce74-404a-a2b4-18171cb19619'; // My active tenant from previous test
  console.log('Testing recent overdue query on schema', schema);

  try {
    // We override search_path per Prisma PG adapter or we can just use raw query to see if table exists
    const res = await prisma.$queryRawUnsafe(`SET search_path TO "${schema}"`);
    console.log("Set schema OK");
    
    // Now simulate what Prisma does with receivables
    const overdue = await prisma.receivable.findMany({
      where: { status: 'OVERDUE' },
      include: {
        customer: { select: { corporateName: true, document: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });
    console.log("Overdue", overdue);
  } catch(e) {
    console.error("DB Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
