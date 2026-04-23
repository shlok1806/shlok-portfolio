import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { Github, Linkedin, Star } from "lucide-react";
import { useState, useRef } from "react";
import { records } from "../data/records";
import { VinylDetail } from "../components/VinylDetail";
import { MagneticButton } from "../components/MagneticButton";
import { usePortfolio } from "../context/PortfolioContext";

const ACCENT = '#EC243C';

interface AlbumTile {
  id: string;
  label: string;
  subtitle: string;
  album: 'graduation' | 'mbdtf' | 'tlop' | 'college-dropout' | 'yeezus' | 'ye' | '808s';
}

const albumTiles: AlbumTile[] = [
  { id: 'experience', label: 'EXPERIENCE', subtitle: '', album: 'college-dropout' },
  { id: 'projects',   label: 'PROJECTS',   subtitle: '', album: 'mbdtf' },
  { id: 'skills',     label: 'SKILLS',     subtitle: '', album: 'ye' },
  { id: 'education',  label: 'EDUCATION',  subtitle: '', album: 'tlop' },
  { id: 'blog',       label: 'AWARDS',     subtitle: '', album: 'yeezus' },
  { id: 'contact',    label: 'CONTACT',    subtitle: '', album: '808s' },
];

const STATS = [
  { value: '3.97', label: 'GPA' },
  { value: '4',    label: 'Roles' },
  { value: 'UIUC', label: "CS + Econ '28" },
];

