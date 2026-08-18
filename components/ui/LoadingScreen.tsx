'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Dna } from 'lucide-react';

/**
 * Full-screen boot loader shown while the WebGL bundle streams in and the
 * first frame compiles. Pure CSS/DOM — no assets.
 */
export function LoadingScreen({ done }: { done: boolean }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
          className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-[#04060d]"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="relative flex h-20 w-20 items-center justify-center"
          >
            <div className="absolute inset-0 rounded-full border border-cyan-400/20" />
            <div className="absolute inset-0 animate-ping rounded-full border border-cyan-400/10" />
            <div className="absolute inset-2 rounded-full border border-violet-400/25" style={{ animationDelay: '0.4s' }} />
            <Dna size={26} className="text-cyan-300" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-xs font-medium uppercase tracking-[0.3em] text-white/50"
          >
            Assembling cell
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
            className="mt-3 h-px w-40 origin-left bg-gradient-to-r from-cyan-400/60 to-violet-400/60"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
