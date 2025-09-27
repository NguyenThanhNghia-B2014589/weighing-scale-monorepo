import React, {  useState, ReactNode } from 'react';
import {SettingsContext} from '../hooks/useSettings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const openSettingsModal = () => setShowSettingsModal(true);
  const closeSettingsModal = () => setShowSettingsModal(false);

  return (
    <SettingsContext.Provider
      value={{
        showSettingsModal,
        setShowSettingsModal,
        openSettingsModal,
        closeSettingsModal,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
