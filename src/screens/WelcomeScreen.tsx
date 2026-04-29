import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
  TouchableOpacity, StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../constants';
import { RootStackParamList } from '../types';
import { useApp } from '../store/AppContext';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isOnboarded, assessment, studyPlan, apiKey } = useApp();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();

    // Pulsing orbs
    const loop = (anim: Animated.Value) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1.15, duration: 2800, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: 2800, useNativeDriver: true }),
        ])
      ).start();
    loop(pulse1);
    setTimeout(() => loop(pulse2), 1400);
  }, []);

  const handleStart = () => {
    if (!apiKey) return nav.navigate('ApiKey');
    if (!isOnboarded) return nav.navigate('Onboarding');
    if (!assessment) return nav.navigate('Assessment');
    if (!studyPlan) return nav.navigate('TopicSelection', { assessment });
    nav.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Background orbs */}
      <Animated.View style={[styles.orb1, { transform: [{ scale: pulse1 }] }]} />
      <Animated.View style={[styles.orb2, { transform: [{ scale: pulse2 }] }]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🎙</Text>
          </View>
          <Text style={styles.logoText}>Fluently</Text>
        </View>

        <Text style={styles.tagline}>
          Master English with{'\n'}AI-powered coaching
        </Text>
        <Text style={styles.subtitle}>
          Pronunciation · Grammar · Fluency · Vocabulary{'\n'}
          Powered by Google Gemini
        </Text>

        {/* Feature pills */}
        <View style={styles.pills}>
          {['🎯 Personalised Assessment', '📊 Real-time Scoring', '📅 3-Month Study Plan'].map(f => (
            <View key={f} style={styles.pill}>
              <Text style={styles.pillText}>{f}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.ctaBtn} onPress={handleStart} activeOpacity={0.85}>
          <Text style={styles.ctaText}>
            {!apiKey ? 'Get Started →' : !isOnboarded ? 'Set Up Profile →' : !assessment ? 'Take Assessment →' : 'Continue Learning →'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          {!apiKey ? 'You\'ll need a Gemini API key' : isOnboarded ? `Welcome back!` : 'Free · No account needed'}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: COLORS.primary,
    opacity: 0.12,
    top: -60,
    right: -100,
  },
  orb2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.accent,
    opacity: 0.1,
    bottom: 20,
    left: -80,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
    width: '100%',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 26,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  pills: {
    gap: 10,
    marginBottom: 40,
    width: '100%',
  },
  pill: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  pillText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  ctaBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
