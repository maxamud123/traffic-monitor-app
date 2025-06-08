import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navigation, Clock, MapPin, Route, Zap, TrendingUp, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import InteractiveMap from '@/components/InteractiveMap';

interface RouteOption {
  id: string;
  name: string;
  distance: string;
  estimatedTime: string;
  trafficLevel: 'low' | 'moderate' | 'high';
  savings: string;
  highlights: string[];
}

interface Destination {
  name: string;
  address: string;
  estimatedTime: string;
}

export default function Routes() {
  const [selectedRoute, setSelectedRoute] = useState<string>('route-1');
  const [destinations, setDestinations] = useState<Destination[]>([
    {
      name: 'Downtown Office',
      address: '123 Business Ave',
      estimatedTime: '25 min',
    },
    {
      name: 'Shopping Center',
      address: '456 Mall Road',
      estimatedTime: '18 min',
    },
    {
      name: 'Airport Terminal',
      address: '789 Aviation Blvd',
      estimatedTime: '45 min',
    },
  ]);

  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([
    {
      id: 'route-1',
      name: 'Fastest Route',
      distance: '12.5 km',
      estimatedTime: '22 min',
      trafficLevel: 'moderate',
      savings: '8 min faster',
      highlights: ['Highway access', 'Light traffic', 'Toll road'],
    },
    {
      id: 'route-2',
      name: 'Scenic Route',
      distance: '15.2 km',
      estimatedTime: '28 min',
      trafficLevel: 'low',
      savings: 'Most relaxing',
      highlights: ['City center', 'No tolls', 'Smooth roads'],
    },
    {
      id: 'route-3',
      name: 'Economy Route',
      distance: '11.8 km',
      estimatedTime: '26 min',
      trafficLevel: 'high',
      savings: 'Cheapest option',
      highlights: ['No tolls', 'Heavy traffic', 'Multiple stops'],
    },
  ]);

  const handleRouteSelect = (routeId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedRoute(routeId);
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'low': return '#10B981';
      case 'moderate': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTrafficIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle size={16} color="#10B981" />;
      case 'moderate': return <Clock size={16} color="#F59E0B" />;
      case 'high': return <AlertTriangle size={16} color="#EF4444" />;
      default: return <Clock size={16} color="#6B7280" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Route Planning</Text>
          <Text style={styles.subtitle}>Find the best route for your journey</Text>
        </View>

        {/* Interactive Map */}
        <View style={styles.mapSection}>
          <InteractiveMap
            showRoutes={true}
            selectedRoute={selectedRoute}
            onRouteSelect={handleRouteSelect}
            currentLocation="Downtown District"
          />
        </View>

        {/* Quick Destinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Destinations</Text>
          <View style={styles.destinationsContainer}>
            {destinations.map((destination, index) => (
              <TouchableOpacity
                key={index}
                style={styles.destinationCard}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <View style={styles.destinationIcon}>
                  <MapPin size={20} color="#3B82F6" />
                </View>
                <View style={styles.destinationInfo}>
                  <Text style={styles.destinationName}>{destination.name}</Text>
                  <Text style={styles.destinationAddress}>{destination.address}</Text>
                </View>
                <View style={styles.destinationTime}>
                  <Text style={styles.destinationTimeText}>{destination.estimatedTime}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Current Route Options */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Route Options</Text>
            <View style={styles.routeCount}>
              <Text style={styles.routeCountText}>{routeOptions.length} routes</Text>
            </View>
          </View>

          <View style={styles.routesContainer}>
            {routeOptions.map((route) => (
              <TouchableOpacity
                key={route.id}
                style={[
                  styles.routeCard,
                  selectedRoute === route.id && styles.routeCardSelected,
                ]}
                onPress={() => handleRouteSelect(route.id)}
              >
                <View style={styles.routeHeader}>
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeName}>{route.name}</Text>
                    <View style={styles.routeMetrics}>
                      <Text style={styles.routeDistance}>{route.distance}</Text>
                      <Text style={styles.routeSeparator}>•</Text>
                      <Text style={styles.routeTime}>{route.estimatedTime}</Text>
                    </View>
                  </View>
                  <View style={styles.trafficIndicator}>
                    {getTrafficIcon(route.trafficLevel)}
                  </View>
                </View>

                <View style={styles.routeSavings}>
                  <Zap size={14} color="#3B82F6" />
                  <Text style={styles.routeSavingsText}>{route.savings}</Text>
                </View>

                <View style={styles.routeHighlights}>
                  {route.highlights.map((highlight, index) => (
                    <View key={index} style={styles.highlight}>
                      <Text style={styles.highlightText}>{highlight}</Text>
                    </View>
                  ))}
                </View>

                {selectedRoute === route.id && (
                  <TouchableOpacity style={styles.startButton}>
                    <Navigation size={16} color="#FFFFFF" />
                    <Text style={styles.startButtonText}>Start Navigation</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Traffic Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Traffic Analysis</Text>
          <View style={styles.analysisCard}>
            <View style={styles.analysisHeader}>
              <TrendingUp size={20} color="#3B82F6" />
              <Text style={styles.analysisTitle}>Current Conditions</Text>
            </View>
            
            <View style={styles.analysisGrid}>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisValue}>+15%</Text>
                <Text style={styles.analysisLabel}>Speed vs Average</Text>
              </View>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisValue}>2.3x</Text>
                <Text style={styles.analysisLabel}>Normal Traffic</Text>
              </View>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisValue}>5 min</Text>
                <Text style={styles.analysisLabel}>Delay Expected</Text>
              </View>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisValue}>78%</Text>
                <Text style={styles.analysisLabel}>Accuracy Rate</Text>
              </View>
            </View>

            <View style={styles.recommendationBox}>
              <View style={styles.recommendationIcon}>
                <CheckCircle size={16} color="#10B981" />
              </View>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>Best Time to Leave</Text>
                <Text style={styles.recommendationText}>
                  Leave in 15 minutes to avoid peak traffic and save 12 minutes
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Route History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Routes</Text>
          <View style={styles.historyContainer}>
            <View style={styles.historyItem}>
              <View style={styles.historyIcon}>
                <Route size={16} color="#6B7280" />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyDestination}>Downtown Office</Text>
                <Text style={styles.historyDetails}>15.2 km • 28 min • 2 hours ago</Text>
              </View>
              <TouchableOpacity style={styles.repeatButton}>
                <Text style={styles.repeatButtonText}>Repeat</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.historyItem}>
              <View style={styles.historyIcon}>
                <Route size={16} color="#6B7280" />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyDestination}>Shopping Center</Text>
                <Text style={styles.historyDetails}>8.7 km • 18 min • Yesterday</Text>
              </View>
              <TouchableOpacity style={styles.repeatButton}>
                <Text style={styles.repeatButtonText}>Repeat</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.historyItem}>
              <View style={styles.historyIcon}>
                <Route size={16} color="#6B7280" />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyDestination}>Airport Terminal</Text>
                <Text style={styles.historyDetails}>42.1 km • 55 min • 3 days ago</Text>
              </View>
              <TouchableOpacity style={styles.repeatButton}>
                <Text style={styles.repeatButtonText}>Repeat</Text>
              </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  mapSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  routeCount: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  routeCountText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  destinationsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  destinationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  destinationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  destinationAddress: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  destinationTime: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  destinationTimeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  routesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  routeCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#FEFEFE',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  routeMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeDistance: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  routeSeparator: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  routeTime: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  trafficIndicator: {
    padding: 4,
  },
  routeSavings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  routeSavingsText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  routeHighlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  highlight: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  highlightText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  startButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  startButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  analysisCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  analysisItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  analysisValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  analysisLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  recommendationBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
  },
  recommendationIcon: {
    marginTop: 2,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#166534',
    marginBottom: 2,
  },
  recommendationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#15803D',
  },
  historyContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyDestination: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  historyDetails: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  repeatButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  repeatButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
});