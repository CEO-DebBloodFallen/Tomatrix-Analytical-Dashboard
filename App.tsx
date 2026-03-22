import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  onValue, 
  set, 
  query, 
  orderByKey, 
  limitToLast, 
  get 
} from 'firebase/database';
import { Header } from './components/Header';
import { KpiCard } from './components/KpiCard';
import { GasConcentrationPie } from './components/Charts/GasConcentrationPie';
import { GasLevelsBarChart } from './components/Charts/GasLevelsBarChart';
import { EnvLevelsBarChart } from './components/Charts/EnvLevelsBarChart';
import { LiveReadingsTable } from './components/Charts/LiveReadingsTable';
import { HighestLevelsBarChart } from './components/Charts/HighestLevelsBarChart';
import { SafetyDonut } from './components/Charts/SafetyDonut';
import { IoTStatusGrid } from './components/IoTStatusGrid';
import { getSafetyStatus } from './services/dataService';
import { SensorReading, IoTSystemState, GasType, GAS_COLORS, SensorHeartbeats } from './types';

// Firebase Project Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrhKHstFwZmBmz4Qd_QZWeCONJjOny9O4",
  authDomain: "solanirad-analytics-dashboard.firebaseapp.com",
  databaseURL: "https://solanirad-analytics-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "solanirad-analytics-dashboard",
  storageBucket: "solanirad-analytics-dashboard.firebasestorage.app",
  messagingSenderId: "915597225709",
  appId: "1:915597225709:web:94ceafd1cb5423830d26e4",
  measurementId: "G-77DDBWPJ5S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Realtime Database with explicit URL for asia-southeast1 region
const database = getDatabase(app);

// STALE DATA THRESHOLD (15 Seconds)
const TIMEOUT_MS = 15000;

// Helper to safely parse numbers and prevent NaN
const safeNumber = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

