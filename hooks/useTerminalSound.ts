"use client";

import { useCallback, useRef, useState, useEffect } from "react";

type SoundType = "key" | "enter" | "error" | "boot";

const SOUNDS: Record<SoundType, { freq: number; duration: number; type?: OscillatorType }> = {
  key:   { freq: 1200, duration: 0.04, type: "square" },
  enter: { freq: 660,  duration: 0.12, type: "sine"   },
  error: { freq: 180,  duration: 0.22, type: "sawtooth" },
  boot:  { freq: 880,  duration: 0.08, type: "sine"   },
};

export function useTerminalSound() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem("terminal-sound");
    if (saved === "on") setSoundEnabled(true);
  }, []);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback((type: SoundType) => {
    if (!soundEnabled) return;
    try {
      const ctx = getCtx();
      const { freq, duration, type: waveType = "square" } = SOUNDS[type];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext blocked or unsupported — fail silently
    }
  }, [soundEnabled, getCtx]);

  const toggleSound = useCallback((on: boolean) => {
    setSoundEnabled(on);
    localStorage.setItem("terminal-sound", on ? "on" : "off");
  }, []);

  return { soundEnabled, play, toggleSound };
}
