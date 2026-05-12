import { useState, useEffect } from 'react';
import { askGemini, getApiKey } from './ai';

const subjectiveTopics = [
  {
    id: 'noting',
    title: 'Noting & Drafting',
    prompt: 'You are an Assistant Engineer at Surat Municipal Corporation. Write a formal notice to a residential society regarding pending electricity bill payments and the consequences of non-payment.',
    keywords: ['notice', 'electricity', 'municipal', 'corporation', 'payment', 'rain', 'illegal']
  },
  {
    id: 'contract',
    title: 'Contract Administration',
    prompt: 'Draft a simple contract administration memo for a road construction project involving electrical infrastructure. Include scope, timeline, and penalty clauses for delay.',
    keywords: ['contract', 'scope', 'timeline', 'penalty', 'delay', 'electrical', 'infrastructure']
  },
  {
    id: 'technical',
    title: 'Technical Explanation',
    prompt: 'Explain the working principle of a 3-phase induction motor. Include construction details, slip concept, and why it is widely used in industries.',
    keywords: ['3-phase', 'induction', 'motor', 'slip', 'stator', 'rotor', 'synchronous speed', 'torque']
  },
  {
    id: 'laws',
    title: 'Energy & Laws (Gujarat)',
    prompt: 'Describe the key provisions of the Indian Electricity Act, 2003, specifically focusing on the duties of distribution licensees and consumer rights.',
    keywords: ['Indian Electricity Act', '2003', 'distribution', 'licensee', 'consumer', 'tariff', 'section']
  },
  {
    id: 'problem',
    title: 'Real-Time Problem Solving',
    prompt: 'A 3-phase, 415V, 50Hz distribution transformer supplies power to a residential area. The transformer has a rated capacity of 250 kVA and a power factor of 0.85 lagging. Calculate: (a) The maximum load current (b) The reactive power (kVAR) (c) Suggest measures to improve power factor to 0.95.',
    keywords: ['current', 'kVA', 'kVAR', 'power factor', 'lagging', 'transformer', 'reactive power']
  }
];

export default function SubjectivePractice() {
  const [topic, setTopic] = useState(subjectiveTopics[0]);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('smc-subjective')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('smc-subjective', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(id); setIsActive(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isActive]);

  const startTimer = () => {
    setIsActive(true);
    setTimeLeft(25 * 60);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const submitAnswer = async () => {
    setFeedback('');
    setLoading(true);

    // Basic client-side check
    const wordCount = answer.trim().split(/\s+/).length;
    const hasKeywords = topic.keywords.filter(k => answer.toLowerCase().includes(k.toLowerCase())).length;
    const basicFeedback = `Word count: ${wordCount}. Keywords covered: ${hasKeywords}/${topic.keywords.length}.`;

    // Try AI
    if (getApiKey()) {
      try {
        const prompt = `Evaluate this written answer for the following question. Focus on: missing keywords, poor structure, weak explanation, unnecessary filler, missing calculations.

Question: ${topic.prompt}

Answer: ${answer}

Provide concise bullet-point feedback.`;
        const aiResult = await askGemini(prompt);
        setFeedback(`${basicFeedback}\n\n**AI Feedback:**\n${aiResult}`);
      } catch (err) {
        setFeedback(`${basicFeedback}\n\nAI Error: ${err.message}`);
      }
    } else {
      setFeedback(`${basicFeedback}\n\n(Add Gemini API key in AI Settings for deeper analysis.)`);
    }

    setLoading(false);
    setHistory(prev => [...prev, {
      topic: topic.title,
      answer: answer.slice(0, 200),
      wordCount,
      date: new Date().toLocaleDateString()
    }]);
  };

  const reset = () => {
    setAnswer('');
    setIsActive(false);
    setTimeLeft(25 * 60);
    setFeedback('');
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
        <h2 className="text-2xl font-semibold text-accent">Subjective Answer Practice</h2>
        <span className={`text-sm font-mono ${timeLeft < 300 ? 'text-accent2' : 'text-muted'}`}>⏱ {formatTime(timeLeft)}</span>
      </div>
      <p className="text-muted mb-3 text-sm">Practice drafting, noting, and technical explanations. 25 minutes per answer.</p>

      <div className="bg-card p-4 rounded mb-3 border border-gray-200 shadow-sm">
        <div className="mb-2">
          <label className="text-muted text-sm">Topic</label>
          <select value={topic.id} onChange={e => { const t = subjectiveTopics.find(x => x.id === e.target.value); setTopic(t); reset(); }}           className="w-full p-2 rounded bg-darker text-text border border-gray-300 mt-1">
            {subjectiveTopics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
        <div className="p-3 bg-darker rounded mb-2">
          <p className="text-sm text-muted">{topic.prompt}</p>
        </div>
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Write your answer here..."
          className="w-full h-64 p-3 rounded bg-darker text-text border border-gray-300 focus:outline-none focus:border-secondary resize-y"
          disabled={!isActive && timeLeft !== 25 * 60}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {!isActive && timeLeft === 25 * 60 && (
            <button onClick={startTimer} className="px-4 py-2 bg-secondary text-dark rounded">Start Timer</button>
          )}
          <button onClick={submitAnswer} disabled={!answer.trim()} className="px-4 py-2 bg-success text-dark rounded disabled:opacity-40">Submit Answer</button>
          <button onClick={reset} className="px-4 py-2 bg-darker text-muted rounded">Reset</button>
        </div>
        {loading && <p className="text-muted text-sm mt-1">Analyzing with AI...</p>}
      </div>

      {feedback && (
        <div className="bg-card p-3 rounded mb-3 border border-gray-200 shadow-sm">
          <h3 className="text-accent font-medium mb-1">Feedback</h3>
          <div className="text-sm text-muted whitespace-pre-wrap">{feedback}</div>
        </div>
      )}

      {history.length > 0 && (
        <div className="bg-card p-4 rounded border border-gray-200 shadow-sm">
          <h3 className="text-accent font-medium mb-2">Previous Attempts</h3>
          {history.slice(-3).reverse().map((h, i) => (
            <div key={i} className="text-sm text-muted py-1 border-b border-gray-700 last:border-0">
              <span className="font-medium">{h.topic}</span> — {h.wordCount} words
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