function AlbumTileComponent({
  tile,
  index,
  onClick,
}: {
  tile: AlbumTile;
  index: number;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const tileRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springMx = useSpring(mx, { damping: 22, stiffness: 300 });
  const springMy = useSpring(my, { damping: 22, stiffness: 300 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tileRef.current) return;
    const rect = tileRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mx.set(((e.clientX - cx) / rect.width) * 14);
    my.set(((e.clientY - cy) / rect.height) * 14);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
    setIsHovered(false);
  };

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => { setIsPressed(false); onClick(); }, 120);
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
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
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
            <div className="absolute top-8 left-8 text-[#90BE6D] font-bold text-sm italic opacity-60">believe</div>
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
          </>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={tileRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onHoverStart={() => setIsHovered(true)}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
      tabIndex={0}
      role="button"
      aria-label={`Open ${tile.label}`}
      className="relative aspect-square cursor-pointer group outline-none"
      style={{ x: springMx, y: springMy }}
    >
      <motion.div
        animate={{
          y: isPressed ? 4 : 0,
          scale: isPressed ? 0.97 : 1,
          rotateZ: isHovered && !isPressed ? (index % 2 === 0 ? 1.2 : -1.2) : 0,
        }}
        transition={{ duration: isPressed ? 0.08 : 0.18, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative w-full h-full shadow-lg overflow-hidden flex flex-col items-center justify-center p-6"
        style={{
          boxShadow: isHovered
            ? `0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px ${ACCENT}30`
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
              textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.4)',
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
          className="absolute bottom-4 right-4 text-xs tracking-widest text-white/90 bg-black/50 backdrop-blur-sm px-3 py-1.5"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          OPEN ↗
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const { selectedRecordId, setSelectedRecordId } = usePortfolio();

  const selectedRecord = records.find((r) => r.id === selectedRecordId);

  const handleTileClick = (id: string) => setSelectedRecordId(id);
  const handleModalClose = () => setSelectedRecordId(null);

  return (
    <>
      <div className="min-h-screen text-white">
        <div className="relative z-10 pb-14">

          {/* Stats bar */}
          <div className="border-b border-white/[0.05] bg-white/[0.02] px-6 md:px-8 py-3 flex items-center">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="flex items-center flex-shrink-0">
                <div className="flex items-baseline gap-2 px-4 md:px-6 py-1">
                  <span className="text-white text-sm md:text-base" style={{ fontFamily: 'var(--font-gothic)', fontWeight: 900 }}>
                    {stat.value}
                  </span>
                  <span className="text-neutral-500 text-[10px] tracking-widest uppercase whitespace-nowrap">
                    {stat.label}
                  </span>
                </div>
                {i < STATS.length - 1 && <div className="w-px h-4 bg-white/10 flex-shrink-0" />}
              </div>
            ))}
          </div>

          {/* Main content */}
          <main className="px-6 md:px-8 py-12 md:py-16">
            <div className="max-w-[1400px] mx-auto w-full">
              <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-center">

                {/* Left: Hero */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="space-y-6"
                >
                  {/* Name */}
                  <div>
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
                  </div>

                  {/* Tagline + badge */}
                  <div className="space-y-3">
                    <p className="text-sm text-neutral-400 tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>
                      CS + Economics • Statistics minor • UIUC • Champaign, IL
                    </p>
                    <p className="text-base text-neutral-300 max-w-md leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                      Systems software, backend APIs, and data infrastructure — CS + Economics at UIUC.
                    </p>
                    <div className="inline-flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                      <span className="text-[11px] tracking-[0.15em] text-emerald-400 font-medium">
                        ACTIVELY SEEKING — SWE INTERNSHIPS 2026
                      </span>
                    </div>
                  </div>

                  {/* Experience — liner notes */}
                  <div className="border border-white/[0.07] bg-white/[0.025] px-4 py-3 space-y-2">
                    <div
                      className="text-[10px] tracking-[0.2em] text-neutral-500 mb-3 pb-2 border-b border-white/[0.06]"
                      style={{ fontFamily: 'var(--font-condensed)' }}
                    >
                      Experience
                    </div>
                    {[
                      { company: 'IQM Corporation',    role: 'SWE Intern',   note: 'AWS Bedrock · FastAPI · 10K profiles' },
                      { company: 'UIUC Finance Dept',  role: 'Researcher',   note: '73% runtime ↓ · 10M+ records' },
                      { company: 'Disruption Lab',     role: 'SWE',          note: 'Neo4j · 40+ researchers' },
                      { company: 'Parallel Prog. Lab', role: 'Researcher',   note: 'C++ · HPC · UIUC' },
                    ].map((row) => (
                      <div key={row.company} className="flex items-baseline gap-2 min-w-0">
                        <span
                          className="text-[11px] text-white/55 whitespace-nowrap flex-shrink-0 w-[148px]"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {row.company}
                        </span>
                        <span
                          className="text-[11px] text-white/30 whitespace-nowrap flex-shrink-0 w-[80px]"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {row.role}
                        </span>
                        <span className="text-[10px] text-neutral-600 truncate" style={{ fontFamily: 'var(--font-body)' }}>
                          {row.note}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Social links */}
                  <div className="flex flex-wrap items-center gap-3">
                    <MagneticButton>
                      <a
                        href="https://www.linkedin.com/in/shlok-thakkar/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[11px] tracking-widest text-neutral-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-3 py-2 rounded-sm"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                      </a>
                    </MagneticButton>
                    <MagneticButton>
                      <a
                        href="https://github.com/shlok1806"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[11px] tracking-widest text-neutral-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-3 py-2 rounded-sm"
                      >
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                      </a>
                    </MagneticButton>
                    <div className="flex items-center gap-1.5 text-[10px] text-yellow-500/80">
                      <Star className="w-3 h-3 fill-yellow-500/80" />
                      <span className="tracking-wider">2nd @ HERE Chicago</span>
                    </div>
                  </div>

                  {/* ⌘K hint */}
                  <div
                    className="flex items-center gap-2 text-[9px] text-neutral-700"
                    style={{ fontFamily: 'var(--font-condensed)', letterSpacing: '0.15em' }}
                  >
                    <kbd className="px-1.5 py-0.5 border border-white/10 text-neutral-600">⌘K</kbd>
                    <span>COMMAND PALETTE</span>
                  </div>
                </motion.div>

                {/* Right: Album tile grid */}
                <div id="tiles" className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                  {albumTiles.map((tile, index) => (
                    <AlbumTileComponent
                      key={tile.id}
                      tile={tile}
                      index={index}
                      onClick={() => handleTileClick(tile.id)}
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
