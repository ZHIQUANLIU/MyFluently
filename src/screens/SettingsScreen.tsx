import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, Alert, StatusBar, TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../constants';
import { GlassCard, PrimaryButton, SectionHeader } from '../components/UI';
import { useApp } from '../store/AppContext';
import { resetClient } from '../services/gemini';
import { RootStackParamList } from '../types';

export default function SettingsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, assessment, studyPlan, apiKey, deepseekApiKey, aiProvider, setApiKey, setDeepseekApiKey, setAIProvider, resetAll } = useApp();
  const [newGKey, setNewGKey] = useState(apiKey);
  const [newDKey, setNewDKey] = useState(deepseekApiKey);
  const [saved, setSaved] = useState(false);

  const handleSaveKeys = async () => {
    await setApiKey(newGKey.trim());
    await setDeepseekApiKey(newDKey.trim());
    resetClient();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    Alert.alert(
      '⚠️ Reset all data?',
      'This will delete your profile, assessment results, and study plan. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await resetAll();
            nav.replace('Welcome');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => nav.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="Settings" subtitle="Manage your profile and preferences." />

        {/* Profile info */}
        {user && (
          <GlassCard style={styles.card}>
            <Text style={styles.fieldLabel}>Your Profile</Text>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileMeta}>{user.level} · {user.profession}</Text>
              </View>
            </View>
          </GlassCard>
        )}

        {/* AI Provider */}
        <GlassCard style={styles.card}>
          <Text style={styles.fieldLabel}>Preferred AI Provider</Text>
          <View style={styles.providerRow}>
            {[
              { id: 'gemini', label: 'Google Gemini', icon: '✨' },
              { id: 'deepseek', label: 'DeepSeek V4', icon: '🐋' }
            ].map(p => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setAIProvider(p.id as any)}
                style={[
                  styles.providerBtn,
                  aiProvider === p.id && styles.providerBtnActive
                ]}
              >
                <Text style={styles.providerIcon}>{p.icon}</Text>
                <Text style={[
                  styles.providerLabel,
                  aiProvider === p.id && styles.providerLabelActive
                ]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.apiNote}>
            {aiProvider === 'gemini' 
              ? 'Gemini handles audio evaluation natively for best accuracy.' 
              : 'DeepSeek V4-Flash is used for high-speed generation. Gemini is still used for transcription if available.'}
          </Text>
        </GlassCard>

        {/* API Keys */}
        <GlassCard style={styles.card}>
          <Text style={styles.fieldLabel}>API Configuration</Text>
          
          <Text style={styles.inputSubLabel}>Gemini API Key</Text>
          <TextInput
            style={styles.input}
            placeholder="AIza..."
            placeholderTextColor={COLORS.textMuted}
            value={newGKey}
            onChangeText={setNewGKey}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <Text style={[styles.inputSubLabel, { marginTop: 16 }]}>DeepSeek API Key</Text>
          <TextInput
            style={styles.input}
            placeholder="sk-..."
            placeholderTextColor={COLORS.textMuted}
            value={newDKey}
            onChangeText={setNewDKey}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <PrimaryButton
            label={saved ? '✓ Saved!' : 'Save API Keys'}
            onPress={handleSaveKeys}
            style={{ marginTop: 20 }}
          />
        </GlassCard>

        {/* Assessment summary */}
        {assessment && (
          <GlassCard style={styles.card}>
            <Text style={styles.fieldLabel}>Last Assessment</Text>
            <Text style={styles.infoText}>
              Completed: {new Date(assessment.completedAt).toLocaleDateString()}
            </Text>
            <Text style={styles.infoText}>
              Overall Score: {assessment.scores.overall}/100
            </Text>
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => nav.navigate('AssessmentResults', { assessment })}
            >
              <Text style={styles.linkBtnText}>View Full Results →</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Danger zone */}
        <GlassCard style={[styles.card, styles.dangerCard]}>
          <Text style={styles.dangerTitle}>⚠️ Danger Zone</Text>
          <Text style={styles.dangerDesc}>
            Resetting will permanently delete all your data. This cannot be undone.
          </Text>
          <PrimaryButton
            label="Reset All Data"
            onPress={handleReset}
            variant="danger"
            style={{ marginTop: 12 }}
          />
        </GlassCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingTop: 16 },
  header: { marginBottom: 24 },
  back: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  card: { marginBottom: 16 },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  profileName: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 17 },
  profileMeta: { color: COLORS.textSecondary, fontSize: 14, marginTop: 2 },
  infoText: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 4 },
  linkBtn: { marginTop: 10 },
  linkBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  apiNote: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    color: COLORS.textPrimary,
    padding: 14,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  dangerCard: { borderColor: COLORS.error + '40' },
  dangerTitle: { color: COLORS.error, fontWeight: '800', fontSize: 16, marginBottom: 8 },
  dangerDesc: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
  providerRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  providerBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    gap: 8,
  },
  providerBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  providerIcon: { fontSize: 24 },
  providerLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  providerLabelActive: { color: COLORS.primary },
  inputSubLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', marginBottom: 6, marginLeft: 4, textTransform: 'uppercase' },
});
