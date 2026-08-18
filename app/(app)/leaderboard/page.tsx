'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';
import { MOCK_LEADERBOARD } from '@/lib/mockData';
import type { User } from '@/lib/mockData';
import { Trophy, Crown, Medal } from '@phosphor-icons/react';
import { AvatarIcon } from '@/components/ui/IconHelper';

const RANK_COLORS = ['#fbbf24', '#94a3b8', '#cd7c2f'];
const RANK_BG = ['#fbbf2420', '#94a3b820', '#cd7c2f20'];

export default function LeaderboardPage() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { setUser(getUser()); }, []);

  const top3 = MOCK_LEADERBOARD.slice(0, 3);
  const rest = MOCK_LEADERBOARD.slice(3);
  const myRank = user ? MOCK_LEADERBOARD.find((e) => e.name === user.name) : null;

  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in" style={{ fontFamily: 'var(--font-nunito)' }}>

      {/* ── Header ── */}
      <div className="mb-6">
        <p className="text-white/50 text-sm font-semibold">This Week</p>
        <div className="flex items-center gap-2">
          <Trophy weight="fill" size={30} color="#ffc800" />
          <h1 className="text-3xl font-black text-white">Leaderboard</h1>
        </div>
      </div>

      {/* ── Podium (top 3) ── */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 mb-6 h-44 px-2">
        {/* 2nd */}
        <div className="flex flex-col items-center gap-1.5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center border-2"
            style={{ background: '#94a3b825', borderColor: '#94a3b870' }}>
            <AvatarIcon role="student" avatar={top3[1]?.avatar} size={22} color="#94a3b8" />
          </div>
          <p className="text-white font-black text-xs text-center w-16 sm:w-20 truncate">{top3[1]?.name.split(' ')[0]}</p>
          <div className="w-16 sm:w-20 rounded-t-2xl flex flex-col items-center justify-end pb-3"
            style={{ height: 100, background: 'linear-gradient(180deg, #94a3b840, #94a3b820)' }}>
            <Medal weight="fill" size={24} color="#94a3b8" />
            <span className="text-white font-black text-xs">{top3[1]?.points.toLocaleString()}</span>
          </div>
        </div>

        {/* 1st */}
        <div className="flex flex-col items-center gap-1.5 animate-slide-up" style={{ animationDelay: '0s' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg animate-float"
            style={{ background: '#fbbf2425', borderColor: '#fbbf24', padding: 6 }}>
            <AvatarIcon role="student" avatar={top3[0]?.avatar} size={26} color="#fbbf24" />
          </div>
          <div className="flex items-center gap-1">
            <p className="text-white font-black text-xs text-center">{top3[0]?.name.split(' ')[0]}</p>
            <Crown weight="fill" size={14} color="#ffc800" />
          </div>
          <div className="w-20 sm:w-24 rounded-t-2xl flex flex-col items-center justify-end pb-3"
            style={{ height: 130, background: 'linear-gradient(180deg, #fbbf2440, #fbbf2420)' }}>
            <Medal weight="fill" size={28} color="#ffc800" />
            <span className="text-[#fbbf24] font-black text-sm">{top3[0]?.points.toLocaleString()}</span>
          </div>
        </div>

        {/* 3rd */}
        <div className="flex flex-col items-center gap-1.5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center border-2"
            style={{ background: '#cd7c2f25', borderColor: '#cd7c2f70' }}>
            <AvatarIcon role="student" avatar={top3[2]?.avatar} size={22} color="#cd7c2f" />
          </div>
          <p className="text-white font-black text-xs text-center w-16 sm:w-20 truncate">{top3[2]?.name.split(' ')[0]}</p>
          <div className="w-16 sm:w-20 rounded-t-2xl flex flex-col items-center justify-end pb-3"
            style={{ height: 80, background: 'linear-gradient(180deg, #cd7c2f40, #cd7c2f20)' }}>
            <Medal weight="fill" size={24} color="#cd7c2f" />
            <span className="text-white font-black text-xs">{top3[2]?.points.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ── My rank highlight ── */}
      {myRank && (
        <div className="kid-card p-4 mb-4 animate-slide-up"
          style={{ background: '#4ade8012', borderColor: '#4ade8030' }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
              style={{ background: '#4ade8022', color: '#4ade80' }}>
              #{myRank.rank}
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center border-2"
              style={{ background: '#58cc0220', borderColor: '#58cc0260' }}>
              <AvatarIcon role="student" avatar={myRank.avatar} size={22} color="#58cc02" />
            </div>
            <div className="flex-1">
              <p className="font-black text-[#4ade80] text-sm">You — {myRank.name.split(' ')[0]}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="progress-bar flex-1">
                  <div className="progress-bar__fill"
                    style={{ width: `${myRank.completedPercent}%`, background: '#4ade80' }} />
                </div>
                <span className="text-xs font-bold text-[#4ade80]">{myRank.completedPercent}%</span>
              </div>
            </div>
            <span className="font-black text-white text-base">{myRank.points.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* ── Full rankings ── */}
      <h2 className="text-base font-black text-white mb-3">All Rankings</h2>
      <div className="flex flex-col gap-3">
        {MOCK_LEADERBOARD.map((entry, i) => {
          const isMe = user?.name === entry.name;
          const color = RANK_COLORS[entry.rank - 1] ?? 'rgba(255,255,255,0.15)';
          const bg = RANK_BG[entry.rank - 1] ?? 'rgba(255,255,255,0.04)';
          return (
            <div key={entry.userId}
              id={`rank-${entry.rank}`}
              className="kid-card p-4 flex items-center gap-4 animate-slide-up"
              style={{
                animationDelay: `${i * 0.06}s`,
                borderColor: isMe ? '#4ade8040' : 'rgba(255,255,255,0.08)',
              }}>
              {/* Rank */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{ background: bg, color: entry.rank <= 3 ? color : 'rgba(255,255,255,0.3)' }}>
                {entry.badge || `#${entry.rank}`}
              </div>
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center border flex-shrink-0"
                style={{ background: bg, borderColor: entry.rank <= 3 ? color : 'rgba(255,255,255,0.15)' }}>
                <AvatarIcon role="student" avatar={entry.avatar} size={20} color={entry.rank <= 3 ? color : '#60a5fa'} />
              </div>
              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-sm truncate">
                  {entry.name.split(' ')[0]}
                  {isMe && <span className="text-[#4ade80] ml-1 text-xs">← you</span>}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="progress-bar flex-1">
                    <div className="progress-bar__fill"
                      style={{ width: `${entry.completedPercent}%`, background: entry.rank <= 3 ? color : '#60a5fa' }} />
                  </div>
                  <span className="text-xs font-bold text-white/40">{entry.completedPercent}%</span>
                </div>
              </div>
              {/* Score */}
              <span className="font-black text-white text-sm flex-shrink-0">{entry.points.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
