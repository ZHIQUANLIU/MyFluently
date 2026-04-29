import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SCORE_LABELS } from '../constants';
import { GlassCard, SectionHeader, ProgressBar, Badge } from '../components/UI';
import { useApp } from '../store/AppContext';
import { RootStackParamList, StudyTask } from '../types';

const TYPE_ICONS: Record<string, string> = {
  pronunciation: '🗣',
  grammar: '📝',
  fluency: '💬',
  vocabulary: '📚',
  mixed: '⚡',
};

const TYPE_COLORS: Record<string, string> = {
  pronunciation: '#FF6584',
  grammar: '#6C63FF',
  fluency: '#43D9AD',
  vocabulary: '#FFB84C',
  mixed: '#FF9F43',
};

export default function DashboardScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, assessment, studyPlan, markTaskComplete } = useApp();
  const [expandedWeek, setExpandedWeek] = useState(studyPlan?.currentWeek ?? 1);

  if (!studyPlan || !assessment) return null;

  const progress = studyPlan.completedDays / studyPlan.totalDays;
  const overallScore = assessment.scores.overall;
  const { label: scoreLabel, color: scoreColor } = SCORE_LABELS(overallScore);

  // Group tasks by week
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);
  const tasksByWeek = (week: number) => studyPlan.tasks.filter(t => t.week === week);

  const handleComplete = (task: StudyTask) => {
    if (task.completed) return;
    Alert.alert(
      'Mark as done?',
      `"${task.title}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Done ✓', onPress: () => markTaskComplete(task.id) },
      ]
    );
  };

  // Today's task = first incomplete task
  const todayTask = studyPlan.tasks.find(t => !t.completed);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] ?? 'Learner'} 👋</Text>
            <Text style={styles.subGreeting}>Keep up the great work!</Text>
          </View>
          <TouchableOpacity onPress={() => nav.navigate('Settings')} style={styles.settingsBtn}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Progress card */}
        <GlassCard style={styles.progressCard}>
          <View style={styles.progressRow}>
            <View>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={styles.scorePill}>
              <Text style={[styles.scoreNum, { color: scoreColor }]}>{overallScore}</Text>
              <Text style={styles.scoreLabel}>{scoreLabel}</Text>
            </View>
          </View>
          <ProgressBar progress={progress} color={COLORS.primary} height={8} />
          <Text style={styles.progressSub}>
            {studyPlan.completedDays} of {studyPlan.totalDays} sessions complete
          </Text>
        </GlassCard>

        {/* Today's task */}
        {todayTask && (
          <GlassCard style={[styles.todayCard, { borderColor: TYPE_COLORS[todayTask.type] + '50' }]}>
            <Text style={styles.todayLabel}>📅 Today's Task</Text>
            <View style={styles.taskHeader}>
              <Text style={styles.taskIcon}>{TYPE_ICONS[todayTask.type]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{todayTask.title}</Text>
                <Badge label={todayTask.type} color={TYPE_COLORS[todayTask.type]} />
              </View>
              <Text style={styles.taskDuration}>{todayTask.durationMinutes}m</Text>
            </View>
            <Text style={styles.taskDesc}>{todayTask.description}</Text>
            {todayTask.resources && todayTask.resources.length > 0 && (
              <Text style={styles.taskTip}>💡 {todayTask.resources[0]}</Text>
            )}
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={() => handleComplete(todayTask)}
              activeOpacity={0.8}
            >
              <Text style={styles.completeBtnText}>Mark as Complete ✓</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {!todayTask && (
          <GlassCard style={[styles.todayCard, { borderColor: COLORS.success + '50' }]}>
            <Text style={styles.allDoneText}>🎉 All tasks complete! Fantastic work!</Text>
          </GlassCard>
        )}

        {/* Focus areas */}
        <GlassCard style={styles.card}>
          <Text style={styles.focusHeading}>Focus Areas</Text>
          <View style={styles.focusRow}>
            {studyPlan.focusAreas.map(f => (
              <View key={f} style={[styles.focusBadge, { backgroundColor: TYPE_COLORS[f] + '20', borderColor: TYPE_COLORS[f] + '50' }]}>
                <Text style={styles.focusBadgeIcon}>{TYPE_ICONS[f]}</Text>
                <Text style={[styles.focusBadgeText, { color: TYPE_COLORS[f] }]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Weekly plan */}
        <SectionHeader title="12-Week Plan" subtitle={`Topics: ${studyPlan.topics.join(', ')}`} />

        {weeks.map(week => {
          const tasks = tasksByWeek(week);
          if (tasks.length === 0) return null;
          const doneCount = tasks.filter(t => t.completed).length;
          const isExpanded = expandedWeek === week;

          return (
            <GlassCard key={week} style={styles.weekCard}>
              <TouchableOpacity
                style={styles.weekHeader}
                onPress={() => setExpandedWeek(isExpanded ? 0 : week)}
                activeOpacity={0.8}
              >
                <View>
                  <Text style={styles.weekTitle}>Week {week}</Text>
                  <Text style={styles.weekSub}>{doneCount}/{tasks.length} complete</Text>
                </View>
                <View style={styles.weekRight}>
                  <ProgressBar progress={doneCount / tasks.length} color={COLORS.primary} height={4} />
                  <Text style={styles.weekChevron}>{isExpanded ? '▲' : '▼'}</Text>
                </View>
              </TouchableOpacity>

              {isExpanded && tasks.map(task => (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.taskRow, task.completed && styles.taskRowDone]}
                  onPress={() => handleComplete(task)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.taskRowIcon}>{task.completed ? '✅' : TYPE_ICONS[task.type]}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.taskRowTitle, task.completed && styles.taskRowTitleDone]}>
                      {task.title}
                    </Text>
                    <Text style={styles.taskRowMeta}>Day {task.day} · {task.durationMinutes}min · {task.type}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </GlassCard>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingTop: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 26, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },
  subGreeting: { color: COLORS.textSecondary, fontSize: 14, marginTop: 2 },
  settingsBtn: { padding: 8 },
  settingsIcon: { fontSize: 24 },
  progressCard: { marginBottom: 16, gap: 10 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  progressPct: { color: COLORS.textPrimary, fontSize: 32, fontWeight: '900' },
  progressSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  scorePill: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  scoreNum: { fontSize: 24, fontWeight: '900' },
  scoreLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  todayCard: { marginBottom: 16, borderWidth: 1.5, gap: 10 },
  todayLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  taskHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  taskIcon: { fontSize: 28 },
  taskTitle: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 17, marginBottom: 6 },
  taskDuration: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
  taskDesc: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },
  taskTip: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18, fontStyle: 'italic' },
  completeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  completeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  allDoneText: { color: COLORS.success, fontWeight: '800', fontSize: 17, textAlign: 'center', padding: 8 },
  card: { marginBottom: 16 },
  focusHeading: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 16, marginBottom: 12 },
  focusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    gap: 6,
  },
  focusBadgeIcon: { fontSize: 16 },
  focusBadgeText: { fontWeight: '700', fontSize: 13 },
  weekCard: { marginBottom: 12 },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weekTitle: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 16 },
  weekSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  weekRight: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '40%' },
  weekChevron: { color: COLORS.textMuted, fontSize: 12 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.bgCardBorder,
    marginTop: 8,
    gap: 10,
  },
  taskRowDone: { opacity: 0.5 },
  taskRowIcon: { fontSize: 20 },
  taskRowTitle: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 14 },
  taskRowTitleDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  taskRowMeta: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
});
