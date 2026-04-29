import React, { useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar,
  TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../constants';
import { GlassCard, PrimaryButton } from '../components/UI';
import { useApp } from '../store/AppContext';
import { resetClient } from '../services/gemini';
import { RootStackParamList } from '../types';

export default function ApiKeyScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setApiKey } = useApp();
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleSave = async () => {
    if (!key.trim()) return;
    setLoading(true);
    await setApiKey(key.trim());
    resetClient();
    setLoading(false);
    nav.replace('Onboarding');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

        <View style={styles.top}>
          <Text style={styles.emoji}>🔑</Text>
          <Text style={styles.title}>Connect Gemini</Text>
          <Text style={styles.subtitle}>
            Fluently uses Google Gemini to analyse your speech and generate personalised study plans.
            Your key is stored only on this device.
          </Text>
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.label}>Gemini API Key</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="AIza..."
              placeholderTextColor={COLORS.textMuted}
              value={key}
              onChangeText={setKey}
              secureTextEntry={!show}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShow(s => !s)} style={styles.showBtn}>
              <Text style={styles.showBtnText}>{show ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <PrimaryButton
            label="Continue →"
            onPress={handleSave}
            disabled={key.trim().length < 10}
            loading={loading}
            style={{ marginTop: 16 }}
          />
        </GlassCard>

        <GlassCard style={styles.howCard}>
          <Text style={styles.howTitle}>How to get your key</Text>
          {[
            '1. Go to aistudio.google.com',
            '2. Sign in with your Google account',
            '3. Click "Get API Key" → "Create API key"',
            '4. Copy the key and paste it above',
          ].map(step => (
            <Text key={step} style={styles.howStep}>{step}</Text>
          ))}
          <Text style={styles.howNote}>
            The free tier supports Gemini 1.5 Flash and Pro models, which are all this app needs.
          </Text>
        </GlassCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, paddingTop: 60 },
  top: { alignItems: 'center', marginBottom: 32, gap: 12 },
  emoji: { fontSize: 52 },
  title: { fontSize: 30, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  card: { marginBottom: 16 },
  label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    color: COLORS.textPrimary,
    padding: 14,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  showBtn: { padding: 10 },
  showBtnText: { fontSize: 20 },
  howCard: { marginBottom: 40, gap: 8 },
  howTitle: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 16, marginBottom: 4 },
  howStep: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  howNote: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4, fontStyle: 'italic' },
});
