import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider, useApp } from './src/store/AppContext';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from './src/constants';

import WelcomeScreen from './src/screens/WelcomeScreen';
import ApiKeyScreen from './src/screens/ApiKeyScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AssessmentScreen from './src/screens/AssessmentScreen';
import AssessmentResultsScreen from './src/screens/AssessmentResultsScreen';
import TopicSelectionScreen from './src/screens/TopicSelectionScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import InterviewSetupScreen from './src/screens/InterviewSetupScreen';
import InterviewScreen from './src/screens/InterviewScreen';
import InterviewResultsScreen from './src/screens/InterviewResultsScreen';
import PracticeSetupScreen from './src/screens/PracticeSetupScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import PracticeResultsScreen from './src/screens/PracticeResultsScreen';

import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { isLoading } = useApp();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="ApiKey" component={ApiKeyScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Assessment" component={AssessmentScreen} />
        <Stack.Screen name="AssessmentResults" component={AssessmentResultsScreen} />
        <Stack.Screen name="TopicSelection" component={TopicSelectionScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="InterviewSetup" component={InterviewSetupScreen} />
        <Stack.Screen name="Interview" component={InterviewScreen} />
        <Stack.Screen name="InterviewResults" component={InterviewResultsScreen} />
        <Stack.Screen name="PracticeSetup" component={PracticeSetupScreen} />
        <Stack.Screen name="Practice" component={PracticeScreen} />
        <Stack.Screen name="PracticeResults" component={PracticeResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
