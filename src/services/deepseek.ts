import { EnglishLevel, AssessmentQuestion, AssessmentScores, StudyTask, InterviewScores } from '../types';

const BASE_URL = 'https://api.deepseek.com';

async function chat(apiKey: string, messages: any[], responseFormat?: 'json_object') {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages,
      response_format: responseFormat ? { type: responseFormat } : undefined,
      stream: false,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API error: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

export async function generateQuestions(
  apiKey: string,
  level: EnglishLevel,
  profession: string
): Promise<AssessmentQuestion[]> {
  const prompt = `You are an English language assessment expert. Generate 4 coherent, situational English speaking questions for someone who:
- Self-rated English level: ${level}
- Profession: ${profession}

Return ONLY valid JSON in this exact format:
{
  "questions": [
    { "id": "q1", "text": "Question text here", "topic": "Topic category" },
    ...
  ]
}`;

  const content = await chat(apiKey, [{ role: 'user', content: prompt }], 'json_object');
  const parsed = JSON.parse(content);
  return parsed.questions as AssessmentQuestion[];
}

export async function generateStudyPlan(
  apiKey: string,
  level: EnglishLevel,
  profession: string,
  scores: AssessmentScores,
  topics: string[]
): Promise<StudyTask[]> {
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

Create 3 tasks per week (Mon/Wed/Fri pattern = 36 tasks total).
Return ONLY valid JSON:
{
  "tasks": [
    {
      "id": "t1",
      "week": 1,
      "day": 1,
      "title": "...",
      "description": "...",
      "type": "...",
      "durationMinutes": 30,
      "resources": []
    }
  ]
}`;

  const content = await chat(apiKey, [{ role: 'user', content: prompt }], 'json_object');
  const parsed = JSON.parse(content);
  return parsed.tasks.map((t: any) => ({ ...t, completed: false }));
}

export async function generateInterviewQuestions(
  apiKey: string,
  position: string,
  level: EnglishLevel,
  count: number = 10
): Promise<AssessmentQuestion[]> {
  const prompt = `Generate ${count} interview questions for a ${position} role. Candidate level: ${level}.
Return ONLY valid JSON:
{
  "questions": [
    { "id": "iq1", "text": "...", "topic": "Behavioral" }
  ]
}`;

  const content = await chat(apiKey, [{ role: 'user', content: prompt }], 'json_object');
  const parsed = JSON.parse(content);
  return parsed.questions as AssessmentQuestion[];
}

export async function generatePracticeQuestions(
  apiKey: string,
  topic: string,
  level: EnglishLevel,
  count: number = 10
): Promise<AssessmentQuestion[]> {
  const prompt = `Generate ${count} English conversation questions about "${topic}". Level: ${level}.
Return ONLY valid JSON:
{
  "questions": [
    { "id": "pq1", "text": "...", "topic": "${topic}" }
  ]
}`;

  const content = await chat(apiKey, [{ role: 'user', content: prompt }], 'json_object');
  const parsed = JSON.parse(content);
  return parsed.questions as AssessmentQuestion[];
}

export async function analyseText(
  apiKey: string,
  context: string,
  transcript: string,
  type: 'assessment' | 'interview'
): Promise<any> {
  const systemPrompt = type === 'assessment' 
    ? `You are an expert English evaluator. Analyse this transcript of a learner's answers. Return JSON scores for pronunciation (estimated from text flow/errors), grammar, fluency, vocabulary.`
    : `You are an expert interviewer. Analyse this transcript of a candidate's answers. Return JSON scores for confidence, fluency, description, overall.`;

  const prompt = `Context: ${context}\nTranscript: ${transcript}\nReturn ONLY valid JSON.`;

  const content = await chat(apiKey, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ], 'json_object');
  
  return JSON.parse(content);
}
