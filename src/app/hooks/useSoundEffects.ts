import { useCallback, useRef, useEffect } from 'react';

type SoundEffect = 'hover' | 'click' | 'open' | 'close' | 'ambient';

const hapticPatterns = {
  light: [10],
  medium: [20],
  heavy: [30],
  double: [15, 50, 15],
  success: [10, 30, 10, 30, 10],
};

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isInitializedRef = useRef(false);

  const initializeAudio = useCallback(() => {
    if (isInitializedRef.current) return;
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      isInitializedRef.current = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }, []);

  const playHover = useCallback(() => {
    initializeAudio();
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.08);
  }, [initializeAudio]);

  const playClick = useCallback(() => {
    initializeAudio();
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
    const ctx = audioContextRef.current;
    const frequencies = [261.63, 329.63, 392.00];
    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      filter.type = 'lowpass';
      filter.frequency.value = 3000;
      filter.Q.value = 1;
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start(ctx.currentTime + i * 0.01);
      oscillator.stop(ctx.currentTime + 0.15);
    });
  }, [initializeAudio]);

  const playOpen = useCallback(() => {
    initializeAudio();
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
    const ctx = audioContextRef.current;
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      filter.type = 'lowpass';
      filter.frequency.value = 4000;
      filter.Q.value = 1;
      const startTime = ctx.currentTime + i * 0.04;
      const duration = 0.12;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.03, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.value = 130.81;
    const bassStart = ctx.currentTime + 0.16;
    bassGain.gain.setValueAtTime(0, bassStart);
    bassGain.gain.linearRampToValueAtTime(0.08, bassStart + 0.02);
    bassGain.gain.exponentialRampToValueAtTime(0.001, bassStart + 0.15);
    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.start(bassStart);
    bassOsc.stop(bassStart + 0.15);
  }, [initializeAudio]);

  const playClose = useCallback(() => {
    initializeAudio();
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
    const ctx = audioContextRef.current;
    const notes = [523.25, 392.00, 329.63, 261.63];
    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      filter.type = 'lowpass';
      filter.frequency.value = 3000;
      filter.Q.value = 1;
      const startTime = ctx.currentTime + i * 0.04;
      const duration = 0.1;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.025, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }, [initializeAudio]);

  const triggerHaptic = useCallback((pattern: keyof typeof hapticPatterns = 'light') => {
    if ('vibrate' in navigator) {
      navigator.vibrate(hapticPatterns[pattern]);
    }
  }, []);

  const onTileHover = useCallback(() => {
    playHover();
    triggerHaptic('light');
  }, [playHover, triggerHaptic]);

  const onTileClick = useCallback(() => {
    playClick();
    triggerHaptic('medium');
  }, [playClick, triggerHaptic]);

  const onModalOpen = useCallback(() => {
    playOpen();
    triggerHaptic('double');
  }, [playOpen, triggerHaptic]);

  const onModalClose = useCallback(() => {
    playClose();
    triggerHaptic('light');
  }, [playClose, triggerHaptic]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

  return {
    initializeAudio,
    playHover,
    playClick,
    playOpen,
    playClose,
    triggerHaptic,
    onTileHover,
    onTileClick,
    onModalOpen,
    onModalClose,
  };
}
