import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function logActivity(
  userId: string,
  action: string,
  opts?: { projectId?: string; metadata?: Record<string, unknown> }
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        projectId: opts?.projectId,
        action,
        metadata: opts?.metadata as Prisma.InputJsonValue | undefined,
      },
    })
  } catch (err) {
    console.error('logActivity failed:', err)
  }
}
