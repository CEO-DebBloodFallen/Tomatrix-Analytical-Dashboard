import React, { useState, useMemo, useEffect } from 'react';
import { SensorReading } from '../../types';
import { DateRangePicker } from '../DateRangePicker';
import { Download, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { truncateToTwoDecimals } from '../../utils/format';

type AlertFilter = 'voc' | 'nh3' | 'co2' | 'temp' | 'hum' | 'weight';

interface Props {
  history: SensorReading[];
}

export const LiveReadingsTable: React.FC<Props> = ({ history }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<AlertFilter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 50;

  const toggleFilter = (filter: AlertFilter) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredHistory = useMemo(() => {
    // --- 15-Minute Interval Grouping ---
    const bucketed = new Map<string, SensorReading>();
    
    for (const row of history) {
      if (row.id === 'loading') continue;
      
      const parts = row.timestamp.split(' ');
      if (parts.length === 2) {
        const [hour, minute] = parts[1].split(':');
        const minNum = Number(minute);
        
        if (!isNaN(minNum)) {
          const bucketMin = Math.floor(minNum / 15) * 15;
          const bucketKey = `${parts[0]} ${hour}:${bucketMin.toString().padStart(2, '0')}`;
          
          // Create a new row with the standardized 15-minute timestamp
          const standardizedRow = {
            ...row,
            timestamp: `${parts[0]} ${hour}:${bucketMin.toString().padStart(2, '0')}:00`
          };
          
          if (minNum === bucketMin) {
            // Allow updates only during the exact minute of the interval (e.g., 19:00:00 to 19:00:59)
            bucketed.set(bucketKey, standardizedRow);
          } else {
            // Once the minute has passed (e.g., 19:01:00+), the row is LOCKED.
            // Only set if it doesn't exist (e.g., if data collection started at 19:05)
            if (!bucketed.has(bucketKey)) {
              bucketed.set(bucketKey, standardizedRow);
            }
          }
          continue;
        }
      }
      if (!bucketed.has(row.id)) {
        bucketed.set(row.id, row);
      }
    }
    
    let filtered = Array.from(bucketed.values());

    // 1. Date Filter
    if (startDate) {
      const start = new Date(startDate).getTime();
      filtered = filtered.filter(r => {
        const parts = r.timestamp.split(' ');
        if (parts.length === 2) {
          const [m, d, y] = parts[0].split('-');
          const [hr, min, sec] = parts[1].split(':');
          const t = new Date(Number(y), Number(m)-1, Number(d), Number(hr), Number(min), Number(sec)).getTime();
          return t >= start;
        }
        return true;
      });
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const endMs = end.getTime();
      filtered = filtered.filter(r => {
        const parts = r.timestamp.split(' ');
        if (parts.length === 2) {
          const [m, d, y] = parts[0].split('-');
          const [hr, min, sec] = parts[1].split(':');
          const t = new Date(Number(y), Number(m)-1, Number(d), Number(hr), Number(min), Number(sec)).getTime();
          return t <= endMs;
        }
        return true;
      });
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

    return filtered;
  }, [history, startDate, endDate, activeFilters]);

  // Reverse to show newest first
  const reversedData = useMemo(() => [...filteredHistory].reverse(), [filteredHistory]);

  // Reset pagination when filters or dates change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters, startDate, endDate]);

  const totalRecords = reversedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / ROWS_PER_PAGE));

  // Ensure currentPage is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return reversedData.slice(start, start + ROWS_PER_PAGE);
  }, [reversedData, currentPage]);

  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1;
  const endRecord = Math.min(currentPage * ROWS_PER_PAGE, totalRecords);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handleExportCSV = () => {
    if (reversedData.length === 0) return;

    const headers = ['Timestamp', 'NH3 (ppm)', 'CO2 (ppm)', 'VOC (index)', 'Temperature (°C)', 'Weight (kg)', 'Humidity (%)'];
    const csvRows = [
      headers.join(','),
      ...reversedData.map(row => 
        [
          `"${row.timestamp}"`,
          truncateToTwoDecimals(row.nh3),
          truncateToTwoDecimals(row.co2),
          truncateToTwoDecimals(row.voc),
          truncateToTwoDecimals(row.temperature),
          truncateToTwoDecimals(row.weight),
          truncateToTwoDecimals(row.humidity)
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
            {paginatedData.map((row, i) => {
              const absoluteIndex = (currentPage - 1) * ROWS_PER_PAGE + i;
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
                      : absoluteIndex === 0 
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-100 hover:bg-slate-100 dark:hover:bg-white/5' 
                        : 'hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <td className="py-2.5 px-2 opacity-70 whitespace-nowrap text-left pl-4">{row.timestamp}</td>
                  <td className="py-2.5 px-2 text-center">
                    {isNh3Alert ? <span className="inline-block bg-red-500 text-white font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">{truncateToTwoDecimals(row.nh3)}</span> : truncateToTwoDecimals(row.nh3)}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {isCo2Alert ? <span className="inline-block bg-red-500 text-white font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">{truncateToTwoDecimals(row.co2)}</span> : truncateToTwoDecimals(row.co2)}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {isVocAlert ? <span className="inline-block bg-red-500 text-white font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">{truncateToTwoDecimals(row.voc)}</span> : truncateToTwoDecimals(row.voc)}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {isTempAlert ? <span className="inline-block bg-red-500 text-white font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">{truncateToTwoDecimals(row.temperature)}</span> : truncateToTwoDecimals(row.temperature)}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {isWeightAlert ? <span className="inline-block bg-red-500 text-white font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">{truncateToTwoDecimals(row.weight)}</span> : truncateToTwoDecimals(row.weight)}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {isHumAlert ? <span className="inline-block bg-red-500 text-white font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">{truncateToTwoDecimals(row.humidity)}</span> : truncateToTwoDecimals(row.humidity)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing records <span className="font-bold text-slate-700 dark:text-slate-200">{startRecord}–{endRecord}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{totalRecords}</span>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1} 
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center px-1 gap-1">
              {getPageNumbers().map((pageNum, idx) => (
                <button 
                  key={idx}
                  onClick={() => typeof pageNum === 'number' ? setCurrentPage(pageNum) : null}
                  disabled={pageNum === '...'}
                  className={`min-w-[28px] h-7 flex items-center justify-center rounded-md text-xs font-bold transition-colors ${
                    pageNum === currentPage 
                      ? 'bg-purple-500 text-white shadow-md' 
                      : pageNum === '...' 
                        ? 'text-slate-400 cursor-default' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages} 
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages} 
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};