const App: React.FC = () => {
  // Analytic Data State (for charts)
  const [data, setData] = useState<SensorReading>({
    id: 'loading',
    timestamp: '--:--:--',
    nh3: 0,
    co2: 0,
    voc: 0,
    so2: 0,
    temperature: 0,
    humidity: 0,
    weight: 0
  });
  
  // Hardware Status State
  const [systemState, setSystemState] = useState<IoTSystemState>({
    esp32_status: false,
    esp32_last_update: 0,
    mq137: 0,
    mq135: 0,
    scd41: { co2: 0, temperature: 0, humidity: 0 },
    loadcell: 0,
    servo: false,
    uvc: false,
    battery: 0
  });

  // Independent Sensor Heartbeats (Stores SERVER timestamps)
  const [sensorHeartbeats, setSensorHeartbeats] = useState<SensorHeartbeats>({
    esp32: 0,
    mq137: 0,
    mq135: 0,
    scd41: 0,
    loadcell: 0,
    servo: 0,
    uvc: 0
  });

  const [fullHistory, setFullHistory] = useState<SensorReading[]>([]);
  const [filter, setFilter] = useState<GasType>('All');
  const [connected, setConnected] = useState(false);
  
  const recentHistory = React.useMemo(() => fullHistory.slice(-20), [fullHistory]);

  // Local state to track current time for stale data calculation (updates every second)
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // 1. Load Initial History from Database
    const historyRef = query(ref(database, 'sensor_history'), orderByKey(), limitToLast(1000));
    get(historyRef).then((snapshot: any) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const historyArray = Object.values(val) as SensorReading[];
        historyArray.sort((a, b) => Number(a.id) - Number(b.id));
        setFullHistory(historyArray);
      }
    }).catch(console.error);

    // 2. Firebase Listener for Live Data
    const iotRef = ref(database, 'iot_system');
    const unsubscribe = onValue(iotRef, (snapshot: any) => {
      const val = snapshot.val();
      if (val) {
        setConnected(true);
        
        const timestampDate = new Date();
        // Format: MM-DD-YYYY HH:mm:ss
        const pad = (n: number) => n.toString().padStart(2, '0');
        const timestamp = `${pad(timestampDate.getMonth() + 1)}-${pad(timestampDate.getDate())}-${timestampDate.getFullYear()} ${pad(timestampDate.getHours())}:${pad(timestampDate.getMinutes())}:${pad(timestampDate.getSeconds())}`;
        
        // --- HELPER: Resolve Sensor Node ---
        // Expects structure: { value: number, lastUpdated: number }
        // Returns { value, lastUpdated }
        const extractSensorNode = (node: any) => {
          if (!node) return { value: 0, lastUpdated: 0 };
          
          // Strict check for object structure
          if (typeof node === 'object') {
            return {
              value: safeNumber(node.value),
              lastUpdated: safeNumber(node.lastUpdated) // Default 0 means "Offline" if missing
            };
          }
          
          // Fallback for legacy (flat number) - Assume stale (lastUpdated = 0) to force DB update
          // This strictly enforces the requirement: "Never trust static values."
          return {
            value: safeNumber(node),
            lastUpdated: 0 
          };
        };

        // --- PARSE SENSORS INDEPENDENTLY ---
        
        // 1. MQ-137 (NH3)
        // Check for 'mq-137' (legacy) or 'mq137' keys
        const mq137Raw = val['mq-137'] ?? val.mq137;
        const mq137Data = extractSensorNode(mq137Raw);

        // 2. MQ-135 (VOC)
        const mq135Raw = val['mq-135'] ?? val.mq135;
        const mq135Data = extractSensorNode(mq135Raw);

        // 3. Load Cell (Weight)
        const loadcellData = extractSensorNode(val.loadcell);

        // 4. SCD41 (CO2, Temp, Hum)
        // SCD41 usually has sub-keys. We look for a 'lastUpdated' at the scd41 root.
        const scd41Node = val.scd41 || {};
        const scd41Timestamp = safeNumber(scd41Node.lastUpdated); 
        
        // 5. ESP32 Heartbeat
        const espTimestamp = safeNumber(val.esp32_last_update);

        // --- UPDATE INDEPENDENT HEARTBEATS (SERVER TIME) ---
        setSensorHeartbeats({
          esp32: espTimestamp,
          mq137: mq137Data.lastUpdated,
          mq135: mq135Data.lastUpdated,
          scd41: scd41Timestamp,
          loadcell: loadcellData.lastUpdated,
          servo: espTimestamp, // Servo state usually tied to ESP main loop
          uvc: espTimestamp    // UVC state usually tied to ESP main loop
        });

        // --- UPDATE SYSTEM VALUES ---
        const newSystemState: IoTSystemState = {
          esp32_status: val.esp32_status ?? false,
          esp32_last_update: espTimestamp,
          mq137: mq137Data.value,
          mq135: mq135Data.value,
          scd41: {
            co2: safeNumber(scd41Node.co2),
            temperature: safeNumber(scd41Node.temperature),
            humidity: safeNumber(scd41Node.humidity)
          },
          loadcell: loadcellData.value,
          servo: Boolean(val.servo),
          uvc: Boolean(val.uvc),
          battery: safeNumber(val.battery)
        };
        setSystemState(newSystemState);

        // --- MAP TO ANALYTICS MODEL ---
        // Use espTimestamp if available, otherwise fallback to 5-second buckets to prevent duplicate keys
        const readingId = espTimestamp > 0 ? espTimestamp.toString() : Math.floor(timestampDate.getTime() / 5000).toString();
        
        const newReading: SensorReading = {
          id: readingId,
          timestamp: timestamp,
          nh3: newSystemState.mq137,
          co2: newSystemState.scd41.co2,
          voc: newSystemState.mq135,
          so2: 0, 
          temperature: newSystemState.scd41.temperature,
          humidity: newSystemState.scd41.humidity,
          weight: newSystemState.loadcell
        };

        setData(newReading);
        
        // Save to Firebase History
        set(ref(database, `sensor_history/${readingId}`), newReading).catch(console.error);

        setFullHistory(prev => {
          // Prevent duplicate entries if the readingId is already the last one
          if (prev.length > 0 && prev[prev.length - 1].id === readingId) {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = newReading;
            return newHistory;
          }
          const newHistory = [...prev, newReading];
          return newHistory.slice(-1000); 
        });
      } else {
        console.log("Connected to Firebase, but 'iot_system' node is empty or missing.");
      }
    }, (error: any) => {
      console.error("Firebase Read Error:", error);
      setConnected(false);
    });

    // 2. Refresh Timer
    // Updates 'now' every second to trigger re-renders for stale data checks
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const safetyStatuses = getSafetyStatus(data);

  // --- STALE DATA LOGIC ---
  // Calculates online status based on (Current Time - Server LastUpdated Time)
  const isOnline = (serverTimestamp: number) => {
    // If serverTimestamp is 0 or undefined, it's definitely offline
    if (!serverTimestamp) return false;
    return (now - serverTimestamp) < TIMEOUT_MS;
  };

  const isEspOnline = isOnline(sensorHeartbeats.esp32);

  // Helper to determine display value based on INDEPENDENT sensor status
  const getDisplayValue = (val: number, sensorKey: keyof SensorHeartbeats) => {
     const online = isOnline(sensorHeartbeats[sensorKey]);
     return online ? val : 'Disconnected';
  };

  // Dashboard Click Logic
  const handleReset = () => {
    const confirmed = window.confirm(
      "CONFIRM REBOOT: Initiate ESP32 System Reset Sequence?"
    );

    if (confirmed) {
      set(ref(database, 'iot_system/control/reboot'), true)
        .then(() => {
           alert("Reboot Signal Sent. The ESP32 will restart and reset the signal.");
        })
        .catch((err: any) => {
            console.error("Cloud sync failed:", err);
            alert("Error sending reboot signal. Check connection.");
        });
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-gradient-to-br dark:from-indigo-950 dark:via-[#1e1b4b] dark:to-slate-950 p-4 lg:p-6 overflow-x-hidden font-sans text-slate-900 dark:text-slate-50 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* HEADER */}
        <div className="relative">
          <Header activeFilter={filter} onFilterChange={setFilter} connected={connected} isEspOnline={isEspOnline} />
        </div>

        {/* SECTION 1: IOT HARDWARE STATUS GRID - Independent Sensors */}
        <IoTStatusGrid 
          systemData={systemState} 
          heartbeats={sensorHeartbeats}
          now={now}
          onReset={handleReset} 
        />

        {/* SECTION 2: ANALYTIC KPIs - Independent Data Binding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard title="NH₃ Level" subtitle="Ammonia" value={getDisplayValue(data.nh3, 'mq137')} unit="ppm" color={GAS_COLORS.nh3} />
          <KpiCard title="CO₂ Level" subtitle="Carbon Dioxide" value={getDisplayValue(data.co2, 'scd41')} unit="ppm" color={GAS_COLORS.co2} />
          <KpiCard title="VOC LEVEL" subtitle="volatile organic compounds" value={getDisplayValue(data.voc, 'mq135')} unit="ppm" color={GAS_COLORS.voc} />
          <KpiCard title="Load Weight" subtitle="Total Load" value={getDisplayValue(data.weight, 'loadcell')} unit="kg" color={GAS_COLORS.so2} />
          <KpiCard title="System Temp" subtitle="Internal" value={getDisplayValue(data.temperature, 'scd41')} unit="°C" color={GAS_COLORS.env} />
          <KpiCard title="Humidity" subtitle="Relative Humidity" value={getDisplayValue(data.humidity, 'scd41')} unit="%" color="#a855f7" />
        </div>

        {/* SECTION 3: MAIN ANALYTICS CHARTS - UNIFORM 2x2 GRID */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-500 ${isEspOnline ? 'opacity-100' : 'opacity-50 grayscale'}`}>
          
          <div className="h-[350px]">
            <GasConcentrationPie data={data} />
          </div>
          
          <div className="h-[350px]">
            <HighestLevelsBarChart data={data} />
          </div>

          <div className="h-[350px]">
             <GasLevelsBarChart history={recentHistory} />
          </div>

          <div className="h-[350px]">
             <EnvLevelsBarChart history={recentHistory} />
          </div>

        </div>

        {/* SECTION 4: SAFETY SUMMARY */}
        <div className={`w-full bg-white dark:bg-[#0f172a]/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/5 p-4 transition-all duration-500 shadow-sm dark:shadow-md ${isEspOnline ? 'opacity-100' : 'opacity-50'}`}>
            <h3 className="text-slate-600 dark:text-white/70 text-sm font-semibold mb-3 ml-2 uppercase tracking-widest">System Safety Status Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {safetyStatuses.map((status) => (
                <SafetyDonut key={status.gas} statusData={status} />
              ))}
            </div>
        </div>

        {/* SECTION 5: LIVE DATA LOG */}
        <div className={`w-full h-[500px] transition-opacity duration-500 ${isEspOnline ? 'opacity-100' : 'opacity-50 grayscale'}`}>
             <LiveReadingsTable history={fullHistory} />
        </div>

      </div>
    </div>
  );
};

export default App;