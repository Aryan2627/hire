import { NextResponse } from 'next/server';
import { login } from '@/lib/session';
import allowedEmails from '@/data/allowed-emails.json';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // 1. Check if email is in the allowed whitelist
    const isAllowed = allowedEmails.some(
      (allowed) => allowed.toLowerCase() === email.toLowerCase()
    );

    if (!isAllowed) {
      return NextResponse.json({ error: 'Access Denied: Email not registered for this exam' }, { status: 403 });
    }

    // 2. Check password logic (first 3 chars + @2026)
    const expectedPassword = email.substring(0, 3) + '@2026';
    if (password !== expectedPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await login(email);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
