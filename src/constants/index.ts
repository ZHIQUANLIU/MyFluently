export const COLORS = {
  // Primary gradient
  primary: '#6C63FF',
  primaryDark: '#4A42CC',
  primaryLight: '#8B85FF',
  
  // Accent
  accent: '#FF6584',
  accentLight: '#FF8FA3',
  
  // Success / warning / error
  success: '#43D9AD',
  warning: '#FFB84C',
  error: '#FF5370',
  
  // Backgrounds
  bg: '#0D0D1A',
  bgCard: 'rgba(255, 255, 255, 0.06)',
  bgCardBorder: 'rgba(255, 255, 255, 0.1)',
  bgOverlay: 'rgba(13, 13, 26, 0.8)',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textMuted: 'rgba(255, 255, 255, 0.35)',
  
  // Score colors
  scoreExcellent: '#43D9AD',
  scoreGood: '#6C63FF',
  scoreAverage: '#FFB84C',
  scorePoor: '#FF5370',
  
  // Level colors
  levels: {
    A1: '#FF6B6B',
    A2: '#FF9F43',
    B1: '#FFB84C',
    B2: '#43D9AD',
    C1: '#6C63FF',
    C2: '#FF6584',
  },
};

export const LEVEL_DESCRIPTIONS: Record<string, { label: string; desc: string }> = {
  A1: { label: 'Beginner', desc: 'Basic phrases and simple conversations' },
  A2: { label: 'Elementary', desc: 'Familiar topics and routine tasks' },
  B1: { label: 'Intermediate', desc: 'Travel, work and social situations' },
  B2: { label: 'Upper-Intermediate', desc: 'Complex topics and fluent interaction' },
  C1: { label: 'Advanced', desc: 'Flexible and effective language use' },
  C2: { label: 'Proficient', desc: 'Near-native mastery and precision' },
};

export const PROFESSIONS = [
  'Software Engineer', 'Product Manager', 'Marketing', 'Sales',
  'Finance / Banking', 'Healthcare / Medicine', 'Legal / Law',
  'Education / Teacher', 'Design / Creative', 'Business / Management',
  'Engineering', 'Science / Research', 'Hospitality / Tourism',
  'Media / Journalism', 'Student', 'Other',
];

export const TOPIC_SUGGESTIONS = [
  'Technology', 'Business', 'Travel', 'Culture', 'Science',
  'Health', 'Environment', 'Sports', 'Music', 'Movies',
  'Food', 'Current Events', 'History', 'Philosophy', 'Art',
];

export const SCORE_LABELS = (score: number) => {
  if (score >= 90) return { label: 'Excellent', color: '#43D9AD' };
  if (score >= 80) return { label: 'Good', color: '#6C63FF' };
  if (score >= 65) return { label: 'Average', color: '#FFB84C' };
  return { label: 'Needs Work', color: '#FF5370' };
};
