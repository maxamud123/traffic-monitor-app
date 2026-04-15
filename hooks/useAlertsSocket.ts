import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { TrafficAlert } from '@/types';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export function useAlertsSocket() {
  const [alerts, setAlerts] = useState<TrafficAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('connect_error', (error) => {
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // New alert received
    socket.on('traffic_alert', (alert: TrafficAlert) => {
      setAlerts((prev) => [alert, ...prev]);
    });

    // Alert resolved
    socket.on('alert_resolved', (resolved: TrafficAlert) => {
      setAlerts((prev) =>
        prev.map((a) => (a._id === resolved._id ? { ...a, status: 'resolved' } : a))
      );
    });

    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      socket.disconnect();
    };
  }, []);

  const markAsRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, isRead: true } : a)));
  };

  return { alerts, isConnected, connectionError, markAsRead };
}
