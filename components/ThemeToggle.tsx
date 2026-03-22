import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 shadow-inner ${
        isDark 
          ? 'bg-[#0f172a]/80 border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]' 
          : 'bg-blue-100/80 border border-blue-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
      }`}
      aria-label="Toggle Dark Mode"
    >
      <span className="sr-only">Toggle Dark Mode</span>
      
      {/* Sun Icon Background */}
      <span className={`absolute left-1.5 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-100'}`}>
        <Sun className="w-3.5 h-3.5 text-yellow-500" />
      </span>

      {/* Moon Icon Background */}
      <span className={`absolute right-1.5 transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
        <Moon className="w-3.5 h-3.5 text-slate-400" />
      </span>

      {/* Toggle Knob */}
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-500 flex items-center justify-center shadow-[0_2px_5px_rgba(0,0,0,0.2)] ${
          isDark ? 'translate-x-9 bg-slate-200' : 'translate-x-1 bg-white'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-indigo-900" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-yellow-500" />
        )}
      </span>
    </button>
  );
};
