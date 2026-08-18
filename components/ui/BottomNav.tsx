'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  House,
  Books,
  Trophy,
  CalendarBlank,
  UserCircle,
} from '@phosphor-icons/react';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    Icon: House,
    label: 'Home',
    path: '/dashboard',
    activeColor: '#1cb0f6',
    activeBg: '#1cb0f618',
  },
  {
    id: 'courses',
    Icon: Books,
    label: 'Learn',
    path: '/courses',
    activeColor: '#58cc02',
    activeBg: '#58cc0218',
  },
  {
    id: 'leaderboard',
    Icon: Trophy,
    label: 'Ranks',
    path: '/leaderboard',
    activeColor: '#ffc800',
    activeBg: '#ffc80018',
  },
  {
    id: 'calendar',
    Icon: CalendarBlank,
    label: 'Schedule',
    path: '/calendar',
    activeColor: '#ce82ff',
    activeBg: '#ce82ff18',
  },
  {
    id: 'profile',
    Icon: UserCircle,
    label: 'Profile',
    path: '/profile',
    activeColor: '#ff9600',
    activeBg: '#ff960018',
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="bottom-nav"
      aria-label="Main navigation"
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
    >
      {NAV_ITEMS.map(({ id, Icon, label, path, activeColor, activeBg }) => {
        const isActive =
          pathname === path || pathname.startsWith(path + '/');

        return (
          <button
            key={id}
            id={`nav-${id}`}
            data-tab={id}
            onClick={() => router.push(path)}
            className={`bottom-nav__item ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            style={{ color: isActive ? activeColor : undefined }}
          >
            <span
              className="bottom-nav__icon-wrap"
              style={{ background: isActive ? activeBg : undefined }}
            >
              <Icon
                weight={isActive ? 'fill' : 'regular'}
                size={26}
                color={isActive ? activeColor : 'rgba(255,255,255,0.35)'}
              />
            </span>
            <span
              className="bottom-nav__label"
              style={{ color: isActive ? activeColor : undefined }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
