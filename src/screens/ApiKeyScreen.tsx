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
  const { setApiKey, setDeepseekApiKey, apiKey, deepseekApiKey } = useApp();
  const [gKey, setGKey] = useState(apiKey || '');
  const [dKey, setDKey] = useState(deepseekApiKey || '');
  const [loading, setLoading] = useState(false);
  const [showG, setShowG] = useState(false);
  const [showD, setShowD] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    if (gKey.trim()) await setApiKey(gKey.trim());
    if (dKey.trim()) await setDeepseekApiKey(dKey.trim());
    resetClient();
    setLoading(false);
    nav.replace('Onboarding');
  };

  const isReady = gKey.trim().length > 10 || dKey.trim().length > 10;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

        <View style={styles.top}>
          <Text style={styles.emoji}>🔑</Text>
          <Text style={styles.title}>Connect AI</Text>
          <Text style={styles.subtitle}>
            Fluently uses AI to analyse your speech. Connect Gemini (for audio & text) or DeepSeek (for high-speed text).
          </Text>
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.label}>Google Gemini Key (Recommended)</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="AIza..."
              placeholderTextColor={COLORS.textMuted}
              value={gKey}
              onChangeText={setGKey}
              secureTextEntry={!showG}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowG(s => !s)} style={styles.showBtn}>
              <Text style={styles.showBtnText}>{showG ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.label}>DeepSeek Key (Optional)</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="sk-..."
              placeholderTextColor={COLORS.textMuted}
              value={dKey}
              onChangeText={setDKey}
              secureTextEntry={!showD}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowD(s => !s)} style={styles.showBtn}>
              <Text style={styles.showBtnText}>{showD ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <PrimaryButton
          label="Continue →"
          onPress={handleSave}
          disabled={!isReady}
          loading={loading}
          style={{ marginBottom: 24 }}
        />

        <GlassCard style={styles.howCard}>
          <Text style={styles.howTitle}>How to get keys</Text>
          <Text style={styles.howStep}>• Gemini: aistudio.google.com</Text>
          <Text style={styles.howStep}>• DeepSeek: platform.deepseek.com</Text>
          <Text style={styles.howNote}>
            Gemini is required for the best audio analysis. DeepSeek V4-Flash is used for rapid response generation.
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
