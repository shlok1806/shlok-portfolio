import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'done'>('loading');

  useEffect(() => {
    const duration = 1800;
    const interval = 30;
    const steps = duration / interval;
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      const eased = Math.min(100, Math.round((1 - Math.pow(1 - current / steps, 3)) * 100));
      setProgress(eased);

      if (current >= steps) {
        clearInterval(timer);
        setPhase('done');
        setTimeout(onComplete, 400);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'done' ? 0 : 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Spinning vinyl */}
      <motion.div
        className="relative w-32 h-32 mb-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-full h-full rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center shadow-2xl">
          <div className="absolute inset-0 rounded-full"
            style={{
              background: `repeating-radial-gradient(circle at center,
                transparent 0px, transparent 10px,
                rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 11px)`,
            }}
          />
          <div className="w-8 h-8 rounded-full bg-[#EC243C] z-10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-black" />
          </div>
        </div>
      </motion.div>

      <div className="text-center mb-8">
        <div
          className="text-4xl tracking-tight text-white mb-1"
          style={{ fontFamily: 'var(--font-gothic)', fontWeight: 700 }}
        >
          SHLOK THAKKAR
        </div>
        <div
          className="text-xs tracking-[0.4em] text-neutral-500"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          CS + ECON @ UIUC
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-px bg-neutral-800 relative overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full bg-[#EC243C]"
          style={{ width: `${progress}%` }}
          transition={{ ease: "linear" }}
        />
      </div>
      <div
        className="text-[10px] tracking-widest text-neutral-600 mt-2"
        style={{ fontFamily: 'var(--font-condensed)' }}
      >
        {progress}%
      </div>
    </motion.div>
  );
}
