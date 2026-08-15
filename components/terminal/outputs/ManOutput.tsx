interface Page {
  name: string;
  section: number;
  synopsis: string;
  summary: string;
  description: string[];
  seeAlso?: string[];
}

export const MAN_PAGES: Record<string, Page> = {
  help: {
    name: "help",
    section: 1,
    synopsis: "help",
    summary: "list the available commands",
    description: ["Prints every command this shell understands. `?` is an alias."],
    seeAlso: ["man"],
  },
  man: {
    name: "man",
    section: 1,
    synopsis: "man <command>",
    summary: "display the manual page for a command",
    description: [
      "Formats and displays the manual page for the given command.",
      "With no argument, man lists the pages it has.",
    ],
    seeAlso: ["help"],
  },
  whoami: {
    name: "whoami",
    section: 1,
    synopsis: "whoami",
    summary: "print the effective user",
    description: ["Prints who is logged in, what they do, and what they are looking for."],
    seeAlso: ["resume", "contact"],
  },
  resume: {
    name: "resume",
    section: 1,
    synopsis: "resume [--pdf]",
    summary: "print the resume",
    description: [
      "Prints education, experience, projects, and skills in one go.",
      "With --pdf, opens the real PDF instead of the text version.",
    ],
    seeAlso: ["experience", "projects", "skills"],
  },
  projects: {
    name: "projects",
    section: 1,
    synopsis: "projects",
    summary: "list projects",
    description: [
      "Lists every project with its stack and a one-line description.",
      "Project names are links; clicking one opens its repository.",
    ],
    seeAlso: ["experience"],
  },
  experience: {
    name: "experience",
    section: 1,
    synopsis: "experience",
    summary: "print work history",
    description: ["Prints each role with its dates and what shipped."],
    seeAlso: ["resume", "projects"],
  },
  skills: {
    name: "skills",
    section: 1,
    synopsis: "skills",
    summary: "print technical skills as JSON",
    description: ["Prints the skill set grouped by category."],
  },
  education: {
    name: "education",
    section: 1,
    synopsis: "education",
    summary: "print academic background",
    description: ["Degree, institution, dates, GPA, and relevant coursework."],
  },
  contact: {
    name: "contact",
    section: 1,
    synopsis: "contact",
    summary: "print contact details",
    description: ["Email, GitHub, LinkedIn, and website. Email is the fastest route."],
    seeAlso: ["open"],
  },
  open: {
    name: "open",
    section: 1,
    synopsis: "open <github|linkedin|email>",
    summary: "open an external destination",
    description: ["Opens the given destination in a new tab."],
    seeAlso: ["contact"],
  },
  ls: {
    name: "ls",
    section: 1,
    synopsis: "ls",
    summary: "list directory contents",
    description: ["Lists the files in the home directory. Read one with cat."],
    seeAlso: ["cat"],
  },
  cat: {
    name: "cat",
    section: 1,
    synopsis: "cat <file>",
    summary: "concatenate and print files",
    description: ["Prints a file. Try resume.txt, projects, skills.json, or contact.txt."],
    seeAlso: ["ls"],
  },
  clear: {
    name: "clear",
    section: 1,
    synopsis: "clear",
    summary: "clear the terminal screen",
    description: ["Clears the scrollback."],
  },
  sound: {
    name: "sound",
    section: 1,
    synopsis: "sound <on|off>",
    summary: "toggle keyboard sounds",
    description: ["Turns the key click and error beep on or off. Off by default."],
  },
  exit: {
    name: "exit",
    section: 1,
    synopsis: "exit",
    summary: "close the terminal",
    description: ["Closes this terminal. `quit` is an alias."],
  },
  uname: {
    name: "uname",
    section: 1,
    synopsis: "uname",
    summary: "print system information",
    description: ["Prints the kernel name and machine architecture."],
  },
  sudo: {
    name: "sudo",
    section: 8,
    synopsis: "sudo <command>",
    summary: "execute a command as another user",
    description: ["You are not in the sudoers file. This incident will be reported."],
  },
};

const Head = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-3 font-bold text-primary first:mt-0">{children}</p>
);

export function ManOutput({ page }: { page: Page }) {
  return (
    <div className="text-[13px] leading-relaxed">
      <p className="text-foreground/50">
        {page.name.toUpperCase()}({page.section}){" ".repeat(8)}General Commands Manual
        {" ".repeat(8)}
        {page.name.toUpperCase()}({page.section})
      </p>

      <Head>NAME</Head>
      <p className="pl-6 text-foreground/80">
        {page.name} - {page.summary}
      </p>

      <Head>SYNOPSIS</Head>
      <p className="pl-6 text-foreground/80">{page.synopsis}</p>

      <Head>DESCRIPTION</Head>
      {page.description.map((d, i) => (
        <p key={i} className="pl-6 text-foreground/80">
          {d}
        </p>
      ))}

      {page.seeAlso && (
        <>
          <Head>SEE ALSO</Head>
          <p className="pl-6 text-foreground/80">
            {page.seeAlso.map((s) => `${s}(1)`).join(", ")}
          </p>
        </>
      )}
    </div>
  );
}

export function ManIndexOutput() {
  const names = Object.keys(MAN_PAGES).sort();
  return (
    <div className="text-[13px]">
      <p className="text-foreground/60">What manual page do you want?</p>
      <p className="mt-2 text-foreground/80">{names.join("  ")}</p>
      <p className="mt-2 text-foreground/30 text-[11px]">Try: man resume</p>
    </div>
  );
}
