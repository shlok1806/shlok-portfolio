import { HelpOutput }       from "@/components/terminal/outputs/HelpOutput";
import { WhoamiOutput }     from "@/components/terminal/outputs/WhoamiOutput";
import { ProjectsOutput }   from "@/components/terminal/outputs/ProjectsOutput";
import { ExperienceOutput } from "@/components/terminal/outputs/ExperienceOutput";
import { SkillsOutput }     from "@/components/terminal/outputs/SkillsOutput";
import { EducationOutput }  from "@/components/terminal/outputs/EducationOutput";
import { ContactOutput }    from "@/components/terminal/outputs/ContactOutput";
import { ResumeOutput }     from "@/components/terminal/outputs/ResumeOutput";
import { LsOutput }         from "@/components/terminal/outputs/LsOutput";
import { ErrorOutput }      from "@/components/terminal/outputs/ErrorOutput";
import { ManOutput, ManIndexOutput, MAN_PAGES } from "@/components/terminal/outputs/ManOutput";
import { GamesOutput }       from "@/components/terminal/outputs/GamesOutput";
import { GAMES, gameById }   from "@/lib/games/registry";
import { OS }                from "@/lib/content";
import { MENU_APPS }         from "@/lib/os/registry";

const OPEN_URLS: Record<string, string> = {
  github:   "https://github.com/shlok1806",
  linkedin: "https://linkedin.com/in/shlok-thakkar/",
  email:    "mailto:shlokthakkar1806@gmail.com",
};

const CAT_ALIASES: Record<string, string> = {
  "resume.txt":    "resume",
  "projects":      "projects",
  "projects/":     "projects",
  "experience.log":"experience",
  "skills.json":   "skills",
  "education.md":  "education",
  "contact.txt":   "contact",
};

export interface CommandResult {
  output: React.ReactNode;
  action?: "clear" | "sound-on" | "sound-off" | "exit" | "play" | "open";
  /** which game `play` asked for, or which app `open` did */
  target?: string;
}

/*
 * What `cat` prints for each file in the home directory. The bare commands
 * (`projects`, `resume`) open the window instead, the way a desktop shell
 * hands a document to its viewer; `cat` is for reading it in place.
 */
const PRINTERS: Record<string, () => React.ReactNode> = {
  resume:     () => <ResumeOutput />,
  projects:   () => <ProjectsOutput />,
  experience: () => <ExperienceOutput />,
  skills:     () => <SkillsOutput />,
  education:  () => <EducationOutput />,
  contact:    () => <ContactOutput />,
};

const openWindow = (appId: string): CommandResult => {
  const app = MENU_APPS.find((a) => a.id === appId);
  return {
    output: <p className="text-muted-foreground text-[13px]">{app?.title ?? appId}: opened</p>,
    action: "open",
    target: appId,
  };
};

/**
 * Tab completion. Given the line so far, the words that could finish it: a
 * command name at the start, a file after cat, a game after play, an app or a
 * link after open.
 */
export function completions(line: string): string[] {
  const parts = line.replace(/^\s+/, "").split(/\s+/);
  const [head, ...rest] = parts;
  if (parts.length <= 1) {
    const prefix = (head ?? "").toLowerCase();
    return Array.from(COMMAND_NAMES).filter((c) => c !== "?" && c.startsWith(prefix)).sort();
  }
  const word = (rest[rest.length - 1] ?? "").toLowerCase();
  const pool =
    head === "cat" ? Object.keys(CAT_ALIASES).filter((f) => !f.endsWith("/"))
    : head === "play" ? GAMES.map((g) => g.id)
    : head === "man" ? Object.keys(MAN_PAGES)
    : head === "open" ? [...Object.keys(OPEN_URLS), ...MENU_APPS.map((a) => a.id)]
    : head === "sound" ? ["on", "off"]
    : [];
  return pool.filter((w) => w.startsWith(word)).sort();
}

/*
 * Every name runCommand answers to, aliases included.
 *
 * Keep this beside the switch below and add to both together. It used to be
 * duplicated inside TerminalPage as a hand-kept `KNOWN` set purely to decide
 * whether to play the error beep, and the copy had already fallen behind - so
 * real commands beeped as if they were typos.
 */
export const COMMAND_NAMES = new Set([
  "help", "?", "whoami", "about", "projects", "experience", "skills", "education",
  "contact", "resume", "man", "games", "arcade", "play", "ls", "dir", "cat", "open",
  "top", "sysinfo", "audio",
  "clear", "sound", "pwd", "date", "uname", "echo", "exit", "quit", "sudo",
]);

