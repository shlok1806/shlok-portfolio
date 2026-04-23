import { createContext, useContext, useState, ReactNode } from 'react';

interface PortfolioContextType {
  selectedRecordId: string | null;
  setSelectedRecordId: (id: string | null) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <PortfolioContext.Provider value={{ selectedRecordId, setSelectedRecordId, commandPaletteOpen, setCommandPaletteOpen }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used within PortfolioProvider');
  return context;
}
