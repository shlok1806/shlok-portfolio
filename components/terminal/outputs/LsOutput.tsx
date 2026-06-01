const FILES = [
  { name: "resume.txt",    size: "12K",  desc: "Full resume" },
  { name: "projects/",     size: "4.0K", desc: "All 6 projects" },
  { name: "experience.log",size: "8.2K", desc: "Work history" },
  { name: "skills.json",   size: "2.1K", desc: "Technical skills" },
  { name: "education.md",  size: "1.4K", desc: "Academic background" },
  { name: "contact.txt",   size: "512B", desc: "Get in touch" },
];

export function LsOutput() {
  return (
    <div className="space-y-[2px]">
      <p className="text-white/20 text-[11px] mb-1">total 28K</p>
      {FILES.map((f) => (
        <div key={f.name} className="flex gap-4 text-[13px]">
          <span className="text-white/20 shrink-0">-rw-r--r--  shlok  staff</span>
          <span className="text-white/30 w-12 shrink-0">{f.size}</span>
          <span className={`font-bold shrink-0 ${f.name.endsWith("/") ? "text-accent" : "text-white/70"}`}>{f.name}</span>
          <span className="text-white/25"># {f.desc}</span>
        </div>
      ))}
      <p className="text-white/20 text-[11px] mt-2">Use <span className="text-accent/60">cat &lt;filename&gt;</span> to read a file</p>
    </div>
  );
}
