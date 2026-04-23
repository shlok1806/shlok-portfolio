import { motion, AnimatePresence } from "motion/react";
import { Github, Linkedin, Volume2, VolumeX, Star } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { records } from "../data/records";
import { VinylDetail } from "../components/VinylDetail";
import { useSoundEffects } from "../hooks/useSoundEffects";

interface AlbumTile {
  id: string;
  label: string;
  subtitle: string;
  album: 'graduation' | 'mbdtf' | 'tlop' | 'college-dropout' | 'yeezus' | 'ye' | '808s';
}

// Experience first — what recruiters look for
const albumTiles: AlbumTile[] = [
  {
    id: 'experience',
    label: 'EXPERIENCE',
    subtitle: '',
    album: 'college-dropout',
  },
  {
    id: 'projects',
    label: 'PROJECTS',
    subtitle: '',
    album: 'mbdtf',
  },
  {
    id: 'skills',
    label: 'SKILLS',
    subtitle: '',
    album: 'ye',
  },
  {
    id: 'education',
    label: 'EDUCATION',
    subtitle: '',
    album: 'tlop',
  },
  {
    id: 'blog',
    label: 'AWARDS',
    subtitle: '',
    album: 'yeezus',
  },
  {
    id: 'contact',
    label: 'CONTACT',
    subtitle: '',
    album: '808s',
  },
];

const STATS = [
  { value: '3.97', label: 'GPA' },
  { value: '4', label: 'Roles' },
  { value: '15+', label: 'Projects' },
  { value: '2nd', label: 'HERE Chicago Hackathon' },
  { value: 'UIUC', label: "CS + Econ '28" },
];

