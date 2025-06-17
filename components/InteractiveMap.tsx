import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { MapPin, Navigation, Clock, Route as RouteIcon, Plus, X, Locate } from 'lucide-react-native';
import LeafletMap from './LeafletMap';
import * as Location from 'expo-location';

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

interface Location {
  name: string;
  coordinates: { x: number; y: number };
}

interface InteractiveMapProps {
  showRoutes?: boolean;
  selectedRoute?: string;
  onRouteSelect?: (routeId: string) => void;
  currentLocation?: string;
}

// Predefined locations for the demo
const predefinedLocations: Location[] = [
  { name: 'Downtown District', coordinates: { x: -1.9441, y: 30.0619 } },
  { name: 'Kigali Heights', coordinates: { x: -1.9471, y: 30.0651 } },
  { name: 'Kacyiru', coordinates: { x: -1.9445, y: 30.0622 } },
  { name: 'Kimihurura', coordinates: { x: -1.9452, y: 30.0631 } },
  { name: 'Remera', coordinates: { x: -1.9458, y: 30.0639 } },
  { name: 'Nyamirambo', coordinates: { x: -1.9465, y: 30.0645 } },
  { name: 'Kigali Convention Centre', coordinates: { x: -1.9550, y: 30.0940 } },
  { name: 'Kigali International Airport', coordinates: { x: -1.9686, y: 30.1344 } },
  { name: 'Nyabugogo Bus Station', coordinates: { x: -1.9367, y: 30.0522 } },
  { name: 'Gikondo', coordinates: { x: -1.9667, y: 30.0833 } },
  { name: 'Kicukiro', coordinates: { x: -1.9833, y: 30.0833 } },
  { name: 'Gisozi', coordinates: { x: -1.9333, y: 30.0500 } },
  { name: 'Kanombe', coordinates: { x: -1.9667, y: 30.1167 } },
];

