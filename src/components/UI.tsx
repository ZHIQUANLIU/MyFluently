import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ViewStyle, TextStyle, ActivityIndicator, StyleProp
} from 'react-native';
import { COLORS } from '../constants';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  label, onPress, loading = false, disabled = false,
  variant = 'primary', style
}: PrimaryButtonProps) {
  const btnStyle = [
    styles.btn,
    variant === 'primary' && styles.btnPrimary,
    variant === 'secondary' && styles.btnSecondary,
    variant === 'ghost' && styles.btnGhost,
    variant === 'danger' && styles.btnDanger,
    (disabled || loading) && styles.btnDisabled,
    style,
  ];

  return (
    <TouchableOpacity style={btnStyle} onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color={COLORS.textPrimary} size="small" />
      ) : (
        <Text style={[styles.btnText, variant === 'ghost' && styles.btnTextGhost]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
}

export function Chip({ label, selected = false, onPress, color }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: color || COLORS.primary, borderColor: color || COLORS.primary }]}
      activeOpacity={0.75}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color = COLORS.primary, height = 6 }: ProgressBarProps) {
  return (
    <View style={[styles.progressTrack, { height }]}>
      <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: color, height }]} />
    </View>
  );
}

interface BadgeProps {
  label: string;
  color?: string;
}

export function Badge({ label, color = COLORS.primary }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '30', borderColor: color + '60' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    padding: 20,
  },
  btn: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnSecondary: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  btnDanger: {
    backgroundColor: COLORS.error + '20',
    borderWidth: 1,
    borderColor: COLORS.error + '60',
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  btnTextGhost: {
    color: COLORS.primary,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
    backgroundColor: COLORS.bgCard,
    margin: 4,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: COLORS.textPrimary,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  progressTrack: {
    backgroundColor: COLORS.bgCardBorder,
    borderRadius: 100,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    borderRadius: 100,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
