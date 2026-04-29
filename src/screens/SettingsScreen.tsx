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
  const { user, assessment, studyPlan, apiKey, setApiKey, resetAll } = useApp();
  const [newKey, setNewKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  const handleSaveKey = async () => {
    if (!newKey.trim()) {
      Alert.alert('Error', 'API key cannot be empty.');
      return;
    }
    await setApiKey(newKey.trim());
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

        {/* Study plan summary */}
        {studyPlan && (
          <GlassCard style={styles.card}>
            <Text style={styles.fieldLabel}>Study Plan</Text>
            <Text style={styles.infoText}>
              Started: {new Date(studyPlan.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.infoText}>
              Progress: {studyPlan.completedDays}/{studyPlan.totalDays} sessions ({Math.round(studyPlan.completedDays / studyPlan.totalDays * 100)}%)
            </Text>
            <Text style={styles.infoText}>
              Topics: {studyPlan.topics.join(', ')}
            </Text>
          </GlassCard>
        )}

        {/* API Key */}
        <GlassCard style={styles.card}>
          <Text style={styles.fieldLabel}>Gemini API Key</Text>
          <Text style={styles.apiNote}>
            Get your free key at aistudio.google.com. Never share your key publicly.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="AIza..."
            placeholderTextColor={COLORS.textMuted}
            value={newKey}
            onChangeText={setNewKey}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <PrimaryButton
            label={saved ? '✓ Saved!' : 'Save API Key'}
            onPress={handleSaveKey}
            style={{ marginTop: 12 }}
          />
        </GlassCard>

        {/* Danger zone */}
        <GlassCard style={[styles.card, styles.dangerCard]}>
          <Text style={styles.dangerTitle}>⚠️ Danger Zone</Text>
          <Text style={styles.dangerDesc}>
            Resetting will permanently delete all your data: profile, assessment results, and your 3-month study plan. You will start from scratch.
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
});
