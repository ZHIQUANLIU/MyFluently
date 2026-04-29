import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  TouchableOpacity, Animated, StatusBar, Dimensions
} from 'react-native';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../constants';
import { GlassCard, PrimaryButton, SectionHeader, Badge } from '../components/UI';
import { useApp } from '../store/AppContext';
import { generateQuestions, analyseAssessment, transcribeAudio } from '../services/gemini';
import { RootStackParamList, AssessmentQuestion } from '../types';
import { generateId } from '../utils/id';

const { width } = Dimensions.get('window');
type Phase = 'loading' | 'ready' | 'recording' | 'reviewing' | 'analysing' | 'done';

export default function AssessmentScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, apiKey, setAssessment } = useApp();

  const [phase, setPhase] = useState<Phase>('loading');
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [audioUris, setAudioUris] = useState<string[]>([]);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingObj, setRecordingObj] = useState<Audio.Recording | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const [error, setError] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!user || !apiKey) return;
    loadQuestions();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadQuestions = async () => {
    try {
      setPhase('loading');
      const qs = await generateQuestions(apiKey, user!.level, user!.profession);
      setQuestions(qs);
      setPhase('ready');
    } catch (e: any) {
      setError('Failed to generate questions. Check your API key and network.');
      setPhase('ready');
    }
  };

  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Microphone permission is required.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecordingObj(recording);
      setIsRecording(true);
      setRecordDuration(0);
      setPhase('recording');

      timerRef.current = setInterval(() => {
        setRecordDuration(d => d + 1);
      }, 1000);

      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulseRef.current.start();
    } catch (e) {
      console.error(e);
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

    const newUris = [...audioUris, uri];
    setAudioUris(newUris);
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
      // Transcribe all
      const txs: string[] = [];
      for (const uri of audioUris) {
        const t = await transcribeAudio(apiKey, uri);
        txs.push(t);
      }
      setTranscripts(txs);

      const scores = await analyseAssessment(apiKey, user!.level, user!.profession, questions, audioUris);

      const assessment = {
        id: generateId(),
        userId: user!.id,
        completedAt: new Date().toISOString(),
        scores,
        questions,
        transcripts: txs,
      };

      await setAssessment(assessment);
      nav.replace('AssessmentResults', { assessment });
    } catch (e: any) {
      Alert.alert('Analysis failed', e?.message || 'Please try again.');
      setPhase('ready');
    }
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (!user) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        {questions.length > 0 && (
          <Text style={styles.progress}>{currentQ + 1} / {questions.length}</Text>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {phase === 'loading' && (
          <View style={styles.centred}>
            <Text style={styles.loadingEmoji}>✨</Text>
            <Text style={styles.loadingTitle}>Generating your questions…</Text>
            <Text style={styles.loadingSubtitle}>Gemini is crafting personalised questions for a {user.level} {user.profession}</Text>
          </View>
        )}

        {phase === 'analysing' && (
          <View style={styles.centred}>
            <Text style={styles.loadingEmoji}>🧠</Text>
            <Text style={styles.loadingTitle}>Analysing your speech…</Text>
            <Text style={styles.loadingSubtitle}>Gemini is evaluating pronunciation, grammar, fluency and vocabulary. This may take 30–60 seconds.</Text>
          </View>
        )}

        {(phase === 'ready' || phase === 'recording' || phase === 'reviewing') && questions.length > 0 && (
          <>
            {/* Progress dots */}
            <View style={styles.dots}>
              {questions.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i < audioUris.length && styles.dotDone, i === currentQ && styles.dotActive]}
                />
              ))}
            </View>

            {/* Question card */}
            <GlassCard style={styles.questionCard}>
              <Badge label={questions[currentQ]?.topic || 'Question'} color={COLORS.primary} />
              <Text style={styles.questionNum}>Question {currentQ + 1}</Text>
              <Text style={styles.questionText}>{questions[currentQ]?.text}</Text>
              <Text style={styles.questionHint}>Take a moment to think, then press record when ready.</Text>
            </GlassCard>

            {/* Recording UI */}
            {phase !== 'reviewing' ? (
              <View style={styles.recordSection}>
                <TouchableOpacity
                  onPress={isRecording ? stopRecording : startRecording}
                  activeOpacity={0.85}
                >
                  <Animated.View style={[styles.recordBtn, { transform: [{ scale: pulseAnim }] }]}>
                    <View style={[styles.recordBtnInner, isRecording && styles.recordBtnActive]}>
                      <Text style={styles.recordBtnEmoji}>{isRecording ? '⏹' : '🎙'}</Text>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
                <Text style={styles.recordLabel}>
                  {isRecording ? `Recording… ${formatDuration(recordDuration)}` : 'Tap to record your answer'}
                </Text>
              </View>
            ) : (
              <GlassCard style={styles.reviewCard}>
                <Text style={styles.reviewTitle}>✅ Answer recorded</Text>
                <Text style={styles.reviewSubtitle}>
                  {currentQ < questions.length - 1
                    ? 'Ready for the next question?'
                    : 'That\'s all the questions! Ready to analyse?'}
                </Text>
                <PrimaryButton
                  label={currentQ < questions.length - 1 ? 'Next Question →' : '🧠 Analyse My Speech'}
                  onPress={nextQuestion}
                  style={{ marginTop: 16 }}
                />
              </GlassCard>
            )}

            {error !== '' && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  back: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  progress: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
  content: { padding: 20, paddingTop: 8, flexGrow: 1 },
  centred: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 16 },
  loadingEmoji: { fontSize: 52 },
  loadingTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  loadingSubtitle: { color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.bgCardBorder },
  dotDone: { backgroundColor: COLORS.success },
  dotActive: { backgroundColor: COLORS.primary, width: 24 },
  questionCard: { marginBottom: 24, gap: 10 },
  questionNum: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  questionText: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', lineHeight: 28 },
  questionHint: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
  recordSection: { alignItems: 'center', gap: 20, paddingVertical: 20 },
  recordBtn: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnActive: { backgroundColor: COLORS.error },
  recordBtnEmoji: { fontSize: 32 },
  recordLabel: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' },
  reviewCard: { gap: 6 },
  reviewTitle: { color: COLORS.success, fontSize: 17, fontWeight: '800' },
  reviewSubtitle: { color: COLORS.textSecondary, fontSize: 14 },
  errorText: { color: COLORS.error, textAlign: 'center', marginTop: 16, fontSize: 14 },
});
