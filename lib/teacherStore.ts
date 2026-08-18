// ─── Role-aware localStorage store for teacher-added content ─────────────────
// Persists teacher-created events and courses across refreshes.
// Replace with a real backend API in production.

import type { CalendarEvent, Course } from './mockData';

const EVENTS_KEY  = 'bio_ar_events';
const COURSES_KEY = 'bio_ar_courses';

// ── Events ────────────────────────────────────────────────────────────────────

export function getCustomEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]') as CalendarEvent[];
  } catch { return []; }
}

export function saveEvent(event: CalendarEvent): void {
  const existing = getCustomEvents();
  existing.push(event);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(existing));
}

export function deleteEvent(id: string): void {
  const updated = getCustomEvents().filter((e) => e.id !== id);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
}

// ── Courses ───────────────────────────────────────────────────────────────────

export function getCustomCourses(): Course[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(COURSES_KEY) ?? '[]') as Course[];
  } catch { return []; }
}

export function saveCourse(course: Course): void {
  const existing = getCustomCourses();
  existing.push(course);
  localStorage.setItem(COURSES_KEY, JSON.stringify(existing));
}

export function deleteCourse(id: string): void {
  const updated = getCustomCourses().filter((c) => c.id !== id);
  localStorage.setItem(COURSES_KEY, JSON.stringify(updated));
}
