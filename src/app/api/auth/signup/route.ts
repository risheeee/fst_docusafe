import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, setUserSession } from '@/lib/auth';
import { initDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (role !== 'student' && role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 400 }
      );
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }

    const user = await createUser(name, email, password, role);
    await setUserSession(user.id);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
