import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany();
  console.log(JSON.stringify(customers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
