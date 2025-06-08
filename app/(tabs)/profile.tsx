import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, MapPin, Clock, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Car, ChartBar as BarChart3, Moon, Sun } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface UserProfile {
  name: string;
  email: string;
  totalTrips: number;
  timeSaved: string;
  avgSpeed: number;
  memberSince: string;
}

interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  locationServices: boolean;
  dataUsage: 'low' | 'normal' | 'high';
  autoRouting: boolean;
}

export default function Profile() {
  const [profile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    totalTrips: 247,
    timeSaved: '12.5 hours',
    avgSpeed: 42,
    memberSince: 'January 2024',
  });

  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    notifications: true,
    locationServices: true,
    dataUsage: 'normal',
    autoRouting: true,
  });

  const handleSettingToggle = (key: keyof AppSettings, value?: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setSettings(prev => ({
      ...prev,
      [key]: value !== undefined ? value : !prev[key],
    }));
  };

  const handleLogout = () => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: () => {} },
        ]
      );
    }
  };

  const menuItems = [
    {
      icon: <MapPin size={20} color="#3B82F6" />,
      title: 'Saved Places',
      subtitle: 'Manage your favorite locations',
      onPress: () => {},
    },
    {
      icon: <Clock size={20} color="#10B981" />,
      title: 'Trip History',
      subtitle: 'View your recent journeys',
      onPress: () => {},
    },
    {
      icon: <BarChart3 size={20} color="#8B5CF6" />,
      title: 'Analytics',
      subtitle: 'View your driving statistics',
      onPress: () => {},
    },
    {
      icon: <Bell size={20} color="#F59E0B" />,
      title: 'Notifications',
      subtitle: 'Manage alert preferences',
      onPress: () => {},
    },
    {
      icon: <Shield size={20} color="#EF4444" />,
      title: 'Privacy & Security',
      subtitle: 'Control your data and privacy',
      onPress: () => {},
    },
    {
      icon: <HelpCircle size={20} color="#6B7280" />,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <User size={32} color="#3B82F6" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            <Text style={styles.memberSince}>Member since {profile.memberSince}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Settings size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Car size={20} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>{profile.totalTrips}</Text>
              <Text style={styles.statLabel}>Total Trips</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Clock size={20} color="#10B981" />
              </View>
              <Text style={styles.statValue}>{profile.timeSaved}</Text>
              <Text style={styles.statLabel}>Time Saved</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <BarChart3 size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.statValue}>{profile.avgSpeed} km/h</Text>
              <Text style={styles.statLabel}>Avg Speed</Text>
            </View>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                {settings.darkMode ? (
                  <Moon size={20} color="#3B82F6" />
                ) : (
                  <Sun size={20} color="#F59E0B" />
                )}
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Dark Mode</Text>
                  <Text style={styles.settingDescription}>
                    Switch to dark theme
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => handleSettingToggle('darkMode', value)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Bell size={20} color="#3B82F6" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive traffic alerts and updates
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => handleSettingToggle('notifications', value)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MapPin size={20} color="#10B981" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Location Services</Text>
                  <Text style={styles.settingDescription}>
                    Allow access to your location
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.locationServices}
                onValueChange={(value) => handleSettingToggle('locationServices', value)}
                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Car size={20} color="#8B5CF6" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Auto Routing</Text>
                  <Text style={styles.settingDescription}>
                    Automatically suggest optimal routes
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.autoRouting}
                onValueChange={(value) => handleSettingToggle('autoRouting', value)}
                trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Data Usage Setting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Usage</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.dataUsageContainer}>
              {(['low', 'normal', 'high'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.dataUsageOption,
                    settings.dataUsage === level && styles.dataUsageOptionActive,
                  ]}
                  onPress={() => handleSettingToggle('dataUsage', level)}
                >
                  <Text style={[
                    styles.dataUsageText,
                    settings.dataUsage === level && styles.dataUsageTextActive,
                  ]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.dataUsageDescription}>
              Controls how much data the app uses for real-time updates
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Options</Text>
          
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuIcon}>
                  {item.icon}
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={16} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Traffic Monitor v1.0.0</Text>
          <Text style={styles.footerText}>
            Built with ❤️ for safer driving
          </Text>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  editButton: {
    padding: 8,
  },
  statsSection: {
    marginBottom: 16,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
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
  section: {
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
  dataUsageContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dataUsageOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  dataUsageOptionActive: {
    backgroundColor: '#3B82F6',
  },
  dataUsageText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  dataUsageTextActive: {
    color: '#FFFFFF',
  },
  dataUsageDescription: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
  },
});