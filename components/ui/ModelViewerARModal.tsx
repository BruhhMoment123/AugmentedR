'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { X, Sparkles, Box } from 'lucide-react';

interface ModelViewerARModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelUrl?: string;
  title?: string;
}

export function ModelViewerARModal({
  isOpen,
  onClose,
  modelUrl = 'https://cdn.jsdelivr.net/gh/BruhhMoment123/AugmentedR@main/public/models/cell_sphere.glb',
  title = 'Human Cell 3D AR Model',
}: ModelViewerARModalProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if model-viewer custom element is already defined
    if (typeof window !== 'undefined' && customElements.get('model-viewer')) {
      setScriptLoaded(true);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <Script
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        type="module"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="relative flex flex-col items-center w-full max-w-lg h-[80vh] bg-slate-900/90 border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between w-full px-5 py-4 border-b border-white/10 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-cyan-400 animate-pulse" />
              <h2 className="text-sm font-semibold text-white tracking-wide">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* 3D Container & Google <model-viewer> */}
          <div className="relative flex-1 w-full flex items-center justify-center bg-radial from-slate-800 to-slate-950">
            {/* @ts-expect-error model-viewer is a Web Component */}
            <model-viewer
              src={modelUrl}
              alt={title}
              ar
              ar-modes="scene-viewer quick-look webxr"
              camera-controls
              touch-action="pan-y"
              auto-rotate
              shadow-intensity="1"
              environment-image="neutral"
              style={{ width: '100%', height: '100%' }}
            >
              <button
                slot="ar-button"
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm shadow-lg hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all"
              >
                <Box size={18} />
                View in 3D / Your Space (AR)
              </button>
            {/* @ts-expect-error model-viewer is a Web Component */}
            </model-viewer>
          </div>

          {/* Footer instruction */}
          <div className="w-full py-2.5 px-4 bg-slate-950/80 text-center text-xs text-cyan-300/80 border-t border-white/5">
            Powered by Google Scene Viewer & Model Viewer
          </div>

        </div>
      </div>
    </>
  );
}
