export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface UserProfile {
  id: string;
  name: string;
  level: EnglishLevel;
  profession: string;
  createdAt: string;
}

export interface AssessmentScores {
  pronunciation: number;
  grammar: number;
  fluency: number;
  vocabulary: number;
  overall: number;
  feedback: {
    pronunciation: string;
    grammar: string;
    fluency: string;
    vocabulary: string;
    strengths: string[];
    improvements: string[];
  };
  vocabularyBreakdown: {
    a1: number;
    a2: number;
    b1: number;
    b2: number;
    c1: number;
    c2: number;
  };
}

export interface Assessment {
  id: string;
  userId: string;
  completedAt: string;
  scores: AssessmentScores;
  questions: AssessmentQuestion[];
  transcripts: string[];
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  topic: string;
  audioUri?: string;
  transcript?: string;
}

export interface StudyTask {
  id: string;
  week: number;
  day: number;
  title: string;
  description: string;
  type: 'pronunciation' | 'grammar' | 'fluency' | 'vocabulary' | 'mixed';
  completed: boolean;
  completedAt?: string;
  durationMinutes: number;
  resources?: string[];
}

export interface StudyPlan {
  id: string;
  userId: string;
  assessmentId: string;
  createdAt: string;
  topics: string[];
  focusAreas: string[];
  tasks: StudyTask[];
  currentWeek: number;
  currentDay: number;
  totalDays: number;
  completedDays: number;
}

export interface AppState {
  user: UserProfile | null;
  assessment: Assessment | null;
  studyPlan: StudyPlan | null;
  isOnboarded: boolean;
  apiKey: string;
}

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  ApiKey: undefined;
  Assessment: undefined;
  AssessmentResults: { assessment: Assessment };
  TopicSelection: { assessment: Assessment };
  StudyPlan: undefined;
  Dashboard: undefined;
  Settings: undefined;
};
