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
      console.log('Database missing columns or table, attempting auto-patch...', dbError.message);
      
      // Full table creation and alter just in case
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "CandidateResponse" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "name" TEXT,
            "phone" TEXT,
            "education" TEXT,
            "experience" TEXT,
            "status" TEXT NOT NULL DEFAULT 'PENDING',
            "currentSectionIndex" INTEGER NOT NULL DEFAULT 0,
            "answers" TEXT,
            "logicalScore" INTEGER,
            "quantScore" INTEGER,
            "completedAt" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "CandidateResponse_pkey" PRIMARY KEY ("id")
        );
      `);

      try {
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "CandidateResponse_email_key" ON "CandidateResponse"("email");`);
      } catch (e) {
        // Index might already exist
      }

      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "CandidateResponse" 
          ADD COLUMN IF NOT EXISTS "name" TEXT, 
          ADD COLUMN IF NOT EXISTS "phone" TEXT, 
          ADD COLUMN IF NOT EXISTS "education" TEXT, 
          ADD COLUMN IF NOT EXISTS "experience" TEXT;
        `);
      } catch (e) {
        // Ignore alter errors if it was just created
      }
      
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
    return NextResponse.json({ error: 'Internal Server Error: ' + (err.message || String(err)) }, { status: 500 });
  }
}
