import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import TodayScreen from '../screens/TodayScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AddScreen from '../screens/AddScreen';
import SettingsScreen from '../screens/SettingsScreen';

type TabParamList = {
  Today: undefined;
  History: undefined;
  Add: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, { focused: string; default: string }> = {
  Today: { focused: 'today', default: 'today-outline' },
  History: { focused: 'time', default: 'time-outline' },
  Add: { focused: 'add-circle', default: 'add-circle-outline' },
  Settings: { focused: 'settings', default: 'settings-outline' },
};

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name as keyof TabParamList];
          const iconName = focused ? icons.focused : icons.default;
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: true,
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Add" component={AddScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
