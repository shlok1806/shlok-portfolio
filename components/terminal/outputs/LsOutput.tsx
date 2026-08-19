const FILES = [
  { name: "resume.txt",    size: "12K",  desc: "Full resume" },
  { name: "projects/",     size: "4.0K", desc: "All 8 projects" },
  { name: "experience.log",size: "8.2K", desc: "Work history" },
  { name: "skills.json",   size: "2.1K", desc: "Technical skills" },
  { name: "education.md",  size: "1.4K", desc: "Academic background" },
  { name: "contact.txt",   size: "512B", desc: "Get in touch" },
];

export function LsOutput() {
  return (
    <div className="space-y-[2px]">
      <p className="text-faint text-[11px] mb-1">total 28K</p>
      {FILES.map((f) => (
        <div key={f.name} className="flex gap-4 text-[13px]">
          {/*
            Owner and group first, then the mode. Spelled out, this row wanted
            376px of fixed columns inside a 343px phone window, so it was the
            one thing in the terminal that actually scrolled sideways.
          */}
          <span className="hidden shrink-0 text-faint md:inline">-rw-r--r--  shlok  staff</span>
          <span className="hidden shrink-0 text-faint sm:inline md:hidden">-rw-r--r--</span>
          <span className="text-faint w-12 shrink-0">{f.size}</span>
          <span className={`font-bold shrink-0 ${f.name.endsWith("/") ? "text-accent-ink" : "text-foreground"}`}>{f.name}</span>
          <span className="hidden truncate text-faint sm:inline"># {f.desc}</span>
        </div>
      ))}
      <p className="text-faint text-[11px] mt-2">Use <span className="text-accent-ink">cat &lt;filename&gt;</span> to read a file</p>
    </div>
  );
}
