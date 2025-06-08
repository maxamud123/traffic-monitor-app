import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MapPin, Navigation, Zap, Clock, Route as RouteIcon } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface MapRoute {
  id: string;
  name: string;
  coordinates: { x: number; y: number }[];
  color: string;
  trafficLevel: 'low' | 'moderate' | 'high';
  estimatedTime: string;
  distance: string;
}

interface TrafficPoint {
  id: string;
  x: number;
  y: number;
  severity: 'low' | 'moderate' | 'high';
  type: 'accident' | 'construction' | 'congestion';
}

interface InteractiveMapProps {
  showRoutes?: boolean;
  selectedRoute?: string;
  onRouteSelect?: (routeId: string) => void;
  currentLocation?: string;
}

export default function InteractiveMap({
  showRoutes = true,
  selectedRoute,
  onRouteSelect,
  currentLocation = 'Downtown District'
}: InteractiveMapProps) {
  const [routes] = useState<MapRoute[]>([
    {
      id: 'route-1',
      name: 'Fastest Route',
      coordinates: [
        { x: 20, y: 80 },
        { x: 35, y: 65 },
        { x: 50, y: 50 },
        { x: 65, y: 35 },
        { x: 80, y: 20 },
      ],
      color: '#3B82F6',
      trafficLevel: 'moderate',
      estimatedTime: '22 min',
      distance: '12.5 km',
    },
    {
      id: 'route-2',
      name: 'Scenic Route',
      coordinates: [
        { x: 20, y: 80 },
        { x: 25, y: 70 },
        { x: 40, y: 60 },
        { x: 60, y: 45 },
        { x: 75, y: 30 },
        { x: 80, y: 20 },
      ],
      color: '#10B981',
      trafficLevel: 'low',
      estimatedTime: '28 min',
      distance: '15.2 km',
    },
    {
      id: 'route-3',
      name: 'Economy Route',
      coordinates: [
        { x: 20, y: 80 },
        { x: 30, y: 75 },
        { x: 45, y: 70 },
        { x: 55, y: 60 },
        { x: 70, y: 40 },
        { x: 80, y: 20 },
      ],
      color: '#F59E0B',
      trafficLevel: 'high',
      estimatedTime: '26 min',
      distance: '11.8 km',
    },
  ]);

  const [trafficPoints] = useState<TrafficPoint[]>([
    { id: '1', x: 35, y: 65, severity: 'high', type: 'accident' },
    { id: '2', x: 55, y: 45, severity: 'moderate', type: 'construction' },
    { id: '3', x: 70, y: 30, severity: 'low', type: 'congestion' },
    { id: '4', x: 40, y: 55, severity: 'moderate', type: 'congestion' },
  ]);

  const [animatedPoints, setAnimatedPoints] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPoints(prev => {
        const newState = { ...prev };
        trafficPoints.forEach(point => {
          if (point.severity === 'high') {
            newState[point.id] = !prev[point.id];
          }
        });
        return newState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [trafficPoints]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#EF4444';
      case 'moderate': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const renderRoute = (route: MapRoute) => {
    const isSelected = selectedRoute === route.id;
    const strokeWidth = isSelected ? 4 : 2;
    const opacity = selectedRoute && !isSelected ? 0.3 : 1;

    return (
      <View key={route.id} style={StyleSheet.absoluteFill}>
        {route.coordinates.map((point, index) => {
          if (index === route.coordinates.length - 1) return null;
          
          const nextPoint = route.coordinates[index + 1];
          const length = Math.sqrt(
            Math.pow((nextPoint.x - point.x) * 2.5, 2) + 
            Math.pow((nextPoint.y - point.y) * 2.5, 2)
          );
          const angle = Math.atan2(
            (nextPoint.y - point.y) * 2.5,
            (nextPoint.x - point.x) * 2.5
          ) * (180 / Math.PI);

          return (
            <View
              key={`${route.id}-${index}`}
              style={[
                styles.routeSegment,
                {
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  width: length,
                  height: strokeWidth,
                  backgroundColor: route.color,
                  opacity,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Map Header */}
      <View style={styles.mapHeader}>
        <View style={styles.locationInfo}>
          <MapPin size={16} color="#3B82F6" />
          <Text style={styles.locationText}>{currentLocation}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Navigation size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Interactive Map Area */}
      <View style={styles.mapContainer}>
        <View style={styles.mapArea}>
          {/* Grid Background */}
          <View style={styles.gridBackground}>
            {Array.from({ length: 10 }).map((_, i) => (
              <View key={`h-${i}`} style={[styles.gridLine, styles.horizontalLine, { top: `${i * 10}%` }]} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <View key={`v-${i}`} style={[styles.gridLine, styles.verticalLine, { left: `${i * 10}%` }]} />
            ))}
          </View>

          {/* Main Roads */}
          <View style={[styles.mainRoad, styles.horizontalRoad, { top: '30%' }]} />
          <View style={[styles.mainRoad, styles.horizontalRoad, { top: '70%' }]} />
          <View style={[styles.mainRoad, styles.verticalRoad, { left: '40%' }]} />
          <View style={[styles.mainRoad, styles.verticalRoad, { left: '60%' }]} />

          {/* Routes */}
          {showRoutes && routes.map(renderRoute)}

          {/* Traffic Points */}
          {trafficPoints.map((point) => (
            <View
              key={point.id}
              style={[
                styles.trafficPoint,
                {
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  backgroundColor: getSeverityColor(point.severity),
                  transform: [
                    { scale: animatedPoints[point.id] && point.severity === 'high' ? 1.3 : 1 }
                  ],
                },
              ]}
            >
              <View style={[
                styles.trafficPulse,
                {
                  backgroundColor: getSeverityColor(point.severity),
                  opacity: animatedPoints[point.id] ? 0.3 : 0,
                }
              ]} />
            </View>
          ))}

          {/* Start Location */}
          <View style={[styles.locationMarker, styles.startLocation, { left: '20%', top: '80%' }]}>
            <View style={styles.locationCenter} />
            <View style={styles.locationPulse} />
          </View>

          {/* End Location */}
          <View style={[styles.locationMarker, styles.endLocation, { left: '80%', top: '20%' }]}>
            <View style={styles.locationCenter} />
          </View>

          {/* Distance Indicators */}
          <View style={[styles.distanceIndicator, { left: '50%', top: '35%' }]}>
            <Text style={styles.distanceText}>2.5 km</Text>
          </View>
        </View>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlText}>-</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Route Selection */}
      {showRoutes && (
        <ScrollView 
          horizontal 
          style={styles.routeSelector}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.routeSelectorContent}
        >
          {routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={[
                styles.routeOption,
                selectedRoute === route.id && styles.routeOptionSelected,
              ]}
              onPress={() => onRouteSelect?.(route.id)}
            >
              <View style={styles.routeOptionHeader}>
                <View style={[styles.routeColorIndicator, { backgroundColor: route.color }]} />
                <Text style={styles.routeOptionName}>{route.name}</Text>
              </View>
              <View style={styles.routeOptionMetrics}>
                <View style={styles.routeMetric}>
                  <Clock size={12} color="#6B7280" />
                  <Text style={styles.routeMetricText}>{route.estimatedTime}</Text>
                </View>
                <View style={styles.routeMetric}>
                  <RouteIcon size={12} color="#6B7280" />
                  <Text style={styles.routeMetricText}>{route.distance}</Text>
                </View>
              </View>
              <View style={[
                styles.trafficLevelIndicator,
                { backgroundColor: getSeverityColor(route.trafficLevel) }
              ]}>
                <Text style={styles.trafficLevelText}>
                  {route.trafficLevel.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Map Legend */}
      <View style={styles.mapLegend}>
        <View style={styles.legendSection}>
          <Text style={styles.legendTitle}>Traffic</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Light</Text>
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
        
        {showRoutes && (
          <View style={styles.legendSection}>
            <Text style={styles.legendTitle}>Routes</Text>
            <View style={styles.legendItems}>
              {routes.slice(0, 3).map((route) => (
                <View key={route.id} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: route.color }]} />
                  <Text style={styles.legendText}>{route.name.split(' ')[0]}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  mapContainer: {
    position: 'relative',
  },
  mapArea: {
    height: 300,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    overflow: 'hidden',
  },
  gridBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#E2E8F0',
  },
  horizontalLine: {
    width: '100%',
    height: 1,
  },
  verticalLine: {
    height: '100%',
    width: 1,
  },
  mainRoad: {
    position: 'absolute',
    backgroundColor: '#CBD5E1',
  },
  horizontalRoad: {
    width: '100%',
    height: 4,
  },
  verticalRoad: {
    height: '100%',
    width: 4,
  },
  routeSegment: {
    position: 'absolute',
    borderRadius: 2,
  },
  trafficPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -6,
    marginTop: -6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  trafficPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    marginTop: -10,
  },
  locationMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startLocation: {},
  endLocation: {},
  locationCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  locationPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    opacity: 0.3,
  },
  distanceIndicator: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: -20,
    marginTop: -10,
  },
  distanceText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: 16,
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  controlText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#374151',
  },
  routeSelector: {
    maxHeight: 120,
  },
  routeSelectorContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  routeOption: {
    width: 140,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  routeOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  routeOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  routeColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeOptionName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    flex: 1,
  },
  routeOptionMetrics: {
    gap: 4,
    marginBottom: 8,
  },
  routeMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeMetricText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  trafficLevelIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  trafficLevelText: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendSection: {
    flex: 1,
  },
  legendTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 6,
  },
  legendItems: {
    flexDirection: 'row',
    gap: 8,
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