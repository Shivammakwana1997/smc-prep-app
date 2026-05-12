import { useState, useEffect } from 'react';
import { askGemini, getApiKey, setApiKey as persistApiKey } from './ai';

// Sample wrong answers for initial analysis (in real app, loaded from revision engine)
const sampleWrongAnswers = [
  { q: "Power factor of a purely resistive circuit is:", options: ["1","0","0.5","Infinity"], ans: 0, studentAnswer: "0", topic: "Basic Electrical", diff: 'easy' },
  { q: "Transformer efficiency is maximum when:", options: ["Copper loss = Iron loss","Copper loss > Iron loss","Copper loss < Iron loss","Always maximum at full load"], ans: 0, studentAnswer: "Always maximum at full load", topic: "Electrical Machines", diff: 'medium' },
  { q: "Ferranti effect occurs in:", options: ["Long transmission lines during light load","Short lines","Transformers","Generators"], ans: 0, studentAnswer: "Transformers", topic: "Power Systems", diff: 'medium' },
  { q: "Routh-Hurwitz criterion is related to:", options: ["Stability analysis","Transfer function","Frequency response","State variables"], ans: 0, studentAnswer: "Frequency response", topic: "Control Systems", diff: 'medium' },
];

export default function AIWeaknessTracker() {
  const [apiKey, setLocalApiKey] = useState(getApiKey());
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const topics = ['Basic Electrical','Electrical Machines','Power Systems','Control Systems','Switchgear','Measurements','Digital Electronics','Energy & Laws'];

  const [topicMastery] = useState(() => {
    return topics.map(t => ({
      name: t,
      mastery: Math.floor(Math.random() * 60 + 40)
    }));
  });

  useEffect(() => {
    // On load, if API key is set, auto-analyze (or only on button click)
  }, []);

  const handleSaveKey = () => {
    persistApiKey(keyInput.trim());
    setLocalApiKey(keyInput.trim());
  };

  const runAnalysis = async () => {
    setError('');
    setResult('');
    setLoading(true);
    try {
      const raid = await askGemini(
        `You are an expert exam preparation tutor for the SMC Assistant Engineer (Electrical) exam in Gujarat, India.

A student has answered the following questions incorrectly:
${sampleWrongAnswers.map((w, i) => `${i+1}. Topic: ${w.topic} | Difficulty: ${w.diff}\n   Q: ${w.q}\n   Correct: ${w.options[w.ans]}\n   Student chose: ${w.studentAnswer}`).join('\n\n')}

Based on these wrong answers, analyze the student's weak areas.
Provide in **Gujarat** context (exam syllabus includes Basic Electrical, Machines, Power Systems, Control Systems, Switchgear, Measurements, Digital Electronics & Microprocessors, Energy & Laws):

1. **Weakest Topics** (top 3, with reasoning)
2. **Recommended Resources** (specific YouTube channels, websites, PDFs)
3. **7-Day Focus Plan** (day-by-day schedule to improve)
4. **Practice Strategy** (how many MCQs per topic per day)

Respond in structured HTML-friendly format. Keep it encouraging and practical.`
      );
      setResult(raid || 'No result returned.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-3 text-accent">AI Weakness Tracker</h2>
      <p className="text-muted mb-4">Powered by Gemini. Add your API key to get personalized study recommendations.</p>

      {/* API Key Config */}
      <div className="bg-card p-4 rounded mb-4 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-accent mb-2">Gemini API Key</h3>
        {apiKey ? (
          <div className="flex items-center gap-2">
            <span className="text-success text-sm">Key set: {apiKey.slice(0, 4)}...{apiKey.slice(-4)}</span>
            <button onClick={() => { setLocalApiKey(''); persistApiKey(''); localStorage.removeItem('smc-gemini-api-key'); }} className="px-2 py-1 bg-darker text-muted rounded text-sm">Remove</button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <input 
              type="password" 
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)} 
              placeholder="Paste your Gemini API key here"
              className="flex-1 min-w-[200px] p-2 rounded bg-darker text-text border border-gray-700 focus:outline-none focus:border-secondary"
            />
            <button onClick={handleSaveKey} className="px-4 py-2 bg-secondary text-dark rounded">Save</button>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="flex gap-2 mb-4">
        <button 
          onClick={runAnalysis} 
          disabled={!apiKey || loading} 
          className="px-4 py-2 bg-secondary text-dark rounded disabled:opacity-40 hover:opacity-80 transition"
        >
          {loading ? 'Analyzing...' : 'Analyze My Weaknesses'}
        </button>
      </div>

      {error && <div className="bg-accent2/20 text-accent2 p-3 rounded mb-4">{error}</div>}

      {/* Results */}
      {result && (
        <div className="bg-card p-4 rounded border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-accent mb-2">Gemini Analysis</h3>
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br/>') }} />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {topicMastery.map(t => (
          <div key={t.name} className="bg-card p-3 rounded border border-gray-200 shadow-sm">
            <p className="text-muted text-xs">{t.name}</p>
            <div className="w-full bg-darker rounded h-2 mt-1">
              <div className="bg-secondary h-full rounded" style={{ width: `${t.mastery}%` }} />
            </div>
            <p className="text-muted text-xs mt-1">{t.mastery}% mastery</p>
          </div>
        ))}
      </div>
    </section>
  );
}
