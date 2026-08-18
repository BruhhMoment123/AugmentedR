'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { MOCK_COURSES, MOCK_EVENTS, MOCK_LEADERBOARD, MOCK_USERS } from '@/lib/mockData';
import { getCustomEvents, getCustomCourses } from '@/lib/teacherStore';
import type { User } from '@/lib/mockData';
import {
  Flame, Heart, Diamond, Microscope, UserCircle, Lock, CheckCircle, Star,
  Student, Books, Broadcast, Lightning, Plus, CalendarBlank, Trophy, ChartBar,
  ClipboardText, Sparkle, ChalkboardTeacher
} from '@phosphor-icons/react';
import { LessonIcon, AvatarIcon } from '@/components/ui/IconHelper';

// ─── Teacher Dashboard ────────────────────────────────────────────────────────
function TeacherDashboard({ user }: { user: User }) {
  const router = useRouter();
  const [customCourses, setCustomCourses] = useState(getCustomCourses());
  const allCourses = [...MOCK_COURSES, ...customCourses];
  const todayStr = new Date().toISOString().split('T')[0];
  const allEvents = [...MOCK_EVENTS, ...getCustomEvents()];
  const todayEvents = allEvents.filter((e) => e.date === todayStr);

  const totalStudents = MOCK_USERS.filter((u) => u.role === 'student').length;
  const publishedCourses = allCourses.length;
  const arCourses = allCourses.filter((c) => c.hasARModel).length;

  // refresh on focus
  useEffect(() => {
    const handler = () => setCustomCourses(getCustomCourses());
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, []);

  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in" style={{ fontFamily: 'var(--font-nunito)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/50 text-sm font-semibold">Teacher Portal</p>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Hello, {user.name.split(' ')[0]}!</h1>
            {user.role === 'teacher' && <ChalkboardTeacher weight="fill" size={24} color="#ce82ff" />}
          </div>
        </div>
        <button id="dash-avatar-teacher" onClick={() => router.push('/profile')}
          className="w-11 h-11 rounded-full flex items-center justify-center border-2"
          style={{ background: '#ce82ff20', borderColor: '#ce82ff60' }}>
          <AvatarIcon role={user.role} avatar={user.avatar} size={22} color="#ce82ff" />
        </button>
      </div>

      {/* Class Overview Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Students',  value: totalStudents,    Icon: Student,   color: '#60a5fa' },
          { label: 'Courses',   value: publishedCourses, Icon: Books,     color: '#ce82ff' },
          { label: 'AR Models', value: arCourses,        Icon: Broadcast, color: '#58cc02' },
        ].map((stat) => (
          <div key={stat.label} className="kid-card p-4 flex flex-col items-center gap-1">
            <stat.Icon weight="fill" size={28} color={stat.color} />
            <span className="font-black text-2xl" style={{ color: stat.color }}>{stat.value}</span>
            <span className="text-white/40 text-xs font-bold text-center">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightning weight="fill" size={20} color="#ffc800" />
          <h2 className="text-lg font-black text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button id="quick-add-course" onClick={() => router.push('/courses')}
            className="kid-card p-4 flex flex-col items-center gap-2 cursor-pointer"
            style={{ borderColor: '#ce82ff30' }}>
            <Plus weight="bold" size={26} color="#ce82ff" />
            <span className="font-black text-white text-sm">Add Course</span>
          </button>
          <button id="quick-add-event" onClick={() => router.push('/calendar')}
            className="kid-card p-4 flex flex-col items-center gap-2 cursor-pointer"
            style={{ borderColor: '#60a5fa30' }}>
            <CalendarBlank weight="fill" size={26} color="#60a5fa" />
            <span className="font-black text-white text-sm">Schedule Class</span>
          </button>
          <button id="quick-view-ranks" onClick={() => router.push('/leaderboard')}
            className="kid-card p-4 flex flex-col items-center gap-2 cursor-pointer"
            style={{ borderColor: '#ffc80030' }}>
            <Trophy weight="fill" size={26} color="#ffc800" />
            <span className="font-black text-white text-sm">View Rankings</span>
          </button>
          <Link href="/cell" id="quick-view-cell"
            className="kid-card p-4 flex flex-col items-center gap-2 cursor-pointer"
            style={{ borderColor: '#58cc0230' }}>
            <Microscope weight="fill" size={26} color="#58cc02" />
            <span className="font-black text-white text-sm">Open 3D Viewer</span>
          </Link>
        </div>
      </div>

      {/* Student Progress Overview */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ChartBar weight="fill" size={20} color="#58cc02" />
          <h2 className="text-lg font-black text-white">Student Progress</h2>
        </div>
        <div className="flex flex-col gap-3">
          {MOCK_LEADERBOARD.slice(0, 4).map((entry, i) => (
            <div key={entry.userId} className="kid-card p-4 flex items-center gap-3 animate-slide-up"
              style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 flex-shrink-0">
                <AvatarIcon role="student" avatar={entry.avatar} size={20} color="#60a5fa" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-sm truncate">{entry.name.split(' ')[0]}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="progress-bar flex-1">
                    <div className="progress-bar__fill"
                      style={{ width: `${entry.completedPercent}%`, background: '#4ade80' }} />
                  </div>
                  <span className="text-xs font-bold text-white/40">{entry.completedPercent}%</span>
                </div>
              </div>
              <span className="text-xs font-black text-[#fbbf24]">{entry.points.toLocaleString()} XP</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Classes */}
      {todayEvents.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarBlank weight="fill" size={20} color="#60a5fa" />
            <h2 className="text-lg font-black text-white">Today&apos;s Classes</h2>
          </div>
          <div className="flex flex-col gap-3">
            {todayEvents.map((event, i) => (
              <div key={event.id} className="kid-card p-4 flex items-center gap-4 animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${event.color}22` }}>
                  {event.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white text-sm">{event.title}</p>
                  <p className="text-white/40 text-xs font-semibold">{event.time}</p>
                </div>
                <span className="pill" style={{ background: `${event.color}20`, color: event.color }}>{event.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Lesson path config ───────────────────────────────────────────────────────
// xOff = horizontal offset from container center (px). Negative = left, positive = right.
const LESSON_DATA = [
  { id:'l1', label:'Cell Membrane',          emoji:'🫧', state:'completed' as const, xOff:  10 },
  { id:'l2', label:'Nucleus',                emoji:'🔵', state:'completed' as const, xOff: -90 },
  { id:'l3', label:'Mitochondria',           emoji:'⚡', state:'completed' as const, xOff:-105 },
  { id:'l4', label:'Reticulum',              emoji:'🌀', state:'completed' as const, xOff: -40 },
  { id:'l5', label:'Golgi Body',             emoji:'📦', state:'current'  as const, xOff:  55 },
  { id:'l6', label:'AR Lab',                emoji:'📡', state:'ar'       as const, xOff: 100 },
  { id:'l7', label:'Lysosomes',              emoji:'💧', state:'locked'   as const, xOff:  45 },
  { id:'l8', label:'Final Quiz',             emoji:'📝', state:'locked'   as const, xOff: -10 },
];

const STATE_STYLE = {
  completed: { bg:'#58cc02', shadow:'#46a302', text:'#58cc02' },
  current:   { bg:'#1cb0f6', shadow:'#0a8fc4', text:'#1cb0f6' },
  ar:        { bg:'#ce82ff', shadow:'#a854f7', text:'#ce82ff' },
  locked:    { bg:'#2d2d3d', shadow:'#1a1a28', text:'rgba(255,255,255,0.2)' },
};

// ─── SVG Lesson Path component ────────────────────────────────────────────────
function LessonPath({ onGo }: { onGo: (p: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(340); // container width

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCw(el.offsetWidth));
    ro.observe(el);
    setCw(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const D  = 76;   // normal circle diameter
  const DC = 92;   // current circle diameter
  const YSTEP = 148; // vertical spacing between circle centers
  const PAD  = 20;   // top padding

  // Compute absolute center (x, y) for each circle
  const centers = LESSON_DATA.map((l, i) => ({
    x: cw / 2 + l.xOff,
    y: PAD + i * YSTEP + (l.state === 'current' ? DC : D) / 2,
  }));

  const totalH = PAD + LESSON_DATA.length * YSTEP + D + 20;


  return (
    <div ref={ref} style={{ position: 'relative', height: totalH, width: '100%' }}>

      {/* Absolutely positioned circles */}
      {LESSON_DATA.map((lesson, i) => {
        const isAR      = lesson.state === 'ar';
        const isCurrent = lesson.state === 'current';
        const isLocked  = lesson.state === 'locked';
        const d  = isCurrent ? DC : D;
        const r  = d / 2;
        const cx = centers[i].x;
        const cy = centers[i].y;
        const s  = STATE_STYLE[lesson.state];

        return (
          <div
            key={lesson.id}
            style={{
              position: 'absolute',
              left: cx - r,
              top:  cy - r,
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: `slideUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s both`,
            }}
          >
            {/* Circle button */}
            <button
              id={`lesson-${lesson.id}`}
              onClick={() => { if (!isLocked) onGo('/cell'); }}
              style={{
                width: d, height: d,
                borderRadius: '50%',
                background: s.bg,
                border: 'none',
                boxShadow: `0 6px 0 ${s.shadow}`,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isCurrent ? 40 : 30,
                opacity: isLocked ? 0.55 : 1,
                transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)',
                animation: isCurrent ? 'pulseRing 2s ease-out infinite' : 'none',
                color: '#fff',
                fontFamily: 'var(--font-nunito)',
                fontWeight: 900,
              }}
            >
              {lesson.state === 'completed'
                ? <CheckCircle weight="fill" size={isCurrent ? 44 : 36} color="#fff" />
                : isLocked
                ? <Lock weight="fill" size={28} color="rgba(255,255,255,0.4)" />
                : <LessonIcon id={lesson.id} emoji={lesson.emoji} size={isCurrent ? 40 : 34} color="#fff" />}
            </button>

            {/* Label below circle */}
            <div style={{
              marginTop: 8,
              textAlign: 'center',
              width: 96,
              fontFamily: 'var(--font-nunito)',
            }}>
              <p style={{
                fontSize: 11.5,
                fontWeight: 800,
                color: isLocked ? 'rgba(255,255,255,0.22)' : '#fff',
                lineHeight: 1.25,
              }}>
                {lesson.label}
              </p>
              {isCurrent && (
                <p style={{ fontSize: 10, fontWeight: 800, color: '#1cb0f6', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Start!</p>
              )}
              {isAR && (
                <p style={{ fontSize: 10, fontWeight: 800, color: '#ce82ff', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <Broadcast weight="fill" size={10} /> AR
                </p>
              )}
              {lesson.state === 'completed' && (
                <p style={{ fontSize: 10, fontWeight: 800, color: '#58cc02', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <CheckCircle weight="fill" size={10} /> Done
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────
function StudentDashboard({ user }: { user: User }) {
  const router = useRouter();
  const todayStr   = new Date().toISOString().split('T')[0];
  const todayEvents = MOCK_EVENTS.filter((e) => e.date === todayStr);
  const hearts = 5;

  return (
    <div className="animate-fade-in pb-4" style={{ fontFamily: 'var(--font-nunito)' }}>

      {/* ── Top Stats Bar ── */}
      <div className="top-stats-bar">
        <div className="flex items-center gap-1.5 mr-auto">
          <Microscope weight="fill" size={24} color="#1cb0f6" />
          <span className="font-black text-sm text-white/70 uppercase tracking-wider">Biology</span>
        </div>
        <div className="stat-pill" style={{ color: '#ff9600' }}>
          <Flame weight="fill" size={18} color="#ff9600" />
          <span>{user.streak}</span>
        </div>
        <div className="stat-pill" style={{ color: '#ff4b4b' }}>
          <Heart weight="fill" size={18} color="#ff4b4b" />
          <span>{hearts}</span>
        </div>
        <div className="stat-pill" style={{ color: '#1cb0f6' }}>
          <Diamond weight="fill" size={18} color="#1cb0f6" />
          <span>{user.points.toLocaleString()}</span>
        </div>
        <button id="dash-avatar" onClick={() => router.push('/profile')}
          className="w-9 h-9 rounded-full flex items-center justify-center border-2 ml-1 flex-shrink-0"
          style={{ background: '#1cb0f620', borderColor: '#1cb0f660' }}>
          <AvatarIcon role={user.role} avatar={user.avatar} size={20} color="#1cb0f6" />
        </button>
      </div>

      <div className="px-5 pt-5">

        {/* ── Section Banner ── */}
        <div className="section-banner mb-5 animate-slide-up"
          style={{ background: 'linear-gradient(135deg, #1cb0f6, #0a8fc4)' }}>
          <div>
            <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-0.5">Section 1 · Unit 1</p>
            <p className="text-white font-black text-lg">The Human Cell</p>
          </div>
          <button id="section-guide"
            aria-label="Section guide"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <ClipboardText weight="fill" size={22} color="#fff" />
          </button>
        </div>

        {/* ── SVG Lesson Path ── */}
        <LessonPath onGo={(p) => router.push(p)} />

        {/* ── Today's Classes ── */}
        {todayEvents.length > 0 && (
          <div className="mt-6 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarBlank weight="fill" size={20} color="#60a5fa" />
              <h2 className="text-lg font-black text-white">Today&apos;s Classes</h2>
            </div>
            <div className="flex flex-col gap-3">
              {todayEvents.map((event, i) => (
                <div key={event.id} className="kid-card p-4 flex items-center gap-4 animate-slide-up"
                  style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${event.color}22` }}>
                    {event.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-sm truncate">{event.title}</p>
                    <p className="text-white/40 text-xs font-semibold">{event.time}</p>
                  </div>
                  <span className="pill" style={{ background: `${event.color}20`, color: event.color }}>{event.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 mb-2 flex items-center justify-center gap-1.5 text-white/30 text-xs font-bold uppercase tracking-widest">
          <Sparkle weight="fill" size={14} color="#ffc800" />
          <span>Keep going! You&apos;re doing great</span>
        </div>
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { setUser(getUser()); }, []);
  if (!user) return null;
  return user.role === 'teacher'
    ? <TeacherDashboard user={user} />
    : <StudentDashboard user={user} />;
}
