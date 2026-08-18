'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
import { Student, ChalkboardTeacher, RocketLaunch, ArrowRight, Sparkle, Dna } from '@phosphor-icons/react';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    signUp(name, email, role);
    router.replace('/dashboard');
  }

  return (
    <div className="app-screen relative flex flex-col items-center justify-center min-h-dvh p-6 overflow-hidden">

      {/* Decorative blobs */}
      <div className="blob w-72 h-72 bg-[#c084fc] top-[-60px] left-[-40px]" />
      <div className="blob w-56 h-56 bg-[#4ade80] bottom-[-30px] right-[-30px]" />

      {/* Hero icon */}
      <div className="flex items-center justify-center w-28 h-28 rounded-full animate-bounce-in mb-4"
        style={{ background: '#ce82ff18', border: '3px solid #ce82ff50', boxShadow: '0 0 0 8px #ce82ff10' }}>
        <RocketLaunch weight="fill" size={60} color="#ce82ff" />
      </div>

      <div className="text-center mb-8 animate-slide-up">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-nunito)' }}>
            Join Biology AR!
          </h1>
          <Dna weight="fill" size={28} color="#58cc02" />
        </div>
        <p className="text-sm text-white/50 font-semibold" style={{ fontFamily: 'var(--font-nunito)' }}>
          Start your learning adventure today
        </p>
      </div>

      <div className="kid-card w-full max-w-sm p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Role selector */}
          <div>
            <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-nunito)' }}>
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['student', 'teacher'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  id={`role-${r}`}
                  onClick={() => setRole(r)}
                  className="py-3 px-4 rounded-2xl font-bold text-sm transition-all border-2"
                  style={{
                    fontFamily: 'var(--font-nunito)',
                    background: role === r ? (r === 'student' ? '#4ade8022' : '#c084fc22') : 'rgba(255,255,255,0.04)',
                    borderColor: role === r ? (r === 'student' ? '#4ade80' : '#c084fc') : 'rgba(255,255,255,0.08)',
                    color: role === r ? (r === 'student' ? '#4ade80' : '#c084fc') : 'rgba(255,255,255,0.4)',
                  }}
                >
                <div className="flex items-center justify-center gap-2 py-3 px-4">
                  {r === 'student'
                    ? <Student weight="fill" size={20} />
                    : <ChalkboardTeacher weight="fill" size={20} />}
                  {r === 'student' ? 'Student' : 'Teacher'}
                </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-nunito)' }}>
              Your Name
            </label>
            <input
              id="signup-name"
              type="text"
              className="kid-input"
              placeholder="What do your friends call you?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-nunito)' }}>
              School Email
            </label>
            <input
              id="signup-email"
              type="email"
              className="kid-input"
              placeholder="you@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-nunito)' }}>
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              className="kid-input"
              placeholder="Make it strong! 💪"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button id="signup-submit" type="submit"
            className="kid-btn kid-btn--purple mt-1 flex items-center justify-center gap-2" disabled={loading}>
            {loading
              ? <><Sparkle weight="fill" size={18} /> Creating account...</>
              : <>Let&apos;s Go! <ArrowRight weight="bold" size={18} /></>}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm text-white/40" style={{ fontFamily: 'var(--font-nunito)' }}>
            Already have an account?{' '}
            <Link href="/sign-in" className="text-[#4ade80] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Floating dots */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            width: 10 + (i % 3) * 5,
            height: 10 + (i % 3) * 5,
            background: ['#4ade80','#c084fc','#fbbf24','#f87171','#60a5fa'][i],
            opacity: 0.35,
            top: `${10 + i * 15}%`,
            right: i % 2 === 0 ? `${6 + i * 2}%` : undefined,
            left: i % 2 !== 0 ? `${6 + i * 2}%` : undefined,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}
