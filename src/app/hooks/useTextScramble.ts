import { useEffect, useState } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&';

/**
 * Scrambles text through random characters before resolving to the final string.
 * Characters resolve one-by-one from left to right.
 */
export function useTextScramble(text: string, delay = 500) {
  const [output, setOutput] = useState<string>(text);

  useEffect(() => {
    let frame = 0;
    let raf: number;
    const totalFrames = text.length * 4;

    const timer = setTimeout(() => {
      const iterate = () => {
        const result = text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (frame >= i * 4 + 4) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('');

        setOutput(result);
        frame++;

        if (frame <= totalFrames) {
          raf = requestAnimationFrame(iterate);
        } else {
          setOutput(text);
        }
      };

      raf = requestAnimationFrame(iterate);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [text, delay]);

  return output;
}
