import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useRef, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Search, ArrowRight, Github, Linkedin, Mail,
  FileText, ChevronRight, Download, Copy,
} from 'lucide-react';
import { toast } from 'sonner';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  group: string;
  action: () => void;
}

const SECTIONS = [
  { id: 'experience', label: 'Experience', sub: 'Work & Research' },
  { id: 'projects',  label: 'Projects',   sub: 'Personal Builds & Systems' },
  { id: 'skills',    label: 'Skills',     sub: 'Technical Proficiencies' },
  { id: 'education', label: 'Education',  sub: 'Academic Background' },
  { id: 'blog',      label: 'Awards',     sub: 'Hackathons & Recognition' },
  { id: 'contact',   label: 'Contact',    sub: "Let's Connect" },
];

export function CommandPalette() {
  const { setSelectedRecordId, commandPaletteOpen, setCommandPaletteOpen } = usePortfolio();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(() => [
    ...SECTIONS.map(s => ({
      id: `open-${s.id}`,
      label: `Open ${s.label}`,
      description: s.sub,
      icon: <ChevronRight className="w-4 h-4" />,
      group: 'Navigate',
      action: () => { setSelectedRecordId(s.id); setCommandPaletteOpen(false); setQuery(''); },
    })),
    {
      id: 'copy-email',
      label: 'Copy Email Address',
      description: 'shlokthakkar1806@gmail.com',
      icon: <Copy className="w-4 h-4" />,
      group: 'Connect',
      action: () => {
        navigator.clipboard.writeText('shlokthakkar1806@gmail.com');
        toast('COPIED TO CLIPBOARD', { description: 'shlokthakkar1806@gmail.com', style: { background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' } });
        setCommandPaletteOpen(false); setQuery('');
      },
    },
    {
      id: 'open-github',
      label: 'Open GitHub',
      description: 'github.com/shlok1806',
      icon: <Github className="w-4 h-4" />,
      group: 'Connect',
      action: () => { window.open('https://github.com/shlok1806', '_blank'); setCommandPaletteOpen(false); setQuery(''); },
    },
    {
      id: 'open-linkedin',
      label: 'Open LinkedIn',
      description: 'linkedin.com/in/shlok-thakkar',
      icon: <Linkedin className="w-4 h-4" />,
      group: 'Connect',
      action: () => { window.open('https://www.linkedin.com/in/shlok-thakkar/', '_blank'); setCommandPaletteOpen(false); setQuery(''); },
    },
    {
      id: 'send-email',
      label: 'Send Email',
      description: 'Open mail client',
      icon: <Mail className="w-4 h-4" />,
      group: 'Connect',
      action: () => { window.open('mailto:shlokthakkar1806@gmail.com', '_blank'); setCommandPaletteOpen(false); setQuery(''); },
    },
    {
      id: 'download-resume',
      label: 'Download Resume',
      description: "Get a copy of Shlok's resume",
      icon: <Download className="w-4 h-4" />,
      group: 'Resume',
      action: () => { window.open('/resume.pdf', '_blank'); setCommandPaletteOpen(false); setQuery(''); },
    },
  ], [setSelectedRecordId, setCommandPaletteOpen]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c => c.label.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
  }, [query, commands]);

  const grouped = useMemo(() =>
    filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
      if (!acc[cmd.group]) acc[cmd.group] = [];
      acc[cmd.group].push(cmd);
      return acc;
    }, {}),
    [filtered]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true); setQuery(''); setSelectedIndex(0);
      }
      if (!commandPaletteOpen) return;
      if (e.key === 'Escape') { setCommandPaletteOpen(false); setQuery(''); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && filtered[selectedIndex]) filtered[selectedIndex].action();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commandPaletteOpen, filtered, selectedIndex, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) { setTimeout(() => inputRef.current?.focus(), 60); setSelectedIndex(0); }
  }, [commandPaletteOpen]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[500] flex items-start justify-center pt-[18vh] px-4"
          style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)' }}
          onClick={() => { setCommandPaletteOpen(false); setQuery(''); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: -12 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-[540px] overflow-hidden"
            style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 30px 80px rgba(0,0,0,0.9)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.08]">
              <Search className="w-4 h-4 text-neutral-600 flex-shrink-0" />
              <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search commands..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-neutral-700" style={{ fontFamily: 'var(--font-body)' }} />
              <kbd className="px-1.5 py-0.5 text-[9px] text-neutral-600 border border-white/10 flex-shrink-0" style={{ fontFamily: 'var(--font-condensed)', letterSpacing: '0.1em' }}>ESC</kbd>
            </div>

            <div className="max-h-[360px] overflow-y-auto py-1" style={{ scrollbarWidth: 'none' }}>
              {Object.entries(grouped).map(([group, cmds]) => (
                <div key={group}>
                  <div className="px-4 pt-3 pb-1.5 text-[9px] tracking-[0.35em] text-neutral-600" style={{ fontFamily: 'var(--font-condensed)' }}>{group.toUpperCase()}</div>
                  {cmds.map(cmd => {
                    const thisIndex = filtered.indexOf(cmd);
                    const isSel = thisIndex === selectedIndex;
                    return (
                      <button key={cmd.id} onClick={cmd.action} onMouseEnter={() => setSelectedIndex(thisIndex)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-100"
                        style={{ background: isSel ? 'rgba(255,255,255,0.055)' : 'transparent', borderLeft: isSel ? '2px solid #DC2626' : '2px solid transparent' }}
                      >
                        <span className="flex-shrink-0 transition-colors duration-100" style={{ color: isSel ? '#DC2626' : '#555' }}>{cmd.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm transition-colors duration-100" style={{ color: isSel ? '#fff' : '#aaa', fontFamily: 'var(--font-body)' }}>{cmd.label}</div>
                          {cmd.description && <div className="text-[11px] text-neutral-700 truncate mt-0.5">{cmd.description}</div>}
                        </div>
                        {isSel && <ArrowRight className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-10 text-center text-neutral-700 text-sm" style={{ fontFamily: 'var(--font-body)' }}>No commands found for "{query}"</div>
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-white/[0.08] flex items-center gap-5 text-[9px] text-neutral-600" style={{ fontFamily: 'var(--font-condensed)', letterSpacing: '0.12em' }}>
              <span><span className="text-neutral-500">↑↓</span> NAVIGATE</span>
              <span><span className="text-neutral-500">↵</span> SELECT</span>
              <span><span className="text-neutral-500">ESC</span> CLOSE</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-red-600 animate-pulse" />
                <span>ST-ARCHIVE</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
