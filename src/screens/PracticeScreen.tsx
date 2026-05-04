import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  TouchableOpacity, Animated, StatusBar
} from 'react-native';
import { Audio } from 'expo-av';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../constants';
import { GlassCard, PrimaryButton, SectionHeader, Badge } from '../components/UI';
import { useApp } from '../store/AppContext';
import * as AI from '../services/ai';
import { RootStackParamList, AssessmentQuestion } from '../types';
import { generateId } from '../utils/id';

type PracticeRoute = RouteProp<RootStackParamList, 'Practice'>;
type Phase = 'loading' | 'ready' | 'recording' | 'reviewing' | 'analysing' | 'done';

export default function PracticeScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { topic } = useRoute<PracticeRoute>().params;
  const { user, apiKey, deepseekApiKey, aiProvider, addPracticeSession } = useApp();
  const aiParams = { provider: aiProvider, geminiKey: apiKey, deepseekKey: deepseekApiKey };

  const [phase, setPhase] = useState<Phase>('loading');
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [audioUris, setAudioUris] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingObj, setRecordingObj] = useState<Audio.Recording | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!user || (!apiKey && !deepseekApiKey)) return;
    loadQuestions();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadQuestions = async () => {
    try {
      setPhase('loading');
      const qs = await AI.generatePracticeQuestions(aiParams, topic, user!.level, 10);
      setQuestions(qs);
      setPhase('ready');
    } catch (e) {
      Alert.alert('Error', 'Failed to generate practice questions.');
      nav.goBack();
    }
  };

  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return Alert.alert('Permission needed', 'Microphone permission is required.');
      
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecordingObj(recording);
      setIsRecording(true);
      setRecordDuration(0);
      setPhase('recording');

      timerRef.current = setInterval(() => setRecordDuration(d => d + 1), 1000);
      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulseRef.current.start();
    } catch (e) {
      Alert.alert('Error', 'Could not start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recordingObj) return;
    if (timerRef.current) clearInterval(timerRef.current);
    pulseRef.current?.stop();
    pulseAnim.setValue(1);

    await recordingObj.stopAndUnloadAsync();
    const uri = recordingObj.getURI() ?? '';
    setRecordingObj(null);
    setIsRecording(false);
    setPhase('reviewing');
    setAudioUris([...audioUris, uri]);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setPhase('ready');
    } else {
      runAnalysis();
    }
  };

  const runAnalysis = async () => {
    setPhase('analysing');
    try {
      const scores = await AI.analyseAssessment(aiParams, user!.level, user!.profession, questions, audioUris);
      const session = {
        id: generateId(),
        userId: user!.id,
        topic,
        completedAt: new Date().toISOString(),
        scores,
        questions,
        transcripts: scores.fullTranscript ? scores.fullTranscript.split('\n') : [],
      };
      await addPracticeSession(session);
      nav.replace('PracticeResults', { session });
    } catch (e) {
      Alert.alert('Analysis failed', 'Please try again.');
      setPhase('ready');
    }
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (phase === 'loading') {
    return (
      <View style={styles.centred}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <Text style={styles.loadingEmoji}>📚</Text>
        <Text style={styles.loadingTitle}>Generating practice session…</Text>
        <Text style={styles.loadingSubtitle}>AI is preparing 10 questions about {topic}.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>{currentQ + 1} / {questions.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {phase === 'analysing' ? (
          <View style={styles.centred}>
            <Text style={styles.loadingEmoji}>🧠</Text>
            <Text style={styles.loadingTitle}>Analysing your session…</Text>
            <Text style={styles.loadingSubtitle}>AI is evaluating your English skills.</Text>
          </View>
        ) : (
          <>
            <GlassCard style={styles.questionCard}>
              <Badge label={topic} color={COLORS.primary} />
              <Text style={styles.questionText}>{questions[currentQ]?.text}</Text>
            </GlassCard>

            <View style={styles.recordSection}>
              {phase !== 'reviewing' ? (
                <>
                  <TouchableOpacity onPress={isRecording ? stopRecording : startRecording}>
                    <Animated.View style={[styles.recordBtn, { transform: [{ scale: pulseAnim }] }]}>
                      <View style={[styles.recordBtnInner, isRecording && styles.recordBtnActive]}>
                        <Text style={styles.recordBtnEmoji}>{isRecording ? '⏹' : '🎙'}</Text>
                      </View>
                    </Animated.View>
                  </TouchableOpacity>
                  <Text style={styles.recordLabel}>{isRecording ? `Recording… ${formatDuration(recordDuration)}` : 'Tap to answer'}</Text>
                </>
              ) : (
                <View style={{ width: '100%' }}>
                  <Text style={styles.reviewTitle}>✅ Answer recorded</Text>
                  <PrimaryButton
                    label={currentQ < questions.length - 1 ? 'Next Question →' : '📈 Complete Practice'}
                    onPress={nextQuestion}
                  />
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centred: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', padding: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  back: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  progress: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
  content: { padding: 24 },
  loadingEmoji: { fontSize: 52, marginBottom: 20 },
  loadingTitle: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  loadingSubtitle: { color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  questionCard: { marginBottom: 40, gap: 16 },
  questionText: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 32 },
  recordSection: { alignItems: 'center', gap: 20 },
  recordBtn: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary + '20', alignItems: 'center', justifyContent: 'center' },
  recordBtnInner: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  recordBtnActive: { backgroundColor: COLORS.error },
  recordBtnEmoji: { fontSize: 28 },
  recordLabel: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' },
  reviewTitle: { color: COLORS.success, fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
});
