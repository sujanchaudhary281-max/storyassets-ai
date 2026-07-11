import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import { hash } from 'bcryptjs';

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await hash('test1234', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@storeassets.ai' },
    update: {},
    create: {
      email: 'test@storeassets.ai',
      name: 'Test User',
      passwordHash,
      emailVerified: new Date(),
      creditBalance: 10,
    },
  });

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'FitTrack Pro',
      description: 'AI-powered fitness tracking app',
      ageGroup: '4+',
      fullDescription: 'FitTrack Pro uses AI to analyze your workouts, suggest improvements, and track progress over time. Perfect for gym enthusiasts and home workout lovers.',
      category: 'health-fitness',
      platforms: ['ios', 'android'],
      stylePreset: 'gradient',
      brandColor: '#6366f1',
    },
  });

  console.log('✅ Test user created:');
  console.log(`   Email: test@storeassets.ai`);
  console.log(`   Password: test1234`);
  console.log(`   Credits: 10`);
  console.log(`   Project: ${project.name} (${project.id})`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
