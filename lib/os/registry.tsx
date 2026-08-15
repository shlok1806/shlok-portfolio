import type { AppProps } from "./types";
import { ResumeApp } from "@/components/os/apps/ResumeApp";
import { ExperienceApp } from "@/components/os/apps/ExperienceApp";
import { ProjectsApp, ProjectApp } from "@/components/os/apps/ProjectsApp";
import { SysInfoApp } from "@/components/os/apps/SysInfoApp";
import { SkillsApp, EducationApp, ContactApp } from "@/components/os/apps/MiscApps";
import { XtermApp } from "@/components/os/apps/XtermApp";
import { ReadmeApp } from "@/components/os/apps/ReadmeApp";
import { TopApp } from "@/components/os/apps/TopApp";

export interface AppDef {
  id: string;
  /** window title and menu entry */
  title: string;
  /** shown under the desktop icon; short */
  icon: string;
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
    id: "readme",
    title: "README",
    icon: "?",
    w: 560,
    h: 520,
    Component: ReadmeApp,
    onDesktop: true,
    inMenu: true,
  },
  {
    id: "xterm",
    title: "xterm",
    icon: ">_",
    w: 720,
    h: 460,
    Component: XtermApp,
    onDesktop: true,
    inMenu: true,
  },
  {
    id: "resume",
    title: "resume.txt",
    icon: "▤",
    w: 700,
    h: 520,
    Component: ResumeApp,
    onDesktop: true,
    inMenu: true,
  },
  {
    id: "resume-pdf",
    title: "resume.pdf",
    icon: "⇩",
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
    icon: "▣",
    w: 660,
    h: 400,
    Component: ProjectsApp,
    onDesktop: true,
    inMenu: true,
  },
  {
    id: "experience",
    title: "experience.log",
    icon: "▥",
    w: 700,
    h: 500,
    Component: ExperienceApp,
    onDesktop: true,
    inMenu: true,
  },
  {
    id: "sysinfo",
    title: "sysinfo",
    icon: "◈",
    w: 640,
    h: 380,
    Component: SysInfoApp,
    onDesktop: true,
    inMenu: true,
  },
  {
    id: "contact",
    title: "contact.txt",
    icon: "@",
    w: 520,
    h: 320,
    Component: ContactApp,
    onDesktop: true,
    inMenu: true,
  },
  {
    id: "top",
    title: "top",
    icon: "▩",
    w: 640,
    h: 420,
    Component: TopApp,
    inMenu: true,
  },
  {
    id: "skills",
    title: "skills.json",
    icon: "{}",
    w: 620,
    h: 380,
    Component: SkillsApp,
    inMenu: true,
  },
  {
    id: "education",
    title: "education.md",
    icon: "▦",
    w: 560,
    h: 380,
    Component: EducationApp,
    inMenu: true,
  },
  // Opened by the file manager, never directly
  {
    id: "project",
    title: "project",
    icon: "▣",
    w: 620,
    h: 440,
    Component: ProjectApp,
  },
];

export const appById = (id: string) => APPS.find((a) => a.id === id);
export const DESKTOP_APPS = APPS.filter((a) => a.onDesktop);
export const MENU_APPS = APPS.filter((a) => a.inMenu);
