// Shared types used across the app

export type CongestionLevel = 'low' | 'medium' | 'high';

export interface TrafficPayload {
  roadSegmentId: string;
  timestamp: string;
  vehicleCount: number;
  averageSpeedKph: number;
  congestionLevel: CongestionLevel;
}

export interface TrafficAlert {
  _id: string;
  type: 'accident' | 'construction' | 'congestion' | 'weather' | 'event';
  severity: 'low' | 'moderate' | 'high';
  title: string;
  description: string;
  location: string;
  timestamp: string;
  estimatedDelay: string;
  isRead: boolean;
  status: 'active' | 'resolved';
}

export interface TrafficData {
  currentSpeed: number;
  averageSpeed: number;
  congestionLevel: CongestionLevel;
  estimatedDelay: number;
  activeAlerts: number;
}

export interface SensorReading {
  timestamp: Date;
  vehicleCount: number;
  averageSpeed: number;
  densityLevel: number;
}
