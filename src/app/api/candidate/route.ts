import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { login } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { name, email, phone, education, experience } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Upsert candidate based on email
    const candidate = await prisma.candidateResponse.upsert({
      where: { email },
      update: {
        name,
        phone,
        education,
        experience,
        // Reset test status if they are registering again? Or keep it.
        // We'll leave it as is if they already exist so they can resume
      },
      create: {
        email,
        name,
        phone,
        education,
        experience,
        status: 'PENDING',
        currentSectionIndex: 0
      }
    });

    // Update their session to reflect their actual email, overriding 'pending_onboarding'
    await login(email);

    return NextResponse.json({ success: true, candidate });
  } catch (err: any) {
    console.error('Registration Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
