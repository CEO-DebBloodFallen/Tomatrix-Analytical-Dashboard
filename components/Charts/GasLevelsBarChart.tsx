import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SensorReading, GAS_COLORS } from '../../types';

interface Props {
  history: SensorReading[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg dark:shadow-2xl">
        <p className="text-slate-500 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-2">{label}</p>
        <div className="flex flex-col gap-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{entry.name}</span>
              </div>
              <span className="text-slate-900 dark:text-white font-mono font-bold">{Number(entry.value).toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const GasLevelsBarChart: React.FC<Props> = ({ history }) => {
  return (
    <div className="w-full h-full min-h-[250px] bg-white dark:bg-[#0f172a]/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/5 p-6 flex flex-col shadow-sm dark:shadow-md transition-colors duration-500">
      <h3 className="text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
        <span className="w-1 h-4 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"></span>
        Gas Levels Over Time
      </h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={history}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barCategoryGap="20%"
          >
            <defs>
              <linearGradient id="gradNh3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GAS_COLORS.nh3} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={GAS_COLORS.nh3} stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="gradCo2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GAS_COLORS.co2} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={GAS_COLORS.co2} stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="gradVoc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GAS_COLORS.voc} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={GAS_COLORS.voc} stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis 
              dataKey="timestamp" 
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickLine={false}
              interval="preserveStartEnd"
              dy={10}
              tickFormatter={(value) => {
                // Extract time from "MM-DD-YYYY HH:mm:ss"
                const parts = value.split(' ');
                return parts.length > 1 ? parts[1] : value;
              }}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              content={<CustomTooltip />}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontFamily: 'monospace' }} 
              iconType="circle"
            />
            <Bar dataKey="nh3" name="NH₃" stackId="a" fill="url(#gradNh3)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="co2" name="CO₂ (x0.1)" stackId="a" fill="url(#gradCo2)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="voc" name="VOC" stackId="a" fill="url(#gradVoc)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};