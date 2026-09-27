import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getCandidateResponse, updateCandidateResponse } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const email = session.user.email;
  let response = getCandidateResponse(email);
  
  if (!response) {
    updateCandidateResponse(email, { status: 'PENDING', currentSectionIndex: 0, answers: {} });
    response = getCandidateResponse(email);
  }

  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const email = session.user.email;
  const data = await request.json();
  
  // Save progress
  updateCandidateResponse(email, data);
  return NextResponse.json({ success: true });
}
