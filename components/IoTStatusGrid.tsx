import React from 'react';
import { IoTSystemState, SensorHeartbeats } from '../types';

interface Props {
  systemData: IoTSystemState;
  heartbeats: SensorHeartbeats;
  now: number;
  onReset?: () => void;
}

// Simplified SVGs with glow filters support
const Icons = {
  Chip: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
  Gas: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  Env: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
  Weight: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
  Servo: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Light: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  Battery: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
};

const StatusCard = ({ 
  label, 
  status, 
  subtext, 
  icon: Icon 
}: { 
  label: string; 
  status: 'ON' | 'OFF'; 
  subtext?: string; 
  icon: React.FC 
}) => {
  const isActive = status === 'ON';
  return (
    <div className={`
      relative flex items-center p-4 rounded-xl border transition-all duration-500 overflow-hidden group
      ${isActive 
        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/30 shadow-sm dark:shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
        : 'bg-slate-50 dark:bg-[#0f172a]/40 border-slate-200 dark:border-white/5 opacity-80 hover:opacity-100 hover:border-slate-300 dark:hover:border-white/10'}
    `}>
      {/* Background Pulse Effect for Active Cards */}
      {isActive && (
        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
      )}

      <div className={`
        p-3 rounded-lg mr-4 transition-colors duration-300 relative z-10
        ${isActive ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-500'}
      `}>
        <Icon />
      </div>
      
      <div className="flex-1 z-10">
        <div className="flex justify-between items-start">
          <div>
             <h4 className="text-sm font-bold text-slate-800 dark:text-gray-200 tracking-tight">{label}</h4>
             {subtext && <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono mt-0.5 tracking-wide">{subtext}</p>}
          </div>
          <div className="flex flex-col items-end gap-1.5">
             <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full ${
               isActive ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/10'
             }`}>
               {status}
             </span>
             {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export const IoTStatusGrid: React.FC<Props> = ({ systemData, heartbeats, now, onReset }) => {
  // TIMEOUT THRESHOLD: 15 seconds
  const TIMEOUT_MS = 15000;

  // Determine Online Status Per Device
  const isOnline = (lastSeen: number) => (now - lastSeen) < TIMEOUT_MS;

  const espOnline = isOnline(heartbeats.esp32);
  const mq137Online = isOnline(heartbeats.mq137);
  const mq135Online = isOnline(heartbeats.mq135);
  const scd41Online = isOnline(heartbeats.scd41);
  const loadcellOnline = isOnline(heartbeats.loadcell);
  const servoOnline = isOnline(heartbeats.servo);
  const uvcOnline = isOnline(heartbeats.uvc);

  // Logic: UV-C and LEDs
  // UV-C only active if connected AND boolean is true
  const uvcActive = uvcOnline && systemData.uvc;
  const redLedActive = uvcActive;   
  const greenLedActive = !uvcActive && uvcOnline; // Ready if online but not running

  // Battery Segment & Color Logic
  const segments = 10;
  // Battery depends on ESP32 connection
  const batteryLevel = espOnline ? systemData.battery : 0;
  const filledSegments = Math.ceil((batteryLevel / 100) * segments);
  
  // DETERMINE COLOR CONFIGURATION BASED ON PERCENTAGE
  const getBatteryConfig = (level: number) => {
    if (!espOnline) return {
       text: 'text-slate-400 dark:text-gray-500', bg: 'bg-slate-300 dark:bg-gray-700', shadow: 'shadow-none', border: 'border-slate-300 dark:border-gray-700/30'
    };
    // 80-100% = Green
    if (level >= 80) return {
      text: 'text-emerald-500',
      bg: 'bg-emerald-500',
      shadow: 'shadow-[0_0_6px_#10b981]',
      border: 'border-emerald-500/30'
    };
    // 50-79% = Yellow
    if (level >= 50) return {
      text: 'text-yellow-400',
      bg: 'bg-yellow-400',
      shadow: 'shadow-[0_0_6px_#facc15]',
      border: 'border-yellow-500/30'
    };
    // 30-49% = Yellow Orange
    if (level >= 30) return {
      text: 'text-amber-500',
      bg: 'bg-amber-500',
      shadow: 'shadow-[0_0_6px_#f59e0b]',
      border: 'border-amber-500/30'
    };
    // 20-29% = Red Orange
    if (level >= 20) return {
      text: 'text-orange-600',
      bg: 'bg-orange-600',
      shadow: 'shadow-[0_0_6px_#ea580c]',
      border: 'border-orange-600/30'
    };
    // 1-19% = Red
    return {
      text: 'text-red-600',
      bg: 'bg-red-600',
      shadow: 'shadow-[0_0_6px_#dc2626]',
      border: 'border-red-600/30'
    };
  };

  const batConfig = getBatteryConfig(batteryLevel);
  const isCritical = espOnline && batteryLevel < 20;

  const getBatteryStatusText = () => {
    if (!espOnline) return 'OFFLINE';
    if (batteryLevel >= 98) return 'FULL CHG';
    if (batteryLevel >= 80) return 'NOMINAL';
    if (batteryLevel >= 50) return 'GOOD';
    if (batteryLevel >= 30) return 'LOW PWR';
    if (batteryLevel >= 20) return 'WARNING';
    return 'CRITICAL';
  };

  const getSegmentColor = (index: number) => {
    if (!espOnline) return 'bg-slate-200 dark:bg-gray-800/30';
    // If segment is empty
    if (index >= filledSegments) return 'bg-slate-200 dark:bg-gray-800/30'; 
    // Filled segment colors based on global level
    return `${batConfig.bg} ${batConfig.shadow}`;
  };

  return (
    <div className="w-full bg-white dark:bg-[#0f172a]/40 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/5 p-6 shadow-sm dark:shadow-md relative overflow-hidden transition-colors duration-500">
      
      {/* Enhanced Background: Plasma Border & Grid */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden">
          {/* Plasma only active when main MCU is online */}
          {espOnline && (
            <div className="absolute inset-0 z-0 opacity-60 mix-blend-plus-lighter" 
                 style={{ maskImage: 'radial-gradient(ellipse at center, transparent 60%, black 100%)', WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 60%, black 100%)' }}>
                <div className="absolute -inset-[50%] animate-[spin_10s_linear_infinite] blur-[50px] opacity-70"
                     style={{ background: 'conic-gradient(from 0deg, transparent 0deg, #10b981 60deg, transparent 120deg, transparent 200deg, #ef4444 260deg, transparent 360deg)' }} />
                <div className="absolute -inset-[50%] animate-[spin_7s_linear_infinite_reverse] blur-[40px] opacity-70"
                     style={{ background: 'conic-gradient(from 180deg, transparent 0deg, #ef4444 40deg, transparent 100deg, transparent 240deg, #10b981 300deg, transparent 360deg)' }} />
            </div>
          )}

          {/* Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] opacity-80" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 border-b border-slate-200 dark:border-white/5 pb-6">
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${espOnline ? 'bg-green-500 shadow-[0_0_15px_#22c55e] animate-pulse' : 'bg-red-500 shadow-[0_0_15px_#ef4444]'}`} />
            <h3 className="text-slate-800 dark:text-white font-black text-xl uppercase tracking-[0.15em] drop-shadow-sm dark:drop-shadow-md">
            System Hardware
            </h3>
        </div>
        
        {/* Right Side Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          
          {/* Reset Button - Only show/enable when online */}
          {onReset && (
            <button 
              onClick={espOnline ? onReset : undefined}
              disabled={!espOnline}
              className={`group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
                 ${espOnline 
                    ? 'bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 hover:border-red-300 dark:hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] cursor-pointer' 
                    : 'bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 cursor-not-allowed grayscale'
                 }`}
            >
              <svg className={`w-4 h-4 text-red-500 transition-transform duration-700 ${espOnline ? 'group-hover:rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className={`text-[10px] font-black uppercase tracking-widest ${espOnline ? 'text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300' : 'text-slate-400 dark:text-gray-500'}`}>
                Reboot System
              </span>
            </button>
          )}

          {/* Battery Widget */}
          <div className={`flex items-center gap-4 bg-slate-100 dark:bg-black/40 px-5 py-2.5 rounded-2xl border transition-all duration-500 shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] ${batConfig.border} ${isCritical ? 'animate-pulse shadow-[inset_0_0_20px_rgba(220,38,38,0.2)]' : 'border-slate-200 dark:border-white/10'}`}>
            
            <div className={`transition-colors duration-300 ${batConfig.text}`}>
               <Icons.Battery />
            </div>

            <div className="flex gap-1">
              {Array.from({ length: segments }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-5 rounded-[1px] transition-all duration-300 ${getSegmentColor(i)}`}
                />
              ))}
            </div>
            
            <div className="flex flex-col border-l border-white/10 pl-4 ml-1 min-w-[60px]">
               <div className="flex items-baseline gap-0.5">
                  <span className={`text-lg font-mono font-bold leading-none transition-colors duration-300 ${batConfig.text}`}>
                      {batteryLevel}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">%</span>
               </div>
               <span className={`text-[8px] font-bold uppercase tracking-widest leading-none mt-1 transition-colors duration-300 ${batConfig.text}`}>
                  {getBatteryStatusText()}
               </span>
            </div>

          </div>

        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* ESP32 Controller */}
        <StatusCard 
          label="ESP32 MCU" 
          status={espOnline ? 'ON' : 'OFF'} 
          subtext={espOnline ? `Heartbeat: Active` : 'Signal Lost'}
          icon={Icons.Chip}
        />

        {/* Gas Sensors - Independent Online Checks */}
        <StatusCard 
          label="MQ-137 Array" 
          status={mq137Online ? 'ON' : 'OFF'} 
          subtext={mq137Online ? 'Data Streaming' : 'No Signal'}
          icon={Icons.Gas}
        />
        <StatusCard 
          label="MQ-135 Array" 
          status={mq135Online ? 'ON' : 'OFF'} 
          subtext={mq135Online ? 'Data Streaming' : 'No Signal'}
          icon={Icons.Gas}
        />

        {/* Env Sensor - Independent Online Check */}
        <StatusCard 
          label="SCD41 Module" 
          status={scd41Online ? 'ON' : 'OFF'} 
          subtext={scd41Online ? 'Env Monitoring' : 'Offline'}
          icon={Icons.Env}
        />

        {/* Actuators - Servo state depends on connection + boolean state */}
        <StatusCard 
          label="Servo Mech" 
          status={servoOnline && systemData.servo ? 'ON' : 'OFF'} 
          subtext={servoOnline ? (systemData.servo ? 'Position Lock' : 'Idle / Inactive') : 'Offline'}
          icon={Icons.Servo}
        />
        
        {/* Load Cell - Independent Online Check */}
        <StatusCard 
          label="Load Cell" 
          status={loadcellOnline ? 'ON' : 'OFF'} 
          subtext={loadcellOnline ? 'Calibrated' : 'Offline'}
          icon={Icons.Weight}
        />

        {/* Custom UV-C Control Panel */}
        <div className={`xl:col-span-2 rounded-2xl border p-5 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group transition-all duration-500
            ${!uvcOnline 
              ? 'bg-slate-100 dark:bg-[#0f172a]/40 border-slate-200 dark:border-white/5 opacity-60 grayscale' 
              : uvcActive 
                ? 'bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/40 dark:to-fuchsia-900/20 border-purple-300 dark:border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)] dark:shadow-[0_0_30px_rgba(168,85,247,0.2)]' 
                : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-900/80 border-slate-200 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/30'
            }`}>
          
          {/* Background Glow */}
          {uvcActive && (
             <>
               <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 mix-blend-overlay pointer-events-none animate-pulse" />
               <div className="absolute -inset-1/2 bg-purple-500/20 blur-[60px] rounded-full animate-[spin_4s_linear_infinite] pointer-events-none opacity-50 dark:opacity-30" />
             </>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none opacity-50" />

          <div className="flex items-center gap-5 z-10 w-full sm:w-auto">
            <div className={`p-4 rounded-xl transition-all duration-500 relative ${uvcActive ? 'bg-purple-600 shadow-[0_0_25px_#9333ea] text-white scale-105' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
              {uvcActive && <div className="absolute inset-0 bg-white/20 rounded-xl animate-ping opacity-20" />}
              <Icons.Light />
            </div>
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${uvcActive ? 'text-purple-900 dark:text-purple-100' : 'text-slate-800 dark:text-slate-200'}`}>UV-C Sterilization</h4>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-md border mt-1.5 inline-flex items-center gap-1.5 tracking-widest transition-all duration-300 ${
                !uvcOnline 
                  ? 'text-slate-500 dark:text-slate-500 border-slate-300 dark:border-slate-700' 
                  : uvcActive 
                    ? 'text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30 bg-purple-100 dark:bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                    : 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10'
              }`}>
                {uvcActive && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse" />}
                {!uvcActive && uvcOnline && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />}
                {uvcOnline ? (uvcActive ? 'SEQUENCE ACTIVE' : 'STANDBY') : 'OFFLINE'}
              </span>
            </div>
          </div>

          {/* Realistic LEDs */}
          <div className="flex gap-6 z-10 bg-white dark:bg-black/40 px-8 py-3 rounded-xl border border-slate-200 dark:border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.4)] backdrop-blur-sm self-center sm:self-auto transition-colors duration-500">
            <div className="flex flex-col items-center gap-2">
                <div className={`relative w-4 h-4 rounded-full transition-all duration-300 ${
                  redLedActive 
                    ? 'bg-red-500 shadow-[0_0_15px_#ef4444,inset_0_-2px_4px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.4)] scale-110' 
                    : 'bg-red-900/20 dark:bg-red-950/40 border border-red-900/10 dark:border-red-900/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]'
                }`}>
                  {redLedActive && <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />}
                </div>
                <span className={`text-[9px] font-black tracking-wider transition-colors duration-300 ${redLedActive ? 'text-red-600 dark:text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'text-slate-400 dark:text-slate-600'}`}>BUSY</span>
            </div>
            <div className="w-px h-8 bg-slate-300/50 dark:bg-white/10" />
            <div className="flex flex-col items-center gap-2">
                <div className={`relative w-4 h-4 rounded-full transition-all duration-300 ${
                  greenLedActive 
                    ? 'bg-emerald-500 shadow-[0_0_15px_#10b981,inset_0_-2px_4px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.4)] scale-110' 
                    : 'bg-emerald-900/20 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-900/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]'
                }`}>
                  {greenLedActive && <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />}
                </div>
                <span className={`text-[9px] font-black tracking-wider transition-colors duration-300 ${greenLedActive ? 'text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'text-slate-400 dark:text-slate-600'}`}>READY</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};