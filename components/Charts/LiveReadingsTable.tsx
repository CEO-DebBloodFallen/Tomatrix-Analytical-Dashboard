import React, { useState, useMemo } from 'react';
import { SensorReading } from '../../types';
import { DateRangePicker } from '../DateRangePicker';
import { Download } from 'lucide-react';

interface Props {
  history: SensorReading[];
}

export const LiveReadingsTable: React.FC<Props> = ({ history }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredHistory = useMemo(() => {
    let filtered = history;
    if (startDate) {
      const start = new Date(startDate).getTime();
      filtered = filtered.filter(r => parseInt(r.id) >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime();
      filtered = filtered.filter(r => parseInt(r.id) <= end);
    }
    if (!startDate && !endDate) {
      return filtered.slice(-20);
    }
    return filtered;
  }, [history, startDate, endDate]);

  // Reverse to show newest first
  const reversedData = [...filteredHistory].reverse();

  const handleExportCSV = () => {
    if (reversedData.length === 0) return;

    const headers = ['Timestamp', 'NH3 (ppm)', 'CO2 (ppm)', 'VOC (index)', 'Temperature (°C)', 'Weight (kg)', 'Humidity (%)'];
    const csvRows = [
      headers.join(','),
      ...reversedData.map(row => 
        [
          `"${row.timestamp}"`,
          row.nh3.toFixed(2),
          row.co2.toFixed(2),
          row.voc.toFixed(2),
          row.temperature.toFixed(2),
          row.weight.toFixed(2),
          row.humidity.toFixed(2)
        ].join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tomatrix_sensor_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full min-h-[250px] bg-white dark:bg-[#0f172a]/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/5 p-4 flex flex-col overflow-hidden shadow-sm dark:shadow-md transition-colors duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-slate-800 dark:text-white font-bold text-xs uppercase tracking-widest pl-2 border-l-2 border-purple-500">
            Live Data Log
          </h3>
          <button
            onClick={handleExportCSV}
            disabled={reversedData.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100/50 dark:bg-purple-500/10 hover:bg-purple-200/50 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
        <DateRangePicker 
          startDate={startDate} 
          endDate={endDate} 
          onStartDateChange={setStartDate} 
          onEndDateChange={setEndDate} 
          onClear={() => { setStartDate(''); setEndDate(''); }} 
        />
      </div>
      <div className="flex-1 overflow-auto pr-1">
        <table className="w-full table-fixed border-collapse">
          <thead className="sticky top-0 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-sm z-10 shadow-sm border-b border-slate-200 dark:border-white/10 transition-colors duration-500">
            <tr>
              <th className="py-3 px-2 text-[10px] font-bold uppercase text-slate-500 dark:text-gray-400 tracking-wider w-44 text-left pl-4">DATETIME STAMP</th>
              <th className="py-3 px-2 text-[10px] font-bold uppercase text-cyan-600 dark:text-cyan-400 tracking-wider text-center">NH₃</th>
              <th className="py-3 px-2 text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wider text-center">CO₂</th>
              <th className="py-3 px-2 text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400 tracking-wider text-center">VOC</th>
              <th className="py-3 px-2 text-[10px] font-bold uppercase text-teal-600 dark:text-teal-400 tracking-wider text-center">TMP</th>
              <th className="py-3 px-2 text-[10px] font-bold uppercase text-red-600 dark:text-red-400 tracking-wider text-center">WEIGHT</th>
              <th className="py-3 px-2 text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 tracking-wider text-center">HUMIDITY</th>
            </tr>
          </thead>
          <tbody className="text-xs text-slate-600 dark:text-gray-300 font-mono transition-colors duration-500">
            {reversedData.map((row, i) => (
              <tr 
                key={row.id} 
                className={`border-b border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${i === 0 ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-100 animate-pulse' : ''}`}
              >
                <td className="py-2.5 px-2 opacity-70 whitespace-nowrap text-left pl-4">{row.timestamp}</td>
                <td className="py-2.5 px-2 text-center">{row.nh3.toFixed(1)}</td>
                <td className="py-2.5 px-2 text-center">{row.co2.toFixed(0)}</td>
                <td className="py-2.5 px-2 text-center">{row.voc.toFixed(1)}</td>
                <td className="py-2.5 px-2 text-center">{row.temperature.toFixed(1)}</td>
                <td className="py-2.5 px-2 text-center">{row.weight.toFixed(1)}</td>
                <td className="py-2.5 px-2 text-center">{row.humidity.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};