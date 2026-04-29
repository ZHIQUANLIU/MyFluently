import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';
import { EnglishLevel, AssessmentQuestion, AssessmentScores, StudyTask, StudyPlan } from '../types';

let _client: GoogleGenerativeAI | null = null;

function getClient(apiKey: string) {
  if (!_client) _client = new GoogleGenerativeAI(apiKey);
  return _client;
}

export function resetClient() {
  _client = null;
}

// ─── 1. Generate assessment questions ────────────────────────────────────────
export async function generateQuestions(
  apiKey: string,
  level: EnglishLevel,
  profession: string
): Promise<AssessmentQuestion[]> {
  const model = getClient(apiKey).getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are an English language assessment expert. Generate 4 coherent, situational English speaking questions for someone who:
- Self-rated English level: ${level}
- Profession: ${profession}

The questions should be realistic, professional, and progressively challenging. They should relate to workplace scenarios, everyday situations, or opinion-based discussions relevant to their profession.

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "questions": [
    { "id": "q1", "text": "Question text here", "topic": "Topic category" },
    { "id": "q2", "text": "Question text here", "topic": "Topic category" },
    { "id": "q3", "text": "Question text here", "topic": "Topic category" },
    { "id": "q4", "text": "Question text here", "topic": "Topic category" }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);
  return parsed.questions as AssessmentQuestion[];
}

// ─── 2. Analyse audio recordings and score them ───────────────────────────────
export async function analyseAssessment(
  apiKey: string,
  level: EnglishLevel,
  profession: string,
  questions: AssessmentQuestion[],
  audioUris: string[]
): Promise<AssessmentScores> {
  const model = getClient(apiKey).getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Build parts: text instruction + audio files
  const parts: Part[] = [];

  const systemPrompt = `You are an expert English language evaluator. You will listen to audio recordings of a ${level}-level English learner who works in ${profession}. They answered these questions:

${questions.map((q, i) => `Q${i + 1}: ${q.text}`).join('\n')}

Carefully evaluate ALL audio recordings and return a comprehensive assessment. Consider:
- PRONUNCIATION: clarity, accent interference, phoneme accuracy, stress patterns, intonation
- GRAMMAR: sentence structure, tense usage, subject-verb agreement, articles, prepositions
- FLUENCY: speaking rate, pauses, filler words, self-corrections, coherence
- VOCABULARY: richness, range, appropriateness, CEFR level distribution of words used

For vocabulary level distribution, estimate the percentage of words at each CEFR level (A1, A2, B1, B2, C1, C2).

Return ONLY valid JSON (no markdown):
{
  "pronunciation": <0-100>,
  "grammar": <0-100>,
  "fluency": <0-100>,
  "vocabulary": <0-100>,
  "overall": <weighted average>,
  "vocabularyBreakdown": { "a1": <0-100>, "a2": <0-100>, "b1": <0-100>, "b2": <0-100>, "c1": <0-100>, "c2": <0-100> },
  "feedback": {
    "pronunciation": "<2-3 sentences of specific feedback>",
    "grammar": "<2-3 sentences of specific feedback>",
    "fluency": "<2-3 sentences of specific feedback>",
    "vocabulary": "<2-3 sentences of specific feedback>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
  }
}`;

  parts.push({ text: systemPrompt });

  // Attach each audio file as inline data
  for (let i = 0; i < audioUris.length; i++) {
    try {
      const base64 = await FileSystem.readAsStringAsync(audioUris[i], {
        encoding: 'base64',
      });
      parts.push({
        inlineData: {
          data: base64,
          mimeType: 'audio/m4a',
        },
      });
      parts.push({ text: `[Above is audio recording for Q${i + 1}: "${questions[i]?.text}"]` });
    } catch (e) {
      console.warn(`Could not read audio ${i}:`, e);
    }
  }

  const result = await model.generateContent(parts);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean) as AssessmentScores;
}

// ─── 3. Generate 3-month study plan ──────────────────────────────────────────
export async function generateStudyPlan(
  apiKey: string,
  level: EnglishLevel,
  profession: string,
  scores: AssessmentScores,
  topics: string[]
): Promise<StudyTask[]> {
  const model = getClient(apiKey).getGenerativeModel({ model: 'gemini-2.5-flash' });

  const weakAreas = Object.entries({
    pronunciation: scores.pronunciation,
    grammar: scores.grammar,
    fluency: scores.fluency,
    vocabulary: scores.vocabulary,
  })
    .filter(([, v]) => v < 85)
    .map(([k]) => k);

  const prompt = `You are an expert English language curriculum designer. Create a detailed 3-month (12-week) personalized study plan for:
- Current level: ${level}
- Profession: ${profession}
- Areas scoring below 85 (needs improvement): ${weakAreas.join(', ') || 'all areas are strong, focus on mastery'}
- Scores: Pronunciation ${scores.pronunciation}/100, Grammar ${scores.grammar}/100, Fluency ${scores.fluency}/100, Vocabulary ${scores.vocabulary}/100
- Topics of interest: ${topics.join(', ')}

Create 3 tasks per week (Mon/Wed/Fri pattern = 36 tasks total). Each task should:
- Directly target a weak area or maintain strengths
- Reference the user's topics of interest and profession
- Be specific and actionable (e.g. "Listen to a 5-min TED Talk on ${topics[0]} and shadow-speak it")
- Vary in type and difficulty, increasing over 12 weeks

Return ONLY valid JSON (no markdown):
{
  "tasks": [
    {
      "id": "t1",
      "week": 1,
      "day": 1,
      "title": "<short task title>",
      "description": "<detailed instructions, 2-4 sentences>",
      "type": "<pronunciation|grammar|fluency|vocabulary|mixed>",
      "durationMinutes": <15-45>,
      "resources": ["<optional resource or tip>"]
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);
  return parsed.tasks.map((t: StudyTask) => ({ ...t, completed: false }));
}

// ─── 4. Transcribe audio (text-only fallback display) ────────────────────────
export async function transcribeAudio(
  apiKey: string,
  audioUri: string
): Promise<string> {
  const model = getClient(apiKey).getGenerativeModel({ model: 'gemini-2.5-flash' });
  try {
    const base64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: 'base64',
    });
    const result = await model.generateContent([
      { text: 'Transcribe this audio recording exactly as spoken. Return only the transcript text, nothing else.' },
      { inlineData: { data: base64, mimeType: 'audio/m4a' } },
    ]);
    return result.response.text().trim();
  } catch {
    return '[Transcription unavailable]';
  }
}
