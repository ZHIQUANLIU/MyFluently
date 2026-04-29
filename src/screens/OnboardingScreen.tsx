import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, LEVEL_DESCRIPTIONS, PROFESSIONS } from '../constants';
import { GlassCard, PrimaryButton, SectionHeader } from '../components/UI';
import { useApp } from '../store/AppContext';
import { RootStackParamList, EnglishLevel } from '../types';
import { generateId } from '../utils/id';

const LEVELS: EnglishLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function OnboardingScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setUser } = useApp();

  const [name, setName] = useState('');
  const [level, setLevel] = useState<EnglishLevel | null>(null);
  const [profession, setProfession] = useState('');
  const [customProfession, setCustomProfession] = useState('');
  const [saving, setSaving] = useState(false);

  const isValid = name.trim().length > 0 && level !== null && (profession !== '' || customProfession.trim() !== '');

  const handleContinue = async () => {
    if (!isValid) return;
    setSaving(true);
    const finalProfession = profession === 'Other' ? customProfession.trim() : profession;
    await setUser({
      id: generateId(),
      name: name.trim(),
      level: level!,
      profession: finalProfession,
      createdAt: new Date().toISOString(),
    });
    nav.replace('Assessment');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => nav.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader
          title="Set up your profile"
          subtitle="This helps Gemini personalise your assessment and study plan."
        />

        {/* Name */}
        <GlassCard style={styles.card}>
          <Text style={styles.fieldLabel}>Your name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Alex Chen"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={setName}
          />
        </GlassCard>

        {/* Level */}
        <GlassCard style={styles.card}>
          <Text style={styles.fieldLabel}>Current English level (self-assessed)</Text>
          <View style={styles.levelGrid}>
            {LEVELS.map(l => {
              const selected = level === l;
              const info = LEVEL_DESCRIPTIONS[l];
              const color = COLORS.levels[l];
              return (
                <TouchableOpacity
                  key={l}
                  style={[styles.levelCard, selected && { borderColor: color, backgroundColor: color + '18' }]}
                  onPress={() => setLevel(l)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.levelBadge, { color: selected ? color : COLORS.textMuted }]}>{l}</Text>
                  <Text style={[styles.levelName, selected && { color: COLORS.textPrimary }]}>{info.label}</Text>
                  <Text style={styles.levelDesc}>{info.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* Profession */}
        <GlassCard style={styles.card}>
          <Text style={styles.fieldLabel}>Your profession</Text>
          <View style={styles.professionList}>
            {PROFESSIONS.map(p => {
              const selected = profession === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.profChip, selected && styles.profChipSelected]}
                  onPress={() => setProfession(p)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.profChipText, selected && styles.profChipTextSelected]}>{p}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {profession === 'Other' && (
            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="Enter your profession"
              placeholderTextColor={COLORS.textMuted}
              value={customProfession}
              onChangeText={setCustomProfession}
            />
          )}
        </GlassCard>

        <PrimaryButton
          label="Continue to Assessment →"
          onPress={handleContinue}
          disabled={!isValid}
          loading={saving}
          style={{ marginBottom: 40 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingTop: 16 },
  headerRow: { marginBottom: 24 },
  back: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  card: { marginBottom: 16 },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    color: COLORS.textPrimary,
    padding: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  levelCard: {
    width: '47%',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.bgCardBorder,
    padding: 14,
    backgroundColor: COLORS.bgCard,
  },
  levelBadge: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  levelName: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  levelDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  professionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  profChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    backgroundColor: COLORS.bgCard,
  },
  profChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  profChipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  profChipTextSelected: {
    color: COLORS.textPrimary,
  },
});
