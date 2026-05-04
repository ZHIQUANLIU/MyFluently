import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, Alert, StatusBar, TouchableOpacity
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, TOPIC_SUGGESTIONS } from '../constants';
import { GlassCard, PrimaryButton, SectionHeader, Chip } from '../components/UI';
import { useApp } from '../store/AppContext';
import * as AI from '../services/ai';
import { RootStackParamList } from '../types';
import { generateId } from '../utils/id';

type TopicRoute = RouteProp<RootStackParamList, 'TopicSelection'>;

export default function TopicSelectionScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { assessment } = useRoute<TopicRoute>().params;
  const { user, apiKey, deepseekApiKey, aiProvider, setStudyPlan } = useApp();
  const aiParams = { provider: aiProvider, geminiKey: apiKey, deepseekKey: deepseekApiKey };

  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);

  const toggle = (topic: string) => {
    setSelected(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const addCustom = () => {
    const t = custom.trim();
    if (t && !selected.includes(t)) {
      setSelected(prev => [...prev, t]);
      setCustom('');
    }
  };

  const handleGenerate = async () => {
    if (selected.length === 0) {
      Alert.alert('Select topics', 'Please choose at least one topic of interest.');
      return;
    }
    setLoading(true);
    try {
      const tasks = await AI.generateStudyPlan(aiParams, user!.level, user!.profession, assessment.scores, selected);

      const weakAreas = Object.entries({
        pronunciation: assessment.scores.pronunciation,
        grammar: assessment.scores.grammar,
        fluency: assessment.scores.fluency,
        vocabulary: assessment.scores.vocabulary,
      })
        .filter(([, v]) => v < 85)
        .map(([k]) => k);

      await setStudyPlan({
        id: generateId(),
        userId: user!.id,
        assessmentId: assessment.id,
        createdAt: new Date().toISOString(),
        topics: selected,
        focusAreas: weakAreas,
        tasks,
        currentWeek: 1,
        currentDay: 1,
        totalDays: tasks.length,
        completedDays: 0,
      });

      nav.replace('Dashboard');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const weakAreas = Object.entries({
    Pronunciation: assessment.scores.pronunciation,
    Grammar: assessment.scores.grammar,
    Fluency: assessment.scores.fluency,
    Vocabulary: assessment.scores.vocabulary,
  })
    .filter(([, v]) => v < 85)
    .map(([k]) => k);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <SectionHeader
          title="What topics interest you?"
          subtitle="AI will build your 3-month study plan around these themes and your weak areas."
        />


        {weakAreas.length > 0 && (
          <GlassCard style={[styles.card, { borderColor: COLORS.warning + '40' }]}>
            <Text style={styles.focusTitle}>🎯 We'll focus on improving:</Text>
            <Text style={styles.focusAreas}>{weakAreas.join(' · ')}</Text>
            <Text style={styles.focusNote}>
              Any skill scoring below 85 will be prioritised in your daily tasks.
            </Text>
          </GlassCard>
        )}

        <GlassCard style={styles.card}>
          <Text style={styles.fieldLabel}>Select your interests</Text>
          <View style={styles.chips}>
            {TOPIC_SUGGESTIONS.map(t => (
              <Chip
                key={t}
                label={t}
                selected={selected.includes(t)}
                onPress={() => toggle(t)}
                color={COLORS.primary}
              />
            ))}
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.fieldLabel}>Add a custom topic</Text>
          <View style={styles.customRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Machine Learning, Jazz music…"
              placeholderTextColor={COLORS.textMuted}
              value={custom}
              onChangeText={setCustom}
              onSubmitEditing={addCustom}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addBtn} onPress={addCustom}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          {selected.filter(t => !TOPIC_SUGGESTIONS.includes(t)).length > 0 && (
            <View style={[styles.chips, { marginTop: 12 }]}>
              {selected.filter(t => !TOPIC_SUGGESTIONS.includes(t)).map(t => (
                <Chip key={t} label={t} selected onPress={() => toggle(t)} color={COLORS.accent} />
              ))}
            </View>
          )}
        </GlassCard>

        {selected.length > 0 && (
          <GlassCard style={[styles.card, styles.selectedSummary]}>
            <Text style={styles.selectedTitle}>{selected.length} topic{selected.length > 1 ? 's' : ''} selected</Text>
            <Text style={styles.selectedList}>{selected.join(', ')}</Text>
          </GlassCard>
        )}

        <PrimaryButton
          label="🚀 Generate My 3-Month Plan"
          onPress={handleGenerate}
          loading={loading}
          disabled={selected.length === 0}
          style={{ marginBottom: 40 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingTop: 24 },
  card: { marginBottom: 16 },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  customRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    color: COLORS.textPrimary,
    padding: 12,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '300' },
  focusTitle: { color: COLORS.warning, fontWeight: '800', fontSize: 15, marginBottom: 6 },
  focusAreas: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 16, marginBottom: 6 },
  focusNote: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18 },
  selectedSummary: { borderColor: COLORS.primary + '40' },
  selectedTitle: { color: COLORS.primary, fontWeight: '800', fontSize: 15, marginBottom: 4 },
  selectedList: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
});
