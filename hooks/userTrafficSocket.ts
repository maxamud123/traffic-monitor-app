import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'http://10.181.63.240:5000'; // Use your machine's LAN IP address

export interface TrafficPayload {
  roadSegmentId: string;
  timestamp: string;
  vehicleCount: number;
  averageSpeedKph: number;
  congestionLevel: 'low' | 'medium' | 'high';
}

export function useTrafficSocket() {
  const [trafficData, setTrafficData] = useState<TrafficPayload[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Attempting to connect to Socket.IO server at:', SOCKET_URL);
    const socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socket.on('connect', () => {
      console.log('📶 Connected to Socket.IO server with ID:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error.message);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    socket.on('traffic_update', (data: TrafficPayload) => {
      console.log('📊 Received traffic update:', data);
      setTrafficData(prev => {
        // If we receive an array, replace the current data
        if (Array.isArray(data)) {
          return data;
        }
        // Otherwise add the new data point
        return [...prev, data];
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from Socket.IO server:', reason);
      setIsConnected(false);
    });

    return () => {
      console.log('Cleaning up Socket.IO connection');
      socket.disconnect();
    };
  }, []);

  return { trafficData, isConnected, connectionError };
}
