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
  const hash = await bcrypt.hash('demo1234', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@storeassets.ai',
      name: 'Demo User',
      passwordHash: hash,
      emailVerified: new Date(),
      creditBalance: 20,
    },
  });
  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'MealPrep AI',
      description: 'Smart meal planning and grocery lists',
      ageGroup: 'all-ages',
      fullDescription: 'MealPrep AI creates personalized weekly meal plans based on your dietary preferences, generates shopping lists, and tracks nutrition goals automatically.',
      category: 'health-fitness',
      platforms: ['ios', 'android'],
      stylePreset: 'dark',
      brandColor: '#10b981',
    },
  });
  console.log('Email: demo@storeassets.ai');
  console.log('Password: demo1234');
  console.log('Credits: 20');
  console.log('Project:', project.name, '(' + project.id + ')');
}
main().then(() => prisma.$disconnect());
