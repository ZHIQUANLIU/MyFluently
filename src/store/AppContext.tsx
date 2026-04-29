import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, UserProfile, Assessment, StudyPlan, StudyTask } from '../types';
import { StorageService } from '../services/storage';

interface AppContextType extends AppState {
  isLoading: boolean;
  setUser: (user: UserProfile) => Promise<void>;
  setAssessment: (a: Assessment) => Promise<void>;
  setStudyPlan: (sp: StudyPlan) => Promise<void>;
  setApiKey: (key: string) => Promise<void>;
  markTaskComplete: (taskId: string) => Promise<void>;
  resetAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState & { isLoading: boolean }>({
    user: null,
    assessment: null,
    studyPlan: null,
    isOnboarded: false,
    apiKey: '',
    isLoading: true,
  });

  useEffect(() => {
    StorageService.load().then(loaded =>
      setState(prev => ({ ...prev, ...loaded, isLoading: false }))
    );
  }, []);

  const update = (partial: Partial<AppState>) =>
    setState(prev => ({ ...prev, ...partial }));

  const setUser = async (user: UserProfile) => {
    await StorageService.setUser(user);
    update({ user, isOnboarded: true });
  };

  const setAssessment = async (assessment: Assessment) => {
    await StorageService.setAssessment(assessment);
    update({ assessment });
  };

  const setStudyPlan = async (studyPlan: StudyPlan) => {
    await StorageService.setStudyPlan(studyPlan);
    update({ studyPlan });
  };

  const setApiKey = async (apiKey: string) => {
    await StorageService.setApiKey(apiKey);
    update({ apiKey });
  };

  const markTaskComplete = async (taskId: string) => {
    await StorageService.markTaskComplete(taskId);
    const fresh = await StorageService.load();
    update({ studyPlan: fresh.studyPlan });
  };

  const resetAll = async () => {
    await StorageService.reset();
    setState({ user: null, assessment: null, studyPlan: null, isOnboarded: false, apiKey: state.apiKey, isLoading: false });
  };

  return (
    <AppContext.Provider value={{ ...state, setUser, setAssessment, setStudyPlan, setApiKey, markTaskComplete, resetAll }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
