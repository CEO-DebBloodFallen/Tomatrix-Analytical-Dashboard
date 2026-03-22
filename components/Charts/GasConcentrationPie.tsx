import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { SensorReading, GAS_COLORS } from '../../types';

interface Props {
  data: SensorReading;
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg dark:shadow-2xl">
        <div className="flex flex-col gap-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: entry.color || entry.payload.fill }}></span>
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

export const GasConcentrationPie: React.FC<Props> = ({ data }) => {
  const chartData = [
    { name: 'NH₃', value: data.nh3, color: GAS_COLORS.nh3 },
    { name: 'CO₂', value: data.co2 / 10, color: GAS_COLORS.co2 },
    { name: 'VOC', value: data.voc, color: GAS_COLORS.voc },
  ];

  return (
    <div className="w-full h-full min-h-[250px] bg-white dark:bg-[#0f172a]/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/5 p-6 flex flex-col shadow-sm dark:shadow-md transition-colors duration-500">
      <h3 className="text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
        <span className="w-1 h-4 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"></span>
        Gas Concentration Share
      </h3>
      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {chartData.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    className="stroke-[2px] stroke-white dark:stroke-slate-900/50"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend 
              verticalAlign="middle" 
              align="right"
              layout="vertical"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-[60px] flex-col opacity-80">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total</span>
          <span className="text-xl font-mono text-slate-800 dark:text-white">100%</span>
        </div>
      </div>
    </div>
  );
};