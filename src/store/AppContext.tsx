import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, UserProfile, Assessment, StudyPlan, StudyTask, InterviewSession, PracticeSession } from '../types';
import { StorageService } from '../services/storage';

interface AppContextType extends AppState {
  isLoading: boolean;
  setUser: (user: UserProfile) => Promise<void>;
  setAssessment: (a: Assessment) => Promise<void>;
  setStudyPlan: (sp: StudyPlan) => Promise<void>;
  setApiKey: (key: string) => Promise<void>;
  setDeepseekApiKey: (key: string) => Promise<void>;
  setAIProvider: (provider: AIProvider) => Promise<void>;
  addInterviewSession: (session: InterviewSession) => Promise<void>;

  addPracticeSession: (session: PracticeSession) => Promise<void>;
  markTaskComplete: (taskId: string) => Promise<void>;
  resetAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState & { isLoading: boolean }>({
    user: null,
    assessment: null,
    studyPlan: null,
    interviewSessions: [],
    practiceSessions: [],
    isOnboarded: false,
    apiKey: '',
    deepseekApiKey: '',
    aiProvider: 'gemini',
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

  const setDeepseekApiKey = async (deepseekApiKey: string) => {
    await StorageService.setDeepseekApiKey(deepseekApiKey);
    update({ deepseekApiKey });
  };

  const setAIProvider = async (aiProvider: AIProvider) => {
    await StorageService.setAIProvider(aiProvider);
    update({ aiProvider });
  };


  const addInterviewSession = async (session: InterviewSession) => {
    const updated = [session, ...state.interviewSessions];
    await StorageService.save({ interviewSessions: updated });
    update({ interviewSessions: updated });
  };

  const addPracticeSession = async (session: PracticeSession) => {
    const updated = [session, ...state.practiceSessions];
    await StorageService.save({ practiceSessions: updated });
    update({ practiceSessions: updated });
  };

  const markTaskComplete = async (taskId: string) => {
    await StorageService.markTaskComplete(taskId);
    const fresh = await StorageService.load();
    update({ studyPlan: fresh.studyPlan });
  };

  const resetAll = async () => {
    await StorageService.reset();
    setState({ user: null, assessment: null, studyPlan: null, interviewSessions: [], practiceSessions: [], isOnboarded: false, apiKey: state.apiKey, deepseekApiKey: state.deepseekApiKey, aiProvider: state.aiProvider, isLoading: false });

  };

  return (
    <AppContext.Provider value={{ ...state, setUser, setAssessment, setStudyPlan, setApiKey, setDeepseekApiKey, setAIProvider, addInterviewSession, addPracticeSession, markTaskComplete, resetAll }}>

      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
