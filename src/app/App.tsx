import { RouterProvider } from 'react-router';
import { router } from './routes';
import { PortfolioProvider } from './context/PortfolioContext';
import { useEffect } from 'react';
import { CustomCursor } from './components/CustomCursor';
import { CommandPalette } from './components/CommandPalette';
import { NowPlayingBar } from './components/NowPlayingBar';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import Lenis from 'lenis';

function App() {
  // Physics-based smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    let raf: number;
    const animate = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(animate); };
    raf = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  return (
    <PortfolioProvider>
      <CustomCursor />
      <RouterProvider router={router} />
      <CommandPalette />
      <NowPlayingBar />
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            letterSpacing: '0.05em',
          },
        }}
      />
      <Analytics />
    </PortfolioProvider>
  );
}

export default App;
