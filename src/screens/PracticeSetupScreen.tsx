import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, TOPIC_SUGGESTIONS } from '../constants';
import { GlassCard, PrimaryButton, SectionHeader, Chip } from '../components/UI';
import { RootStackParamList } from '../types';

export default function PracticeSetupScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');

  const finalTopic = topic === 'Other' ? customTopic : topic;
  const isValid = finalTopic.trim().length > 0;

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
          title="Practice Mode"
          subtitle="Choose a topic and Gemini will give you 10 practice questions."
        />

        <GlassCard style={styles.card}>
          <Text style={styles.label}>Select a Topic</Text>
          <View style={styles.chips}>
            {TOPIC_SUGGESTIONS.map(t => (
              <Chip
                key={t}
                label={t}
                selected={topic === t}
                onPress={() => setTopic(t)}
                color={COLORS.primary}
              />
            ))}
            <Chip
              label="Other"
              selected={topic === 'Other'}
              onPress={() => setTopic('Other')}
              color={COLORS.accent}
            />
          </View>

          {topic === 'Other' && (
            <TextInput
              style={styles.input}
              placeholder="Enter custom topic..."
              placeholderTextColor={COLORS.textMuted}
              value={customTopic}
              onChangeText={setCustomTopic}
              autoFocus
            />
          )}
        </GlassCard>

        <PrimaryButton
          label="Start Practice →"
          onPress={() => nav.navigate('Practice', { topic: finalTopic })}
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
  label: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    color: COLORS.textPrimary,
    padding: 14,
    fontSize: 16,
  },
});
