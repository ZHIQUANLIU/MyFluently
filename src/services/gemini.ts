import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';
import { EnglishLevel, AssessmentQuestion, AssessmentScores, StudyTask, StudyPlan, InterviewScores } from '../types';

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
  const model = getClient(apiKey).getGenerativeModel({ model: 'gemini-1.5-pro' });

  // Build parts: text instruction + audio files
  const parts: Part[] = [];

  const systemPrompt = `You are an expert English language evaluator. You will listen to audio recordings of a ${level}-level English learner who works in ${profession}. They answered these questions:

${questions.map((q, i) => `Q${i + 1}: ${q.text}`).join('\n')}

CRITICAL INSTRUCTION:
1. First, check if there is any intelligible speech in the audio.
2. If the audio is silent, contains only noise, or has no spoken English, you MUST return 0 for all scores and state "No speech detected" in the feedback.
3. Do NOT hallucinate content if the audio is empty.
4. TRANSCRIPTION: You MUST provide a full, verbatim transcript of what you hear in the 'fullTranscript' field. If silence, put "[Silence]".

Carefully evaluate the audio on:
- PRONUNCIATION: clarity, accent, stress, intonation
- GRAMMAR: structure, tense, agreement
- FLUENCY: rate, pauses, filler words
- VOCABULARY: range, appropriateness

Return ONLY valid JSON (no markdown):
{
  "pronunciation": <0-100>,
  "grammar": <0-100>,
  "fluency": <0-100>,
  "vocabulary": <0-100>,
  "overall": <weighted average>,
  "vocabularyBreakdown": { "a1": <0-100>, "a2": <0-100>, "b1": <0-100>, "b2": <0-100>, "c1": <0-100>, "c2": <0-100> },
  "fullTranscript": "<verbatim transcript of all audio>",
  "feedback": {
    "pronunciation": "...",
    "grammar": "...",
    "fluency": "...",
    "vocabulary": "...",
    "strengths": [],
    "improvements": []
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

// ─── 5. Generate Interview Questions ──────────────────────────────────────────
export async function generateInterviewQuestions(
  apiKey: string,
  position: string,
  level: EnglishLevel,
  count: number = 10
): Promise<AssessmentQuestion[]> {
  const model = getClient(apiKey).getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are an expert technical and HR interviewer. Generate ${count} random interview questions for a ${position} role.
The candidate's current English level is ${level}.
The questions should range from technical, behavioral, to situational.
Return ONLY valid JSON in this format:
{
  "questions": [
    { "id": "iq1", "text": "...", "topic": "Behavioral" },
    ...
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);
  return parsed.questions as AssessmentQuestion[];
}

// ─── 6. Analyse Interview ────────────────────────────────────────────────────
export async function analyseInterview(
  apiKey: string,
  position: string,
  questions: AssessmentQuestion[],
  audioUris: string[]
): Promise<InterviewScores> {
  const model = getClient(apiKey).getGenerativeModel({ model: 'gemini-1.5-pro' });

  const parts: Part[] = [];
  const systemPrompt = `You are an expert interviewer evaluating a candidate for a ${position} role.
Based on the provided audio responses, evaluate the candidate on:
- CONFIDENCE: tone, pace, lack of hesitation.
- FLUENCY: natural flow of speech.
- DESCRIPTION: clarity and detail in answers.
- OVERALL: a general interview readiness score.

CRITICAL INSTRUCTION:
1. First, check if there is any intelligible speech in the audio.
2. If the audio is silent, contains only noise, or has no spoken English, you MUST return 0 for all scores and state "No speech detected" in the feedback.
3. Do NOT hallucinate content if the audio is empty.
4. TRANSCRIPTION: You MUST provide a full, verbatim transcript of what you hear in the 'fullTranscript' field. If silence, put "[Silence]".

Return ONLY valid JSON:
{
  "confidence": <0-100>,
  "fluency": <0-100>,
  "description": <0-100>,
  "overall": <0-100>,
  "fullTranscript": "<verbatim transcript of all responses>",
  "feedback": {
    "confidence": "...",
    "fluency": "...",
    "description": "...",
    "overall": "...",
    "strengths": ["...", "..."],
    "improvements": ["...", "..."]
  }
}`;

  parts.push({ text: systemPrompt });

  for (let i = 0; i < audioUris.length; i++) {
    try {
      const base64 = await FileSystem.readAsStringAsync(audioUris[i], { encoding: 'base64' });
      parts.push({ inlineData: { data: base64, mimeType: 'audio/m4a' } });
      parts.push({ text: `[Response to: "${questions[i]?.text}"]` });
    } catch (e) {
      console.warn(`Audio read error ${i}:`, e);
    }
  }

  const result = await model.generateContent(parts);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean) as InterviewScores;
}

// ─── 7. Generate Practice Questions ───────────────────────────────────────────
export async function generatePracticeQuestions(
  apiKey: string,
  topic: string,
  level: EnglishLevel,
  count: number = 10
): Promise<AssessmentQuestion[]> {
  const model = getClient(apiKey).getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Generate ${count} practice English conversation questions about "${topic}".
Level: ${level}.
Return ONLY valid JSON in this format:
{
  "questions": [
    { "id": "pq1", "text": "...", "topic": "${topic}" },
    ...
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);
  return parsed.questions as AssessmentQuestion[];
}
