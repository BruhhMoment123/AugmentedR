'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, X, CheckCircle2, Target, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { launchAndroidAR } from '@/lib/arLauncher';

/**
 * Instant In-App Live Camera AR Mode.
 * Activates real-time phone back camera feed behind the 3D cell canvas,
 * allowing instant cell placement in AR without waiting for surface detection.
 */
export function CameraARMode({ active, onClose }: { active: boolean; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!active) {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
      return;
    }

    // Request native phone back camera stream
    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      .then((s) => {
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => {
        console.warn('Camera access error:', err);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none select-none">
      {/* Live Phone Camera Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Top Header Bar */}
      <div className="absolute top-4 left-3 right-3 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/40 bg-black/75 px-3.5 py-1.5 backdrop-blur-md shadow-xl">
          <Camera size={15} className="text-emerald-400 animate-pulse" />
          <span className="text-xs font-extrabold text-emerald-300 tracking-wider uppercase">
            Instant Camera AR Mode
          </span>
        </div>

        <button
          onClick={onClose}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/75 text-white hover:bg-white/20 active:scale-95 shadow-xl"
        >
          <X size={16} />
        </button>
      </div>

      {/* Status Badge */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-black/85 px-3.5 py-1 backdrop-blur-md shadow-xl">
        <CheckCircle2 size={14} className="text-emerald-400 animate-bounce" />
        <span className="text-[11px] font-bold text-emerald-300 tracking-wide uppercase">
          3D Cell Placed in Camera Space
        </span>
      </div>

      {/* Center Placement Target Reticle Guide */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
        <div className="relative flex h-48 w-48 items-center justify-center">
          {/* Pulsing Target Circle */}
          <div className="h-36 w-36 rounded-full border-2 border-emerald-400/70 bg-emerald-500/10 shadow-[0_0_30px_rgba(52,211,153,0.4)] animate-pulse" />

          {/* Crosshair Ticks */}
          <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-emerald-400/60 to-transparent" />
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

          {/* Center Target Dot */}
          <div className="h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-[0_0_15px_#34d399] scale-110" />

          {/* Corner Brackets */}
          <div className="absolute -left-2 -top-2 h-3.5 w-3.5 border-l-2 border-t-2 border-emerald-400" />
          <div className="absolute -right-2 -top-2 h-3.5 w-3.5 border-r-2 border-t-2 border-emerald-400" />
          <div className="absolute -bottom-2 -left-2 h-3.5 w-3.5 border-b-2 border-l-2 border-emerald-400" />
          <div className="absolute -bottom-2 -right-2 h-3.5 w-3.5 border-b-2 border-r-2 border-emerald-400" />
        </div>
      </div>

      {/* Bottom AR Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 pointer-events-auto">
        <button
          onClick={() => launchAndroidAR()}
          className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-black/80 px-4 py-2.5 text-xs font-bold text-emerald-300 backdrop-blur-md transition-all hover:bg-emerald-500/20 active:scale-95 shadow-xl"
        >
          <Target size={15} className="text-emerald-400" />
          <span>External Scene Viewer AR</span>
        </button>
      </div>
    </div>
  );
}
