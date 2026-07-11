import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find stuck jobs
  const stuck = await prisma.generationJob.findMany({
    where: { status: { in: ['pending', 'processing'] } },
    select: { id: true, status: true, projectId: true, errorMessage: true, createdAt: true },
  });
  console.log('Stuck jobs:', stuck.length);
  for (const j of stuck) console.log(' ', j.id, j.status, j.createdAt);

  // Mark them as failed so user can retry
  if (stuck.length > 0) {
    await prisma.generationJob.updateMany({
      where: { status: { in: ['pending', 'processing'] } },
      data: { status: 'failed', errorMessage: 'Reset: stuck job cleared' },
    });
    console.log('✅ Cleared stuck jobs');
  }
}
main().then(() => prisma.$disconnect());
