import { motion } from "motion/react";
import { useEra } from "../context/EraContext";
import { Era } from "../data/records";

export function EraSwitch() {
  const { currentEra, setCurrentEra } = useEra();

  const eras: { id: Era; label: string; color: string }[] = [
    { id: 'industrial', label: 'Industrial', color: '#DC2626' },
    { id: 'earth', label: 'Earth', color: '#D97706' },
    { id: 'vibrant', label: 'Vibrant', color: '#EC4899' },
    { id: 'stark', label: 'Stark', color: '#10B981' },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/90 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3 shadow-2xl"
      >
        <div className="text-[10px] tracking-widest text-white/40 mb-2 text-center">ERA SWITCH</div>
        <div className="flex gap-2">
          {eras.map((era) => (
            <motion.button
              key={era.id}
              onClick={() => setCurrentEra(era.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <div
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  currentEra === era.id ? 'border-white scale-110' : 'border-white/20 hover:border-white/40'
                }`}
                style={{ backgroundColor: era.color }}
              />
              {currentEra === era.id && (
                <motion.div
                  layoutId="active-era"
                  className="absolute inset-0 rounded-full border-2 border-white"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-white/60 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {era.label}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
