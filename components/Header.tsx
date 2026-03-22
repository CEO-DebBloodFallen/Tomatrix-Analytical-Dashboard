import React, { useState, useEffect } from 'react';
import { GasType } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  activeFilter: GasType;
  onFilterChange: (filter: GasType) => void;
  connected: boolean;
  isEspOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeFilter, onFilterChange, connected, isEspOnline }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6 border-b border-slate-200 dark:border-white/5 pb-6 transition-colors duration-500">
      
      <div className="flex items-center gap-5 w-full lg:w-auto justify-center lg:justify-start text-center lg:text-left">
        {/* Logo Container with Float Animation */}
        <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-slate-300 dark:from-white/20 to-transparent shadow-[0_0_25px_rgba(255,99,71,0.15)] animate-float shrink-0">
          <div className="w-full h-full rounded-full overflow-hidden bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-slate-200 dark:border-white/10 relative group">
             <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent pointer-events-none z-10" />
             <img 
              src="https://raw.githubusercontent.com/claintjapay-web/SolaniRad-Analytics-Dashboard/36a696ebb4d2185083ad81b204c66f3cb3c14c5c/Assets/icons/Tomato.jpg" 
              alt="Tomatrix Tomato Logo"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
             />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-br from-slate-800 via-blue-600 to-cyan-500 dark:from-white dark:via-cyan-200 dark:to-blue-500 drop-shadow-sm">
            Tomatrix <span className="text-slate-400 dark:text-white/30 font-thin">Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-blue-200/50 font-mono tracking-widest uppercase">
            Real-Time Environmental Monitoring System
          </p>
        </div>
      </div>
      
      {/* Center: Theme Toggle - Removed from here */}
      
      <div className="flex flex-col items-center lg:items-end gap-3 w-full lg:w-auto">
        {/* Top Controls: Connection Status & Theme Toggle */}
        <div className="flex items-center gap-4">
           {/* Theme Toggle moved here */}
           <ThemeToggle />
           
           <div className="flex items-center gap-2 bg-white/40 dark:bg-black/20 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5 shadow-sm">
             <div className={`w-2 h-2 rounded-full ${connected && isEspOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
             <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-white/60 tracking-tighter">
               {connected && isEspOnline ? 'Live Sync' : 'Offline / Reconnecting'}
             </span>
           </div>
        </div>

        {/* Real-time Date & Time Widget */}
        <div className="flex items-center gap-4 px-6 py-3 bg-white dark:bg-[#0f172a]/40 backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-md transition-all duration-500">
          
          {/* Date Section */}
          <div className="flex flex-col items-end border-r border-slate-200 dark:border-white/10 pr-4">
             <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] mb-0.5">
               {time.toLocaleDateString('en-US', { weekday: 'long' })}
             </span>
             <span className="text-sm text-cyan-600 dark:text-cyan-300 font-bold uppercase tracking-wider">
               {time.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
             </span>
          </div>

          {/* Time Section */}
          <div className="pl-1">
             <span className="text-4xl font-mono font-medium text-slate-800 dark:text-white tracking-widest drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
               {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
               <span className="text-lg text-slate-400 dark:text-slate-500 ml-1.5 animate-pulse">
                 {time.getSeconds().toString().padStart(2, '0')}
               </span>
             </span>
          </div>

        </div>
      </div>
    </header>
  );
};