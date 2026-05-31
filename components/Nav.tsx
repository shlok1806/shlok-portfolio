"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",        label: "~/home" },
  { href: "/resume",  label: "~/resume" },
  { href: "/contact", label: "~/contact" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 h-12 bg-[#101213]/95 backdrop-blur-sm border-b border-accent/20">
      <span className="text-accent font-mono font-bold text-[13px] tracking-tight">
        shlok@portfolio:~$
      </span>
      <ul className="flex items-center gap-8">
        {links.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`font-mono text-[12px] tracking-wider transition-colors ${
                  isActive
                    ? "text-white border-b border-accent pb-0.5"
                    : "text-white/30 hover:text-white/70"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
