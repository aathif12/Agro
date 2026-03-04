import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { AddExpenseScreen } from '../screens/main/AddExpenseScreen';
import { ExpensesScreen } from '../screens/main/ExpensesScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: '#0F172A',
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#1E293B',
        },
        headerTitleStyle: {
          color: '#F8FAFC',
          fontWeight: '700',
          fontSize: 18,
        },
        headerTintColor: '#F8FAFC',
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AddExpense') {
            iconName = focused ? 'add' : 'add-outline';
          } else if (route.name === 'Expenses') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard', tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{ title: 'My Expenses', tabBarLabel: 'Expenses' }}
      />
      <Tab.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ title: 'Add Expense', tabBarLabel: '' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile', tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1E293B',
    borderTopColor: '#334155',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 25 : 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
