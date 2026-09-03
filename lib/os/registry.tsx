import type { AppProps } from "./types";
import type { IconName } from "./icons";
import { ResumeApp } from "@/components/os/apps/ResumeApp";
import { ExperienceApp } from "@/components/os/apps/ExperienceApp";
import { ProjectsApp, ProjectApp } from "@/components/os/apps/ProjectsApp";
import { SysInfoApp } from "@/components/os/apps/SysInfoApp";
import { SkillsApp, EducationApp, ContactApp } from "@/components/os/apps/MiscApps";
import { XtermApp } from "@/components/os/apps/XtermApp";
import { TopApp } from "@/components/os/apps/TopApp";
import { GamesApp, GameApp } from "@/components/os/apps/GamesApp";
import { MusicApp } from "@/components/os/apps/MusicApp";

export interface AppDef {
  id: string;
  /** window title and menu entry */
  title: string;
  /** the pixmap drawn on the desktop and in the menus */
  icon: IconName;
  w: number;
  h: number;
  Component: (props: AppProps) => React.ReactNode;
  /** downloads instead of opening a window */
  download?: string;
  /** on the desktop, in this order */
  onDesktop?: boolean;
  /** in the applications menu */
  inMenu?: boolean;
}

export const APPS: AppDef[] = [
  {
    id: "xterm",
    title: "xterm",
    icon: "terminal",
    w: 720,
    h: 460,
    Component: XtermApp,
    onDesktop: true,
    inMenu: true,
  },
  {
    id: "resume",
    title: "resume.txt",
    icon: "document",
    w: 700,
    h: 520,
    Component: ResumeApp,
    onDesktop: true,
    inMenu: true,
  },
  {
    id: "resume-pdf",
    title: "resume.pdf",
    icon: "download",
    w: 0,
    h: 0,
    download: "/resume.pdf",
    Component: () => null,
    onDesktop: true,
    inMenu: true,
  },
  {
    id: "projects",
    title: "projects",
    icon: "folder",
    w: 760,
    h: 470,
    Component: ProjectsApp,
    onDesktop: true,
    inMenu: true,
  },
  {
    id: "experience",
    title: "experience.log",
    icon: "log",
    w: 700,
    h: 500,
    Component: ExperienceApp,
    onDesktop: true,
    inMenu: true,
  },
  {
    id: "sysinfo",
    title: "sysinfo",
    icon: "monitor",
    w: 640,
    h: 520,
    Component: SysInfoApp,
    onDesktop: true,
    inMenu: true,
  },
  {
    id: "contact",
    title: "contact.txt",
    icon: "envelope",
    w: 520,
    h: 320,
    Component: ContactApp,
    onDesktop: true,
    inMenu: true,
  },
  {
    id: "games",
    title: "games",
    icon: "invader",
    w: 640,
    h: 520,
    Component: GamesApp,
    onDesktop: true,
    inMenu: true,
  },
  {
    id: "audio",
    title: "audio",
    icon: "note",
    w: 560,
    h: 460,
    Component: MusicApp,
    inMenu: true,
  },
  {
    id: "top",
    title: "top",
    icon: "bars",
    w: 640,
    h: 420,
    Component: TopApp,
    inMenu: true,
  },
  {
    id: "skills",
    title: "skills.json",
    icon: "braces",
    w: 620,
    h: 380,
    Component: SkillsApp,
    inMenu: true,
  },
  {
    id: "education",
    title: "education.md",
    icon: "book",
    w: 560,
    h: 380,
    Component: EducationApp,
    inMenu: true,
  },
  // Opened by a file manager, never directly
  {
    id: "project",
    title: "project",
    icon: "folder",
    w: 620,
    h: 440,
    Component: ProjectApp,
  },
  {
    id: "game",
    title: "game",
    icon: "invader",
    w: 520,
    h: 460,
    Component: GameApp,
  },
];

export const appById = (id: string) => APPS.find((a) => a.id === id);
export const DESKTOP_APPS = APPS.filter((a) => a.onDesktop);
export const MENU_APPS = APPS.filter((a) => a.inMenu);
