import React, { useState, useMemo } from 'react';
import { SensorReading } from '../../types';
import { DateRangePicker } from '../DateRangePicker';
import { Download, Filter } from 'lucide-react';

type AlertFilter = 'voc' | 'nh3' | 'co2' | 'temp' | 'hum' | 'weight';

interface Props {
  history: SensorReading[];
}

export const LiveReadingsTable: React.FC<Props> = ({ history }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<AlertFilter[]>([]);

  const toggleFilter = (filter: AlertFilter) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredHistory = useMemo(() => {
    let filtered = history;
    
    // 1. Date Filter
    if (startDate) {
      const start = new Date(startDate).getTime();
      filtered = filtered.filter(r => parseInt(r.id) >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime();
      filtered = filtered.filter(r => parseInt(r.id) <= end);
    }
    
    // 2. Alert Filter
    if (activeFilters.length > 0) {
      filtered = filtered.filter(row => {
        if (activeFilters.includes('voc') && row.voc >= 2) return true;
        if (activeFilters.includes('nh3') && row.nh3 >= 1) return true;
        if (activeFilters.includes('co2') && row.co2 >= 800) return true;
        if (activeFilters.includes('temp') && row.temperature >= 35) return true;
        if (activeFilters.includes('hum') && row.humidity >= 85) return true;
        if (activeFilters.includes('weight') && row.weight >= 0.2) return true;
        return false;
      });
    }

    // 3. Limit if no dates are set
    if (!startDate && !endDate) {
      if (activeFilters.length > 0) {
        return filtered.slice(-100); // Show more rows if filtering for alerts
      }
      return filtered.slice(-20); // Default view
    }
    
    return filtered;
  }, [history, startDate, endDate, activeFilters]);

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

      {/* TRIGGER FILTERS */}
      <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-1.5 mr-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Trigger Filters:</span>
        </div>
        
        <button 
          onClick={() => setActiveFilters([])}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
            activeFilters.length === 0 
              ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-md' 
              : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
          }`}
        >
          All
        </button>
        
        <button 
          onClick={() => toggleFilter('voc')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border ${
            activeFilters.includes('voc')
              ? 'bg-orange-500 text-white border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]' 
              : 'bg-white dark:bg-white/5 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20 hover:bg-orange-50 dark:hover:bg-orange-500/10'
          }`}
        >
          VOC
        </button>

        <button 
          onClick={() => toggleFilter('nh3')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border ${
            activeFilters.includes('nh3')
              ? 'bg-cyan-500 text-white border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' 
              : 'bg-white dark:bg-white/5 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20 hover:bg-cyan-50 dark:hover:bg-cyan-500/10'
          }`}
        >
          NH3
        </button>

        <button 
          onClick={() => toggleFilter('co2')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border ${
            activeFilters.includes('co2')
              ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]' 
              : 'bg-white dark:bg-white/5 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 hover:bg-blue-50 dark:hover:bg-blue-500/10'
          }`}
        >
          CO2
        </button>

        <button 
          onClick={() => toggleFilter('temp')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border ${
            activeFilters.includes('temp')
              ? 'bg-red-500 text-white border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' 
              : 'bg-white dark:bg-white/5 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10'
          }`}
        >
          TEMPERATURE
        </button>

        <button 
          onClick={() => toggleFilter('hum')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border ${
            activeFilters.includes('hum')
              ? 'bg-purple-500 text-white border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
              : 'bg-white dark:bg-white/5 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20 hover:bg-purple-50 dark:hover:bg-purple-500/10'
          }`}
        >
          HUMIDITY
        </button>

        <button 
          onClick={() => toggleFilter('weight')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border ${
            activeFilters.includes('weight')
              ? 'bg-teal-500 text-white border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.4)]' 
              : 'bg-white dark:bg-white/5 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20 hover:bg-teal-50 dark:hover:bg-teal-500/10'
          }`}
        >
          WEIGHT
        </button>
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
            {reversedData.map((row, i) => {
              const isVocAlert = row.voc >= 2;
              const isNh3Alert = row.nh3 >= 1;
              const isCo2Alert = row.co2 >= 800;
              const isTempAlert = row.temperature >= 35;
              const isHumAlert = row.humidity >= 85;
              const isWeightAlert = row.weight >= 0.2;
              
              const isRowAlert = isVocAlert || isNh3Alert || isCo2Alert || isTempAlert || isHumAlert || isWeightAlert;

              return (
                <tr 
                  key={row.id} 
                  className={`border-b border-slate-200 dark:border-white/5 transition-colors ${
                    isRowAlert 
                      ? 'bg-red-50/80 dark:bg-red-900/20 animate-[pulse_3s_ease-in-out_infinite] hover:bg-red-100 dark:hover:bg-red-900/30' 
                      : i === 0 
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-100 hover:bg-slate-100 dark:hover:bg-white/5' 
                        : 'hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <td className="py-2.5 px-2 opacity-70 whitespace-nowrap text-left pl-4">{row.timestamp}</td>
                  <td className="py-2.5 px-2 text-center">
                    {isNh3Alert ? <span className="inline-block bg-red-500 text-white font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">{row.nh3.toFixed(1)}</span> : row.nh3.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {isCo2Alert ? <span className="inline-block bg-red-500 text-white font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">{row.co2.toFixed(0)}</span> : row.co2.toFixed(0)}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {isVocAlert ? <span className="inline-block bg-red-500 text-white font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">{row.voc.toFixed(1)}</span> : row.voc.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {isTempAlert ? <span className="inline-block bg-red-500 text-white font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">{row.temperature.toFixed(1)}</span> : row.temperature.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {isWeightAlert ? <span className="inline-block bg-red-500 text-white font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">{row.weight.toFixed(1)}</span> : row.weight.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {isHumAlert ? <span className="inline-block bg-red-500 text-white font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">{row.humidity.toFixed(1)}</span> : row.humidity.toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};