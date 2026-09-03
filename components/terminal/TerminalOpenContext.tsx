"use client";

import { createContext, useContext } from "react";

/**
 * How a line of shell output opens a window on the desktop. Provided by the
 * terminal page, read by any output that has something worth opening - a file
 * name in an ls listing, a project in the projects listing.
 */
export const TerminalOpenContext = createContext<((appId: string, arg?: string) => void) | null>(
  null,
);

export const useTerminalOpen = () => useContext(TerminalOpenContext);
