import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { X, Menu } from "lucide-react";

const navItems = [
  { label: "Home",    path: "/" },
  { label: "Contact", path: "#contact" },
];

export function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10"
        style={{ top: 2 }} // sit just below the scroll progress bar
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl tracking-tight text-white"
            style={{ fontFamily: 'var(--font-gothic)', fontWeight: 900 }}
          >
            ST
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive =
                item.path.startsWith("/") && !item.path.startsWith("#")
                  ? location.pathname === item.path
                  : false;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative text-sm tracking-wide text-white/70 hover:text-white transition-colors"
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#EC243C]"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Hamburger (mobile only) */}
          <button
            className="md:hidden text-white/70 hover:text-white transition-colors p-1"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              className="fixed top-0 right-0 bottom-0 z-[61] w-72 bg-[#0d0d0d] border-l border-white/10 flex flex-col md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 35 }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <span
                  className="text-xl tracking-tight text-white"
                  style={{ fontFamily: 'var(--font-gothic)', fontWeight: 900 }}
                >
                  ST
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white transition-colors p-1"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col px-6 py-8 gap-2">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className="block text-2xl tracking-tight text-white/60 hover:text-white transition-colors py-3 border-b border-white/[0.06]"
                      style={{ fontFamily: 'var(--font-gothic)', fontWeight: 700 }}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto px-6 py-6 border-t border-white/[0.06]">
                <p
                  className="text-[10px] tracking-[0.3em] text-neutral-600"
                  style={{ fontFamily: 'var(--font-condensed)' }}
                >
                  SHLOK THAKKAR © {new Date().getFullYear()}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
