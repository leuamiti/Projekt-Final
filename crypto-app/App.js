import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import { AccountProvider, useAccount } from './src/context/AccountContext';
import { MarketProvider } from './src/context/MarketContext';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';
import AccountScreen from './src/screens/AccountScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icon = (emoji) => () => <Text style={{ fontSize: 18 }}>{emoji}</Text>;

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#4ade80' }}>
      <Tab.Screen name="Markets" component={HomeScreen} options={{ tabBarIcon: icon('📈') }} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} options={{ tabBarIcon: icon('💼') }} />
      <Tab.Screen name="Account" component={AccountScreen} options={{ tabBarIcon: icon('👤') }} />
    </Tab.Navigator>
  );
}

function Root() {
  const { ready, user } = useAccount();

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0b0f14', justifyContent: 'center' }}>
        <ActivityIndicator color="#4ade80" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="Detail"
              component={DetailScreen}
              options={({ route }) => ({ title: route.params.name })}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AccountProvider>
      <MarketProvider>
        <StatusBar style="light" />
        <Root />
      </MarketProvider>
    </AccountProvider>
  );
}
