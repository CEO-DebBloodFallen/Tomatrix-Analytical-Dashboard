import React from 'react';

interface KpiCardProps {
  title: string;
  subtitle?: string;
  value: number | string;
  unit: string;
  color: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, subtitle, value, unit, color }) => {
  const isDisconnected = value === 'Disconnected';

  return (
    <div 
      className={`relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#0f172a]/40 backdrop-blur-md border shadow-sm dark:shadow-md overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-lg
        ${isDisconnected ? 'border-red-500/20 grayscale-[0.5] opacity-80' : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'}`}
    >
      {/* Background Glow for active state */}
      {!isDisconnected && (
        <div 
          className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] opacity-20 transition-all duration-500 group-hover:opacity-40"
          style={{ backgroundColor: color }}
        />
      )}

      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <span 
                className={`w-1.5 h-1.5 rounded-sm ${isDisconnected ? 'bg-red-500' : ''}`} 
                style={!isDisconnected ? { backgroundColor: color, boxShadow: `0 0 10px ${color}` } : {}}
            ></span>
            {title}
          </span>
          {subtitle && (
            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider ml-3.5 mt-1">
              {subtitle}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/5 shadow-inner">
           <div 
             className={`w-1.5 h-1.5 rounded-full ${isDisconnected ? 'bg-red-500' : 'animate-pulse'}`} 
             style={!isDisconnected ? { backgroundColor: color } : {}} 
           />
        </div>
      </div>
      
      <div className="relative z-10 flex items-baseline gap-2">
        <span className={`font-mono font-medium tracking-tight text-slate-800 dark:text-white drop-shadow-sm dark:drop-shadow-lg ${isDisconnected ? 'text-xl text-red-500 dark:text-red-400' : 'text-4xl'}`}>
          {typeof value === 'number' 
            ? value.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 0 }) 
            : value}
        </span>
        {!isDisconnected && (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
            {unit}
          </span>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-6 relative h-1.5 w-full bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_25%,rgba(0,0,0,0.1)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1)_100%)] dark:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%,rgba(255,255,255,0.1)_100%)] bg-[length:10px_10px]" />
        
        <div 
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: isDisconnected ? '0%' : '65%', 
              backgroundColor: isDisconnected ? 'transparent' : color, 
              boxShadow: isDisconnected ? 'none' : `0 0 10px ${color}40`,
            }} 
        />
      </div>
    </div>
  );
};