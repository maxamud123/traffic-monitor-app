import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { TrafficPayload } from '@/types';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export function useTrafficSocket() {
  const [trafficData, setTrafficData] = useState<TrafficPayload[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    console.log('Attempting to connect to Socket.IO server at:', SOCKET_URL);

    const socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('📶 Connected to Socket.IO server with ID:', socket.id);
      setIsConnected(true);
      setIsReconnecting(false);
      setConnectionError(null);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error.message);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    socket.on('reconnect_attempt', () => {
      setIsReconnecting(true);
    });

    socket.on('reconnect_failed', () => {
      setIsReconnecting(false);
      setConnectionError('Unable to connect to server. Check your network.');
    });

    socket.on('traffic_update', (data: TrafficPayload | TrafficPayload[]) => {
      console.log('📊 Received traffic update:', data);
      setTrafficData((prev) => {
        if (Array.isArray(data)) return data;
        return [data, ...prev].slice(0, 50); // keep last 50 readings
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

  return { trafficData, isConnected, connectionError, isReconnecting };
}
