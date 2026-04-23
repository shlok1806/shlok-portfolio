import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function ScrollProgress() {
  const raw = useMotionValue(0);
  const smooth = useSpring(raw, { damping: 30, stiffness: 300 });

  useEffect(() => {
    const update = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      raw.set(total > 0 ? scrolled / total : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [raw]);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[9997] bg-white/[0.04]">
      <motion.div
        className="h-full bg-[#EC243C] origin-left"
        style={{ scaleX: smooth }}
      />
    </div>
  );
}