export function runCommand(
  name: string,
  args: string[],
  raw: string,
): CommandResult {
  switch (name) {
    case "help":
    case "?":
      return { output: <HelpOutput /> };

    case "whoami":
    case "about":
      return { output: <WhoamiOutput /> };

    case "projects":
    case "experience":
    case "skills":
    case "education":
    case "contact":
    case "top":
    case "sysinfo":
    case "audio":
      return openWindow(name);

    case "resume": {
      // `resume --pdf` hands over the real document
      if (args.some((a) => a === "--pdf" || a === "-p")) {
        if (typeof window !== "undefined") window.open("/resume.pdf", "_blank");
        return {
          output: <p className="text-accent-ink text-[13px]">Opening resume.pdf ...</p>,
        };
      }
      return openWindow("resume");
    }

    case "man": {
      const topic = args[0]?.toLowerCase().replace(/\(\d\)$/, "");
      if (!topic) return { output: <ManIndexOutput /> };
      const page = MAN_PAGES[topic];
      if (page) return { output: <ManOutput page={page} /> };
      return {
        output: (
          <p className="text-muted-foreground text-[13px]">
            No manual entry for {topic}
          </p>
        ),
      };
    }

    case "games":
    case "arcade":
      // With an argument it lists; bare, it opens the arcade
      return args.length ? { output: <GamesOutput /> } : openWindow("games");

    case "play": {
      const id = args[0]?.toLowerCase();
      const game = gameById(id);
      if (game) {
        return {
          output: <p className="text-accent-ink text-[13px]">Starting {game.title} ...</p>,
          action: "play",
          target: game.id,
        };
      }
      return {
        output: (
          <p className="text-destructive text-[13px]">
            play: no such game &quot;{id ?? ""}&quot;
            <span className="text-faint ml-2 text-[11px]">
              - try: {GAMES.map((g) => g.id).join(" | ")}
            </span>
          </p>
        ),
      };
    }

    case "ls":
    case "ls -la":
    case "dir":
      return { output: <LsOutput /> };

    /*
     * cat exists, so a bad argument is a missing file - not a missing command.
     * Falling through to ErrorOutput claimed `cat` itself was unknown, which
     * sent people looking for the wrong thing.
     */
    case "cat": {
      const file = args.join(" ").toLowerCase();
      if (!file) {
        return {
          output: (
            <p className="text-destructive text-[13px]">
              usage: cat &lt;file&gt;
            </p>
          ),
        };
      }
      const mapped = CAT_ALIASES[file];
      if (mapped) return { output: PRINTERS[mapped]() };
      return {
        output: (
          <p className="text-destructive text-[13px]">
            cat: {args.join(" ")}: No such file or directory
          </p>
        ),
      };
    }

    case "open": {
      const dest = args[0]?.toLowerCase();
      const url = OPEN_URLS[dest ?? ""];
      if (url) {
        if (typeof window !== "undefined") window.open(url, "_blank");
        return { output: <p className="text-accent-ink text-[13px]">Opening {dest}...</p> };
      }
      // Any application by name, the way a desktop shell has `open`
      if (dest && MENU_APPS.some((a) => a.id === dest)) return openWindow(dest);
      return {
        output: (
          <p className="text-destructive text-[13px]">
            open: unknown destination &quot;{dest ?? ""}&quot;
            <span className="text-faint ml-2 text-[11px]">
              - try: {[...Object.keys(OPEN_URLS), ...MENU_APPS.map((a) => a.id)].join(" | ")}
            </span>
          </p>
        ),
      };
    }

    case "clear":
      return { output: null, action: "clear" };

    case "sound": {
      const flag = args[0]?.toLowerCase();
      if (flag === "on")  return { output: <p className="text-accent-ink text-[13px]">[●] Sound enabled</p>, action: "sound-on" };
      if (flag === "off") return { output: <p className="text-faint text-[13px]">[○] Sound disabled</p>, action: "sound-off" };
      return { output: <p className="text-destructive text-[13px]">Usage: sound on | sound off</p> };
    }

    case "pwd":
      return { output: <p className="text-muted-foreground text-[13px]">/home/shlok/portfolio</p> };

    case "date":
      return { output: <p className="text-muted-foreground text-[13px]">{new Date().toUTCString()}</p> };

    case "uname":
      return {
        output: (
          <p className="text-muted-foreground text-[13px]">
            {OS.name} {OS.version} {OS.arch} GNU/Linux
          </p>
        ),
      };

    case "echo":
      return { output: <p className="text-muted-foreground text-[13px]">{args.join(" ")}</p> };

    case "exit":
    case "quit":
      return {
        output: <p className="text-muted-foreground text-[13px]">logout</p>,
        action: "exit",
      };

    case "sudo":
      return { output: <p className="text-destructive text-[13px]">shlok is not in the sudoers file. This incident will be reported.</p> };

    case "":
      return { output: null };

    default:
      return { output: <ErrorOutput command={raw} />, action: undefined };
  }
}
