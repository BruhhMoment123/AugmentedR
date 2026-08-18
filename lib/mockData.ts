// ─── Mock Data for Biology AR Educational Platform ───────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatar: string; // emoji avatar
  grade: string;
  points: number;
  completedCourses: number;
  totalCourses: number;
  streak: number; // days
  joinedDate: string;
}

export interface Course {
  id: string;
  title: string;
  subject: string;
  description: string;
  teacher: string;
  teacherId: string;
  emoji: string;
  color: string; // accent color
  duration: string;
  totalLessons: number;
  completedLessons: number;
  hasARModel: boolean;
  modelRoute?: string;
  tags: string[];
  dateAdded: string;
  enrolled: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  points: number;
  completedPercent: number;
  badge: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  subject: string;
  emoji: string;
  color: string;
  date: string; // ISO date
  time: string;
  type: 'lesson' | 'quiz' | 'lab' | 'assignment';
  teacher: string;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Aarav Sharma',
    email: 'aarav@school.edu',
    role: 'student',
    avatar: '🧑‍🎓',
    grade: 'Grade 9',
    points: 3420,
    completedCourses: 5,
    totalCourses: 8,
    streak: 12,
    joinedDate: '2026-01-15',
  },
  {
    id: 'u2',
    name: 'Priya Nair',
    email: 'priya@school.edu',
    role: 'student',
    avatar: '👩‍🎓',
    grade: 'Grade 9',
    points: 4100,
    completedCourses: 7,
    totalCourses: 8,
    streak: 21,
    joinedDate: '2026-01-10',
  },
  {
    id: 'u3',
    name: 'Rohan Mehta',
    email: 'rohan@school.edu',
    role: 'student',
    avatar: '🧑',
    grade: 'Grade 9',
    points: 2850,
    completedCourses: 4,
    totalCourses: 8,
    streak: 7,
    joinedDate: '2026-02-01',
  },
  {
    id: 't1',
    name: 'Dr. Sneha Pillai',
    email: 'sneha@school.edu',
    role: 'teacher',
    avatar: '👩‍🏫',
    grade: 'Biology Dept.',
    points: 0,
    completedCourses: 0,
    totalCourses: 0,
    streak: 0,
    joinedDate: '2025-07-01',
  },
];

