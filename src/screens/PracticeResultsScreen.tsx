import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../constants';
import { GlassCard, PrimaryButton, SectionHeader, Badge } from '../components/UI';
import { ScoreGrid } from '../components/ScoreRing';
import { RootStackParamList } from '../types';

type ResultsRoute = RouteProp<RootStackParamList, 'PracticeResults'>;

export default function PracticeResultsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session } = useRoute<ResultsRoute>().params;
  const { scores } = session;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>📈</Text>
          <Text style={styles.title}>Practice Results</Text>
          <Text style={styles.subtitle}>Topic: {session.topic}</Text>
        </View>

        <GlassCard style={styles.overallCard}>
          <Text style={styles.overallLabel}>Overall Performance</Text>
          <Text style={styles.overallScore}>{scores.overall}</Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <SectionHeader title="Skill Breakdown" />
          <ScoreGrid scores={scores} />
        </GlassCard>

        <GlassCard style={styles.card}>
          <SectionHeader title="Feedback" />
          <Text style={styles.feedbackText}>
            Great job practicing your English on the topic of {session.topic}. 
            Your pronunciation scored {scores.pronunciation} and your fluency is at {scores.fluency}.
          </Text>
          
          <Text style={styles.subHead}>✅ Strengths</Text>
          {scores.feedback.strengths.map((s, i) => <Text key={i} style={styles.listItem}>• {s}</Text>)}

          <Text style={[styles.subHead, { marginTop: 16 }]}>🎯 Areas to Improve</Text>
          {scores.feedback.improvements.map((s, i) => <Text key={i} style={styles.listItem}>• {s}</Text>)}
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
  card: { marginBottom: 20 },
  feedbackText: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 20 },
  subHead: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 8 },
  listItem: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 4 },
});