function AlbumTileComponent({
  tile,
  index,
  onClick,
  onHover,
  isFocused,
}: {
  tile: AlbumTile;
  index: number;
  onClick: () => void;
  onHover?: () => void;
  isFocused?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleHoverStart = () => {
    setIsHovered(true);
    if (onHover) onHover();
  };

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => {
      setIsPressed(false);
      onClick();
    }, 120);
  };

  const renderComposition = () => {
    switch (tile.album) {
      case 'graduation':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#C9C436] via-[#DE5470] to-[#B51989]" />
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-8 right-8 w-16 h-16 border-4 border-white/30"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-12 left-8 w-12 h-12 rounded-full bg-white/20"
            />
            <div className="absolute top-1/2 left-1/3 w-8 h-8 rotate-45 bg-[#C9C436]/40" />
          </>
        );

      case 'mbdtf':
        return (
          <>
            <div className="absolute inset-0 bg-[#EC243C]" />
            <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-[#D4AF37]" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-[#D4AF37]" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-[#D4AF37]" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-[#D4AF37]" />
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-12 border-2 border-[#FCC464]/40"
            />
          </>
        );

      case 'tlop':
        return (
          <>
            <div className="absolute inset-0 bg-[#F48C54]" />
            <div className="absolute inset-0 overflow-hidden opacity-30">
              <div className="absolute top-0 left-0 right-0 flex flex-col gap-2">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ x: [0, -20, 0] }}
                    transition={{ duration: 8 + i, repeat: Infinity, ease: "linear" }}
                    className="h-1 bg-black/40"
                    style={{ width: `${60 + i * 10}%` }}
                  />
                ))}
              </div>
            </div>
            <motion.div
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-8 right-8 w-16 h-12 border-2 border-white/60"
            />
          </>
        );

      case 'college-dropout':
        return (
          <>
            <div className="absolute inset-0 bg-[#D4C5A0]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="w-32 h-40 border-4 border-[#FFD700] rounded-sm relative">
                  <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-[#DAA520]" />
                  <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#DAA520]" />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-[#DAA520]" />
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-[#DAA520]" />
                  <div className="absolute inset-2 border border-[#B8860B]/30" />
                </div>
              </motion.div>
            </div>
          </>
        );

      case 'yeezus':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1505] to-[#0d0d00]" />
            <motion.div
              animate={{ x: ['-100%', '250%'] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent pointer-events-none"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-5xl"
              >
                🥈
              </motion.div>
            </div>
            <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-yellow-500/50" />
            <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-yellow-500/50" />
          </>
        );

      case 'ye':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#8FA899] via-[#6B8E7F] to-[#4A5F56]" />
            <div className="absolute bottom-0 left-0 right-0">
              <svg className="w-full h-32" viewBox="0 0 200 80" preserveAspectRatio="none">
                <motion.path
                  d="M0,80 L0,60 Q50,20 100,40 T200,60 L200,80 Z"
                  fill="#3D4A45"
                  animate={{
                    d: [
                      "M0,80 L0,60 Q50,20 100,40 T200,60 L200,80 Z",
                      "M0,80 L0,55 Q50,25 100,45 T200,55 L200,80 Z",
                      "M0,80 L0,60 Q50,20 100,40 T200,60 L200,80 Z",
                    ],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
              </svg>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#2C3530] to-transparent" />
            </div>
            <div className="absolute top-8 left-8 text-[#90BE6D] font-bold text-sm italic opacity-60">
              believe
            </div>
          </>
        );

      case '808s':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#C5CAD0] to-[#A8ADB3]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="relative w-16 h-16">
                  <div className="absolute top-0 left-0 w-8 h-8 bg-[#E63946] rounded-full" />
                  <div className="absolute top-0 right-0 w-8 h-8 bg-[#E63946] rounded-full" />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[20px] border-t-[#E63946]" />
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#1A1A1A]/40 rotate-12" />
                </div>
              </motion.div>
            </div>
            <div className="absolute left-4 top-1/4 w-2 h-1/2 flex flex-col gap-1">
              <div className="flex-1 bg-[#90BE6D]/80" />
              <div className="flex-1 bg-[#F9C74F]/80" />
              <div className="flex-1 bg-[#F8961E]/80" />
            </div>
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[8px] tracking-[0.3em] text-gray-600 opacity-50">
              808s
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 + index * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      onHoverStart={handleHoverStart}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
      tabIndex={0}
      role="button"
      aria-label={`Open ${tile.label}`}
      className="relative aspect-square cursor-pointer group outline-none"
    >
      <motion.div
        animate={{
          y: isPressed ? 4 : isHovered ? -8 : 0,
          scale: isPressed ? 0.97 : 1,
          rotateZ: isHovered && !isPressed ? (index % 2 === 0 ? 1.5 : -1.5) : 0,
        }}
        transition={{ duration: isPressed ? 0.08 : 0.18, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative w-full h-full shadow-lg overflow-hidden flex flex-col items-center justify-center p-6"
        style={{
          boxShadow: isFocused
            ? '0 0 0 2px #fff, 0 20px 40px rgba(0,0,0,0.3)'
            : isHovered
            ? '0 20px 40px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.1)'
            : '0 8px 16px rgba(0,0,0,0.2)',
        }}
      >
        {renderComposition()}

        <div className="relative z-10 text-center px-4">
          <div
            className="text-xl md:text-2xl lg:text-3xl tracking-tight leading-none text-white"
            style={{
              fontFamily: 'var(--font-gothic)',
              fontWeight: 900,
              textShadow: '0 2px 8px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3), 0 0 40px rgba(0,0,0,0.2)',
              WebkitTextStroke: '1px rgba(0,0,0,0.3)',
              paintOrder: 'stroke fill',
            }}
          >
            {tile.label}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-4 right-4 text-xs tracking-widest text-white/90 bg-black/40 backdrop-blur-sm px-3 py-1.5"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          OPEN
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const selectedRecord = records.find((r) => r.id === selectedRecordId);

  const { initializeAudio, onTileHover, onTileClick, onModalOpen, onModalClose } = useSoundEffects();

  useEffect(() => {
    const handleFirstInteraction = () => {
      initializeAudio();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [initializeAudio]);

  useEffect(() => {
    if (selectedRecordId && soundEnabled) onModalOpen();
  }, [selectedRecordId, soundEnabled, onModalOpen]);

  const handleTileClick = useCallback(
    (tileId: string) => {
      if (soundEnabled) onTileClick();
      setSelectedRecordId(tileId);
    },
    [soundEnabled, onTileClick]
  );

  const handleModalClose = useCallback(() => {
    if (soundEnabled) onModalClose();
    setSelectedRecordId(null);
  }, [soundEnabled, onModalClose]);

  const handleTileHover = useCallback(() => {
    if (soundEnabled) onTileHover();
  }, [soundEnabled, onTileHover]);

  const toggleSound = () => setSoundEnabled((s) => !s);

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
        {/* Background vinyl groove rings */}
        <div className="fixed inset-0 opacity-[0.015] pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw]">
            {[...Array(60)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-white/[0.02]"
                style={{
                  top: `${2 + i * 1.5}%`,
                  left: `${2 + i * 1.5}%`,
                  right: `${2 + i * 1.5}%`,
                  bottom: `${2 + i * 1.5}%`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="fixed inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
            }}
          />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="px-6 md:px-8 py-5 flex justify-between items-center border-b border-white/[0.05]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-gothic)', fontWeight: 900 }}>
                SHLOK THAKKAR
              </h1>
              <p className="text-[8px] font-mono text-neutral-600 tracking-widest mt-0.5">
                ARCHIVE_01 / SYSTEM PORTFOLIO
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-4 md:gap-6"
            >
              <button
                onClick={toggleSound}
                className="text-neutral-400 hover:text-white transition-colors"
                title={soundEnabled ? 'Sound On' : 'Sound Off'}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                <span className="text-[8px] font-mono text-neutral-600">ONLINE</span>
              </div>
              <a href="https://github.com/shlok1806" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/shlok-thakkar/" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </motion.div>
          </header>

          {/* Quick Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="border-b border-white/[0.05] bg-white/[0.02] px-6 md:px-8 py-3 flex items-center gap-0 overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {STATS.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-0 flex-shrink-0">
                <div className="flex items-baseline gap-2 px-4 md:px-6 py-1">
                  <span className="text-white text-sm md:text-base" style={{ fontFamily: 'var(--font-gothic)', fontWeight: 900 }}>
                    {stat.value}
                  </span>
                  <span className="text-neutral-500 text-[10px] tracking-widest uppercase whitespace-nowrap">
                    {stat.label}
                  </span>
                </div>
                {i < STATS.length - 1 && (
                  <div className="w-px h-4 bg-white/10 flex-shrink-0" />
                )}
              </div>
            ))}
          </motion.div>

          {/* Main Content */}
          <main className="px-6 md:px-8 py-12 md:py-16">
            <div className="max-w-[1400px] mx-auto w-full relative z-10">
              <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-center">

                {/* Left: Hero */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                  className="space-y-6"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-3 text-[9px] tracking-[0.3em] text-neutral-500"
                    style={{ fontFamily: 'var(--font-condensed)' }}
                  >
                    <span>CATALOG NO. 0001</span>
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                    <span>ARCHIVE MODE</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <h1
                      className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] leading-[0.9] tracking-[-0.02em] text-white mb-2"
                      style={{ fontFamily: 'var(--font-gothic)', fontWeight: 900 }}
                    >
                      SHLOK
                    </h1>
                    <h1
                      className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] leading-[0.9] tracking-[-0.02em] text-white"
                      style={{ fontFamily: 'var(--font-gothic)', fontWeight: 900 }}
                    >
                      THAKKAR
                    </h1>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                  >
                    <p className="text-sm text-neutral-400 tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>
                      CS + Economics • Statistics minor • UIUC • Champaign, IL
                    </p>
                    <p className="text-base text-neutral-300 max-w-md leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                      Backend systems and data-driven products at the intersection of software and finance.
                    </p>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.75, type: 'spring', stiffness: 200 }}
                      className="inline-flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 rounded-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                      <span className="text-[11px] tracking-[0.15em] text-emerald-400 font-medium">
                        OPEN TO INTERNSHIPS — SUMMER / FALL 2026
                      </span>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="border-l-2 border-red-600 pl-4 py-2"
                  >
                    <p
                      className="text-sm text-neutral-400 mb-1"
                      style={{ fontFamily: 'var(--font-condensed)', letterSpacing: '0.1em' }}
                    >
                      SELECT A TILE TO EXPLORE
                    </p>
                    <p className="text-xs text-neutral-500" style={{ fontFamily: 'var(--font-body)' }}>
                      Each section has detailed work, projects, and skills — press <kbd className="px-1 py-0.5 rounded border border-white/10 text-[10px]">ESC</kbd> to go back.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex items-center gap-4"
                  >
                    <a
                      href="https://www.linkedin.com/in/shlok-thakkar/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[11px] tracking-widest text-neutral-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-3 py-2 rounded-sm"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </a>
                    <a
                      href="https://github.com/shlok1806"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[11px] tracking-widest text-neutral-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-3 py-2 rounded-sm"
                    >
                      <Github className="w-4 h-4" />
                      <span>GitHub</span>
                    </a>
                    <div className="flex items-center gap-1.5 text-[10px] text-yellow-500/80">
                      <Star className="w-3 h-3 fill-yellow-500/80" />
                      <span className="tracking-wider">2nd @ HERE Chicago</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Right: Album tile grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                  {albumTiles.map((tile, index) => (
                    <AlbumTileComponent
                      key={tile.id}
                      tile={tile}
                      index={index}
                      onClick={() => handleTileClick(tile.id)}
                      onHover={handleTileHover}
                    />
                  ))}
                </div>

              </div>
            </div>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {selectedRecord && (
          <VinylDetail record={selectedRecord} onClose={handleModalClose} />
        )}
      </AnimatePresence>
    </>
  );
}
