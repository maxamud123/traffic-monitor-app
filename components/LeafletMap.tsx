import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTrafficSocket, TrafficPayload } from '@/hooks/userTrafficSocket';

interface LeafletMapProps {
  currentLocation?: string;
  showRoutes?: boolean;
  trafficLevel?: 'low' | 'moderate' | 'high';
  initialPosition?: [number, number];
  initialZoom?: number;
  takeoffPoint?: { x: number; y: number };
  dropoffPoint?: { x: number; y: number };
  selectedRouteId?: string;
}

const initialCenter: { lat: number; lng: number; zoom: number } = {
  lat: -1.944,
  lng: 30.061, 
  zoom: 13,
};

export default function LeafletMap({
  currentLocation = 'Downtown District',
  showRoutes = true,
  trafficLevel = 'moderate',
  initialPosition = [-1.944, 30.061],
  initialZoom = 13,
  takeoffPoint,
  dropoffPoint,
  selectedRouteId
}: LeafletMapProps) {
  const webViewRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { trafficData } = useTrafficSocket();
  const trafficPoints = trafficData.map((data, idx) => ({
    id: `${idx}`,
    lat: getCoordinates(data.roadSegmentId).lat,
    lng: getCoordinates(data.roadSegmentId).lng,
    severity: data.congestionLevel,
    type: 'traffic'
  }));

  // Updated routes data with actual road coordinates
  const routes = [
    {
      id: 'route-1',
      name: 'Fastest Route',
      coordinates: [
        // KN 5 Rd -> KG 11 Ave -> KG 7 Ave
        { x: -1.9441, y: 30.0619 }, // Start at Downtown
        { x: -1.9445, y: 30.0622 }, // Follow KN 5 Rd
        { x: -1.9452, y: 30.0631 }, // Turn onto KG 11 Ave
        { x: -1.9458, y: 30.0639 }, // Continue on KG 11
        { x: -1.9465, y: 30.0645 }, // Turn onto KG 7 Ave
        { x: -1.9471, y: 30.0651 }, // Final destination
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
        // KN 3 Rd -> KG 13 Ave -> KG 9 Ave
        { x: -1.9441, y: 30.0619 },
        { x: -1.9448, y: 30.0625 },
        { x: -1.9455, y: 30.0635 },
        { x: -1.9462, y: 30.0642 },
        { x: -1.9469, y: 30.0648 },
        { x: -1.9475, y: 30.0655 },
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
        // KN 7 Rd -> KG 15 Ave -> KG 5 Ave
        { x: -1.9441, y: 30.0619 },
        { x: -1.9446, y: 30.0628 },
        { x: -1.9453, y: 30.0637 },
        { x: -1.9459, y: 30.0644 },
        { x: -1.9466, y: 30.0649 },
        { x: -1.9473, y: 30.0653 },
      ],
      color: '#F59E0B',
      trafficLevel: 'high',
      estimatedTime: '26 min',
      distance: '11.8 km',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#EF4444';
      case 'moderate': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
      <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
      <style>
        body {
          padding: 0;
          margin: 0;
        }
        html, body, #map {
          height: 100%;
          width: 100%;
        }
        .custom-marker {
          border-radius: 50%;
          border: 2px solid white;
          text-align: center;
          line-height: 20px;
          font-weight: bold;
          color: white;
        }
        .pulse {
          border-radius: 50%;
          animation: pulse 2s infinite;
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          z-index: -1;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.3;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.7;
          }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map').setView([${initialPosition[0]}, ${initialPosition[1]}], ${initialZoom});
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        function createCustomMarker(lat, lng, color, severity, type) {
          const markerSize = severity === 'high' ? 14 : 12;
          const markerHtml = \`
            <div style="width: \${markerSize}px; height: \${markerSize}px; background-color: \${color};" class="custom-marker">
              \${severity === 'high' ? '<div class="pulse" style="background-color: ' + color + '"></div>' : ''}
            </div>
          \`;
          
          const icon = L.divIcon({
            html: markerHtml,
            className: '',
            iconSize: [markerSize, markerSize]
          });
          
          return L.marker([lat, lng], { icon }).addTo(map)
            .bindPopup(\`<b>\${type.charAt(0).toUpperCase() + type.slice(1)}</b><br>\${severity.charAt(0).toUpperCase() + severity.slice(1)} traffic\`);
        }

        ${JSON.stringify(trafficPoints).replace(/\"([^\"]+)\":/g, '$1:')}.forEach(point => {
          createCustomMarker(point.lat, point.lng, '${getSeverityColor(trafficLevel)}', point.severity, point.type);
        });

        // Handle takeoff and dropoff points
        const takeoffPoint = ${takeoffPoint ? JSON.stringify(takeoffPoint) : 'null'};
        const dropoffPoint = ${dropoffPoint ? JSON.stringify(dropoffPoint) : 'null'};
        
        // Clear any existing routes and markers
        if (window.routingControl) {
          map.removeControl(window.routingControl);
        }
        
        if (window.startMarker) {
          map.removeLayer(window.startMarker);
        }
        
        if (window.endMarker) {
          map.removeLayer(window.endMarker);
        }
        
        // Add takeoff marker if available
        if (takeoffPoint) {
          const startIcon = L.divIcon({
            html: \`
              <div style="width: 14px; height: 14px; background-color: #3B82F6; border-radius: 50%; border: 2px solid white;">
                <div style="position: absolute; width: 24px; height: 24px; background-color: #3B82F6; border-radius: 50%; opacity: 0.3; top: -7px; left: -7px;"></div>
              </div>
            \`,
            className: '',
            iconSize: [18, 18]
          });
          
          window.startMarker = L.marker([takeoffPoint.x, takeoffPoint.y], { icon: startIcon }).addTo(map)
            .bindPopup('<b>Takeoff Point</b>');
        }
        
        // Add dropoff marker if available
        if (dropoffPoint) {
          const endIcon = L.divIcon({
            html: \`
              <div style="width: 14px; height: 14px; background-color: #EF4444; border-radius: 50%; border: 2px solid white;"></div>
            \`,
            className: '',
            iconSize: [18, 18]
          });
          
          window.endMarker = L.marker([dropoffPoint.x, dropoffPoint.y], { icon: endIcon }).addTo(map)
            .bindPopup('<b>Drop-off Point</b>');
        }
        
        // If both points are set and showRoutes is true, create a route between them
        if (takeoffPoint && dropoffPoint && ${showRoutes}) {
          const routeColor = '${selectedRouteId === 'route-1' ? '#3B82F6' : selectedRouteId === 'route-2' ? '#10B981' : '#F59E0B'}';
          
          window.routingControl = L.Routing.control({
            waypoints: [
              L.latLng(takeoffPoint.x, takeoffPoint.y),
              L.latLng(dropoffPoint.x, dropoffPoint.y)
            ],
            lineOptions: {
              styles: [
                {color: routeColor, opacity: 0.7, weight: 5}
              ],
              addWaypoints: false
            },
            createMarker: function() { return null; },
            fitSelectedRoutes: true,
            draggableWaypoints: false,
            routeWhileDragging: false,
            show: false
          }).addTo(map);
        }
        // If showRoutes is true but we don't have both points, show the predefined routes
        else if (${showRoutes} && !takeoffPoint && !dropoffPoint) {
          ${JSON.stringify(routes).replace(/\"([^\"]+)\":/g, '$1:')}.forEach(route => {
            const waypoints = route.coordinates.map(coord => L.latLng(coord.x, coord.y));
            
            L.Routing.control({
              waypoints: waypoints,
              lineOptions: {
                styles: [
                  {color: route.color, opacity: 0.7, weight: 5}
                ],
                addWaypoints: false
              },
              createMarker: function() { return null; },
              fitSelectedRoutes: false,
              draggableWaypoints: false,
              routeWhileDragging: false,
              show: false
            }).addTo(map);
          });
          
          // Add start and end markers for the first route
          const firstRoute = ${JSON.stringify(routes).replace(/\"([^\"]+)\":/g, '$1:')}[0];
          const startCoords = firstRoute.coordinates[0];
          const endCoords = firstRoute.coordinates[firstRoute.coordinates.length - 1];
          
          const startIcon = L.divIcon({
            html: \`
              <div style="width: 14px; height: 14px; background-color: #3B82F6; border-radius: 50%; border: 2px solid white;">
                <div style="position: absolute; width: 24px; height: 24px; background-color: #3B82F6; border-radius: 50%; opacity: 0.3; top: -7px; left: -7px;"></div>
              </div>
            \`,
            className: '',
            iconSize: [18, 18]
          });
          
          L.marker([startCoords.x, startCoords.y], { icon: startIcon }).addTo(map)
            .bindPopup('<b>Start Location</b>');
          
          const endIcon = L.divIcon({
            html: \`
              <div style="width: 14px; height: 14px; background-color: #EF4444; border-radius: 50%; border: 2px solid white;"></div>
            \`,
            className: '',
            iconSize: [18, 18]
          });
          
          L.marker([endCoords.x, endCoords.y], { icon: endIcon }).addTo(map)
            .bindPopup('<b>Destination</b>');
        }

        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage('mapLoaded');
        }
      </script>
    </body>
    </html>
  `;

  const onMessage = (event: any) => {
    const data = event.nativeEvent.data;
    if (data === 'mapLoaded') {
      setMapLoaded(true);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
      />
    </View>
  );
}

function getCoordinates(road: string): { lat: number; lng: number } {
  const coords: Record<string, { lat: number; lng: number }> = {
    'Kacyiru-Kigali Heights': { lat: -1.944, lng: 30.093 },
    'Remera-Airtel': { lat: -1.957, lng: 30.125 },
    'RDB-Kimihurura': { lat: -1.949, lng: 30.082 },
    'Nyamirambo': { lat: -1.974, lng: 30.041 },
  };
  return coords[road] || initialCenter;
}

function getIconColor(level: 'low' | 'medium' | 'high') {
  switch (level) {
    case 'low':
      return 'green';
    case 'medium':
      return 'orange';
    case 'high':
      return 'red';
    default:
      return 'blue';
  }
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: Dimensions.get('window').width,
    borderRadius: 16,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});