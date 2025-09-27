import { useContext, createContext, } from 'react';

interface SettingsContextType {
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
export { SettingsContext, useSettings };
