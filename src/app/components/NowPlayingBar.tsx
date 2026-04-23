import { motion, AnimatePresence } from 'motion/react';
import { usePortfolio } from '../context/PortfolioContext';
import { records } from '../data/records';

const BAR_HEIGHTS = [6, 12, 9, 15, 8, 13, 10];

function WaveformBar({ index, active }: { index: number; active: boolean }) {
  const h = BAR_HEIGHTS[index % BAR_HEIGHTS.length];
  return (
    <motion.div
      className="rounded-full"
      style={{ width: '2px', backgroundColor: active ? '#DC2626' : '#2a2a2a' }}
      animate={active ? { height: [3, h, 3, h - 2, h + 3, 3] } : { height: 3 }}
      transition={active ? { duration: 0.9 + index * 0.07, repeat: Infinity, ease: 'easeInOut', delay: index * 0.09 } : { duration: 0.4 }}
    />
  );
}

export function NowPlayingBar() {
  const { selectedRecordId, setSelectedRecordId } = usePortfolio();
  const record = records.find(r => r.id === selectedRecordId);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none select-none">
      <div
        className="flex items-center gap-4 px-5 md:px-8 py-3 pointer-events-auto"
        style={{ background: 'rgba(8,8,8,0.96)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-end gap-[2px] h-4 flex-shrink-0">
          {BAR_HEIGHTS.map((_, i) => <WaveformBar key={i} index={i} active={!!record} />)}
        </div>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {record ? (
              <motion.div key={record.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }} className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse flex-shrink-0" />
                <span className="text-[9px] tracking-[0.3em] text-red-500 flex-shrink-0" style={{ fontFamily: 'var(--font-condensed)' }}>NOW PLAYING</span>
                <span className="text-neutral-600 text-[9px]">—</span>
                <span className="text-[9px] tracking-widest text-white/80 truncate" style={{ fontFamily: 'var(--font-condensed)' }}>{record.title.toUpperCase()}</span>
                <span className="hidden md:inline text-[9px] text-neutral-700" style={{ fontFamily: 'var(--font-condensed)' }}>· {record.tracks.length} TRACKS</span>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <span className="text-[9px] tracking-[0.3em] text-neutral-700" style={{ fontFamily: 'var(--font-condensed)' }}>SELECT A RECORD TO BEGIN</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {record && (
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setSelectedRecordId(null)}
              className="text-[9px] tracking-[0.2em] text-neutral-600 hover:text-white transition-colors" style={{ fontFamily: 'var(--font-condensed)' }}
            >
              CLOSE ✕
            </motion.button>
          )}
          <span className="hidden md:inline text-[9px] tracking-[0.3em] text-neutral-700" style={{ fontFamily: 'var(--font-condensed)' }}>
            {record ? record.catalogNumber : 'ST-ARCHIVE'}
          </span>
        </div>
      </div>
    </div>
  );
}
