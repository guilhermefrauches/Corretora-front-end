import React, { createContext, useContext, useState } from 'react';

const PREFS_KEY = 'corretora_prefs';

const defaults = {
  hideBalance: false,
  compactMode: false,
  notifications: true,
};

function load() {
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch {
    return defaults;
  }
}

const PrefsContext = createContext(null);

export function PrefsProvider({ children }) {
  const [prefs, setPrefs] = useState(load);

  function updatePref(key, value) {
    setPrefs(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <PrefsContext.Provider value={{ prefs, updatePref }}>
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs deve ser usado dentro de PrefsProvider');
  return ctx;
}
