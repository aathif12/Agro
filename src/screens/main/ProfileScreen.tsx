import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

export const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const memberSince = user?.created_at
    ? format(new Date(user.created_at), 'MMMM yyyy')
    : 'N/A';

  const menuItems = [
    {
      icon: 'person-outline' as const,
      label: 'Full Name',
      value: displayName,
    },
    {
      icon: 'mail-outline' as const,
      label: 'Email',
      value: user?.email || 'N/A',
    },
    {
      icon: 'calendar-outline' as const,
      label: 'Member Since',
      value: memberSince,
    },
    {
      icon: 'shield-checkmark-outline' as const,
      label: 'Account Status',
      value: 'Verified ✓',
      valueColor: '#34D399',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={14} color="#34D399" />
          <Text style={styles.badgeText}>Active Account</Text>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Details</Text>
        {menuItems.map((item, idx) => (
          <View
            key={item.label}
            style={[
              styles.infoRow,
              idx === menuItems.length - 1 && styles.infoRowLast,
            ]}
          >
            <View style={styles.infoLeft}>
              <View style={styles.infoIconBox}>
                <Ionicons name={item.icon} size={18} color="#6366F1" />
              </View>
              <Text style={styles.infoLabel}>{item.label}</Text>
            </View>
            <Text
              style={[styles.infoValue, item.valueColor ? { color: item.valueColor } : {}]}
              numberOfLines={1}
            >
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      {/* App Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <View style={styles.infoIconBox}>
              <Ionicons name="information-circle-outline" size={18} color="#6366F1" />
            </View>
            <Text style={styles.infoLabel}>Version</Text>
          </View>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <View style={styles.infoIconBox}>
              <Ionicons name="code-slash-outline" size={18} color="#6366F1" />
            </View>
            <Text style={styles.infoLabel}>Stack</Text>
          </View>
          <Text style={styles.infoValue}>Expo + Supabase</Text>
        </View>
        <View style={[styles.infoRow, styles.infoRowLast]}>
          <View style={styles.infoLeft}>
            <View style={styles.infoIconBox}>
              <Ionicons name="business-outline" size={18} color="#6366F1" />
            </View>
            <Text style={styles.infoLabel}>Company</Text>
          </View>
          <Text style={styles.infoValue}>Agro Ventures</Text>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={styles.signOutBtn}
        onPress={handleSignOut}
        activeOpacity={0.85}
      >
        <Ionicons name="log-out-outline" size={20} color="#F87171" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#6366F122',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#F1F5F9',
    fontWeight: '600',
    maxWidth: '50%',
    textAlign: 'right',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#F87171',
  },
  signOutText: {
    color: '#F87171',
    fontSize: 16,
    fontWeight: '700',
  },
});
