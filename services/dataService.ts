import { SensorReading, SafetyStatus, GAS_COLORS } from '../types';

// Helper to generate random number within range
const random = (min: number, max: number) => Math.random() * (max - min) + min;

// Initial baseline values
let currentData: SensorReading = {
  id: 'init',
  timestamp: new Date().toLocaleTimeString(),
  nh3: 25,
  co2: 400,
  voc: 50,
  so2: 10,
  temperature: 24,
  humidity: 45,
  weight: 120
};

export const generateReading = (): SensorReading => {
  const now = new Date();
  
  // Drift values slightly to simulate real sensor noise/changes
  currentData = {
    id: now.getTime().toString(),
    timestamp: now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    nh3: Math.max(0, currentData.nh3 + random(-2, 2.5)),
    co2: Math.max(300, currentData.co2 + random(-10, 15)),
    voc: Math.max(0, currentData.voc + random(-5, 5)),
    so2: Math.max(0, currentData.so2 + random(-1, 2)),
    temperature: Math.max(15, Math.min(40, currentData.temperature + random(-0.2, 0.2))),
    humidity: Math.max(20, Math.min(90, currentData.humidity + random(-1, 1))),
    weight: 120 + random(-0.1, 0.1)
  };

  return { ...currentData };
};

export const getSafetyStatus = (reading: SensorReading): SafetyStatus[] => {
  const getStatus = (val: number, warn: number, crit: number): 'Safe' | 'Warning' | 'Critical' => {
    if (val >= crit) return 'Critical';
    if (val >= warn) return 'Warning';
    return 'Safe';
  };

  return [
    { 
      gas: 'NH₃', 
      value: reading.nh3, 
      status: getStatus(reading.nh3, 35, 50),
      color: GAS_COLORS.nh3 
    },
    { 
      gas: 'CO₂', 
      value: reading.co2, 
      status: getStatus(reading.co2, 800, 1200),
      color: GAS_COLORS.co2 
    },
    { 
      gas: 'VOC', 
      value: reading.voc, 
      status: getStatus(reading.voc, 80, 120),
      color: GAS_COLORS.voc 
    },
    { 
      gas: 'Temp', 
      value: reading.temperature, 
      status: getStatus(reading.temperature, 30, 38),
      color: GAS_COLORS.so2 
    },
    { 
      gas: 'Humidity', 
      value: reading.humidity, 
      status: getStatus(reading.humidity, 60, 80),
      color: GAS_COLORS.env 
    },
  ];
};