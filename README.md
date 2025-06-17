# Traffic Monitoring System Frontend

A mobile and web application for real-time traffic monitoring built with React Native and Expo.

## Overview

The Traffic Monitoring System frontend provides a user interface for:
- Viewing real-time traffic data on an interactive map
- Monitoring traffic alerts and notifications
- Tracking congestion levels and traffic conditions
- Planning routes based on current traffic conditions

## Tech Stack

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform for React Native
- **Socket.IO**: Real-time communication with backend
- **React Navigation**: Navigation and routing
- **Leaflet**: Interactive mapping library

## Key Features

### Real-time Traffic Monitoring
- Live traffic data visualization
- Traffic congestion indicators
- Vehicle count and speed metrics
- Density level monitoring

### Traffic Alerts
- Push notifications for traffic incidents
- Alert categorization (accident, construction, congestion, etc.)
- Severity indicators (low, moderate, high)
- Alert management and settings

### Interactive Map
- Visual representation of traffic conditions
- Route planning and navigation
- Location search functionality
- Custom map markers for different traffic conditions

## App Structure

### Main Screens

1. **Dashboard** (`app/(tabs)/index.tsx`)
   - Traffic overview with real-time metrics
   - Interactive map
   - Current traffic status
   - Sensor readings

2. **Alerts** (`app/(tabs)/alerts.tsx`)
   - Traffic incident notifications
   - Alert filtering options
   - Alert settings management
   - Alert statistics

3. **Routes** (`app/(tabs)/routes.tsx`)
   - Route planning and navigation
   - Alternative route suggestions
   - ETA calculations

4. **Profile** (`app/(tabs)/profile.tsx`)
   - User preferences
   - App settings

### Components

- **InteractiveMap**: Main mapping component with traffic visualization
- **LeafletMap**: Leaflet integration for web platforms
- **TrafficMap**: Traffic data overlay for maps

### Hooks

- **useTrafficSocket**: Socket.IO connection for real-time traffic data
- **useAlertsSocket**: Socket.IO connection for real-time alerts
- **useFrameworkReady**: Utility for framework initialization

## Socket.IO Integration

The app connects to the backend server via Socket.IO to receive real-time updates:

- **Traffic Updates**: `traffic_update` event
- **Traffic Alerts**: `traffic_alert` event
- **Alert Resolution**: `alert_resolved` event

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation Steps

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd traffic-monitor-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Update the Socket.IO connection URL:
   - Open `hooks/userTrafficSocket.ts`
   - Update the `SOCKET_URL` constant with your backend server IP address

### Running the App

Start the development server:

```bash
npm run dev
```

This will start the Expo development server, allowing you to run the app on:
- iOS simulator or device
- Android emulator or device
- Web browser

## Development Notes

- The app uses Socket.IO to maintain a real-time connection with the backend
- Make sure the backend server is running before starting the app
- For mobile testing, ensure your device is on the same network as the backend server
- Update the Socket.IO URL in `hooks/userTrafficSocket.ts` to match your backend server's IP address

## Troubleshooting

- If you encounter connection issues, verify that:
  - The backend server is running
  - The Socket.IO URL is correctly configured
  - Your device is on the same network as the backend server
- For styling issues, check the component-specific StyleSheet definitions
- For navigation issues, verify the Expo Router configuration in the app directory