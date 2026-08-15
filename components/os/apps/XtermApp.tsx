"use client";

import { TerminalPage } from "@/components/terminal/TerminalPage";

/**
 * The existing interactive terminal, running as an app inside the desktop.
 *
 * The boot sequence is skipped here: the machine already booted before X came
 * up, so an xterm should hand you a shell, not replay the kernel log.
 */
export function XtermApp() {
  return <TerminalPage embedded chromeless skipBoot />;
}