// ─── Courses ──────────────────────────────────────────────────────────────────

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'The Human Cell',
    subject: 'Biology',
    description: 'Explore the building blocks of life. Dive inside a cell and interact with every organelle in stunning 3D and AR.',
    teacher: 'Dr. Sneha Pillai',
    teacherId: 't1',
    emoji: '🔬',
    color: '#4ade80',
    duration: '45 min',
    totalLessons: 6,
    completedLessons: 4,
    hasARModel: true,
    modelRoute: '/cell',
    tags: ['Biology', 'Grade 9', 'AR'],
    dateAdded: '2026-07-20',
    enrolled: 28,
  },
  {
    id: 'c2',
    title: 'The Circulatory System',
    subject: 'Biology',
    description: 'Follow a red blood cell on its journey through the heart, arteries and veins of the human body.',
    teacher: 'Dr. Sneha Pillai',
    teacherId: 't1',
    emoji: '❤️',
    color: '#f87171',
    duration: '30 min',
    totalLessons: 5,
    completedLessons: 5,
    hasARModel: false,
    tags: ['Biology', 'Grade 9'],
    dateAdded: '2026-07-25',
    enrolled: 28,
  },
  {
    id: 'c3',
    title: 'DNA & Genetics',
    subject: 'Biology',
    description: 'Unravel the double helix. Learn how genetic information is stored, copied, and expressed.',
    teacher: 'Dr. Sneha Pillai',
    teacherId: 't1',
    emoji: '🧬',
    color: '#c084fc',
    duration: '50 min',
    totalLessons: 8,
    completedLessons: 2,
    hasARModel: false,
    tags: ['Biology', 'Grade 9', 'Genetics'],
    dateAdded: '2026-07-28',
    enrolled: 25,
  },
  {
    id: 'c4',
    title: 'Photosynthesis',
    subject: 'Biology',
    description: 'See how plants convert sunlight into energy. Explore the chloroplast and the light reactions.',
    teacher: 'Dr. Sneha Pillai',
    teacherId: 't1',
    emoji: '🌿',
    color: '#34d399',
    duration: '35 min',
    totalLessons: 4,
    completedLessons: 0,
    hasARModel: false,
    tags: ['Biology', 'Plants', 'Grade 9'],
    dateAdded: '2026-08-01',
    enrolled: 22,
  },
  {
    id: 'c5',
    title: 'The Nervous System',
    subject: 'Biology',
    description: 'How do neurons talk to each other? Understand the brain, spinal cord, and nerve impulses.',
    teacher: 'Dr. Sneha Pillai',
    teacherId: 't1',
    emoji: '🧠',
    color: '#60a5fa',
    duration: '40 min',
    totalLessons: 7,
    completedLessons: 0,
    hasARModel: false,
    tags: ['Biology', 'Grade 9', 'Neuroscience'],
    dateAdded: '2026-08-03',
    enrolled: 20,
  },
];

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: 'u2', name: 'Priya Nair',      avatar: '👩‍🎓', points: 4100, completedPercent: 87, badge: '👑' },
  { rank: 2, userId: 'lb2', name: 'Arjun Kapoor',   avatar: '🧑', points: 3900, completedPercent: 80, badge: '🥈' },
  { rank: 3, userId: 'lb3', name: 'Sneha Gupta',    avatar: '👧', points: 3650, completedPercent: 75, badge: '🥉' },
  { rank: 4, userId: 'u1', name: 'Aarav Sharma',    avatar: '🧑‍🎓', points: 3420, completedPercent: 62, badge: '' },
  { rank: 5, userId: 'lb5', name: 'Diya Menon',     avatar: '👩', points: 3200, completedPercent: 58, badge: '' },
  { rank: 6, userId: 'u3', name: 'Rohan Mehta',     avatar: '🧑', points: 2850, completedPercent: 50, badge: '' },
  { rank: 7, userId: 'lb7', name: 'Kabir Singh',    avatar: '🧒', points: 2600, completedPercent: 45, badge: '' },
  { rank: 8, userId: 'lb8', name: 'Ananya Bose',    avatar: '👧', points: 2400, completedPercent: 42, badge: '' },
];

// ─── Calendar Events ──────────────────────────────────────────────────────────

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Cell Organelles Quiz',
    subject: 'Biology',
    emoji: '📝',
    color: '#4ade80',
    date: fmt(today),
    time: '10:00 AM',
    type: 'quiz',
    teacher: 'Dr. Sneha Pillai',
  },
  {
    id: 'e2',
    title: 'AR Lab — Human Cell',
    subject: 'Biology',
    emoji: '🔬',
    color: '#c084fc',
    date: fmt(today),
    time: '2:00 PM',
    type: 'lab',
    teacher: 'Dr. Sneha Pillai',
  },
  {
    id: 'e3',
    title: 'Circulatory System Lesson',
    subject: 'Biology',
    emoji: '❤️',
    color: '#f87171',
    date: fmt(addDays(today, 1)),
    time: '11:00 AM',
    type: 'lesson',
    teacher: 'Dr. Sneha Pillai',
  },
  {
    id: 'e4',
    title: 'DNA Assignment Due',
    subject: 'Biology',
    emoji: '🧬',
    color: '#fbbf24',
    date: fmt(addDays(today, 2)),
    time: '11:59 PM',
    type: 'assignment',
    teacher: 'Dr. Sneha Pillai',
  },
  {
    id: 'e5',
    title: 'Photosynthesis Lesson',
    subject: 'Biology',
    emoji: '🌿',
    color: '#34d399',
    date: fmt(addDays(today, 3)),
    time: '10:00 AM',
    type: 'lesson',
    teacher: 'Dr. Sneha Pillai',
  },
  {
    id: 'e6',
    title: 'Nervous System Intro',
    subject: 'Biology',
    emoji: '🧠',
    color: '#60a5fa',
    date: fmt(addDays(today, 5)),
    time: '9:00 AM',
    type: 'lesson',
    teacher: 'Dr. Sneha Pillai',
  },
];
