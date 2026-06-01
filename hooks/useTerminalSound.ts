"use client";

import { useCallback, useRef, useState, useEffect } from "react";

type SoundType = "key" | "enter" | "error";

export function useTerminalSound() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("terminal-sound");
    if (saved === "on") setSoundEnabled(true);
  }, []);

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const playKey = useCallback((ctx: AudioContext) => {
    // Short white-noise burst — sounds like a real key press
    const len = Math.floor(ctx.sampleRate * 0.022);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1);

    const src = ctx.createBufferSource();
    src.buffer = buf;

    // Band-pass around 2kHz gives a crisp tap rather than a hiss
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2200;
    bp.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.022);

    src.connect(bp);
    bp.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }, []);

  const playEnter = useCallback((ctx: AudioContext) => {
    // Low "thock" — a sine that drops in pitch quickly
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.09);
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }, []);

  const playError = useCallback((ctx: AudioContext) => {
    // Two short descending beeps (classic error pattern)
    [0, 0.16].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = i === 0 ? 380 : 280;
      gain.gain.setValueAtTime(0.08, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.11);
    });
  }, []);

  const play = useCallback((type: SoundType) => {
    if (!soundEnabled) return;
    try {
      const ctx = getCtx();
      if (type === "key")   playKey(ctx);
      if (type === "enter") playEnter(ctx);
      if (type === "error") playError(ctx);
    } catch {
      // AudioContext blocked — fail silently
    }
  }, [soundEnabled, getCtx, playKey, playEnter, playError]);

  const toggleSound = useCallback((on: boolean) => {
    setSoundEnabled(on);
    localStorage.setItem("terminal-sound", on ? "on" : "off");
  }, []);

  return { soundEnabled, play, toggleSound };
}
