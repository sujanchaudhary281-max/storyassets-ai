import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const templates = [
  {
    name: 'Minimal',
    category: 'minimal',
    isDefault: true,
    config: JSON.stringify({
      bgColor: '#ffffff',
      bgGradientEnd: null,
      textColor: '#171717',
      subtextColor: '#525252',
      fontWeight: 'normal',
      headlineYRatio: 0.08,
      subtextYRatio: 0.12,
      frameBg: '#f5f5f5',
      frameRadius: 12,
      frameVisible: true,
    }),
  },
  {
    name: 'Bold',
    category: 'bold',
    isDefault: false,
    config: JSON.stringify({
      bgColor: '#ff2d55',
      bgGradientEnd: null,
      textColor: '#ffffff',
      subtextColor: '#ffe0e6',
      fontWeight: 'bold',
      headlineYRatio: 0.08,
      subtextYRatio: 0.12,
      frameBg: 'transparent',
      frameRadius: 16,
      frameVisible: false,
    }),
  },
  {
    name: 'Gradient',
    category: 'gradient',
    isDefault: false,
    config: JSON.stringify({
      bgColor: '#007cf0',
      bgGradientEnd: '#7928ca',
      textColor: '#ffffff',
      subtextColor: '#e0e0ff',
      fontWeight: 'bold',
      headlineYRatio: 0.08,
      subtextYRatio: 0.12,
      frameBg: '#1a1a2e',
      frameRadius: 14,
      frameVisible: true,
    }),
  },
  {
    name: 'Dark',
    category: 'dark',
    isDefault: false,
    config: JSON.stringify({
      bgColor: '#0a0a0a',
      bgGradientEnd: null,
      textColor: '#ffffff',
      subtextColor: '#a0a0a0',
      fontWeight: 'bold',
      headlineYRatio: 0.08,
      subtextYRatio: 0.12,
      frameBg: '#1a1a1a',
      frameRadius: 12,
      frameVisible: true,
    }),
  },
  {
    name: 'Photo Realistic',
    category: 'photo-realistic',
    isDefault: false,
    config: JSON.stringify({
      bgColor: '#1a1a2e',
      bgGradientEnd: null,
      textColor: '#ffffff',
      subtextColor: '#c0c0d0',
      fontWeight: 'bold',
      headlineYRatio: 0.08,
      subtextYRatio: 0.12,
      frameBg: '#0d0d1a',
      frameRadius: 20,
      frameVisible: true,
    }),
  },
  {
    name: 'Illustration',
    category: 'illustration',
    isDefault: false,
    config: JSON.stringify({
      bgColor: '#e8f4fd',
      bgGradientEnd: null,
      textColor: '#1a1a2e',
      subtextColor: '#4a5568',
      fontWeight: 'normal',
      headlineYRatio: 0.08,
      subtextYRatio: 0.12,
      frameBg: '#ffffff',
      frameRadius: 24,
      frameVisible: true,
    }),
  },
  {
    name: 'Raw UI',
    category: 'raw-ui',
    isDefault: false,
    config: JSON.stringify({
      bgColor: '#f9fafb',
      bgGradientEnd: null,
      textColor: '#374151',
      subtextColor: '#6b7280',
      fontWeight: 'normal',
      headlineYRatio: 0.08,
      subtextYRatio: 0.12,
      frameBg: '#ffffff',
      frameRadius: 4,
      frameVisible: true,
    }),
  },
];

async function main() {
  await prisma.template.deleteMany({});
  await prisma.template.createMany({ data: templates });
  console.log(`Seeded ${templates.length} templates`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
