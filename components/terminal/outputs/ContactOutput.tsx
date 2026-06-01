const LINKS = [
  { label: "email",    value: "shlokthakkar1806@gmail.com", href: "mailto:shlokthakkar1806@gmail.com" },
  { label: "github",   value: "github.com/shlok1806",       href: "https://github.com/shlok1806" },
  { label: "linkedin", value: "linkedin/shlok-thakkar",     href: "https://linkedin.com/in/shlok-thakkar/" },
];

export function ContactOutput() {
  return (
    <div className="space-y-2">
      {LINKS.map(({ label, value, href }) => (
        <div key={label} className="flex items-baseline gap-4 text-[13px]">
          <span className="text-accent/60 w-16 shrink-0">{label}</span>
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="text-accent hover:underline transition-colors"
          >
            {value}
          </a>
        </div>
      ))}
      <p className="text-white/20 text-[11px] mt-2">Tip: type <span className="text-accent/60">open github</span> to open GitHub directly</p>
    </div>
  );
}
