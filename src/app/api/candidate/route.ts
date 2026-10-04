import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { login } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { name, email, phone, education, experience } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    let candidate;
    try {
      // Upsert candidate based on email
      candidate = await prisma.candidateResponse.upsert({
        where: { email },
        update: { name, phone, education, experience },
        create: { email, name, phone, education, experience, status: 'PENDING', currentSectionIndex: 0 }
      });
    } catch (dbError: any) {
      // If the error is about missing columns (because prisma db push wasn't run on Vercel), auto-patch the DB
      console.log('Database missing columns, attempting auto-patch...', dbError.message);
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "CandidateResponse" 
        ADD COLUMN IF NOT EXISTS "name" TEXT, 
        ADD COLUMN IF NOT EXISTS "phone" TEXT, 
        ADD COLUMN IF NOT EXISTS "education" TEXT, 
        ADD COLUMN IF NOT EXISTS "experience" TEXT;
      `);
      
      // Retry the upsert after patching
      candidate = await prisma.candidateResponse.upsert({
        where: { email },
        update: { name, phone, education, experience },
        create: { email, name, phone, education, experience, status: 'PENDING', currentSectionIndex: 0 }
      });
    }

    // Update their session to reflect their actual email, overriding 'pending_onboarding'
    await login(email);

    return NextResponse.json({ success: true, candidate });
  } catch (err: any) {
    console.error('Registration Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
