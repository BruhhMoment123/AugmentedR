'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, signOut } from '@/lib/auth';
import { MOCK_COURSES } from '@/lib/mockData';
import type { User } from '@/lib/mockData';
import {
  Star,
  Flame,
  CheckCircle,
  UserCircle,
  ChalkboardTeacher,
  Student,
  Medal,
  SignOut,
  Trophy,
  BookOpen,
  Dna,
  Plant,
  Brain,
  Microscope,
} from '@phosphor-icons/react';

const STAT_ITEMS = [
  { label: 'XP Points', Icon: Star,         key: 'points'          as const, color: '#ffc800' },
  { label: 'Streak',    Icon: Flame,         key: 'streak'          as const, color: '#ff9600' },
  { label: 'Courses',   Icon: CheckCircle,   key: 'completedCourses' as const, color: '#58cc02' },
];

const BADGE_DATA = [
  { Icon: Microscope,       label: 'Cell Explorer',    earned: true  },
  { Icon: Flame,            label: '7-Day Streak',     earned: true  },
  { Icon: Dna,              label: 'DNA Master',       earned: false },
  { Icon: Plant,            label: 'Plant Whisperer',  earned: false },
  { Icon: Brain,            label: 'Neuro Genius',     earned: false },
  { Icon: Trophy,           label: 'Top of Class',     earned: false },
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => { setUser(getUser()); }, []);

  function handleSignOut() {
    signOut();
    router.replace('/sign-in');
  }

  if (!user) return null;

  const isTeacher = user.role === 'teacher';
  const completedCourses = MOCK_COURSES.filter((c) => c.completedLessons === c.totalLessons);
  const avatarColor = isTeacher ? '#ce82ff' : '#58cc02';

  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in" style={{ fontFamily: 'var(--font-nunito)' }}>

      {/* ── Avatar + Name ── */}
      <div className="flex flex-col items-center mb-8">
        {/* Avatar circle with Phosphor icon */}
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center mb-4 animate-bounce-in"
          style={{
            background: `linear-gradient(135deg, ${avatarColor}25, ${avatarColor}10)`,
            border: `3px solid ${avatarColor}60`,
            boxShadow: `0 0 0 6px ${avatarColor}15`,
          }}
        >
          {isTeacher
            ? <ChalkboardTeacher weight="fill" size={60} color={avatarColor} />
            : <Student weight="fill" size={60} color={avatarColor} />
          }
        </div>

        <h1 className="text-2xl font-black text-white">{user.name}</h1>
        <p className="text-white/50 font-semibold text-sm mt-0.5">{user.grade}</p>

        {/* Role badge */}
        <span
          className="mt-3 flex items-center gap-1.5 px-4 py-1.5 rounded-full font-black text-sm"
          style={{
            background: isTeacher ? '#ce82ff18' : '#58cc0218',
            color: isTeacher ? '#ce82ff' : '#58cc02',
            border: `1.5px solid ${isTeacher ? '#ce82ff40' : '#58cc0240'}`,
          }}
        >
          {isTeacher
            ? <ChalkboardTeacher weight="fill" size={16} />
            : <Student weight="fill" size={16} />
          }
          {isTeacher ? 'Teacher' : 'Student'}
        </span>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {STAT_ITEMS.map((stat) => (
          <div key={stat.key} className="kid-card p-4 flex flex-col items-center gap-2">
            <stat.Icon weight="fill" size={28} color={stat.color} />
            <span className="font-black text-xl" style={{ color: stat.color }}>
              {stat.key === 'points' ? user.points.toLocaleString() : user[stat.key]}
            </span>
            <span className="text-white/40 text-xs font-bold text-center">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── Overall progress ── */}
      <div className="kid-card p-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-black text-white text-base">Overall Progress</h2>
          <span className="font-black" style={{ color: '#58cc02' }}>
            {Math.round((user.completedCourses / user.totalCourses) * 100)}%
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar__fill"
            style={{
              width: `${(user.completedCourses / user.totalCourses) * 100}%`,
              background: 'linear-gradient(90deg, #58cc02, #ce82ff)',
            }} />
        </div>
        <p className="text-white/40 text-xs font-semibold mt-2">
          {user.completedCourses} of {user.totalCourses} courses completed
        </p>
      </div>

      {/* ── Badges ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Medal weight="fill" size={22} color="#ffc800" />
          <h2 className="text-lg font-black text-white">Badges</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {BADGE_DATA.map(({ Icon, label, earned }, i) => (
            <div key={label}
              className="kid-card p-4 flex flex-col items-center gap-2 animate-slide-up"
              style={{
                animationDelay: `${i * 0.07}s`,
                opacity: earned ? 1 : 0.3,
              }}>
              <Icon
                weight="fill"
                size={32}
                color={earned ? '#ffc800' : 'rgba(255,255,255,0.4)'}
              />
              <span className="text-xs font-bold text-center leading-tight"
                style={{ color: earned ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Completed courses ── */}
      {completedCourses.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen weight="fill" size={22} color="#58cc02" />
            <h2 className="text-lg font-black text-white">Completed</h2>
          </div>
          <div className="flex flex-col gap-3">
            {completedCourses.map((course) => (
              <div key={course.id} className="kid-card p-4 flex items-center gap-3">
                <span className="text-2xl">{course.emoji}</span>
                <div className="flex-1">
                  <p className="font-black text-white text-sm">{course.title}</p>
                  <p className="text-white/40 text-xs">{course.duration}</p>
                </div>
                <span className="flex items-center gap-1 pill"
                  style={{ background: '#58cc0220', color: '#58cc02' }}>
                  <CheckCircle weight="fill" size={14} />
                  Done
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sign out ── */}
      <button
        id="profile-signout"
        onClick={handleSignOut}
        className="kid-btn kid-btn--ghost w-full mt-2 flex items-center justify-center gap-2"
      >
        <SignOut weight="bold" size={18} />
        Sign Out
      </button>
    </div>
  );
}
