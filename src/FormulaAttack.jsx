import { useState, useMemo } from 'react';
import { formulas } from './formulas';

const MODES = {
  flashcards: 'Flashcards',
  rapid: 'Rapid Quiz',
  recall: 'Memory Recall',
  challenge: 'Formula Challenge',
  forgotten: 'Forgotten Formula Detector',
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FormulaAttack() {
  const [mode, setMode] = useState('flashcards');
  const [cards, setCards] = useState(shuffle(formulas));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [forgotten, setForgotten] = useState([]);
  const [searched, setSearched] = useState('');
  const [filterTopic, setFilterTopic] = useState('All');

  const topics = useMemo(() => ['All', ...Array.from(new Set(formulas.map(f => f.topic)))], []);
  const filtered = useMemo(() => {
    let pool = [...formulas];
    if (filterTopic !== 'All') pool = pool.filter(f => f.topic === filterTopic);
    if (searched) pool = pool.filter(f => f.name.toLowerCase().includes(searched.toLowerCase()));
    return pool;
  }, [filterTopic, searched]);

  const current = mode === 'forgotten' ? forgotten[idx] || cards[idx] : cards[idx];
  const isLast = idx >= cards.length - 1;

  function next() {
    if (isLast) { setIdx(0); setCards(shuffle(cards)); }
    else setIdx(i => i + 1);
    setFlipped(false);
    setReveal(false);
  }

  function markForgotten() {
    setForgotten(prev => {
      const exists = prev.find(f => f.id === current.id);
      if (!exists) return [...prev, { ...current, interval: 1 }];
      return prev;
    });
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-3 text-accent">Formula & Fact Attack</h2>
      <p className="text-muted mb-3 text-sm">Memorize formulas, equations, and key facts fast.</p>

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(MODES).map(([key, label]) => (
          <button key={key} onClick={() => { setMode(key); setIdx(0); setFlipped(false); setReveal(false); }} className={`px-3 py-1 rounded text-sm ${mode === key ? 'bg-secondary text-dark' : 'bg-darker text-muted'}`}>{label}</button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input value={searched} onChange={e => setSearched(e.target.value)} placeholder="Search formula..." className="flex-1 min-w-[150px] p-2 rounded bg-darker text-text border border-gray-300" />
        <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)} className="p-2 rounded bg-darker text-text border border-gray-300">
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Card Area */}
        {mode === 'flashcards' && (
        <div className="bg-card p-6 rounded mb-3 min-h-[200px] flex flex-col justify-center text-center cursor-pointer border border-gray-200 shadow-sm" onClick={() => setFlipped(!flipped)}>
          <span className="text-muted text-xs">{current.topic}</span>
          <h3 className="text-xl font-bold text-accent mt-2">{current.name}</h3>
          {flipped ? (
            <div className="mt-2">
              <p className="text-2xl font-mono text-success">{current.equation}</p>
              <p className="text-muted text-sm mt-1">{current.description}</p>
            </div>
          ) : (
            <p className="text-muted mt-2">Click to reveal</p>
          )}
        </div>
      )}

        {mode === 'rapid' && (
        <div className="bg-card p-6 rounded mb-3 min-h-[200px] flex flex-col justify-center border border-gray-200 shadow-sm">
          <span className="text-muted text-xs">{current.topic}</span>
          <h3 className="text-xl font-bold text-accent mt-2 mb-2">{current.description}</h3>
          {reveal ? (
            <p className="text-2xl font-mono text-success">{current.equation}</p>
          ) : (
            <p className="text-muted">Click 'Reveal' to see formula</p>
          )}
          {!reveal && <button onClick={() => setReveal(true)} className="mt-3 px-4 py-2 bg-secondary text-dark rounded w-fit mx-auto">Reveal</button>}
        </div>
      )}

        {mode === 'recall' && (
        <div className="bg-card p-6 rounded mb-3 min-h-[200px] flex flex-col justify-center border border-gray-200 shadow-sm">
          <span className="text-muted text-xs">{current.topic}</span>
          <h3 className="text-xl font-bold text-accent mt-2 mb-2">{current.name}</h3>
          {reveal ? (
            <p className="text-2xl font-mono text-success">{current.equation}</p>
          ) : (
            <p className="text-muted">Click 'Reveal' to see formula</p>
          )}
          <button onClick={() => setReveal(true)} className="mt-3 px-4 py-2 bg-secondary text-dark rounded w-fit mx-auto">Reveal</button>
        </div>
      )}

        {mode === 'challenge' && (
        <div className="bg-card p-6 rounded mb-3 min-h-[200px] flex flex-col justify-center border border-gray-200 shadow-sm">
          <span className="text-muted text-xs">{current.topic}</span>
          <h3 className="text-xl font-bold text-accent mt-2 mb-2">{current.name}</h3>
          {reveal ? (
            <div>
              <p className="text-2xl font-mono text-success">{current.equation}</p>
              <p className="text-muted text-sm mt-1">{current.description}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {current.equation.split('').map((ch, i) => (
                <span key={i} className="inline-block w-4 h-6 border-b border-muted text-center text-text">{ch === ' ' ? ' ' : ''}</span>
              ))}
            </div>
          )}
          <button onClick={() => setReveal(true)} className="mt-3 px-4 py-2 bg-secondary text-dark rounded w-fit mx-auto">Show Formula</button>
        </div>
      )}

        {mode === 'forgotten' && (
        <div className="bg-card p-6 rounded mb-3 min-h-[200px] flex flex-col justify-center text-center border border-gray-200 shadow-sm">
          {current ? (
            <>
              <h3 className="text-xl font-bold text-accent">{current.name}</h3>
              <p className="text-2xl font-mono text-success mt-2">{current.equation}</p>
              <p className="text-muted text-sm mt-1">{current.description}</p>
            </>
          ) : (
            <p className="text-muted">No forgotten formulas. Great job!</p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-2">
        <button onClick={next} className="px-4 py-2 bg-secondary text-dark rounded">Next →</button>
        <button onClick={markForgotten} className="px-4 py-2 bg-accent2 text-dark rounded">Forgot it ✗</button>
        <button onClick={() => setCards(shuffle(cards))} className="px-4 py-2 bg-darker text-muted rounded">Shuffle</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-card p-3 rounded border border-gray-200 shadow-sm">
            <p className="text-muted text-xs">Card</p>
            <p className="text-2xl font-bold text-accent">{idx + 1}/{cards.length}</p>
          </div>
          <div className="bg-card p-3 rounded border border-gray-200 shadow-sm">
            <p className="text-muted text-xs">Forgotten</p>
            <p className="text-2xl font-bold text-accent2">{forgotten.length}</p>
          </div>
          <div className="bg-card p-3 rounded border border-gray-200 shadow-sm">
            <p className="text-muted text-xs">Filtered</p>
            <p className="text-2xl font-bold text-success">{filtered.length}</p>
          </div>
          <div className="bg-card p-3 rounded border border-gray-200 shadow-sm">
            <p className="text-muted text-xs">Mode</p>
            <p className="text-2xl font-bold text-accent">{MODES[mode]}</p>
          </div>
      </div>
    </section>
  );
}
