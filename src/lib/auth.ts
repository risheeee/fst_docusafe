import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { query } from './db';
import type { User } from '@/types';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(name: string, email: string, password: string, role: 'student' | 'admin'): Promise<User> {
  const hashedPassword = await hashPassword(password);
  const result = await query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at',
    [name, email, hashedPassword, role]
  );
  
  const user = result.rows[0];
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.created_at,
  };
}

export async function getUserByEmail(email: string): Promise<any> {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  
  const user = result.rows[0];
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.created_at,
  };
}

export async function setUserSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('userId', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getUserSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  
  if (!userId) return null;
  return getUserById(userId);
}

export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
}
