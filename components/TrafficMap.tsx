import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MapPin, Navigation } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface TrafficMapProps {
  currentLocation?: string;
  showRoutes?: boolean;
  trafficLevel?: 'low' | 'moderate' | 'high';
}

export default function TrafficMap({ 
  currentLocation = 'Downtown District',
  showRoutes = false,
  trafficLevel = 'moderate'
}: TrafficMapProps) {
  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'low': return '#10B981';
      case 'moderate': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapHeader}>
        <View style={styles.locationInfo}>
          <MapPin size={16} color="#3B82F6" />
          <Text style={styles.locationText}>{currentLocation}</Text>
        </View>
        {showRoutes && (
          <Navigation size={16} color="#3B82F6" />
        )}
      </View>
      
      {/* Simulated Map Area */}
      <View style={styles.mapArea}>
        <View style={styles.mapGrid}>
          {/* Road simulation */}
          <View style={[styles.road, styles.horizontalRoad]} />
          <View style={[styles.road, styles.verticalRoad]} />
          
          {/* Traffic indicators */}
          <View style={[
            styles.trafficIndicator,
            { backgroundColor: getTrafficColor(trafficLevel) },
            styles.indicator1
          ]} />
          <View style={[
            styles.trafficIndicator,
            { backgroundColor: '#10B981' },
            styles.indicator2
          ]} />
          <View style={[
            styles.trafficIndicator,
            { backgroundColor: '#EF4444' },
            styles.indicator3
          ]} />
          
          {/* Current location marker */}
          <View style={styles.currentLocationMarker}>
            <View style={styles.locationPulse} />
            <View style={styles.locationCenter} />
          </View>
        </View>
        
        <Text style={styles.mapPlaceholder}>
          Interactive map view{'\n'}
          (Simulated for web compatibility)
        </Text>
      </View>
      
      <View style={styles.mapLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Low Traffic</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Moderate</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Heavy</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  mapArea: {
    height: 200,
    position: 'relative',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapGrid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  road: {
    position: 'absolute',
    backgroundColor: '#D1D5DB',
  },
  horizontalRoad: {
    width: '100%',
    height: 3,
    top: '50%',
    left: 0,
  },
  verticalRoad: {
    width: 3,
    height: '100%',
    left: '50%',
    top: 0,
  },
  trafficIndicator: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicator1: {
    top: '30%',
    left: '20%',
  },
  indicator2: {
    top: '70%',
    left: '60%',
  },
  indicator3: {
    top: '40%',
    left: '80%',
  },
  currentLocationMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 20,
    height: 20,
    marginTop: -10,
    marginLeft: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    opacity: 0.3,
  },
  locationCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  mapPlaceholder: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
});