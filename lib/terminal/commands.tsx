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
  action?: "clear" | "sound-on" | "sound-off" | "exit";
}

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
      return { output: <ProjectsOutput /> };

    case "experience":
      return { output: <ExperienceOutput /> };

    case "skills":
      return { output: <SkillsOutput /> };

    case "education":
      return { output: <EducationOutput /> };

    case "contact":
      return { output: <ContactOutput /> };

    case "resume": {
      // `resume --pdf` hands over the real document
      if (args.some((a) => a === "--pdf" || a === "-p")) {
        if (typeof window !== "undefined") window.open("/resume.pdf", "_blank");
        return {
          output: <p className="text-primary/70 text-[13px]">Opening resume.pdf ...</p>,
        };
      }
      return { output: <ResumeOutput /> };
    }

    case "man": {
      const topic = args[0]?.toLowerCase().replace(/\(\d\)$/, "");
      if (!topic) return { output: <ManIndexOutput /> };
      const page = MAN_PAGES[topic];
      if (page) return { output: <ManOutput page={page} /> };
      return {
        output: (
          <p className="text-foreground/60 text-[13px]">
            No manual entry for {topic}
          </p>
        ),
      };
    }

    case "ls":
    case "ls -la":
    case "dir":
      return { output: <LsOutput /> };

    case "cat": {
      const file = args.join(" ").toLowerCase();
      const mapped = CAT_ALIASES[file];
      if (mapped) return runCommand(mapped, [], mapped);
      return { output: <ErrorOutput command={raw} /> };
    }

    case "open": {
      const dest = args[0]?.toLowerCase();
      const url = OPEN_URLS[dest ?? ""];
      if (url) {
        if (typeof window !== "undefined") window.open(url, "_blank");
        return { output: <p className="text-primary/70 text-[13px]">Opening {dest}...</p> };
      }
      return {
        output: (
          <p className="text-destructive/80 text-[13px]">
            open: unknown destination &quot;{dest ?? ""}&quot;
            <span className="text-foreground/25 ml-2 text-[11px]">- try: open github | linkedin | email</span>
          </p>
        ),
      };
    }

    case "clear":
      return { output: null, action: "clear" };

    case "sound": {
      const flag = args[0]?.toLowerCase();
      if (flag === "on")  return { output: <p className="text-primary text-[13px]">[●] Sound enabled</p>, action: "sound-on" };
      if (flag === "off") return { output: <p className="text-foreground/40 text-[13px]">[○] Sound disabled</p>, action: "sound-off" };
      return { output: <p className="text-destructive/80 text-[13px]">Usage: sound on | sound off</p> };
    }

    case "pwd":
      return { output: <p className="text-foreground/55 text-[13px]">/home/shlok/portfolio</p> };

    case "date":
      return { output: <p className="text-foreground/55 text-[13px]">{new Date().toUTCString()}</p> };

    case "uname":
      return { output: <p className="text-foreground/55 text-[13px]">ShlokOS 2.0.26 portfolio-aarch64 GNU/Linux</p> };

    case "echo":
      return { output: <p className="text-foreground/55 text-[13px]">{args.join(" ")}</p> };

    case "exit":
    case "quit":
      return {
        output: <p className="text-foreground/40 text-[13px]">Back to the site.</p>,
        action: "exit",
      };

    case "sudo":
      return { output: <p className="text-destructive/80 text-[13px]">Nice try. Permission denied.</p> };

    case "":
      return { output: null };

    default:
      return { output: <ErrorOutput command={raw} />, action: undefined };
  }
}
