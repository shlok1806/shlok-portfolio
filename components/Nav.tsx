"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-24 h-14 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/[0.06]">
      <Link href="/" className="text-white text-sm font-semibold tracking-tight">
        Shlok Thakkar
      </Link>
      <ul className="flex items-center gap-8">
        {links.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`text-xs font-mono tracking-widest uppercase transition-colors pb-1 ${
                  isActive
                    ? "text-white border-b border-[rgb(var(--accent))]"
                    : "text-white/35 hover:text-white/70"
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
