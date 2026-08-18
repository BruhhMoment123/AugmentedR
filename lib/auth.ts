'use client';

// ─── Mock Auth with localStorage ─────────────────────────────────────────────
// No real backend needed for the demo. Role is stored in localStorage.
// Replace with real auth (Supabase, Firebase, etc.) in production.

import { MOCK_USERS, type User } from './mockData';

const AUTH_KEY = 'bio_ar_user';

export function signIn(email: string, _password: string): User | null {
  const user = MOCK_USERS.find((u) => u.email === email);
  if (!user) return null;
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
  return user;
}

export function signUp(name: string, email: string, role: 'student' | 'teacher'): User {
  const newUser: User = {
    id: `u_${Date.now()}`,
    name,
    email,
    role,
    avatar: role === 'teacher' ? '👩‍🏫' : '🧑‍🎓',
    grade: role === 'teacher' ? 'Teacher' : 'Grade 9',
    points: 0,
    completedCourses: 0,
    totalCourses: 5,
    streak: 0,
    joinedDate: new Date().toISOString().split('T')[0],
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
  }
  return newUser;
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as User; } catch { return null; }
}

export function signOut(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}
