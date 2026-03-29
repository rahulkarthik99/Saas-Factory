import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/db/prisma';
import { addBuildJob } from '@/queue';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check plan limits
    if (user.plan === 'FREE' && user.credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits. Please upgrade.' }, { status: 403 });
    }

    const { name, description, code } = await req.json();

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: user.id,
        status: 'PENDING',
        code: JSON.stringify(code),
      },
    });

    if (user.plan === 'FREE') {
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: 1 } },
      });
    }

    const queued = await addBuildJob(project.id, code);

    if (!queued) {
      throw new Error('Failed to queue build job');
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error('Project creation failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
