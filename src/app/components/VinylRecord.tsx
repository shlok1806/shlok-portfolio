import { motion } from "motion/react";
import { Record, eraThemes } from "../data/records";

interface VinylRecordProps {
  record: Record;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

export function VinylRecord({ record, index, isSelected, onClick }: VinylRecordProps) {
  const theme = eraThemes[record.era];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="cursor-pointer group relative"
      onClick={onClick}
    >
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative w-64"
      >
        {/* Vinyl peeking out */}
        <motion.div
          className="absolute top-2 right-[-18px] w-56 h-56 rounded-full z-0"
          style={{ background: '#111' }}
          animate={isSelected ? { x: 30 } : { x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `repeating-radial-gradient(circle at center,
                transparent 0px, transparent 12px,
                rgba(255,255,255,0.04) 12px, rgba(255,255,255,0.04) 13px)`,
            }}
          />
          {/* Label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-center"
              style={{ background: theme.labelColor }}
            >
              <span
                className="text-[8px] leading-tight px-1"
                style={{
                  fontFamily: 'var(--font-condensed)',
                  color: theme.textColor,
                  fontSize: '7px',
                }}
              >
                {record.catalogNumber}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Sleeve */}
        <div
          className="relative z-10 w-56 h-56 rounded-sm overflow-hidden shadow-2xl"
          style={{ background: theme.sleeveColor }}
        >
          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px',
            }}
          />

          {/* Era badge */}
          <div className="absolute top-3 left-3">
            <div
              className="text-[9px] tracking-widest px-2 py-0.5 border"
              style={{
                fontFamily: 'var(--font-condensed)',
                borderColor: `${theme.accentColor}60`,
                color: theme.accentColor,
              }}
            >
              {record.era.toUpperCase()}
            </div>
          </div>

          {/* Track count */}
          <div className="absolute top-3 right-3">
            <div
              className="text-[9px] tracking-widest"
              style={{
                fontFamily: 'var(--font-condensed)',
                color: `${theme.textColor}80`,
              }}
            >
              {record.tracks.length} TRACKS
            </div>
          </div>

          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div
              className="text-2xl leading-tight mb-1"
              style={{
                fontFamily: 'var(--font-gothic)',
                fontWeight: 700,
                color: theme.textColor,
              }}
            >
              {record.title.toUpperCase()}
            </div>
            <div
              className="text-[10px] tracking-widest opacity-70"
              style={{
                fontFamily: 'var(--font-condensed)',
                color: theme.textColor,
              }}
            >
              {record.subtitle}
            </div>
            <div
              className="text-[9px] opacity-40 mt-1"
              style={{
                fontFamily: 'var(--font-condensed)',
                color: theme.textColor,
              }}
            >
              {record.catalogNumber}
            </div>
          </div>

          {/* Selected indicator */}
          {isSelected && (
            <motion.div
              layoutId="selected-border"
              className="absolute inset-0 border-2"
              style={{ borderColor: theme.accentColor }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
