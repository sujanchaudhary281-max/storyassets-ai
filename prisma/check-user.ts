import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@storeassets.ai' },
    select: { id: true, email: true, emailVerified: true, passwordHash: true },
  });
  console.log(JSON.stringify(user, null, 2));
}

main().then(() => prisma.$disconnect());
