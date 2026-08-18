'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { BottomNav } from '@/components/ui/BottomNav';
import { App } from '@capacitor/app';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Auth guard — redirect to sign-in if not logged in
    const user = getUser();
    if (!user) {
      router.replace('/sign-in');
    }
  }, [router]);

  useEffect(() => {
    // Hardware back button handler for Android phone navigation
    const listener = App.addListener('backButton', ({ canGoBack }) => {
      if (pathname === '/dashboard') {
        App.minimizeApp();
      } else {
        router.push('/dashboard');
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, [pathname, router]);

  // The cell viewer is full-screen — don't show the bottom nav there
  const showNav = !pathname.startsWith('/cell');

  return (
    <div style={{ height: '100dvh', width: '100vw', background: '#0a0a10', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
      <div className="app-screen" style={{ width: '100%', maxWidth: 480, height: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <main className="flex-1 overflow-y-auto" style={{ paddingBottom: showNav ? 76 : 0 }}>
          {children}
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
