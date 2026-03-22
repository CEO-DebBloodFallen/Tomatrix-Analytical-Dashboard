import React from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear: () => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear
}) => {
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-[#0f172a]/40 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-md transition-colors duration-500">
      <div className="flex flex-col">
        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Start Date & Time</label>
        <input 
          type="datetime-local" 
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">End Date & Time</label>
        <input 
          type="datetime-local" 
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
        />
      </div>
      <button 
        onClick={onClear}
        className="mt-4 px-4 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
      >
        Clear
      </button>
    </div>
  );
};
