import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TriangleAlert as AlertTriangle, Clock, MapPin, Volume2, VolumeX, Bell, BellOff, Car, Construction, Zap, CircleCheck as CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface TrafficAlert {
  id: string;
  type: 'accident' | 'construction' | 'congestion' | 'weather' | 'event';
  severity: 'low' | 'moderate' | 'high';
  title: string;
  description: string;
  location: string;
  timestamp: Date;
  estimatedDelay: string;
  isRead: boolean;
}

interface AlertSettings {
  notifications: boolean;
  sound: boolean;
  vibration: boolean;
  highPriorityOnly: boolean;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<TrafficAlert[]>([
    {
      id: '1',
      type: 'accident',
      severity: 'high',
      title: 'Multi-vehicle accident',
      description: 'Major collision blocking 2 lanes on Highway 101',
      location: 'Highway 101, Mile 23',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      estimatedDelay: '15-20 min',
      isRead: false,
    },
    {
      id: '2',
      type: 'construction',
      severity: 'moderate',
      title: 'Road construction',
      description: 'Lane closure for maintenance work',
      location: 'Main Street & 5th Ave',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      estimatedDelay: '5-8 min',
      isRead: false,
    },
    {
      id: '3',
      type: 'congestion',
      severity: 'moderate',
      title: 'Heavy traffic congestion',
      description: 'Slower than usual traffic due to rush hour',
      location: 'Downtown District',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      estimatedDelay: '10-12 min',
      isRead: true,
    },
    {
      id: '4',
      type: 'weather',
      severity: 'low',
      title: 'Light rain affecting traffic',
      description: 'Reduced visibility and wet road conditions',
      location: 'City-wide',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      estimatedDelay: '3-5 min',
      isRead: true,
    },
    {
      id: '5',
      type: 'event',
      severity: 'high',
      title: 'Stadium event traffic',
      description: 'Major sporting event causing increased traffic',
      location: 'Sports District',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      estimatedDelay: '20-25 min',
      isRead: true,
    },
  ]);

  const [settings, setSettings] = useState<AlertSettings>({
    notifications: true,
    sound: true,
    vibration: true,
    highPriorityOnly: false,
  });

  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  const handleAlertPress = (alertId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const toggleSetting = (key: keyof AlertSettings) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'unread':
        return !alert.isRead;
      case 'high':
        return alert.severity === 'high';
      default:
        return true;
    }
  });

  const getAlertIcon = (type: string, severity: string) => {
    const color = getSeverityColor(severity);
    switch (type) {
      case 'accident':
        return <Car size={20} color={color} />;
      case 'construction':
        return <Construction size={20} color={color} />;
      case 'congestion':
        return <Clock size={20} color={color} />;
      case 'weather':
        return <AlertTriangle size={20} color={color} />;
      case 'event':
        return <MapPin size={20} color={color} />;
      default:
        return <AlertTriangle size={20} color={color} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#EF4444';
      case 'moderate': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getSeverityBackground = (severity: string) => {
    switch (severity) {
      case 'high': return '#FEE2E2';
      case 'moderate': return '#FEF3C7';
      case 'low': return '#D1FAE5';
      default: return '#F3F4F6';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return timestamp.toLocaleDateString();
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Traffic Alerts</Text>
            <Text style={styles.subtitle}>
              {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.alertStatus}>
            {settings.notifications ? (
              <Bell size={24} color="#3B82F6" />
            ) : (
              <BellOff size={24} color="#6B7280" />
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive
            ]}>
              All ({alerts.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[
              styles.filterText,
              filter === 'unread' && styles.filterTextActive
            ]}>
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === 'high' && styles.filterTabActive]}
            onPress={() => setFilter('high')}
          >
            <Text style={[
              styles.filterText,
              filter === 'high' && styles.filterTextActive
            ]}>
              High Priority
            </Text>
          </TouchableOpacity>
        </View>

        {/* Alerts List */}
        <View style={styles.alertsList}>
          {filteredAlerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[
                styles.alertCard,
                !alert.isRead && styles.alertCardUnread,
              ]}
              onPress={() => handleAlertPress(alert.id)}
            >
              <View style={styles.alertHeader}>
                <View style={[
                  styles.alertIconContainer,
                  { backgroundColor: getSeverityBackground(alert.severity) }
                ]}>
                  {getAlertIcon(alert.type, alert.severity)}
                </View>
                
                <View style={styles.alertInfo}>
                  <View style={styles.alertTitleRow}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    {!alert.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.alertDescription}>{alert.description}</Text>
                </View>
                
                <View style={styles.alertMeta}>
                  <Text style={styles.alertTime}>{formatTimestamp(alert.timestamp)}</Text>
                </View>
              </View>
              
              <View style={styles.alertDetails}>
                <View style={styles.alertLocation}>
                  <MapPin size={12} color="#6B7280" />
                  <Text style={styles.alertLocationText}>{alert.location}</Text>
                </View>
                
                <View style={styles.alertDelay}>
                  <Clock size={12} color="#F59E0B" />
                  <Text style={styles.alertDelayText}>+{alert.estimatedDelay}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Alert Settings</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Bell size={20} color="#3B82F6" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive alerts on your device
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={() => toggleSetting('notifications')}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                {settings.sound ? (
                  <Volume2 size={20} color="#3B82F6" />
                ) : (
                  <VolumeX size={20} color="#6B7280" />
                )}
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Sound Alerts</Text>
                  <Text style={styles.settingDescription}>
                    Play sound for new alerts
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.sound}
                onValueChange={() => toggleSetting('sound')}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Zap size={20} color="#3B82F6" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Vibration</Text>
                  <Text style={styles.settingDescription}>
                    Vibrate for alert notifications
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.vibration}
                onValueChange={() => toggleSetting('vibration')}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <AlertTriangle size={20} color="#EF4444" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>High Priority Only</Text>
                  <Text style={styles.settingDescription}>
                    Only show critical alerts
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.highPriorityOnly}
                onValueChange={() => toggleSetting('highPriorityOnly')}
                trackColor={{ false: '#E5E7EB', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Alert Summary</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
                <AlertTriangle size={16} color="#EF4444" />
              </View>
              <Text style={styles.statValue}>
                {alerts.filter(a => a.severity === 'high').length}
              </Text>
              <Text style={styles.statLabel}>High Priority</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                <CheckCircle size={16} color="#10B981" />
              </View>
              <Text style={styles.statValue}>
                {alerts.filter(a => a.isRead).length}
              </Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                <Clock size={16} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>24h</Text>
              <Text style={styles.statLabel}>Monitoring</Text>
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
  alertStatus: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  alertsList: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  alertCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  alertDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 16,
  },
  alertMeta: {
    alignItems: 'flex-end',
  },
  alertTime: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  alertDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  alertLocationText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  alertDelay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  alertDelayText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  settingsCard: {
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
});