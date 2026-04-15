import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTrafficSocket } from '@/hooks/userTrafficSocket';

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

const initialCenter = { lat: -1.944, lng: 30.061, zoom: 13 };

function getCoordinates(road: string): { lat: number; lng: number } {
  const coords: Record<string, { lat: number; lng: number }> = {
    'Kacyiru-Kigali Heights': { lat: -1.944, lng: 30.093 },
    'Remera-Airtel': { lat: -1.957, lng: 30.125 },
    'RDB-Kimihurura': { lat: -1.949, lng: 30.082 },
    'Nyamirambo': { lat: -1.974, lng: 30.041 },
  };
  return coords[road] || initialCenter;
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'high': return '#EF4444';
    case 'moderate': return '#F59E0B';
    case 'low': return '#10B981';
    default: return '#6B7280';
  }
}

export default function LeafletMap({
  showRoutes = true,
  trafficLevel = 'moderate',
  initialPosition = [-1.944, 30.061],
  initialZoom = 13,
  takeoffPoint,
  dropoffPoint,
  selectedRouteId,
}: LeafletMapProps) {
  const { trafficData } = useTrafficSocket();

  const trafficPoints = trafficData.map((data, idx) => ({
    id: `${idx}`,
    lat: getCoordinates(data.roadSegmentId).lat,
    lng: getCoordinates(data.roadSegmentId).lng,
    severity: data.congestionLevel,
    type: 'traffic',
  }));

  const routes = [
    {
      id: 'route-1',
      coordinates: [
        { x: -1.9441, y: 30.0619 },
        { x: -1.9445, y: 30.0622 },
        { x: -1.9452, y: 30.0631 },
        { x: -1.9458, y: 30.0639 },
        { x: -1.9465, y: 30.0645 },
        { x: -1.9471, y: 30.0651 },
      ],
      color: '#3B82F6',
    },
    {
      id: 'route-2',
      coordinates: [
        { x: -1.9441, y: 30.0619 },
        { x: -1.9448, y: 30.0625 },
        { x: -1.9455, y: 30.0635 },
        { x: -1.9462, y: 30.0642 },
        { x: -1.9469, y: 30.0648 },
        { x: -1.9475, y: 30.0655 },
      ],
      color: '#10B981',
    },
    {
      id: 'route-3',
      coordinates: [
        { x: -1.9441, y: 30.0619 },
        { x: -1.9446, y: 30.0628 },
        { x: -1.9453, y: 30.0637 },
        { x: -1.9459, y: 30.0644 },
        { x: -1.9466, y: 30.0649 },
        { x: -1.9473, y: 30.0653 },
      ],
      color: '#F59E0B',
    },
  ];

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
        body { padding: 0; margin: 0; }
        html, body, #map { height: 100%; width: 100%; }
        .custom-marker { border-radius: 50%; border: 2px solid white; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        try {
          const map = L.map('map').setView([${initialPosition[0]}, ${initialPosition[1]}], ${initialZoom});
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);

          function createMarker(lat, lng, color, label) {
            const icon = L.divIcon({
              html: '<div style="width:12px;height:12px;background:' + color + ';border-radius:50%;border:2px solid white;"></div>',
              className: '',
              iconSize: [12, 12]
            });
            return L.marker([lat, lng], { icon }).addTo(map).bindPopup(label);
          }

          ${JSON.stringify(trafficPoints)}.forEach(function(p) {
            createMarker(p.lat, p.lng, '${getSeverityColor(trafficLevel)}', p.severity + ' traffic');
          });

          const takeoffPoint = ${takeoffPoint ? JSON.stringify(takeoffPoint) : 'null'};
          const dropoffPoint = ${dropoffPoint ? JSON.stringify(dropoffPoint) : 'null'};

          if (takeoffPoint) createMarker(takeoffPoint.x, takeoffPoint.y, '#3B82F6', 'Takeoff');
          if (dropoffPoint) createMarker(dropoffPoint.x, dropoffPoint.y, '#EF4444', 'Drop-off');

          if (takeoffPoint && dropoffPoint && ${showRoutes}) {
            const routeColor = '${selectedRouteId === 'route-1' ? '#3B82F6' : selectedRouteId === 'route-2' ? '#10B981' : '#F59E0B'}';
            L.Routing.control({
              waypoints: [L.latLng(takeoffPoint.x, takeoffPoint.y), L.latLng(dropoffPoint.x, dropoffPoint.y)],
              lineOptions: { styles: [{ color: routeColor, opacity: 0.7, weight: 5 }], addWaypoints: false },
              createMarker: function() { return null; },
              fitSelectedRoutes: true,
              draggableWaypoints: false,
              routeWhileDragging: false,
              show: false
            }).addTo(map);
          } else if (${showRoutes} && !takeoffPoint && !dropoffPoint) {
            ${JSON.stringify(routes)}.forEach(function(route) {
              L.Routing.control({
                waypoints: route.coordinates.map(function(c) { return L.latLng(c.x, c.y); }),
                lineOptions: { styles: [{ color: route.color, opacity: 0.7, weight: 5 }], addWaypoints: false },
                createMarker: function() { return null; },
                fitSelectedRoutes: false,
                draggableWaypoints: false,
                routeWhileDragging: false,
                show: false
              }).addTo(map);
            });
          }
        } catch(e) {
          console.warn('Map init error:', e.message);
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <iframe
        srcDoc={htmlContent}
        style={{ width: '100%', height: 300, border: 'none' } as any}
        title="Traffic Map"
        sandbox="allow-scripts allow-same-origin"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: Dimensions.get('window').width,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
