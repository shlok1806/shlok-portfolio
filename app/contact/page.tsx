"use client";

import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <main className="min-h-screen pt-14">
      <section className="px-8 lg:px-24 pt-20 pb-12 border-b border-white/[0.06]">
        <p className="text-white/25 text-xs font-mono tracking-[0.25em] uppercase mb-6 border-l-2 border-[rgb(var(--accent)/0.5)] pl-3">
          Get In Touch
        </p>
        <h1 className="text-[clamp(48px,6vw,80px)] font-bold leading-[0.95] tracking-tight">
          Contact
        </h1>
        <p className="mt-6 text-white/45 text-sm leading-relaxed max-w-md">
          Whether it&apos;s a project, an opportunity, or you just want to talk
          about distributed systems — my inbox is open.
        </p>
      </section>

      <div className="px-8 lg:px-24 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-4xl">
        {/* Links */}
        <div className="space-y-10">
          <div>
            <p className="text-white/20 text-xs font-mono tracking-widest uppercase mb-5 border-l-2 border-[rgb(var(--accent)/0.5)] pl-3">
              Links
            </p>
            <div className="space-y-4">
              {[
                {
                  label: "Email",
                  value: "shlokthakkar1806@gmail.com",
                  href: "mailto:shlokthakkar1806@gmail.com",
                },
                {
                  label: "GitHub",
                  value: "github.com/shlok1806",
                  href: "https://github.com/shlok1806",
                },
                {
                  label: "LinkedIn",
                  value: "linkedin.com/in/shlok-thakkar",
                  href: "https://linkedin.com/in/shlok-thakkar/",
                },
              ].map(({ label, value, href }) => (
                <div key={label} className="flex items-center gap-4">
                  <span className="text-white/20 text-xs font-mono w-16 shrink-0">
                    {label}
                  </span>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/50 text-sm font-mono hover:text-white/80 transition-colors"
                  >
                    {value}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-10">
            <p className="text-white/20 text-xs font-mono tracking-widest uppercase mb-4 border-l-2 border-[rgb(var(--accent)/0.5)] pl-3">
              Availability
            </p>
            <p className="text-white/45 text-sm leading-relaxed">
              Open to internship opportunities for Summer 2025 and beyond.
              Based in Champaign, IL — open to remote and relocation.
            </p>
          </div>
        </div>

        {/* Form */}
        <div>
          {sent ? (
            <div className="flex flex-col justify-center h-full gap-3">
              <p className="text-white font-semibold text-lg">Sent.</p>
              <p className="text-white/40 text-sm">I&apos;ll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono tracking-widest text-white/25 uppercase mb-2">
                  Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-transparent border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-[rgb(var(--accent)/0.45)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono tracking-widest text-white/25 uppercase mb-2">
                  Email
                </label>
                <input
                  required
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-[rgb(var(--accent)/0.45)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono tracking-widest text-white/25 uppercase mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="What's on your mind?"
                  className="w-full bg-transparent border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-[rgb(var(--accent)/0.45)] transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="text-sm font-medium px-6 py-2.5 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="px-8 lg:px-24 py-8 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-white/20 text-xs font-mono">Shlok Thakkar</span>
        <p className="text-white/15 text-xs font-mono">© 2026</p>
      </footer>
    </main>
  );
}
