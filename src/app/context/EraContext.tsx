import { createContext, useContext, useState, ReactNode } from 'react';
import { Era } from '../data/records';

interface EraContextType {
  currentEra: Era;
  setCurrentEra: (era: Era) => void;
}

const EraContext = createContext<EraContextType | undefined>(undefined);

export function EraProvider({ children }: { children: ReactNode }) {
  const [currentEra, setCurrentEra] = useState<Era>('vibrant');

  return (
    <EraContext.Provider value={{ currentEra, setCurrentEra }}>
      {children}
    </EraContext.Provider>
  );
}

export function useEra() {
  const context = useContext(EraContext);
  if (!context) {
    throw new Error('useEra must be used within EraProvider');
  }
  return context;
}