export default function InteractiveMap({
  showRoutes = true,
  selectedRoute,
  onRouteSelect,
  currentLocation = 'Downtown District'
}: InteractiveMapProps) {
  // State for takeoff and drop-off points
  const [takeoffPoint, setTakeoffPoint] = useState<Location | null>(null);
  const [dropoffPoint, setDropoffPoint] = useState<Location | null>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState<'takeoff' | 'dropoff'>('takeoff');
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceLocation, setDeviceLocation] = useState<Location | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Generate routes when both points are selected
  const [routes, setRoutes] = useState<MapRoute[]>([]);
  
  // Request location permission when component mounts
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use your current location');
        return;
      }
      
      // Get current location once permission is granted
      getCurrentLocation();
    })();
  }, []);
  
  // Generate routes when both takeoff and dropoff points are set
  useEffect(() => {
    if (takeoffPoint && dropoffPoint) {
      generateRoutes(takeoffPoint, dropoffPoint);
    }
  }, [takeoffPoint, dropoffPoint]);
  
  // Function to get current device location
  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      const currentLoc: Location = {
        name: 'Current Location',
        coordinates: { 
          x: location.coords.latitude, 
          y: location.coords.longitude 
        }
      };
      setDeviceLocation(currentLoc);
      
      // Automatically set as takeoff point if none is selected
      if (!takeoffPoint) {
        setTakeoffPoint(currentLoc);
      }
      
      setLocationLoading(false);
    } catch (error) {
      setLocationLoading(false);
      Alert.alert('Error', 'Could not get your current location');
      console.error(error);
    }
  };
  
  // Function to generate routes between two points
  const generateRoutes = (start: Location, end: Location) => {
    // Create three different routes between the points
    const newRoutes: MapRoute[] = [
      {
        id: 'route-1',
        name: 'Fastest Route',
        coordinates: [
          start.coordinates,
          { x: start.coordinates.x + 0.0004, y: start.coordinates.y + 0.0003 },
          { x: start.coordinates.x + 0.0011, y: start.coordinates.y + 0.0012 },
          { x: end.coordinates.x - 0.0007, y: end.coordinates.y - 0.0006 },
          end.coordinates,
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
          start.coordinates,
          { x: start.coordinates.x + 0.0007, y: start.coordinates.y + 0.0006 },
          { x: start.coordinates.x + 0.0014, y: start.coordinates.y + 0.0016 },
          { x: end.coordinates.x - 0.0004, y: end.coordinates.y - 0.0003 },
          end.coordinates,
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
          start.coordinates,
          { x: start.coordinates.x + 0.0005, y: start.coordinates.y + 0.0009 },
          { x: start.coordinates.x + 0.0012, y: start.coordinates.y + 0.0018 },
          { x: end.coordinates.x - 0.0007, y: end.coordinates.y - 0.0004 },
          end.coordinates,
        ],
        color: '#F59E0B',
        trafficLevel: 'high',
        estimatedTime: '26 min',
        distance: '11.8 km',
      },
    ];
    
    setRoutes(newRoutes);
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#EF4444';
      case 'moderate': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };
  
  // Search for locations using Nominatim API (OpenStreetMap)
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      // Add "Kigali" to the search query to focus on Kigali area
      const searchTerm = `${query}, Kigali, Rwanda`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&limit=5`
      );
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      // Transform the results to our Location format
      const locations: Location[] = data.map((item: any) => ({
        name: item.display_name.split(',')[0],
        coordinates: { x: parseFloat(item.lat), y: parseFloat(item.lon) },
        fullName: item.display_name
      }));
      
      setSearchResults(locations);
    } catch (error) {
      console.error('Error searching for locations:', error);
      Alert.alert('Error', 'Could not search for locations');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        searchLocations(searchQuery);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Filter predefined locations based on search query
  const filteredLocations = predefinedLocations.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle location selection
  const handleLocationSelect = (location: Location) => {
    if (selectingFor === 'takeoff') {
      setTakeoffPoint(location);
    } else {
      setDropoffPoint(location);
    }
    setLocationModalVisible(false);
    setSearchQuery('');
  };
  
  // Open location selection modal
  const openLocationModal = (type: 'takeoff' | 'dropoff') => {
    setSelectingFor(type);
    setLocationModalVisible(true);
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
      
      {/* Route Selection Points */}
      <View style={styles.routePointsContainer}>
        <View style={styles.routePoint}>
          <View style={styles.routePointIcon}>
            <MapPin size={16} color="#3B82F6" />
          </View>
          <TouchableOpacity 
            style={styles.routePointInput}
            onPress={() => openLocationModal('takeoff')}
          >
            <Text style={takeoffPoint ? styles.routePointText : styles.routePointPlaceholder}>
              {takeoffPoint ? takeoffPoint.name : 'Select takeoff point'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={locationLoading}
          >
            <Locate size={16} color={locationLoading ? "#9CA3AF" : "#3B82F6"} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.routePoint}>
          <View style={styles.routePointIcon}>
            <MapPin size={16} color="#EF4444" />
          </View>
          <TouchableOpacity 
            style={styles.routePointInput}
            onPress={() => openLocationModal('dropoff')}
          >
            <Text style={dropoffPoint ? styles.routePointText : styles.routePointPlaceholder}>
              {dropoffPoint ? dropoffPoint.name : 'Select drop-off point'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Interactive Map Area */}
      <View style={styles.mapContainer}>
        {/* Use Leaflet Map */}
        <LeafletMap 
          showRoutes={showRoutes && routes.length > 0}
          trafficLevel={selectedRoute ? 
            routes.find(r => r.id === selectedRoute)?.trafficLevel || 'moderate' : 
            'moderate'
          }
          initialPosition={takeoffPoint ? [takeoffPoint.coordinates.x, takeoffPoint.coordinates.y] : [-1.944, 30.061]}
          takeoffPoint={takeoffPoint?.coordinates}
          dropoffPoint={dropoffPoint?.coordinates}
          selectedRouteId={selectedRoute}
        />
      </View>
      
      {/* Route Selection */}
      {showRoutes && routes.length > 0 && takeoffPoint && dropoffPoint ? (
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
      ) : showRoutes && (!takeoffPoint || !dropoffPoint) ? (
        <View style={styles.noRoutesContainer}>
          <Text style={styles.noRoutesText}>
            {!takeoffPoint && !dropoffPoint 
              ? 'Select takeoff and drop-off points to see available routes'
              : !takeoffPoint 
                ? 'Select takeoff point to see available routes' 
                : 'Select drop-off point to see available routes'}
          </Text>
        </View>
      ) : null}

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
        
        {showRoutes && routes.length > 0 && (
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
      
      {/* Location Selection Modal */}
      <Modal
        visible={locationModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {selectingFor === 'takeoff' ? 'Takeoff' : 'Drop-off'} Point
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setLocationModalVisible(false)}
              >
                <X size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchInputContainer}>
              <MapPin size={16} color="#9CA3AF" style={styles.searchInputIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a destination in Kigali..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                >
                  <X size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
            
            <ScrollView style={styles.locationsList}>
              {selectingFor === 'takeoff' && (
                <TouchableOpacity
                  style={[styles.locationItem, styles.currentLocationItem]}
                  onPress={() => deviceLocation ? handleLocationSelect(deviceLocation) : getCurrentLocation()}
                  disabled={locationLoading && !deviceLocation}
                >
                  <Locate size={16} color="#3B82F6" />
                  <Text style={styles.locationItemText}>
                    {locationLoading && !deviceLocation ? 'Getting location...' : 'Use current location'}
                  </Text>
                </TouchableOpacity>
              )}
              
              {isSearching && (
                <View style={styles.searchingContainer}>
                  <Text style={styles.searchingText}>Searching...</Text>
                </View>
              )}
              
              {searchQuery.length > 2 && searchResults.length > 0 && (
                <View style={styles.searchResultsContainer}>
                  <Text style={styles.searchResultsTitle}>Search Results</Text>
                  {searchResults.map((location, index) => (
                    <TouchableOpacity
                      key={`search-${index}`}
                      style={[styles.locationItem, styles.searchResultItem]}
                      onPress={() => handleLocationSelect(location)}
                    >
                      <MapPin size={16} color="#3B82F6" />
                      <View style={styles.searchResultTextContainer}>
                        <Text style={styles.locationItemText}>{location.name}</Text>
                        {location.name && (
                          <Text style={styles.searchResultSubtext}>
                            {location.name.split(',').slice(1, 3).join(',')}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {searchQuery.length > 0 && searchResults.length === 0 && !isSearching && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No results found. Try a different search.</Text>
                </View>
              )}
              
              <View style={styles.predefinedLocationsContainer}>
                <Text style={styles.predefinedLocationsTitle}>Popular Locations</Text>
                {filteredLocations.map((location) => (
                  <TouchableOpacity
                    key={location.name}
                    style={styles.locationItem}
                    onPress={() => handleLocationSelect(location)}
                  >
                    <MapPin size={16} color="#3B82F6" />
                    <Text style={styles.locationItemText}>{location.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  routePointsContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routePointIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routePointInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  routePointText: {
    fontSize: 14,
    color: '#374151',
  },
  routePointPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInputIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  locationsList: {
    maxHeight: 300,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  currentLocationItem: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchingContainer: {
    padding: 12,
    alignItems: 'center',
  },
  searchingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  searchResultsContainer: {
    marginBottom: 16,
  },
  searchResultsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  searchResultItem: {
    backgroundColor: '#F3F4F6',
  },
  searchResultTextContainer: {
    flex: 1,
  },
  searchResultSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  noResultsContainer: {
    padding: 12,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#6B7280',
    fontSize: 14,
  },
  predefinedLocationsContainer: {
    marginTop: 8,
  },
  predefinedLocationsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  locationItemText: {
    fontSize: 16,
    color: '#374151',
  },
  noRoutesContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noRoutesText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
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
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: -12,
    marginTop: -12,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeSelector: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  routeSelectorContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  routeOption: {
    width: screenWidth * 0.7,
    maxWidth: 280,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  routeOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  routeOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  routeColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeOptionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  routeOptionMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  routeMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeMetricText: {
    fontSize: 14,
    color: '#4B5563',
  },
  trafficLevelIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  trafficLevelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mapLegend: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendSection: {
    marginBottom: 12,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});