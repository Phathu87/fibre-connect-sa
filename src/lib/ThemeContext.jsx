import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage, KEYS } from '@/services/storageService';

const ThemeContext = createContext({ theme: 'system', setTheme: () => {}, resolved: 'light' });

function getSystem() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => storage.get(KEYS.THEME, 'system'));
  const [resolved, setResolved] = useState('light');

  useEffect(() => {
    const apply = () => {
      const r = theme === 'system' ? getSystem() : theme;
      setResolved(r);
      document.documentElement.classList.toggle('dark', r === 'dark');
    };
    apply();
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  const setTheme = (t) => { storage.set(KEYS.THEME, t); setThemeState(t); };

  return <ThemeContext.Provider value={{ theme, setTheme, resolved }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);