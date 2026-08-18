'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, GraduationCap, X } from 'lucide-react';
import { TOUR_STEPS } from '@/data/tour';
import { useCellStore } from '@/lib/store';

/**
 * Guided tour overlay. Drives the camera through TOUR_STEPS; each stop
 * selects its organelle so the info panel opens alongside the narration.
 * (Narration strings are written for a future voice-over track.)
 */
export function TourOverlay() {
  const tourActive = useCellStore((s) => s.tourActive);
  const tourStep = useCellStore((s) => s.tourStep);
  const setTourStep = useCellStore((s) => s.setTourStep);
  const endTour = useCellStore((s) => s.endTour);

  const step = TOUR_STEPS[tourStep];

  // Push each stop into the scene.
  useEffect(() => {
    if (!tourActive || !step) return;
    const store = useCellStore.getState();
    store.requestFlight(step.cameraPosition, step.lookAt);
    store.select(step.organelleId);
  }, [tourActive, tourStep, step]);

  const finish = () => {
    endTour();
    useCellStore.getState().resetView();
  };

  return (
    <AnimatePresence>
      {tourActive && step && (
        <motion.div
          key={tourStep}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="glass-panel pointer-events-auto absolute bottom-24 left-1/2 z-40 w-[24rem] max-w-[calc(100vw-3rem)] -translate-x-1/2 overflow-hidden rounded-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
              <GraduationCap size={13} />
              Guided tour · {tourStep + 1} / {TOUR_STEPS.length}
            </span>
            <button onClick={finish} className="text-white/40 hover:text-white" aria-label="End tour">
              <X size={14} />
            </button>
          </div>

          <div className="px-4 py-3">
            <h3 className="text-sm font-semibold text-white">{step.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-white/65">{step.narration}</p>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-3 py-2.5">
            <button
              disabled={tourStep === 0}
              onClick={() => setTourStep(Math.max(0, tourStep - 1))}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft size={13} /> Back
            </button>

            {/* Progress dots */}
            <div className="flex items-center gap-1">
              {TOUR_STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === tourStep ? 'w-4 bg-violet-300' : 'w-1 bg-white/20'
                  }`}
                />
              ))}
            </div>

            {tourStep < TOUR_STEPS.length - 1 ? (
              <button
                onClick={() => setTourStep(tourStep + 1)}
                className="flex items-center gap-1 rounded-lg bg-violet-400/20 px-2.5 py-1.5 text-xs text-violet-200 transition-colors hover:bg-violet-400/30"
              >
                Next <ChevronRight size={13} />
              </button>
            ) : (
              <button
                onClick={finish}
                className="rounded-lg bg-violet-400/20 px-3 py-1.5 text-xs text-violet-200 transition-colors hover:bg-violet-400/30"
              >
                Finish
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
