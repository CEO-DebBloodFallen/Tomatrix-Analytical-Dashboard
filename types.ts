import React from 'react';

// Polyfill for missing JSX.IntrinsicElements in the environment
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export interface SensorReading {
  id: string;
  timestamp: string;
  nh3: number; // ppm
  co2: number; // ppm
  voc: number; // ppb
  so2: number; // ppb
  temperature: number; // Celsius
  humidity: number; // %
  weight: number; // kg (system load)
}

export type GasType = 'NH3' | 'CO2' | 'VOC' | 'SO2' | 'Env' | 'All';

export interface SafetyStatus {
  gas: string;
  value: number;
  status: 'Safe' | 'Warning' | 'Critical';
  color: string;
}

// New Interface for the IoT Hardware Status
export interface IoTSystemState {
  esp32_status: boolean;
  esp32_last_update: number; // Unix timestamp
  mq137: number;
  mq135: number;
  scd41: {
    co2: number;
    temperature: number;
    humidity: number;
  };
  loadcell: number;
  servo: boolean;
  uvc: boolean;
  battery: number;
}

export interface SensorHeartbeats {
  esp32: number;
  mq137: number;
  mq135: number;
  scd41: number;
  loadcell: number;
  servo: number;
  uvc: number;
}

export const GAS_COLORS = {
  nh3: '#06b6d4',
  co2: '#3b82f6',
  voc: '#f97316',
  so2: '#ef4444',
  env: '#14b8a6',
  text: '#ffffff',
  grid: 'rgba(255,255,255,0.1)',
};