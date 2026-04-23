import { Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="border-t border-white/[0.06] bg-[#0a0a0a] px-6 md:px-12 py-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-xl tracking-tight text-white"
                style={{ fontFamily: "var(--font-gothic)", fontWeight: 900 }}
              >
                SHLOK THAKKAR
              </span>
              <span className="text-neutral-700">·</span>
              <span
                className="text-[10px] tracking-[0.3em] text-neutral-500"
                style={{ fontFamily: "var(--font-condensed)" }}
              >
                CS + ECON @ UIUC
              </span>
            </div>
            <p className="text-neutral-600 text-[11px] tracking-wide" style={{ fontFamily: "var(--font-body)" }}>
              Open to Summer / Fall 2026 internships
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <a
              href="mailto:shlokthakkar1806@gmail.com"
              className="flex items-center gap-2 text-[11px] tracking-widest text-neutral-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-3 py-2"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              <Mail className="w-3.5 h-3.5" />
              EMAIL
            </a>
            <a
              href="https://www.linkedin.com/in/shlok-thakkar/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[11px] tracking-widest text-neutral-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-3 py-2"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              <Linkedin className="w-3.5 h-3.5" />
              LINKEDIN
            </a>
            <a
              href="https://github.com/shlok1806"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[11px] tracking-widest text-neutral-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-3 py-2"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              <Github className="w-3.5 h-3.5" />
              GITHUB
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.04] flex items-center justify-between">
          <span className="text-neutral-700 text-[10px]" style={{ fontFamily: "var(--font-condensed)" }}>
            © {new Date().getFullYear()} SHLOK THAKKAR — ALL RIGHTS RESERVED
          </span>
          <span className="text-neutral-700 text-[10px]" style={{ fontFamily: "var(--font-condensed)" }}>
            CHAMPAIGN, IL
          </span>
        </div>
      </div>
    </footer>
  );
}
