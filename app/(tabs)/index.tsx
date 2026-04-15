import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Clock, TrendingUp, Zap, Car, CircleAlert as AlertCircle } from 'lucide-react-native';
import InteractiveMap from '@/components/InteractiveMap';
import { useTrafficSocket } from '@/hooks/userTrafficSocket';

const { width: screenWidth } = Dimensions.get('window');

interface TrafficData {
  currentSpeed: number;
  averageSpeed: number;
  congestionLevel: 'low' | 'moderate' | 'high';
  estimatedDelay: number;
  activeAlerts: number;
}

interface SensorReading {
  timestamp: Date;
  vehicleCount: number;
  averageSpeed: number;
  densityLevel: number;
}

export default function Dashboard() {
  const { trafficData: tdata, isConnected, connectionError, isReconnecting } = useTrafficSocket();
  const [trafficData, setTrafficData] = useState<TrafficData>({
    currentSpeed: 45,
    averageSpeed: 38,
    congestionLevel: 'medium',
    estimatedDelay: 12,
    activeAlerts: 3,
  });

  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Downtown District');

  const pulseAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnimation, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const animatedPulseStyle = {
    transform: [{ scale: pulseAnimation.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }],
    opacity: pulseAnimation.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
  };

  // Process real-time sensor data from socket
  useEffect(() => {
    if (tdata.length > 0) {
      console.log('Processing traffic data:', tdata);
      
      // Convert traffic data to sensor readings
      const newReadings: SensorReading[] = tdata.map((data) => ({
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        vehicleCount: data.vehicleCount || 0,
        averageSpeed: data.averageSpeedKph || 0,
        densityLevel: data.congestionLevel === 'high' ? 0.8 : 
                     data.congestionLevel === 'medium' ? 0.5 : 0.2,
      }));
      
      // Update sensor readings
      setSensorReadings(prev => {
        const combined = [...newReadings, ...prev];
        return combined.slice(0, 10); // Keep only the 10 most recent readings
      });
      
      // Update traffic data based on the most recent reading
      if (newReadings.length > 0) {
        const latest = newReadings[0];
        const congestionLevel: 'low' | 'medium' | 'high' =
          latest.averageSpeed > 45 ? 'low' :
          latest.averageSpeed > 30 ? 'medium' : 'high';
          
        setTrafficData({
          currentSpeed: latest.averageSpeed,
          averageSpeed: tdata.reduce((sum, data) => sum + (data.averageSpeedKph || 0), 0) / tdata.length,
          congestionLevel,
          estimatedDelay: congestionLevel === 'high' ? 
            Math.floor(Math.random() * 20) + 15 : 
            Math.floor(Math.random() * 10) + 5,
          activeAlerts: Math.ceil(Math.random() * 5),
        });
      }
    }
  }, [tdata]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTrafficGradient = (level: string) => {
    switch (level) {
      case 'low': return ['#10B981', '#059669'];
      case 'medium': return ['#F59E0B', '#D97706'];
      case 'high': return ['#EF4444', '#DC2626'];
      default: return ['#6B7280', '#4B5563'];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Traffic Monitor</Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.location}>{currentLocation}</Text>
            </View>
            {connectionError && !isReconnecting && (
              <Text style={styles.connectionError}>
                Offline — {connectionError}
              </Text>
            )}
            {isReconnecting && (
              <Text style={styles.reconnecting}>Reconnecting...</Text>
            )}
          </View>
          <Animated.View style={[
            styles.liveIndicator, 
            animatedPulseStyle, 
            !isConnected && styles.disconnected
          ]}>
            <View style={[styles.liveCircle, !isConnected && styles.disconnectedCircle]} />
            <Text style={styles.liveText}>{isConnected ? 'LIVE' : 'OFFLINE'}</Text>
          </Animated.View>
        </View>

        {/* Interactive Map Overview */}
        <View style={styles.mapSection}>
          <InteractiveMap
            showRoutes={false}
            currentLocation={currentLocation}
          />
        </View>

        {/* Current Traffic Status */}
        <LinearGradient
          colors={getTrafficGradient(trafficData.congestionLevel)}
          style={styles.statusCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Current Traffic</Text>
            <Text style={styles.statusLevel}>
              {trafficData.congestionLevel.toUpperCase()}
            </Text>
          </View>
          <View style={styles.statusMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{trafficData.currentSpeed}</Text>
              <Text style={styles.metricLabel}>km/h</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{trafficData.estimatedDelay}</Text>
              <Text style={styles.metricLabel}>min delay</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{parseFloat(`${trafficData.averageSpeed}`).toFixed(2)} km/h</Text>
            <Text style={styles.statLabel}>Avg Speed</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Car size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>
              {sensorReadings[0]?.vehicleCount || 0}
            </Text>
            <Text style={styles.statLabel}>Vehicles/min</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <AlertCircle size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{trafficData.activeAlerts}</Text>
            <Text style={styles.statLabel}>Active Alerts</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Zap size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.statValue}>
              {Math.round((sensorReadings[0]?.densityLevel || 0) * 100)}%
            </Text>
            <Text style={styles.statLabel}>Density</Text>
          </View>
        </View>

        {/* Sensor Readings */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Real-time Sensor Data</Text>
            <View style={styles.updateIndicator}>
              <View style={styles.updateDot} />
              <Text style={styles.updateText}>Live</Text>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sensorReadings}>
              {sensorReadings.slice(0, 6).map((reading, index) => (
                <View key={index} style={styles.sensorCard}>
                  <Text style={styles.sensorTime}>
                    {reading.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                  <View style={styles.sensorMetric}>
                    <Text style={styles.sensorValue}>{reading.vehicleCount}</Text>
                    <Text style={styles.sensorLabel}>vehicles</Text>
                  </View>
                  <View style={styles.sensorMetric}>
                    <Text style={styles.sensorValue}>{reading.averageSpeed}</Text>
                    <Text style={styles.sensorLabel}>km/h</Text>
                  </View>
                  <View style={[
                    styles.densityBar,
                    { backgroundColor: getTrafficColor(
                      reading.densityLevel > 0.7 ? 'high' : 
                      reading.densityLevel > 0.4 ? 'moderate' : 'low'
                    )}
                  ]}>
                    <View 
                      style={[
                        styles.densityFill,
                        { 
                          width: `${reading.densityLevel * 100}%`,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)'
                        }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#FEE2E2' }]}>
                <AlertCircle size={16} color="#EF4444" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Traffic alert on Main St</Text>
                <Text style={styles.activityTime}>2 minutes ago</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#DBEAFE' }]}>
                <TrendingUp size={16} color="#3B82F6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Speed improved by 15%</Text>
                <Text style={styles.activityTime}>5 minutes ago</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#D1FAE5' }]}>
                <Car size={16} color="#10B981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Optimal route suggested</Text>
                <Text style={styles.activityTime}>8 minutes ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  connectionError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  reconnecting: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  disconnected: {
    backgroundColor: '#E5E7EB',
  },
  liveCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  disconnectedCircle: {
    backgroundColor: '#9CA3AF',
  },
  liveText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#EF4444',
  },
  mapSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  statusCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  statusLevel: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusMetrics: {
    flexDirection: 'row',
    gap: 32,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: (screenWidth - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  updateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  updateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  updateText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
  sensorReadings: {
    flexDirection: 'row',
    gap: 12,
  },
  sensorCard: {
    width: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  sensorTime: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  sensorMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  sensorValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  sensorLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  densityBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  densityFill: {
    height: '100%',
    borderRadius: 2,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});