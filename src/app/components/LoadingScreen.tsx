import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

const systemMessages = [
  { text: "booting archive", delay: 0 },
  { text: "compiling selected works", delay: 0.5 },
  { text: "mounting projects", delay: 1.0 },
  { text: "initializing systems portfolio", delay: 1.5 },
  { text: "loading backend projects", delay: 2.2 },
  { text: "indexing research", delay: 2.7 },
  { text: "syncing experience", delay: 3.2 },
  { text: "render complete", delay: 3.8 },
];

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

  useEffect(() => {
    systemMessages.forEach((msg, index) => {
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, index]);
      }, msg.delay * 1000);
    });
    setTimeout(() => { onComplete(); }, 5500);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-[#0a0a0a] z-[100] flex items-center justify-center overflow-hidden"
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.3, 0], scale: [0.8, 1.2, 1.4] }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-radial from-red-900/20 to-transparent blur-xl"
      />

      <div className="absolute top-8 left-8 space-y-1">
        {systemMessages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={visibleMessages.includes(index) ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-[10px] text-neutral-600 font-mono tracking-wide"
          >
            <span className="text-red-700 mr-2">›</span>{msg.text}
          </motion.div>
        ))}
      </div>

      <div className="relative">
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-[400px] h-[400px]"
        >
          <motion.div
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{ opacity: { duration: 0.8, delay: 1 }, rotate: { duration: 20, delay: 1.5, repeat: Infinity, ease: "linear" } }}
            className="absolute inset-0 rounded-full border border-white/[0.04]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            transition={{
              opacity: { duration: 0.8, delay: 1.2 },
              scale: { duration: 1, delay: 1.2, ease: [0.25, 0.1, 0.25, 1] },
              rotate: { duration: 8, delay: 2, repeat: Infinity, ease: "linear" }
            }}
            className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(circle at 30% 30%, #1a1a1a 0%, #0a0a0a 100%)', boxShadow: "inset 0 0 60px rgba(0,0,0,0.8), 0 8px 32px rgba(0,0,0,0.6)" }}
          >
            {[...Array(35)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.4 + (i * 0.03), ease: "easeOut" }}
                className="absolute rounded-full border border-white/[0.04]"
                style={{ top: `${4 + i * 2.2}%`, left: `${4 + i * 2.2}%`, right: `${4 + i * 2.2}%`, bottom: `${4 + i * 2.2}%` }}
              />
            ))}
            {[8, 16, 24].map((idx, i) => (
              <motion.div
                key={`accent-${idx}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 2.2 + (i * 0.2), ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute rounded-full border border-red-900/20"
                style={{ top: `${4 + idx * 2.2}%`, left: `${4 + idx * 2.2}%`, right: `${4 + idx * 2.2}%`, bottom: `${4 + idx * 2.2}%` }}
              />
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.7] }}
              transition={{ duration: 2, delay: 1.8 }}
              className="absolute top-12 left-12 w-32 h-32 bg-gradient-to-br from-white/[0.06] to-transparent rounded-full blur-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 0.6, rotate: -360 }}
            transition={{ opacity: { duration: 0.6, delay: 2.4 }, rotate: { duration: 12, delay: 2.5, repeat: Infinity, ease: "linear" } }}
            className="absolute inset-[60px] rounded-full border border-amber-900/10"
          />

          <motion.div
            initial={{ scale: 0, opacity: 0, filter: "blur(8px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{
              scale: { duration: 0.8, delay: 2.6, ease: [0.25, 0.1, 0.25, 1] },
              opacity: { duration: 0.8, delay: 2.6 },
              filter: { duration: 1.2, delay: 2.6 }
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full shadow-2xl flex items-center justify-center"
            style={{ background: 'radial-gradient(circle, #1f1f1f 0%, #0f0f0f 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="text-4xl tracking-tighter text-neutral-400" style={{ fontFamily: 'var(--font-gothic)', fontWeight: 900 }}>ST</div>
          </motion.div>

          {[...Array(24)].map((_, i) => (
            <motion.div
              key={`tick-${i}`}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.3, delay: 2.8 + (i * 0.015), ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 origin-left"
              style={{ width: '12px', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', transform: `rotate(${i * 15}deg) translateX(190px)` }}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 3.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 text-[9px] font-mono text-neutral-700 tracking-widest"
          >
            SYSTEM ARCHIVE
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 3.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-[9px] font-mono text-neutral-700 tracking-widest"
          >
            CATALOG 0001
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 3.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute left-[-120px] top-1/2 -translate-y-1/2 space-y-2"
          >
            <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 }}>
              <motion.div className="w-1.5 h-1.5 bg-red-600 rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="text-[8px] font-mono text-neutral-700">ACTIVE</span>
            </motion.div>
            <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.6 }}>
              <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full" />
              <span className="text-[8px] font-mono text-neutral-800">SYNC</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 3.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute right-[-120px] top-1/2 -translate-y-1/2 space-y-2"
          >
            <motion.div className="flex items-center gap-2 flex-row-reverse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 }}>
              <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full" />
              <span className="text-[8px] font-mono text-neutral-800">LOAD</span>
            </motion.div>
            <motion.div className="flex items-center gap-2 flex-row-reverse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.6 }}>
              <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full" />
              <span className="text-[8px] font-mono text-neutral-800">PROC</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 4, ease: "backOut" }}
            className="absolute -top-2 -right-2 w-2 h-2 border border-red-900/40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 4.1, ease: "backOut" }}
            className="absolute -bottom-2 -left-2 w-2 h-2 border border-amber-900/30"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.2 }}
        className="absolute bottom-8 right-8 text-[8px] font-mono text-neutral-800 tracking-wider"
      >
        v2026.03
      </motion.div>
    </motion.div>
  );
}
