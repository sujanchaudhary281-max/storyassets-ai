import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = 'test1234';
  const hash = await bcrypt.hash(password, 10);
  console.log('New hash:', hash);
  
  // Verify the hash works
  const valid = await bcrypt.compare(password, hash);
  console.log('Verify:', valid);

  await prisma.user.update({
    where: { email: 'test@storeassets.ai' },
    data: { passwordHash: hash },
  });
  console.log('✅ Password reset for test@storeassets.ai → test1234');
}

main().then(() => prisma.$disconnect());
