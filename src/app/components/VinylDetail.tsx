import { motion, useMotionValue, useTransform } from 'motion/react';
import { Record, eraThemes } from '../data/records';
import {
  X, ExternalLink, Github, MapPin, Calendar, Trophy,
  Mail, Phone, Linkedin, ArrowUpRight, Copy,
} from 'lucide-react';
import { useEra } from '../context/EraContext';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface VinylDetailProps {
  record: Record;
  onClose: () => void;
}

const albumThemes: Record<string, {
  labelColor: string; accentColor: string; textColor: string; bg: string;
}> = {
  projects:   { labelColor: '#EC243C', accentColor: '#D4AF37', textColor: '#FFFFFF', bg: 'from-[#1a0508] via-[#0d0d0d] to-[#0a0a0a]' },
  experience: { labelColor: '#F3CF8C', accentColor: '#D4AF37', textColor: '#000000', bg: 'from-[#1a1508] via-[#0d0d0d] to-[#0a0a0a]' },
  skills:     { labelColor: '#4CAF50', accentColor: '#2E7D32', textColor: '#FFFFFF', bg: 'from-[#051a08] via-[#0d0d0d] to-[#0a0a0a]' },
  education:  { labelColor: '#F48C54', accentColor: '#F48C54', textColor: '#FFFFFF', bg: 'from-[#1a0e05] via-[#0d0d0d] to-[#0a0a0a]' },
  contact:    { labelColor: '#A8ADB3', accentColor: '#E63946', textColor: '#000000', bg: 'from-[#0a0f14] via-[#0d0d0d] to-[#0a0a0a]' },
  blog:       { labelColor: '#D4AF37', accentColor: '#FFD700', textColor: '#000000', bg: 'from-[#1a1505] via-[#0d0d0d] to-[#0a0a0a]' },
};

