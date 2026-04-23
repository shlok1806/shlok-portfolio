import { motion, AnimatePresence } from "motion/react";
import { useParams, useNavigate } from "react-router";
import { VinylRecord } from "../components/VinylRecord";
import { VinylDetail } from "../components/VinylDetail";
import { EraSwitch } from "../components/EraSwitch";
import { records } from "../data/records";

export default function Crate() {
  const { recordId } = useParams();
  const navigate = useNavigate();

  const selectedRecord = records.find((r) => r.id === recordId);

  const handleRecordClick = (id: string) => { navigate(`/crate/${id}`); };
  const handleClose = () => { navigate("/crate"); };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-[#F5F1E8]">
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`, backgroundRepeat: "repeat" }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[15vw] leading-none opacity-[0.02] -rotate-3" style={{ fontFamily: 'var(--font-condensed)' }}>ARCHIVE</div>
          </div>
          <div className="relative">
            <div className="text-xs tracking-[0.4em] text-neutral-400 mb-4 flex items-center justify-center gap-2">
              <span style={{ fontFamily: 'var(--font-condensed)' }}>SHLOK THAKKAR ARCHIVE</span>
              <span className="inline-block w-1 h-1 bg-neutral-400 rounded-full" />
              <span style={{ fontFamily: 'var(--font-display)' }}>EST. 2026</span>
            </div>
            <h1 className="text-7xl md:text-9xl tracking-tighter text-black mb-6 relative inline-block" style={{ fontFamily: 'var(--font-gothic)', fontWeight: 700 }}>
              <span className="inline-block -rotate-2">THE</span>{" "}<span className="inline-block rotate-1">CRATE</span>
              <div className="absolute -top-4 -right-8 border-2 border-red-600 px-2 py-1 rotate-12 text-xs" style={{ fontFamily: 'var(--font-condensed)' }}>
                <span className="text-red-600">LIVE</span>
              </div>
            </h1>
            <p className="text-neutral-600 tracking-wide max-w-2xl mx-auto mb-6" style={{ fontFamily: 'var(--font-body)' }}>Select a vinyl to explore. Each record contains a different chapter of the journey.</p>
            <div className="inline-block border-2 border-red-600 px-4 py-2 rotate-[-1deg]">
              <div className="text-[10px] tracking-widest text-red-600" style={{ fontFamily: 'var(--font-gothic)', fontWeight: 700 }}>5 RECORDS • UNLIMITED IMPACT</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {records.map((record, index) => (
            <VinylRecord key={record.id} record={record} index={index} isSelected={record.id === recordId} onClick={() => handleRecordClick(record.id)} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedRecord && <VinylDetail record={selectedRecord} onClose={handleClose} />}
      </AnimatePresence>

      <EraSwitch />
    </div>
  );
}
