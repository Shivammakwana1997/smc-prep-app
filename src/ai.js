// Gemini AI integration
const GEMINI_API_KEY_KEY = 'smc-gemini-api-key';

export function getApiKey() {
  return localStorage.getItem(GEMINI_API_KEY_KEY) || '';
}

export function setApiKey(key) {
  localStorage.setItem(GEMINI_API_KEY_KEY, key);
}

export async function askGemini(prompt, model = 'gemini-pro') {
  const key = getApiKey();
  if (!key) {
    throw new Error('No Gemini API key configured. Add it in Settings.');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || `Gemini API error: ${response.status}`);
  }
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Analyze weaknesses from wrong answers
export async function analyzeWeaknesses(wrongAnswers, topics) {
  const prompt = `You are an expert exam preparation tutor. A student has answered the following questions incorrectly. Analyze their weaknesses and provide a personalized study plan.

Wrong Answers:
${wrongAnswers.map((w, i) => `${i + 1}. [${w.topic}] ${w.q}\n   Correct: ${w.options[w.ans]}\n   Student chose: ${w.studentAnswer}`).join('\n')}

Available Topics: ${topics.join(', ')}

Provide:
1. Top 3 weakest topics (with reasoning)
2. Recommended resources (books, videos, web links)
3. A 7-day focused study plan to improve these areas
4. Specific practice questions or exercises they should do

Respond in a structured, encouraging way.`;
  return askGemini(prompt);
}
