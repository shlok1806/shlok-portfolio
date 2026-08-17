import { LINKS } from "@/lib/content";

export function ContactOutput() {
  return (
    <div className="space-y-2">
      {LINKS.map(({ label, value, href }) => (
        <div key={label} className="flex items-baseline gap-4 text-[13px]">
          <span className="text-accent-ink w-16 shrink-0">{label}</span>
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="text-accent-ink hover:underline transition-colors"
          >
            {value}
          </a>
        </div>
      ))}
      <p className="text-faint text-[11px] mt-2">
        Tip: type <span className="text-accent-ink">open github</span> to open GitHub directly
      </p>
    </div>
  );
}
