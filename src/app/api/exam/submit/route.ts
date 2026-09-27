import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import questionsDb from '@/questions.json';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const email = session.user.email;
  const data = await request.json();
  const answers = data.answers || {};

  // Evaluate scores
  let logicalScore = 0;
  let quantScore = 0;

  questionsDb.sections.forEach(section => {
    section.questions.forEach((q: any) => {
      if (answers[q.id] && q.correct && answers[q.id] === q.correct) {
        if (section.id === 'logical_reasoning') logicalScore++;
        if (section.id === 'quant') quantScore++;
      }
    });
  });

  await prisma.candidateResponse.update({
    where: { email },
    data: {
      status: 'COMPLETED',
      logicalScore,
      quantScore,
      answers: JSON.stringify(answers),
      completedAt: new Date()
    }
  });

  return NextResponse.json({ success: true, message: 'Test submitted successfully.' });
}
