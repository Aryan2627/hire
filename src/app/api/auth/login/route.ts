import { NextResponse } from 'next/server';
import { login } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // Common ID / Password for all candidates
    if (email !== 'candidate' || password !== 'hire2026') {
      return NextResponse.json({ error: 'Invalid credentials. Please use the common access details.' }, { status: 401 });
    }

    // Login with a temporary generic session
    await login('pending_onboarding');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
