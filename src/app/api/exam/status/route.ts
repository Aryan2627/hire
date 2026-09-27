import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const email = session.user.email;
  
  let response = await prisma.candidateResponse.findUnique({
    where: { email }
  });
  
  if (!response) {
    response = await prisma.candidateResponse.create({
      data: {
        email,
        status: 'PENDING',
        currentSectionIndex: 0,
        answers: JSON.stringify({})
      }
    });
  }

  // Parse answers safely for the frontend
  let parsedAnswers = {};
  try {
    parsedAnswers = response.answers ? JSON.parse(response.answers) : {};
  } catch (e) {}

  return NextResponse.json({
    ...response,
    answers: parsedAnswers
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const email = session.user.email;
  const data = await request.json();
  
  // Save progress
  await prisma.candidateResponse.update({
    where: { email },
    data: {
      currentSectionIndex: data.currentSectionIndex ?? 0,
      answers: data.answers ? JSON.stringify(data.answers) : undefined
    }
  });
  
  return NextResponse.json({ success: true });
}
