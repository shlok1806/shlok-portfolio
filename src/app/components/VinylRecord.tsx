import { motion } from "motion/react";
import { Record, eraThemes } from "../data/records";
import { useState } from "react";
import { useEra } from "../context/EraContext";

interface VinylRecordProps {
  record: Record;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

export function VinylRecord({ record, index, isSelected, onClick }: VinylRecordProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [animationStage, setAnimationStage] = useState<'idle' | 'nudge' | 'slide' | 'expand'>('idle');
  const { currentEra } = useEra();

  const theme = eraThemes[currentEra] || eraThemes[record.era];

  const handleClick = () => {
    if (animationStage === 'idle' && !isSelected) {
      setAnimationStage('nudge');
      setTimeout(() => {
        setAnimationStage('slide');
        setTimeout(() => {
          setAnimationStage('expand');
          setTimeout(() => {
            onClick();
            setAnimationStage('idle');
          }, 350);
        }, 320);
      }, 100);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative cursor-pointer select-none"
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        animate={{
          y: isHovered && !isSelected ? -8 : animationStage === 'nudge' ? 4 : 0,
          rotateX: isHovered && !isSelected ? 2 : 0,
          scale: animationStage === 'expand' ? 1.05 : 1,
        }}
        transition={{ duration: animationStage === 'nudge' ? 0.1 : animationStage === 'expand' ? 0.35 : 0.18, ease: animationStage === 'nudge' ? [0.34, 1.56, 0.64, 1] : [0.25, 0.46, 0.45, 0.94] }}
        className="relative"
        style={{ transformStyle: "preserve-3d", perspective: 1200 }}
      >
        <motion.div
          className="w-80 h-80 relative overflow-hidden"
          style={{ background: theme.sleeveColor, boxShadow: isHovered || animationStage !== 'idle' ? "0 25px 50px rgba(0,0,0,0.5)" : "0 10px 30px rgba(0,0,0,0.3)" }}
        >
          <div className="absolute inset-0 p-10 flex flex-col items-center justify-center">
            <div className="absolute top-6 left-6 text-xs tracking-[0.4em] opacity-40" style={{ color: theme.textColor, fontFamily: 'var(--font-condensed)' }}>
              {record.catalogNumber}
            </div>
            <div className="absolute top-6 right-6 px-2 py-1 border opacity-60 text-[8px] tracking-widest rotate-6" style={{ borderColor: theme.accentColor, color: theme.accentColor, fontFamily: 'var(--font-gothic)', fontWeight: 700 }}>
              {record.era.toUpperCase()}
            </div>
            <div className="relative z-10 text-center mb-4">
              <div className="text-7xl tracking-tighter mb-4" style={{ fontWeight: 900, color: theme.textColor, fontFamily: currentEra === 'stark' ? 'var(--font-gothic)' : currentEra === 'earth' ? 'var(--font-serif)' : currentEra === 'industrial' ? 'var(--font-condensed)' : 'var(--font-display)', fontStyle: currentEra === 'earth' ? 'italic' : 'normal' }}>
                {record.title.toUpperCase()}
              </div>
              <div className="text-sm tracking-[0.35em] opacity-70" style={{ color: theme.textColor, fontFamily: 'var(--font-condensed)' }}>
                {record.subtitle}
              </div>
            </div>
            <div className="w-32 h-1 mt-4" style={{ backgroundColor: theme.accentColor }} />
          </div>
          <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")` }} />
          <div className="absolute bottom-6 left-6 right-6 bg-yellow-100/90 px-3 py-2 text-xs text-black backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="tracking-wider opacity-60">TRACKLIST: {record.tracks.length}</span>
              <span className="tracking-widest text-[10px] opacity-40">ST-ARCHIVE</span>
            </div>
          </div>
        </motion.div>

        {(isHovered || animationStage !== 'idle') && !isSelected && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: animationStage === 'slide' || animationStage === 'expand' ? "48%" : "89%", rotate: animationStage === 'expand' ? 15 : 0 }}
            transition={{ duration: animationStage === 'slide' ? 0.32 : 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute top-0 right-0 w-80 h-80 rounded-full -z-10"
            style={{ background: 'radial-gradient(circle, #1a1a1a 0%, #000000 100%)', boxShadow: "inset 0 0 80px rgba(0,0,0,0.9), 0 15px 40px rgba(0,0,0,0.6)" }}
          >
            {[...Array(28)].map((_, i) => (
              <div key={i} className="absolute rounded-full border border-white/[0.03]" style={{ top: `${3 + i * 2.8}%`, left: `${3 + i * 2.8}%`, right: `${3 + i * 2.8}%`, bottom: `${3 + i * 2.8}%` }} />
            ))}
            <div className="absolute top-12 left-12 w-40 h-40 bg-gradient-to-br from-white/[0.08] to-transparent rounded-full blur-2xl" />
            <motion.div
              animate={{ rotate: animationStage === 'slide' || animationStage === 'expand' ? 360 : 0 }}
              transition={{ duration: 2, repeat: animationStage === 'slide' || animationStage === 'expand' ? Infinity : 0, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl"
              style={{ backgroundColor: theme.labelColor }}
            >
              <div className="text-center">
                <div className="text-2xl mb-1" style={{ fontWeight: 900, color: currentEra === 'stark' || currentEra === 'earth' ? '#000000' : '#FFFFFF' }}>ST</div>
                <div className="text-[9px] tracking-wider opacity-60" style={{ color: currentEra === 'stark' || currentEra === 'earth' ? '#000000' : '#FFFFFF' }}>{record.catalogNumber}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.12 + 0.3 }}
        className="mt-4 text-center text-xs text-neutral-500 tracking-wide"
      >
        <div className="mb-1 opacity-60">Section {String(index + 1).padStart(2, '0')}</div>
        <div className="text-black tracking-widest">{record.title.toUpperCase()}</div>
      </motion.div>
    </motion.div>
  );
}
