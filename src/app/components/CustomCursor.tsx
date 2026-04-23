import { motion, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';

export function CustomCursor() {
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const dotX = useSpring(mouseX, { stiffness: 900, damping: 45, restDelta: 0.001 });
  const dotY = useSpring(mouseY, { stiffness: 900, damping: 45, restDelta: 0.001 });
  const ringX = useSpring(mouseX, { stiffness: 140, damping: 18, restDelta: 0.001 });
  const ringY = useSpring(mouseY, { stiffness: 140, damping: 18, restDelta: 0.001 });

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true);
      return;
    }

    const style = document.createElement('style');
    style.id = 'custom-cursor-style';
    style.textContent = '@media (pointer: fine) { *, *::before, *::after { cursor: none !important; } }';
    document.head.appendChild(style);

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest('a, button, [role="button"], input, textarea, select, label, [tabindex="0"]');
      setHovering(!!interactive);
    };
    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.getElementById('custom-cursor-style')?.remove();
    };
  }, [mouseX, mouseY, visible]);

  if (isTouch || !visible) return null;

  return (
    <>
      <motion.div className="fixed top-0 left-0 z-[9999] pointer-events-none" style={{ x: dotX, y: dotY }}>
        <motion.div
          animate={{ scale: clicking ? 0.55 : 1, rotate: hovering ? -135 : 0 }}
          transition={{ duration: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ translateX: '-50%', translateY: '-50%' }}
        >
          <div
            className="w-3 h-3 rounded-full transition-colors duration-150 shadow-lg"
            style={{ backgroundColor: hovering ? '#ffffff' : '#DC2626', boxShadow: hovering ? '0 0 12px rgba(255,255,255,0.4)' : '0 0 8px rgba(220,38,38,0.5)' }}
          />
          {!hovering && (
            <div
              className="absolute top-full left-1/2 -translate-x-1/2"
              style={{ width: '1.5px', height: '20px', background: 'linear-gradient(to bottom, rgba(220,38,38,0.9), transparent)', borderRadius: '1px' }}
            />
          )}
        </motion.div>
      </motion.div>

      <motion.div className="fixed top-0 left-0 z-[9998] pointer-events-none" style={{ x: ringX, y: ringY }}>
        <motion.div
          animate={{ scale: clicking ? 0.6 : hovering ? 2.2 : 1, opacity: clicking ? 0.6 : hovering ? 0.45 : 0.22, borderColor: hovering ? 'rgba(255,255,255,0.7)' : 'rgba(220,38,38,0.7)' }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ translateX: '-50%', translateY: '-50%', width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(220,38,38,0.7)' }}
        />
      </motion.div>
    </>
  );
}
