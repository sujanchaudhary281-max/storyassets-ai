import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { templateId, platform, matchStyleAcross } = await request.json();

  const data: Record<string, unknown> = { matchStyleAcross: matchStyleAcross ?? false };

  if (platform === 'all' || matchStyleAcross) {
    data.templateId = templateId;
  } else if (platform === 'ios') {
    data.iosTemplateId = templateId;
  } else if (platform === 'android') {
    data.androidTemplateId = templateId;
  }

  const updated = await prisma.project.update({ where: { id }, data });
  return NextResponse.json(updated);
}
