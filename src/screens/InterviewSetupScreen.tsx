import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../constants';
import { GlassCard, PrimaryButton, SectionHeader } from '../components/UI';
import { RootStackParamList } from '../types';

export default function InterviewSetupScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [position, setPosition] = useState('');
  const [questionCount, setQuestionCount] = useState(10);

  const isValid = position.trim().length > 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => nav.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader
          title="Interview Mode"
          subtitle="Simulate a real job interview. Gemini will ask questions based on the role."
        />

        <GlassCard style={styles.card}>
          <Text style={styles.label}>What position are you applying for?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Senior Frontend Developer"
            placeholderTextColor={COLORS.textMuted}
            value={position}
            onChangeText={setPosition}
          />
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.label}>Number of questions</Text>
          <View style={styles.countRow}>
            {[10, 15, 20].map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.countBtn, questionCount === c && styles.countBtnActive]}
                onPress={() => setQuestionCount(c)}
              >
                <Text style={[styles.countBtnText, questionCount === c && styles.countBtnTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        <PrimaryButton
          label="Start Interview →"
          onPress={() => nav.navigate('Interview', { position, questionCount })}
          disabled={!isValid}
          style={{ marginTop: 20 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, paddingTop: 60 },
  headerRow: { marginBottom: 24 },
  back: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  card: { marginBottom: 24 },
  label: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    color: COLORS.textPrimary,
    padding: 14,
    fontSize: 16,
  },
  countRow: { flexDirection: 'row', gap: 12 },
  countBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
  },
  countBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  countBtnText: { color: COLORS.textSecondary, fontWeight: '700' },
  countBtnTextActive: { color: '#fff' },
});
