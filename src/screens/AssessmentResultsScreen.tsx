import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SCORE_LABELS } from '../constants';
import { GlassCard, PrimaryButton, SectionHeader, Badge, ProgressBar } from '../components/UI';
import { ScoreGrid } from '../components/ScoreRing';
import { RootStackParamList } from '../types';

type ResultsRoute = RouteProp<RootStackParamList, 'AssessmentResults'>;

export default function AssessmentResultsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { assessment } = useRoute<ResultsRoute>().params;
  const { scores } = assessment;

  const overallLabel = SCORE_LABELS(scores.overall);
  const vocabEntries = Object.entries(scores.vocabularyBreakdown) as [string, number][];

  const categoryColors: Record<string, string> = {
    a1: '#FF6B6B', a2: '#FF9F43', b1: '#FFB84C',
    b2: '#43D9AD', c1: '#6C63FF', c2: '#FF6584',
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Assessment Complete!</Text>
          <Text style={styles.subtitle}>Here's how you did across all four dimensions.</Text>
        </View>

        {/* Overall score card */}
        <GlassCard style={[styles.overallCard, { borderColor: overallLabel.color + '60' }]}>
          <Text style={styles.overallLabel}>Overall Score</Text>
          <Text style={[styles.overallScore, { color: overallLabel.color }]}>{scores.overall}</Text>
          <Text style={[styles.overallBadge, { color: overallLabel.color }]}>{overallLabel.label}</Text>
        </GlassCard>

        {/* Score rings */}
        <GlassCard style={styles.card}>
          <SectionHeader title="Skill Breakdown" />
          <ScoreGrid scores={scores} />
        </GlassCard>

        {/* Vocabulary distribution */}
        <GlassCard style={styles.card}>
          <SectionHeader title="Vocabulary Level" subtitle="Distribution of words across CEFR levels" />
          {vocabEntries.map(([level, pct]) => (
            <View key={level} style={styles.vocabRow}>
              <Text style={[styles.vocabLevel, { color: categoryColors[level] }]}>{level.toUpperCase()}</Text>
              <View style={styles.vocabBarWrap}>
                <ProgressBar progress={pct / 100} color={categoryColors[level]} height={8} />
              </View>
              <Text style={styles.vocabPct}>{pct}%</Text>
            </View>
          ))}
        </GlassCard>

        {/* Feedback */}
        {(['pronunciation', 'grammar', 'fluency', 'vocabulary'] as const).map(cat => {
          const s = scores[cat];
          const { label, color } = SCORE_LABELS(s);
          return (
            <GlassCard key={cat} style={styles.card}>
              <View style={styles.feedbackHeader}>
                <Text style={styles.feedbackCat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
                <Badge label={`${s} – ${label}`} color={color} />
              </View>
              <Text style={styles.feedbackText}>{scores.feedback[cat]}</Text>
            </GlassCard>
          );
        })}

        {/* Strengths & Improvements */}
        <GlassCard style={styles.card}>
          <Text style={styles.subHead}>✅ Strengths</Text>
          {scores.feedback.strengths.map((s, i) => (
            <Text key={i} style={styles.listItem}>• {s}</Text>
          ))}
          <Text style={[styles.subHead, { marginTop: 16 }]}>🎯 Areas to Improve</Text>
          {scores.feedback.improvements.map((s, i) => (
            <Text key={i} style={styles.listItem}>• {s}</Text>
          ))}
        </GlassCard>

        {/* Transcript Confirmation */}
        <GlassCard style={styles.card}>
          <SectionHeader title="Gemini Heard..." subtitle="Verification of your spoken responses" />
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptText}>
              {scores.fullTranscript || "[No transcript available]"}
            </Text>
          </View>
        </GlassCard>

        <PrimaryButton
          label="Create My Study Plan →"
          onPress={() => nav.navigate('TopicSelection', { assessment })}
          style={{ marginBottom: 40 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingTop: 24 },
  header: { alignItems: 'center', marginBottom: 24, gap: 6 },
  emoji: { fontSize: 48 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
  overallCard: {
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    gap: 4,
  },
  overallLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  overallScore: { fontSize: 72, fontWeight: '900', letterSpacing: -3 },
  overallBadge: { fontSize: 16, fontWeight: '700' },
  card: { marginBottom: 16 },
  vocabRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  vocabLevel: { width: 28, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  vocabBarWrap: { flex: 1 },
  vocabPct: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
  feedbackHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  feedbackCat: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 16 },
  feedbackText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21 },
  subHead: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 15, marginBottom: 8 },
  listItem: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 2 },
  transcriptBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
  },
  transcriptText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
