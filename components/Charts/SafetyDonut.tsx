import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { SafetyStatus } from '../../types';

interface Props {
  statusData: SafetyStatus;
}

const STATUS_COLORS = {
  Safe: '#22c55e',     // Green
  Warning: '#eab308',  // Yellow
  Critical: '#ef4444', // Red
};

export const SafetyDonut: React.FC<Props> = ({ statusData }) => {
  // Always 100% for the background track
  const trackData = [{ name: 'Track', value: 100 }];
  
  // Calculate percentage for the value ring
  const maxVal = statusData.status === 'Critical' ? statusData.value * 1.2 : (statusData.status === 'Warning' ? statusData.value * 1.5 : statusData.value * 2);
  const percentage = Math.min(100, Math.max(5, (statusData.value / maxVal) * 100)); // Min 5% so it's visible
  
  const valueData = [
    { name: 'Value', value: percentage },
    { name: 'Rest', value: 100 - percentage }
  ];

  const statusColor = STATUS_COLORS[statusData.status];

  return (
    <div className="flex flex-row items-center bg-white dark:bg-[#0f172a]/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/5 p-4 h-full min-h-[100px] w-full shadow-sm dark:shadow-md group hover:border-slate-300 dark:hover:border-white/10 transition-colors duration-500">
      <div className="h-[70px] w-[70px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Background Track */}
            <Pie
              data={trackData}
              cx="50%"
              cy="50%"
              innerRadius={28}
              outerRadius={35}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              <Cell fill="rgba(148, 163, 184, 0.2)" />
            </Pie>
            {/* Value Ring */}
            <Pie
              data={valueData}
              cx="50%"
              cy="50%"
              innerRadius={28}
              outerRadius={35}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              <Cell fill={statusColor} />
              <Cell fill="transparent" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Value */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-sm font-black text-slate-800 dark:text-white drop-shadow-sm dark:drop-shadow-md">
            {statusData.value.toFixed(0)}
          </span>
        </div>
      </div>
      
      <div className="ml-4 flex flex-col justify-center gap-1.5">
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          {statusData.gas} Safety
        </span>
        <div className="flex items-center gap-2">
            <div 
                className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] animate-pulse"
                style={{ backgroundColor: statusColor, color: statusColor }}
            />
            <span 
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: statusColor }}
            >
            {statusData.status}
            </span>
        </div>
      </div>
    </div>
  );
};