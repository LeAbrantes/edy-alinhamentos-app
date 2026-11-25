import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, fonts } from '../config/theme';
import { AppointmentsProvider } from '../context/AppointmentsContext';
import { useAuth } from '../context/AuthContext';
import AgendaScreen from '../screens/AgendaScreen';
import AppointmentDetailScreen from '../screens/AppointmentDetailScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen';
import NewAppointmentScreen from '../screens/NewAppointmentScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.orange,
    background: colors.black,
    card: colors.dark,
    text: colors.white,
    border: colors.orange,
  },
};

const headerOptions = {
  headerStyle: { backgroundColor: colors.dark },
  headerTintColor: colors.white,
  headerTitleStyle: { fontFamily: fonts.title, fontSize: 22, letterSpacing: 2 },
};

const tabIcon = (emoji) => ({ focused }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

// Menu inferior: Agendar | Agenda | Painel
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        ...headerOptions,
        tabBarStyle: { backgroundColor: colors.dark2, borderTopColor: '#2a2a2a' },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.gray,
        tabBarLabelStyle: { fontFamily: fonts.heading, fontSize: 13, letterSpacing: 1 },
      }}
    >
      <Tab.Screen name="Agendar" component={NewAppointmentScreen} options={{ tabBarIcon: tabIcon('📅'), title: 'Agendar' }} />
      <Tab.Screen name="Agenda" component={AgendaScreen} options={{ tabBarIcon: tabIcon('📋') }} />
      <Tab.Screen name="Painel" component={DashboardScreen} options={{ tabBarIcon: tabIcon('📊') }} />
    </Tab.Navigator>
  );
}

// Telas para usuário logado (com a escuta do Firestore compartilhada)
function PrivateStack() {
  return (
    <AppointmentsProvider>
      <Stack.Navigator screenOptions={headerOptions}>
        <Stack.Screen name="Principal" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Detalhes" component={AppointmentDetailScreen} options={{ title: 'Detalhes' }} />
      </Stack.Navigator>
    </AppointmentsProvider>
  );
}

// Telas para quem ainda não entrou
function PublicStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.orange} size="large" />
      </View>
    );
  }

  return <NavigationContainer theme={navTheme}>{user ? <PrivateStack /> : <PublicStack />}</NavigationContainer>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' },
});