function TrackCard({ track, index, theme }: {
  track: { title: string; description: string; tech?: string[]; date?: string; impact?: string; links?: { repo?: string; demo?: string; case?: string }; featured?: boolean };
  index: number;
  theme: { accentColor: string; labelColor: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 + index * 0.07 }}
      className={`relative rounded-sm border p-5 group transition-all duration-200 ${
        track.featured
          ? 'border-white/20 bg-white/[0.07] hover:bg-white/[0.11]'
          : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
      }`}
    >
      {track.featured && (
        <div className="absolute top-0 right-0 text-[9px] tracking-[0.2em] px-2 py-1 font-bold" style={{ backgroundColor: theme.accentColor, color: '#000' }}>
          FEATURED
        </div>
      )}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-[10px] text-white/25 font-mono mt-0.5 min-w-[1.5rem]">{String(index + 1).padStart(2, '0')}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-base leading-snug mb-1" style={{ fontWeight: 700 }}>{track.title}</h3>
          {track.date && (
            <div className="flex items-center gap-1.5 text-[11px] text-white/40 mb-2">
              <Calendar className="w-3 h-3" /><span>{track.date}</span>
            </div>
          )}
        </div>
      </div>
      <p className="text-white/65 text-sm leading-relaxed mb-3 ml-9">{track.description}</p>
      {track.impact && (
        <div className="ml-9 mb-3">
          <span className="inline-block text-[10px] tracking-wider px-2.5 py-1 rounded-sm font-bold" style={{ backgroundColor: theme.accentColor + '22', color: theme.accentColor, border: `1px solid ${theme.accentColor}44` }}>
            ↑ {track.impact}
          </span>
        </div>
      )}
      {track.tech && track.tech.length > 0 && (
        <div className="flex flex-wrap gap-1.5 ml-9 mb-3">
          {track.tech.map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-sm border border-white/15 text-white/55 bg-white/5">{t}</span>
          ))}
        </div>
      )}
      {track.links && (
        <div className="flex gap-2 ml-9 mt-3 flex-wrap">
          {track.links.repo && (
            <a href={track.links.repo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 border border-white/20 text-white/70 hover:text-white hover:border-white/50 transition-all rounded-sm group/btn">
              <Github className="w-3.5 h-3.5" /><span>Repo</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            </a>
          )}
          {track.links.demo && (
            <a href={track.links.demo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 border border-white/20 text-white/70 hover:text-white hover:border-white/50 transition-all rounded-sm group/btn">
              <ExternalLink className="w-3.5 h-3.5" /><span>Live Demo</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function VinylDetail({ record, onClose }: VinylDetailProps) {
  const { currentEra } = useEra();
  const theme = albumThemes[record.id] || { ...eraThemes[currentEra], bg: 'from-[#0d0d0d] to-[#0a0a0a]' };
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Keyboard: Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll while modal is open so the page behind doesn't scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const max = scrollHeight - clientHeight;
    setScrollProgress(max > 0 ? Math.min(1, scrollTop / max) : 0);
  };

  const dragY = useMotionValue(0);
  const overlayOpacity = useTransform(dragY, [0, 200], [1, 0.3]);

  const featuredTracks = record.tracks.filter(t => t.featured);
  const otherTracks = record.tracks.filter(t => !t.featured);

  const copyEmail = () => {
    navigator.clipboard.writeText('shlokthakkar1806@gmail.com');
    toast('COPIED TO CLIPBOARD', {
      description: 'shlokthakkar1806@gmail.com',
      style: { background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'var(--font-body)' },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ opacity: overlayOpacity }}
      className="fixed inset-0 bg-black/95 z-50 flex flex-col"
      onClick={onClose}
    >
      {/* Mobile drag handle */}
      <motion.div
        drag="y" dragConstraints={{ top: 0, bottom: 300 }} dragElastic={0.1}
        style={{ y: dragY }}
        onDragEnd={(_, info) => { if (info.offset.y > 120) onClose(); }}
        onClick={e => e.stopPropagation()}
        className="md:hidden flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
      >
        <div className="w-12 h-1 rounded-full bg-white/20" />
      </motion.div>

      {/* Main panel — flex column fills viewport height */}
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex-1 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${theme.bg} border-b border-white/10 flex-shrink-0`}>
          <div className="px-6 md:px-10 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: theme.labelColor }} />
              <div>
                <div className="text-[9px] tracking-[0.4em] text-white/35 mb-0.5">{record.catalogNumber} · NOW PLAYING</div>
                <h2 className="text-2xl md:text-3xl text-white tracking-tight" style={{ fontFamily: 'var(--font-gothic)', fontWeight: 900 }}>{record.title}</h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:block text-[10px] tracking-[0.3em] text-white/30">ESC TO CLOSE</span>
              <button onClick={onClose} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group" aria-label="Close">
                <span className="hidden md:block text-xs tracking-widest group-hover:text-white/80 transition-colors">CLOSE</span>
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          {/* Scroll progress bar */}
          <div className="h-[2px] bg-white/[0.04]">
            <motion.div
              className="h-full"
              style={{ width: `${scrollProgress * 100}%`, background: `linear-gradient(90deg, ${theme.labelColor}, ${theme.accentColor})` }}
              transition={{ duration: 0.05 }}
            />
          </div>
        </div>

        {/*
          KEY FIX:
          - data-lenis-prevent  → tells Lenis to ignore wheel events on this element
          - overscroll-contain  → stops scroll chaining to the page behind
          - WebkitOverflowScrolling → smooth momentum on iOS
          - flex-1 overflow-y-auto → fills remaining height and scrolls
        */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          data-lenis-prevent
          className="flex-1 overflow-y-auto overscroll-contain px-6 md:px-10 py-8"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="max-w-3xl mx-auto space-y-4">

            {record.id === 'experience' && (
              <>
                <div className="text-[10px] tracking-[0.4em] text-white/35 mb-6">WORK HISTORY</div>
                {record.tracks.map((track, i) => <TrackCard key={i} track={track} index={i} theme={theme} />)}
              </>
            )}

            {record.id === 'projects' && (
              <>
                {featuredTracks.length > 0 && (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] tracking-[0.4em] text-white/35">PLATINUM CUTS</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                    {featuredTracks.map((track, i) => <TrackCard key={i} track={track} index={i} theme={theme} />)}
                  </>
                )}
                {otherTracks.length > 0 && (
                  <>
                    <div className="flex items-center gap-3 mt-8 mb-2">
                      <span className="text-[10px] tracking-[0.4em] text-white/35">DEEP CUTS</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                    {otherTracks.map((track, i) => (
                      <TrackCard key={i} track={{ ...track, featured: false }} index={featuredTracks.length + i} theme={theme} />
                    ))}
                  </>
                )}
              </>
            )}

            {record.id === 'skills' && (
              <>
                <div className="text-[10px] tracking-[0.4em] text-white/35 mb-6">TECHNICAL PROFICIENCIES</div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {record.tracks.map((track, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                      className="border border-white/10 bg-white/[0.04] p-5 rounded-sm hover:bg-white/[0.07] transition-all"
                    >
                      <div className="text-[10px] tracking-[0.3em] mb-3 font-bold" style={{ color: theme.labelColor }}>{track.title.toUpperCase()}</div>
                      <div className="flex flex-wrap gap-2">
                        {track.description.split(', ').map(skill => (
                          <span key={skill} className="text-xs px-2.5 py-1 rounded-sm border border-white/15 text-white/70 bg-white/5 hover:border-white/30 hover:text-white transition-all">{skill.trim()}</span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {record.id === 'education' && (
              <>
                <div className="text-[10px] tracking-[0.4em] text-white/35 mb-6">ACADEMIC BACKGROUND</div>
                {record.tracks.map((track, i) => <TrackCard key={i} track={track} index={i} theme={theme} />)}
              </>
            )}

            {record.id === 'blog' && (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <Trophy className="w-4 h-4" style={{ color: theme.accentColor }} />
                  <span className="text-[10px] tracking-[0.4em] text-white/35">HACKATHONS & RECOGNITION</span>
                </div>
                {record.tracks.map((track, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}
                    className={`relative rounded-sm border p-6 overflow-hidden ${track.featured ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-white/10 bg-white/[0.04]'}`}
                  >
                    {track.featured && (
                      <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
                        className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent pointer-events-none"
                      />
                    )}
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{track.featured ? '🥈' : '🏆'}</div>
                      <div className="flex-1">
                        <h3 className="text-white text-lg mb-1" style={{ fontWeight: 700 }}>{track.title.replace(/^[🥈🏆]\s*/, '')}</h3>
                        {track.date && <div className="flex items-center gap-1.5 text-[11px] text-white/40 mb-2"><Calendar className="w-3 h-3" /><span>{track.date}</span></div>}
                        <p className="text-white/65 text-sm leading-relaxed mb-3">{track.description}</p>
                        {track.impact && <span className="inline-block text-[10px] tracking-wider px-2.5 py-1 rounded-sm font-bold" style={{ backgroundColor: '#FFD70022', color: '#FFD700', border: '1px solid #FFD70044' }}>{track.impact}</span>}
                        {track.tech && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {track.tech.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-sm border border-yellow-500/20 text-yellow-400/60 bg-yellow-500/5">{t}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            )}

            {record.id === 'contact' && (
              <>
                <div className="text-[10px] tracking-[0.4em] text-white/35 mb-6">GET IN TOUCH</div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {record.tracks.map((track, i) => {
                    const iconMap: Record<string, React.ReactNode> = {
                      Email: <Mail className="w-5 h-5" />, Phone: <Phone className="w-5 h-5" />,
                      LinkedIn: <Linkedin className="w-5 h-5" />, GitHub: <Github className="w-5 h-5" />, Location: <MapPin className="w-5 h-5" />,
                    };
                    if (track.title === 'Email') {
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
                          <button onClick={copyEmail} className="w-full flex items-center gap-4 border border-white/10 bg-white/[0.04] p-5 rounded-sm hover:bg-white/[0.08] hover:border-white/25 transition-all group text-left">
                            <div style={{ color: theme.labelColor }}>{iconMap[track.title]}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] tracking-widest text-white/35 mb-1">{track.title.toUpperCase()}</div>
                              <div className="text-white/80 text-sm truncate group-hover:text-white transition-colors">{track.description}</div>
                            </div>
                            <Copy className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
                          </button>
                        </motion.div>
                      );
                    }
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
                        {track.links?.demo ? (
                          <a href={track.links.demo} target={track.links.demo.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                            className="flex items-center gap-4 border border-white/10 bg-white/[0.04] p-5 rounded-sm hover:bg-white/[0.08] hover:border-white/25 transition-all group">
                            <div style={{ color: theme.labelColor }}>{iconMap[track.title]}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] tracking-widest text-white/35 mb-1">{track.title.toUpperCase()}</div>
                              <div className="text-white/80 text-sm truncate group-hover:text-white transition-colors">{track.description}</div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-white/25 group-hover:text-white/60 transition-colors flex-shrink-0" />
                          </a>
                        ) : (
                          <div className="flex items-center gap-4 border border-white/10 bg-white/[0.04] p-5 rounded-sm">
                            <div style={{ color: theme.labelColor }}>{iconMap[track.title]}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] tracking-widest text-white/35 mb-1">{track.title.toUpperCase()}</div>
                              <div className="text-white/70 text-sm">{track.description}</div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}

          </div>
          <div className="h-16" />
        </div>
      </motion.div>
    </motion.div>
  );
}
