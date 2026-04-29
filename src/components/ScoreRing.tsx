import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, SCORE_LABELS } from '../constants';

const { width } = Dimensions.get('window');

interface ScoreRingProps {
  score: number;
  label: string;
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({ score, label, size = 100, strokeWidth = 10 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const { label: scoreLabel, color } = SCORE_LABELS(score);

  return (
    <View style={styles.ringContainer}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={`grad-${label}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={COLORS.primary} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.bgCardBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#grad-${label})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[styles.ringInner, { width: size, height: size }]}>
        <Text style={[styles.ringScore, { fontSize: size * 0.22, color }]}>{score}</Text>
        <Text style={styles.ringSubLabel}>{scoreLabel}</Text>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
}

interface ScoreGridProps {
  scores: {
    pronunciation: number;
    grammar: number;
    fluency: number;
    vocabulary: number;
  };
}

export function ScoreGrid({ scores }: ScoreGridProps) {
  const items = [
    { key: 'pronunciation', label: 'Pronunciation', score: scores.pronunciation },
    { key: 'grammar', label: 'Grammar', score: scores.grammar },
    { key: 'fluency', label: 'Fluency', score: scores.fluency },
    { key: 'vocabulary', label: 'Vocabulary', score: scores.vocabulary },
  ];

  return (
    <View style={styles.grid}>
      {items.map(item => (
        <ScoreRing key={item.key} score={item.score} label={item.label} size={110} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  ringContainer: {
    alignItems: 'center',
    margin: 8,
  },
  ringInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringScore: {
    fontWeight: '800',
    letterSpacing: -1,
  },
  ringSubLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  ringLabel: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
});
