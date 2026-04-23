import { RouterProvider } from "react-router";
import { router } from "./routes";
import { useState, useEffect } from "react";
import { LoadingScreen } from "./components/LoadingScreen";
import { AnimatePresence } from "motion/react";
import { Analytics } from "@vercel/analytics/react";

function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    const hasSeenLoading = sessionStorage.getItem('hasSeenLoading');
    if (hasSeenLoading) {
      setShowLoading(false);
      setHasLoadedOnce(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    sessionStorage.setItem('hasSeenLoading', 'true');
    setShowLoading(false);
    setHasLoadedOnce(true);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showLoading && !hasLoadedOnce && (
          <LoadingScreen onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>
      <RouterProvider router={router} />
      <Analytics />
    </>
  );
}

export default App;
