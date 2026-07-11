import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL ?? ''
  if (!connectionString || connectionString.includes('user:password@host')) {
    // Return a stub during build - will fail at runtime if actually called
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (prop === '$connect' || prop === '$disconnect') return () => Promise.resolve()
        throw new Error(`Database not configured. Set DATABASE_URL in .env.local`)
      }
    })
  }
  const adapter = new PrismaNeon({ connectionString })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
