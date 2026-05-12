import { useState, useEffect, useMemo } from 'react';
import { mockQuestions } from './mcqData';

// ---------- Helpers ----------
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function MockTest() {
  const [screen, setScreen] = useState('menu'); // menu, quiz, results
  const [config, setConfig] = useState({ count: 20, diff: 'all' });
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState({}); // q.id -> optionIndex
  const [marked, setMarked] = useState(new Set());
  const [timer, setTimer] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showSubmit, setShowSubmit] = useState(false);

  // Build question list based on config
  function startQuiz() {
    let pool = [...mockQuestions];
    if (config.diff !== 'all') {
      pool = pool.filter(q => q.diff === config.diff);
    }
    if (pool.length === 0) {
      alert('No questions match this filter.');
      return;
    }
    pool = shuffle(pool).slice(0, Math.min(config.count, pool.length));
    setQuestions(pool.map(q => ({ ...q, id: q.id || Math.random().toString(36).slice(2) })));
    setSelected({});
    setMarked(new Set());
    setQIndex(0);
    setTimer(config.count * 60); // 1 min per question
    setElapsed(0);
    setShowSubmit(false);
    setScreen('quiz');
  }

  // Timer
  useEffect(() => {
    if (screen !== 'quiz' || timer <= 0) return;
    const id = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(id);
          finishQuiz();
          return 0;
        }
        return t - 1;
      });
      setElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [screen, timer, elapsed]);

  const current = questions[qIndex];

  function chooseOption(idx) {
    setSelected(prev => ({ ...prev, [current.id]: idx }));
  }

  function toggleMark() {
    setMarked(prev => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  }

  function finishQuiz() {
    setScreen('results');
  }

  // Results
  const results = useMemo(() => {
    let correct = 0, wrong = 0, skipped = 0;
    const topicStats = {};
    questions.forEach(q => {
      const ans = selected[q.id];
      const isCorrect = ans === q.ans;
      if (isCorrect) correct++;
      else if (ans === undefined) skipped++;
      else wrong++;

      if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, correct: 0 };
      topicStats[q.topic].total++;
      if (isCorrect) topicStats[q.topic].correct++;
    });
    return { correct, wrong, skipped, topicStats };
  }, [questions, selected]);

  const score = results.correct;
  const total = questions.length;
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  // Save results to localStorage for analytics
  useEffect(() => {
    if (screen !== 'results') return;
    const prev = JSON.parse(localStorage.getItem('smc-mock-results') || '[]');
    const newResult = {
      date: new Date().toLocaleDateString(),
      score,
      total,
      accuracy
    };
    localStorage.setItem('smc-mock-results', JSON.stringify([...prev, newResult]));
  }, [screen, score, total, accuracy]);

  // Screens
  if (screen === 'menu') {
    return (
      <section>
        <h2 className="text-2xl font-semibold mb-3 text-accent">Mock Test Engine</h2>
        <p className="text-muted mb-4">Simulate a real exam environment.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-card p-4 rounded border border-gray-200 shadow-sm">
            <h3 className="text-accent font-medium mb-2">Questions</h3>
            <select value={config.count} onChange={e => setConfig(c => ({ ...c, count: Number(e.target.value) }))} className="w-full p-2 rounded bg-darker text-text border border-gray-700">
              <option value={10}>10 (Mini)</option>
              <option value={20}>20 (Quick)</option>
              <option value={30}>30 (Standard)</option>
              <option value={60}>60 (Full)</option>
            </select>
          </div>
          <div className="bg-card p-4 rounded border border-gray-200 shadow-sm">
            <h3 className="text-accent font-medium mb-2">Difficulty</h3>
            <select value={config.diff} onChange={e => setConfig(c => ({ ...c, diff: e.target.value }))} className="w-full p-2 rounded bg-darker text-text border border-gray-700">
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="bg-card p-4 rounded border border-gray-200 shadow-sm flex items-end">
            <button onClick={startQuiz} className="w-full px-4 py-2 bg-secondary text-dark rounded font-medium hover:opacity-80">Start Test</button>
          </div>
        </div>
        <div className="bg-card p-3 rounded border border-gray-200 shadow-sm">
          <p className="text-muted text-sm">Total MCQs in bank: <strong className="text-accent">{mockQuestions.length}</strong></p>
        </div>
        {/* Previous scores */}
        <div className="mt-4">
          <h3 className="text-lg font-medium text-accent mb-2">Previous Attempts</h3>
          <div className="bg-card rounded p-2 border border-gray-200 shadow-sm">
            {(() => {
              const data = JSON.parse(localStorage.getItem('smc-mock-results') || '[]');
              if (data.length === 0) return <p className="text-muted text-sm">No attempts yet.</p>;
              return data.slice(-5).reverse().map((r, i) => (
                <div key={i} className="flex justify-between text-muted text-sm py-1 border-b border-gray-700 last:border-0">
                  <span>{r.date}</span>
                  <span className="text-accent">{r.score}/{r.total} ({r.accuracy}%)</span>
                </div>
              ));
            })()}
          </div>
        </div>
      </section>
    );
  }

  if (screen === 'results') {
    return (
      <section>
        <h2 className="text-2xl font-semibold mb-3 text-accent">Test Results</h2>
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
        <div className="bg-card p-4 rounded mb-4 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-accent mb-2">Topic Breakdown</h3>
          {Object.entries(results.topicStats).map(([topic, stats]) => (
            <div key={topic} className="flex items-center justify-between py-1">
              <span className="text-muted text-sm">{topic}</span>
              <span className="text-accent text-sm">{stats.correct}/{stats.total}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setScreen('menu')} className="px-4 py-2 bg-secondary text-dark rounded">Back to Menu</button>
      </section>
    );
  }

  // Quiz screen
  if (!current) return null;
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold text-accent">Mock Test</h2>
        <div className="flex items-center gap-2 text-muted text-sm">
          <span>Q {qIndex + 1}/{questions.length}</span>
          <span className={timer < 60 ? 'text-accent2 font-bold' : ''}>⏱ {formatTime(timer)}</span>
          <button onClick={() => setShowSubmit(true)} className="px-2 py-1 bg-accent2 text-dark rounded text-xs">Submit</button>
        </div>
      </div>

      {/* Palette */}
      <div className="flex flex-wrap gap-1 mb-3">
        {questions.map((q, i) => {
          const isAnswered = selected[q.id] !== undefined;
          const isMarked = marked.has(q.id);
          let bg = 'bg-darker';
          if (isAnswered) bg = 'bg-secondary';
          else if (isMarked) bg = 'bg-accent';
          return (
            <button
              key={q.id}
              onClick={() => setQIndex(i)}
              className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${i === qIndex ? 'ring-2 ring-white' : ''} ${bg} ${isAnswered || isMarked ? 'text-dark' : 'text-text'}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Question */}
      <div className="bg-card p-4 rounded mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted text-xs">{current.topic} | {current.diff}</span>
          <button onClick={toggleMark} className={`text-xs px-2 py-1 rounded ${marked.has(current.id) ? 'bg-accent text-dark' : 'bg-darker text-muted'}`}>
            {marked.has(current.id) ? '⭐ Marked' : '☆ Mark'}
          </button>
        </div>
        <h3 className="text-accent font-medium mb-3">{current.q}</h3>
        <div className="space-y-2">
          {current.options.map((opt, i) => {
            const isSelected = selected[current.id] === i;
            let style = 'bg-darker text-text border border-gray-300 hover:border-secondary';
            if (isSelected) style = 'bg-secondary text-dark border border-secondary';
            return (
              <button key={i} onClick={() => chooseOption(i)} className={`block w-full text-left p-3 rounded transition ${style}`}>
                {i + 1}. {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation (shown after answering) */}
      {selected[current.id] !== undefined && (
        <div className="bg-card p-3 rounded mb-3">
          <p className={`font-medium ${selected[current.id] === current.ans ? 'text-success' : 'text-accent2'}`}>
            {selected[current.id] === current.ans ? '✓ Correct!' : '✗ Wrong'}
          </p>
          <p className="text-muted text-sm mt-1">{current.explain}</p>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex gap-2">
        <button onClick={() => setQIndex(i => Math.max(0, i - 1))} disabled={qIndex === 0} className="px-4 py-2 bg-darker text-muted rounded disabled:opacity-40">Prev</button>
        <button onClick={() => setQIndex(i => Math.min(questions.length - 1, i + 1))} disabled={qIndex === questions.length - 1} className="px-4 py-2 bg-darker text-muted rounded disabled:opacity-40">Next</button>
        <button onClick={() => setScreen('menu')} className="px-4 py-2 bg-accent2 text-dark rounded">End Test</button>
      </div>

      {/* Submit confirmation */}
      {showSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-accent mb-2">Submit Test?</h3>
            <p className="text-muted mb-4">You have answered {Object.keys(selected).length}/{questions.length} questions.</p>
            <div className="flex gap-2">
              <button onClick={() => { setShowSubmit(false); finishQuiz(); }} className="px-4 py-2 bg-secondary text-dark rounded w-full">Submit</button>
              <button onClick={() => setShowSubmit(false)} className="px-4 py-2 bg-darker text-muted rounded w-full">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
