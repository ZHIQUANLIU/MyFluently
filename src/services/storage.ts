import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, UserProfile, Assessment, StudyPlan } from '../types';

const STORAGE_KEY = 'fluently_app_state';

const defaultState: AppState = {
  user: null,
  assessment: null,
  studyPlan: null,
  interviewSessions: [],
  practiceSessions: [],
  isOnboarded: false,
  apiKey: '',
  deepseekApiKey: '',
  aiProvider: 'gemini',
};


export const StorageService = {
  async load(): Promise<AppState> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState;
      return { ...defaultState, ...JSON.parse(raw) };
    } catch {
      return defaultState;
    }
  },

  async save(state: Partial<AppState>): Promise<void> {
    try {
      const current = await this.load();
      const next = { ...current, ...state };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  },

  async setUser(user: UserProfile): Promise<void> {
    await this.save({ user, isOnboarded: true });
  },

  async setAssessment(assessment: Assessment): Promise<void> {
    await this.save({ assessment });
  },

  async setStudyPlan(studyPlan: StudyPlan): Promise<void> {
    await this.save({ studyPlan });
  },

  async setApiKey(apiKey: string): Promise<void> {
    await this.save({ apiKey });
  },

  async setDeepseekApiKey(deepseekApiKey: string): Promise<void> {
    await this.save({ deepseekApiKey });
  },

  async setAIProvider(aiProvider: 'gemini' | 'deepseek'): Promise<void> {
    await this.save({ aiProvider });
  },


  async markTaskComplete(taskId: string): Promise<void> {
    const state = await this.load();
    if (!state.studyPlan) return;
    const tasks = state.studyPlan.tasks.map(t =>
      t.id === taskId
        ? { ...t, completed: true, completedAt: new Date().toISOString() }
        : t
    );
    const completedDays = tasks.filter(t => t.completed).length;
    const studyPlan = { ...state.studyPlan, tasks, completedDays };
    await this.save({ studyPlan });
  },

  async reset(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
