"use client";

import { useCallback, useReducer } from "react";
import { nanoid } from "./nanoid";

export interface HistoryEntry {
  id: string;
  command: string;
  output: React.ReactNode;
}

interface State {
  history: HistoryEntry[];
  commandHistory: string[];   // previously entered commands
  historyIndex: number;       // -1 = current draft
  input: string;
}

type Action =
  | { type: "SET_INPUT"; payload: string }
  | { type: "SUBMIT"; entry: HistoryEntry }
  | { type: "SILENT_SUBMIT"; entry: HistoryEntry }
  | { type: "CLEAR" }
  | { type: "ARROW_UP" }
  | { type: "ARROW_DOWN" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_INPUT":
      return { ...state, input: action.payload, historyIndex: -1 };

    case "SUBMIT": {
      const cmd = state.input.trim();
      const newCmdHistory = cmd
        ? [cmd, ...state.commandHistory.filter(c => c !== cmd)].slice(0, 100)
        : state.commandHistory;
      return {
        ...state,
        history: [...state.history, action.entry],
        input: "",
        historyIndex: -1,
        commandHistory: newCmdHistory,
      };
    }

    case "SILENT_SUBMIT":
      return { ...state, history: [...state.history, action.entry] };

    case "CLEAR":
      return { ...state, history: [], input: "", historyIndex: -1 };

    case "ARROW_UP": {
      const next = Math.min(state.historyIndex + 1, state.commandHistory.length - 1);
      return {
        ...state,
        historyIndex: next,
        input: state.commandHistory[next] ?? state.input,
      };
    }

    case "ARROW_DOWN": {
      const next = state.historyIndex - 1;
      return {
        ...state,
        historyIndex: next,
        input: next < 0 ? "" : (state.commandHistory[next] ?? ""),
      };
    }

    default:
      return state;
  }
}

export function useTerminal() {
  const [state, dispatch] = useReducer(reducer, {
    history: [],
    commandHistory: [],
    historyIndex: -1,
    input: "",
  });

  const setInput = useCallback((val: string) => {
    dispatch({ type: "SET_INPUT", payload: val });
  }, []);

  const submit = useCallback((output: React.ReactNode) => {
    dispatch({
      type: "SUBMIT",
      entry: { id: nanoid(), command: state.input.trim(), output },
    });
  }, [state.input]);

  const silentSubmit = useCallback((command: string, output: React.ReactNode) => {
    dispatch({ type: "SILENT_SUBMIT", entry: { id: nanoid(), command, output } });
  }, []);

  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const arrowUp = useCallback(() => dispatch({ type: "ARROW_UP" }), []);
  const arrowDown = useCallback(() => dispatch({ type: "ARROW_DOWN" }), []);

  return { state, setInput, submit, silentSubmit, clear, arrowUp, arrowDown };
}
