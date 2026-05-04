import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../constants';
import { GlassCard, PrimaryButton, SectionHeader, Badge } from '../components/UI';
import { RootStackParamList } from '../types';

type ResultsRoute = RouteProp<RootStackParamList, 'InterviewResults'>;

export default function InterviewResultsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session } = useRoute<ResultsRoute>().params;
  const { scores } = session;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🤝</Text>
          <Text style={styles.title}>Interview Results</Text>
          <Text style={styles.subtitle}>Feedback for {session.position} role</Text>
        </View>

        <GlassCard style={styles.overallCard}>
          <Text style={styles.overallLabel}>Overall Match</Text>
          <Text style={styles.overallScore}>{scores.overall}%</Text>
        </GlassCard>

        <View style={styles.grid}>
          {[
            { label: 'Confidence', value: scores.confidence, color: COLORS.primary },
            { label: 'Fluency', value: scores.fluency, color: COLORS.success },
            { label: 'Description', value: scores.description, color: COLORS.accent },
          ].map(s => (
            <GlassCard key={s.label} style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>{s.label}</Text>
              <Text style={[styles.scoreValue, { color: s.color }]}>{s.value}</Text>
            </GlassCard>
          ))}
        </View>

        <GlassCard style={styles.feedbackCard}>
          <SectionHeader title="Gemini Heard..." subtitle="Verbatim transcript of your session" />
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptText}>
              {scores.fullTranscript || "[No transcript available]"}
            </Text>
          </View>
        </GlassCard>

        <PrimaryButton
          label="Back to Dashboard"
          onPress={() => nav.navigate('Dashboard')}
          variant="secondary"
          style={{ marginBottom: 40 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 30 },
  emoji: { fontSize: 52, marginBottom: 12 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900' },
  subtitle: { color: COLORS.textSecondary, fontSize: 16 },
  overallCard: { alignItems: 'center', marginBottom: 20, borderColor: COLORS.primary + '60', borderWidth: 2 },
  overallLabel: { color: COLORS.textMuted, textTransform: 'uppercase', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  overallScore: { color: COLORS.primary, fontSize: 64, fontWeight: '900' },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  scoreCard: { flex: 1, alignItems: 'center', padding: 16 },
  scoreLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  scoreValue: { fontSize: 24, fontWeight: '800' },
  feedbackCard: { marginBottom: 24 },
  feedbackText: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 20 },
  subHead: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 8 },
  listItem: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 4 },
  transcriptBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    marginTop: 10,
  },
  transcriptText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
