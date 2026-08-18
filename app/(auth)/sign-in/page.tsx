'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth';
import { Student, ChalkboardTeacher, Atom, ArrowRight, Sparkle, WarningCircle } from '@phosphor-icons/react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const avatars = ['🧑‍🎓', '👩‍🎓', '🧒', '👧', '🧑'];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    const user = signIn(email, password);
    if (!user) {
      setError('Account not found. Try: aarav@school.edu');
      setLoading(false);
      return;
    }
    router.replace('/dashboard');
  }

  return (
    <div className="app-screen relative flex flex-col items-center justify-center min-h-dvh p-6 overflow-hidden">

      {/* Decorative blobs */}
      <div className="blob w-80 h-80 bg-[#4ade80] top-[-80px] right-[-60px]" />
      <div className="blob w-64 h-64 bg-[#c084fc] bottom-[-40px] left-[-40px]" />
      <div className="blob w-40 h-40 bg-[#60a5fa] top-[40%] left-[-30px]" />

      {/* Floating icon cluster */}
      <div className="relative h-44 w-44 mb-6">
        {[
          { Icon: Student,           color: '#58cc02', size: 40 },
          { Icon: ChalkboardTeacher, color: '#ce82ff', size: 26 },
          { Icon: Atom,              color: '#ffc800', size: 26 },
          { Icon: Student,           color: '#ff4b4b', size: 26 },
          { Icon: Atom,              color: '#1cb0f6', size: 26 },
        ].map(({ Icon, color, size }, i) => {
          const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
          const r = i === 0 ? 0 : 68;
          const x = i === 0 ? 50 : 50 + Math.cos(angle) * r * 0.9;
          const y = i === 0 ? 50 : 50 + Math.sin(angle) * r * 0.9;
          const d = i === 0 ? 72 : 46;
          return (
            <div key={i}
              className="absolute flex items-center justify-center rounded-full animate-float"
              style={{
                width: d, height: d,
                left: `calc(${x}% - ${d / 2}px)`,
                top:  `calc(${y}% - ${d / 2}px)`,
                background: color + '22',
                border: `2px solid ${color}80`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + i * 0.5}s`,
                zIndex: i === 0 ? 2 : 1,
              }}
            >
              <Icon weight="fill" size={size} color={color} />
            </div>
          );
        })}
      </div>

      {/* Heading */}
      <div className="text-center mb-8 animate-slide-up">
        <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-nunito)' }}>
          Let&apos;s get you<br />signed in!
        </h1>
        <p className="text-sm text-white/50 font-semibold" style={{ fontFamily: 'var(--font-nunito)' }}>
          Welcome back to Biology AR
        </p>
      </div>

      {/* Form card */}
      <div className="kid-card w-full max-w-sm p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-nunito)' }}>
              School Email
            </label>
            <input
              id="signin-email"
              type="email"
              className="kid-input"
              placeholder="you@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-nunito)' }}>
              Password
            </label>
            <input
              id="signin-password"
              type="password"
              className="kid-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs font-bold text-[#ff4b4b] bg-[#ff4b4b]/10 rounded-xl px-4 py-3"
              style={{ fontFamily: 'var(--font-nunito)' }}>
              <WarningCircle weight="fill" size={16} color="#ff4b4b" />
              {error}
            </div>
          )}

          {/* Demo hint */}
          <div className="text-xs text-white/30 text-center" style={{ fontFamily: 'var(--font-nunito)' }}>
            Demo: <span className="text-[#4ade80]/70 font-bold">aarav@school.edu</span> · any password
          </div>

          <button id="signin-submit" type="submit"
            className="kid-btn kid-btn--green mt-1 flex items-center justify-center gap-2" disabled={loading}>
            {loading
              ? <><Sparkle weight="fill" size={18} /> Signing in...</>
              : <>Sign In <ArrowRight weight="bold" size={18} /></>}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm text-white/40" style={{ fontFamily: 'var(--font-nunito)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-[#c084fc] font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Floating decorative dots */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            width: 8 + (i % 3) * 4,
            height: 8 + (i % 3) * 4,
            background: ['#4ade80','#c084fc','#fbbf24','#f87171','#60a5fa','#34d399'][i],
            opacity: 0.4,
            top: `${15 + i * 12}%`,
            left: i % 2 === 0 ? `${5 + i * 3}%` : `${75 + i * 3}%`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${3 + i * 0.7}s`,
          }}
        />
      ))}
    </div>
  );
}
