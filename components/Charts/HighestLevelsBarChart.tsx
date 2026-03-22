import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SensorReading, GAS_COLORS } from '../../types';

interface Props {
  data: SensorReading;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg dark:shadow-2xl">
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: data.color }}></span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">{label}</span>
          </div>
          <span className="text-slate-900 dark:text-white font-mono font-bold">{Number(data.value).toFixed(1)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const HighestLevelsBarChart: React.FC<Props> = ({ data }) => {
  const chartData = [
    { name: 'NH₃', value: data.nh3, color: GAS_COLORS.nh3 },
    { name: 'CO₂', value: data.co2 / 20, color: GAS_COLORS.co2 },
    { name: 'VOC', value: data.voc, color: GAS_COLORS.voc },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="w-full h-full min-h-[200px] bg-white dark:bg-[#0f172a]/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/5 p-6 flex flex-col shadow-sm dark:shadow-md transition-colors duration-500">
      <h3 className="text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"></span>
        Highest Relative Levels
      </h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            barSize={12}
          >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }} 
              width={40}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              content={<CustomTooltip />}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} background={{ fill: 'rgba(255,255,255,0.03)', radius: [0,4,4,0] }}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};