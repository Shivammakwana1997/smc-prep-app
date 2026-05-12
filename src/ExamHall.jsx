import { useState, useEffect, useMemo, useCallback } from 'react';
import { mockQuestions } from './mcqData';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function FullScreenExam({ paperType, qCount, onExit }) {
  const [questions] = useState(() => {
    let pool = [...mockQuestions];
    if (paperType === 'easy') pool = pool.filter(q => q.diff === 'easy');
    if (paperType === 'moderate') pool = pool.filter(q => q.diff === 'medium');
    if (paperType === 'brutal') pool = pool.filter(q => q.diff === 'hard' || q.diff === 'medium');
    return shuffle(pool).slice(0, qCount);
  });
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // id -> optionIndex
  const [marked, setMarked] = useState(new Set());
  const [results, setResults] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitConfirm, setSubmitConfirm] = useState(false);

  // Time per question in seconds based on paper type
  const timePerQ = useMemo(() => {
    switch (paperType) {
      case 'easy': return 90;
      case 'moderate': return 60;
      case 'brutal': return 45;
      case 'pyq': return 60;
      default: return 60;
    }
  }, [paperType]);

  const totalTime = useMemo(() => qCount * timePerQ, [qCount, timePerQ]);

  const [timer, setTimer] = useState(totalTime);
  const [active, setActive] = useState(true);

  const handleSubmit = useCallback((auto = false) => {
    if (!auto && !window.confirm('Submit the exam?')) return;
    setActive(false);
    setSubmitted(true);
    let correct = 0, wrong = 0, skipped = 0;
    const topicStats = {};
    questions.forEach(q => {
      const ans = answers[q.id];
      const isCorrect = ans === q.ans;
      if (isCorrect) correct++;
      else if (ans === undefined) skipped++;
      else wrong++;
      if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, correct: 0 };
      topicStats[q.topic].total++;
      if (isCorrect) topicStats[q.topic].correct++;
    });
    setResults({ correct, wrong, skipped, topicStats, timeTaken: totalTime - timer });
  }, [questions, answers, totalTime, timer]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(id); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, handleSubmit]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (submitted || results) return;
      if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key) - 1;
        setAnswers(prev => ({ ...prev, [questions[current].id]: idx }));
      } else if (e.key === 'ArrowLeft') {
        setCurrent(c => Math.max(0, c - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrent(c => Math.min(questions.length - 1, c + 1));
      } else if (e.key.toLowerCase() === 'm') {
        setMarked(prev => {
          const next = new Set(prev);
          const id = questions[current].id;
          next.has(id) ? next.delete(id) : next.add(id);
          return next;
        });
      } else if (e.key.toLowerCase() === 's') {
        setSubmitConfirm(true);
      } else if (e.key === 'Escape') {
        setSubmitConfirm(true);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [current, questions, submitted, results]);

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;

  if (!q && !results) return <div className="text-muted text-center mt-10">Loading...</div>;

  if (results) {
    const score = results.correct;
    const total = questions.length;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="fixed inset-0 z-50 bg-dark text-text flex flex-col items-center justify-center p-4 overflow-auto">
        <h1 className="text-3xl font-bold text-accent mb-2">Exam Complete</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-card p-3 rounded text-center border border-gray-200 shadow-sm">
            <p className="text-muted text-xs">Score</p>
            <p className="text-2xl font-bold text-accent">{score}/{total}</p>
          </div>
          <div className="bg-card p-3 rounded text-center border border-gray-200 shadow-sm">
            <p className="text-muted text-xs">Accuracy</p>
            <p className="text-2xl font-bold text-accent">{accuracy}%</p>
          </div>
          <div className="bg-card p-3 rounded text-center border border-gray-200 shadow-sm">
            <p className="text-muted text-xs">Correct</p>
            <p className="text-2xl font-bold text-success">{results.correct}</p>
          </div>
          <div className="bg-card p-3 rounded text-center border border-gray-200 shadow-sm">
            <p className="text-muted text-xs">Wrong</p>
            <p className="text-2xl font-bold text-accent2">{results.wrong}</p>
          </div>
        </div>
        <div className="bg-card p-4 rounded w-full max-w-2xl mb-4 border border-gray-200 shadow-sm">
          <h3 className="text-accent font-medium mb-2">Topic Breakdown</h3>
          {Object.entries(results.topicStats).map(([topic, stats]) => (
            <div key={topic} className="flex justify-between text-muted text-sm py-1 border-b border-gray-700 last:border-0">
              <span>{topic}</span>
              <span>{stats.correct}/{stats.total}</span>
            </div>
          ))}
        </div>
        <button onClick={onExit} className="px-4 py-2 bg-secondary text-dark rounded">Exit Exam Hall</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-dark text-text flex flex-col p-2 sm:p-4 overflow-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-muted text-xs">Exam Hall</span>
          <span className="text-sm font-mono text-accent2">⏱ {formatTime(timer)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted text-xs">
          <span>Ans: {answeredCount}/{questions.length}</span>
          <span>Marked: {marked.size}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-darker h-2 rounded mb-3">
        <div className="bg-accent h-2 rounded transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">
        <span className="text-muted text-xs mb-1">{q.topic} | {q.diff}</span>
        <h2 className="text-xl sm:text-2xl font-semibold text-accent mb-4">{q.q}</h2>
        <div className="space-y-2 mb-4">
          {q.options.map((opt, i) => {
            const isSelected = answers[q.id] === i;
            const style = isSelected ? 'bg-secondary text-dark border-secondary' : 'bg-darker text-text border-gray-300 hover:border-secondary';
            return (
              <button
                key={i}
                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: i }))}
                className={`block w-full text-left p-3 rounded border transition ${style}`}
              >
                <span className="font-bold mr-2">{i + 1}.</span> {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-auto max-w-3xl mx-auto w-full">
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} className="px-3 py-2 bg-darker text-muted rounded disabled:opacity-40">← Prev</button>
        <button onClick={() => setMarked(prev => {
          const next = new Set(prev);
          next.has(q.id) ? next.delete(q.id) : next.add(q.id);
          return next;
        })} className={`px-3 py-2 rounded ${marked.has(q.id) ? 'bg-accent text-dark' : 'bg-darker text-muted'}`}>⭐ Mark</button>
        <span className="text-muted text-sm font-mono">Q {current + 1}/{questions.length}</span>
        <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1} className="px-3 py-2 bg-darker text-muted rounded disabled:opacity-40">Next →</button>
        <button onClick={() => setSubmitConfirm(true)} className="px-4 py-2 bg-accent2 text-dark rounded">Submit</button>
      </div>

      {/* Submit confirmation */}
      {submitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded max-w-sm w-full mx-4 border border-gray-200 shadow-lg">
            <h3 className="text-xl font-semibold text-accent mb-2">Submit Exam?</h3>
            <p className="text-muted text-sm mb-4">You have answered {answeredCount}/{questions.length} questions. Time left: {formatTime(timer)}</p>
            <div className="flex gap-2">
              <button onClick={() => handleSubmit(false)} className="px-4 py-2 bg-secondary text-dark rounded w-full">Submit</button>
              <button onClick={() => setSubmitConfirm(false)} className="px-4 py-2 bg-darker text-muted rounded w-full">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamHall() {
  const [simulating, setSimulating] = useState(false);
  const [paperType, setPaperType] = useState('moderate');
  const [qCount, setQCount] = useState(60);

  if (simulating) {
    return <FullScreenExam paperType={paperType} qCount={qCount} onExit={() => setSimulating(false)} />;
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-3 text-accent">Exam Hall Simulation</h2>
      <p className="text-muted mb-4">Simulate a real exam environment.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="bg-card p-4 rounded border border-gray-200 shadow-sm">
          <h3 className="text-accent font-medium mb-2">Paper Type</h3>
          <select value={paperType} onChange={e => setPaperType(e.target.value)} className="w-full p-2 rounded bg-darker text-text border border-gray-700 mb-2">
            <option value="easy">Easy Paper</option>
            <option value="moderate">Moderate Paper</option>
            <option value="brutal">Brutal Paper</option>
            <option value="pyq">Previous Year Simulation</option>
          </select>
          <p className="text-muted text-xs">Easy: 1.5 min/q | Moderate: 1 min/q | Brutal: 0.75 min/q</p>
        </div>
        <div className="bg-card p-4 rounded border border-gray-200 shadow-sm">
          <h3 className="text-accent font-medium mb-2">Questions</h3>
          <select value={qCount} onChange={e => setQCount(Number(e.target.value))} className="w-full p-2 rounded bg-darker text-text border border-gray-700 mb-2">
            <option value={10}>10 (Quick)</option>
            <option value={30}>30 (Short)</option>
            <option value={60}>60 (Full)</option>
          </select>
          <p className="text-muted text-xs">Recommended: 60 for full exam feel.</p>
        </div>
      </div>
      <button onClick={() => setSimulating(true)} className="px-4 py-2 bg-secondary text-dark rounded font-medium hover:opacity-80">Enter Exam Hall</button>
    </section>
  );
}
