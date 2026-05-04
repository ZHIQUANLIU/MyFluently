import * as Gemini from './gemini';
import * as DeepSeek from './deepseek';
import { AIProvider, EnglishLevel, AssessmentQuestion, AssessmentScores, StudyTask, InterviewScores } from '../types';

interface AIParams {
  provider: AIProvider;
  geminiKey: string;
  deepseekKey: string;
}

export async function generateQuestions(
  params: AIParams,
  level: EnglishLevel,
  profession: string
): Promise<AssessmentQuestion[]> {
  if (params.provider === 'deepseek' && params.deepseekKey) {
    return DeepSeek.generateQuestions(params.deepseekKey, level, profession);
  }
  return Gemini.generateQuestions(params.geminiKey, level, profession);
}

export async function generateStudyPlan(
  params: AIParams,
  level: EnglishLevel,
  profession: string,
  scores: AssessmentScores,
  topics: string[]
): Promise<StudyTask[]> {
  if (params.provider === 'deepseek' && params.deepseekKey) {
    return DeepSeek.generateStudyPlan(params.deepseekKey, level, profession, scores, topics);
  }
  return Gemini.generateStudyPlan(params.geminiKey, level, profession, scores, topics);
}

export async function generateInterviewQuestions(
  params: AIParams,
  position: string,
  level: EnglishLevel,
  count: number = 10
): Promise<AssessmentQuestion[]> {
  if (params.provider === 'deepseek' && params.deepseekKey) {
    return DeepSeek.generateInterviewQuestions(params.deepseekKey, position, level, count);
  }
  return Gemini.generateInterviewQuestions(params.geminiKey, position, level, count);
}

export async function generatePracticeQuestions(
  params: AIParams,
  topic: string,
  level: EnglishLevel,
  count: number = 10
): Promise<AssessmentQuestion[]> {
  if (params.provider === 'deepseek' && params.deepseekKey) {
    return DeepSeek.generatePracticeQuestions(params.deepseekKey, topic, level, count);
  }
  return Gemini.generatePracticeQuestions(params.geminiKey, topic, level, count);
}

// For analysis, we prefer Gemini because it's multimodal.
// If DeepSeek is selected, we transcribe with Gemini first, then analyze with DeepSeek.
// If no Gemini key, we can't do much with audio yet.

export async function analyseAssessment(
  params: AIParams,
  level: EnglishLevel,
  profession: string,
  questions: AssessmentQuestion[],
  audioUris: string[]
): Promise<AssessmentScores> {
  // If we have Gemini key, we use Gemini's native multimodal analysis (it's better for pronunciation/fluency)
  // Even if provider is DeepSeek, we might want to use Gemini for audio evaluation.
  // But let's respect the provider choice if possible.
  
  if (params.provider === 'deepseek' && params.deepseekKey && params.geminiKey) {
    // Hybrid: Transcribe with Gemini, analyze with DeepSeek
    const transcripts = await Promise.all(audioUris.map(uri => Gemini.transcribeAudio(params.geminiKey, uri)));
    const fullTranscript = transcripts.join('\n');
    const context = `Questions: ${questions.map(q => q.text).join(', ')}`;
    const scores = await DeepSeek.analyseText(params.deepseekKey, context, fullTranscript, 'assessment');
    return {
      ...scores,
      fullTranscript,
    } as AssessmentScores;
  }

  // Default to Gemini (it handles audio natively)
  return Gemini.analyseAssessment(params.geminiKey, level, profession, questions, audioUris);
}

export async function analyseInterview(
  params: AIParams,
  position: string,
  questions: AssessmentQuestion[],
  audioUris: string[]
): Promise<InterviewScores> {
  if (params.provider === 'deepseek' && params.deepseekKey && params.geminiKey) {
    const transcripts = await Promise.all(audioUris.map(uri => Gemini.transcribeAudio(params.geminiKey, uri)));
    const fullTranscript = transcripts.join('\n');
    const context = `Position: ${position}. Questions: ${questions.map(q => q.text).join(', ')}`;
    const scores = await DeepSeek.analyseText(params.deepseekKey, context, fullTranscript, 'interview');
    return {
      ...scores,
      fullTranscript,
    } as InterviewScores;
  }

  return Gemini.analyseInterview(params.geminiKey, position, questions, audioUris);
}
