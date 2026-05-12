import { useState, useEffect, useMemo } from 'react';

// Sample MCQs for revision (subset of original bank)
const revisionQuestions = [
  {
    id: 1,
    q: "According to Ohm's law, if voltage is doubled, what happens to current (R constant)?",
    options: ["It doubles", "It halves", "Remains same", "Becomes zero"],
    ans: 0,
    explain: "V=IR, so I = V/R. If V doubles, I doubles.",
    diff: 'easy',
    topic: 'Basic Electrical'
  },
  {
    id: 2,
    q: "What does Thevenin's Theorem state?",
    options: ["Any linear circuit = single V & R in series", "All circuits have single source", "Current is always constant", "Voltage is always constant"],
    ans: 0,
    explain: "Thevenin's theorem: any linear circuit can be replaced by Vth in series with Rth.",
    diff: 'easy',
    topic: 'Basic Electrical'
  },
  {
    id: 3,
    q: "Power factor of a purely resistive circuit is:",
    options: ["1", "0", "0.5", "Infinity"],
    ans: 0,
    explain: "In purely resistive circuit, V and I are in phase, so PF = 1.",
    diff: 'easy',
    topic: 'Basic Electrical'
  },
  {
    id: 4,
    q: "Transformer efficiency is maximum when:",
    options: ["Copper loss = Iron loss", "Copper loss > Iron loss", "Copper loss < Iron loss", "Always maximum at full load"],
    ans: 0,
    explain: "Maximum efficiency occurs when copper losses equal iron (core) losses.",
    diff: 'medium',
    topic: 'Electrical Machines'
  },
  {
    id: 5,
    q: "Ferranti effect occurs in:",
    options: ["Long transmission lines during light load", "Short lines", "Transformers", "Generators"],
    ans: 0,
    explain: "Ferranti effect is voltage rise at receiving end of long lines during light load.",
    diff: 'medium',
    topic: 'Power Systems'
  },
  {
    id: 6,
    q: "PID controller stands for:",
    options: ["Proportional Integral Derivative", "Proportional Individual Differential", "Process Input Differential", "Percent Input Derivative"],
    ans: 0,
    explain: "PID = Proportional + Integral + Derivative control action.",
    diff: 'easy',
    topic: 'Control Systems'
  },
  {
    id: 7,
    q: "ELCB stands for:",
    options: ["Earth Leakage Circuit Breaker", "Electric Line Circuit Breaker", "Earth Load Circuit Breaker", "Energy Loss Circuit Breaker"],
    ans: 0,
    explain: "ELCB stands for Earth Leakage Circuit Breaker.",
    diff: 'easy',
    topic: 'Switchgear'
  },
  {
    id: 8,
    q: "Indian Electricity Act, 2003 was passed in:",
    options: ["2003", "2005", "2001", "2010"],
    ans: 0,
    explain: "The Indian Electricity Act was passed in 2003.",
    diff: 'easy',
    topic: 'Energy & Laws'
  },
  {
    id: 9,
    q: "Slip of an induction motor at starting is:",
    options: ["1", "0", "0.5", "0.02"],
    ans: 0,
    explain: "At start, N=0, so S = (Ns - 0)/Ns = 1.",
    diff: 'easy',
    topic: 'Electrical Machines'
  },
  {
    id: 10,
    q: "Cavitation in pumps occurs due to:",
    options: ["Vapor bubbles formation & collapse", "High speed only", "High temperature only", "Low flow only"],
    ans: 0,
    explain: "Cavitation = vapor bubble formation at low pressure and collapse at high pressure.",
    diff: 'hard',
    topic: 'Pump Motors'
  }
];

// ---------- Storage Helpers ----------
function loadRevisionQueue() {
  try {
    const raw = localStorage.getItem('smc-revision-queue');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveRevisionQueue(queue) {
  localStorage.setItem('smc-revision-queue', JSON.stringify(queue));
}

function initQueue() {
  const stored = loadRevisionQueue();
  if (stored) return stored;
  // Initialize with all questions, spaced-rep defaults
  return revisionQuestions.map(q => ({
    ...q,
    nextReviewDate: new Date().toISOString(),
    interval: 0,
    easeFactor: 2.5,
    reviewHistory: [],
    due: true
  }));
}

// ---------- Dates ----------
function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function isDue(dateStr) {
  return new Date(dateStr) <= new Date();
}

// ---------- Main Component ----------
export default function RevisionEngine() {
  const [queue, setQueue] = useState(() => initQueue());
  const [mode, setMode] = useState('menu'); // menu, study, results
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionCards, setSessionCards] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [timer, setTimer] = useState(0);
  const [results, setResults] = useState({ correct: 0, wrong: 0, skipped: 0 });

  // Timer effect
  useEffect(() => {
    if (!startTime) return;
    const id = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const dueCount = useMemo(() => queue.filter(q => isDue(q.nextReviewDate)).length, [queue]);
  const totalCount = queue.length;
  const weakCount = useMemo(() => queue.filter(q => q.interval <= 1).length, [queue]);
  const strongCount = useMemo(() => queue.filter(q => q.interval >= 7).length, [queue]);

  // Start a revision session
  function startSession(modeName) {
    let selected;
    switch (modeName) {
      case '5min':
        selected = queue
          .filter(q => isDue(q.nextReviewDate))
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);
        break;
      case '30min':
        selected = queue
          .filter(q => isDue(q.nextReviewDate))
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);
        break;
      case 'rapid':
        selected = [...queue].sort(() => Math.random() - 0.5).slice(0, 15);
        break;
      case 'before-mock':
        selected = queue
          .filter(q => q.interval <= 1)
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);
        break;
      case 'last-day':
        selected = queue
          .filter(q => isDue(q.nextReviewDate))
          .sort((a, b) => a.interval - b.interval)
          .slice(0, 20);
        break;
      default:
        selected = [];
    }
    if (selected.length === 0) {
      alert('No cards due for this mode. Great job!');
      return;
    }
    setSessionCards(selected);
    setCardIndex(0);
    setFlipped(false);
    setMode('study');
    setStartTime(Date.now());
    setTimer(0);
    setResults({ correct: 0, wrong: 0, skipped: 0 });
  }

  // Handle card response
  function handleResponse(correct) {
    const current = sessionCards[cardIndex];
    const updatedQueue = queue.map(q => {
      if (q.id !== current.id) return q;
      const newHistory = [...q.reviewHistory, { date: new Date().toISOString(), correct }];
      // Spaced repetition
      let newInterval, newEaseFactor;
      if (correct) {
        newInterval = q.interval === 0 ? 1 : Math.round(q.interval * q.easeFactor);
        newEaseFactor = Math.min(q.easeFactor + 0.1, 4.0);
      } else {
        newInterval = 1;
        newEaseFactor = Math.max(q.easeFactor - 0.2, 1.3);
      }
      return {
        ...q,
        nextReviewDate: addDays(new Date(), newInterval),
        interval: newInterval,
        easeFactor: newEaseFactor,
        reviewHistory: newHistory,
        due: false
      };
    });
    setQueue(updatedQueue);
    saveRevisionQueue(updatedQueue);
    setResults(prev => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1)
    }));
    if (cardIndex + 1 >= sessionCards.length) {
      setMode('results');
      setStartTime(null);
    } else {
      setCardIndex(prev => prev + 1);
      setFlipped(false);
    }
  }

  function skipCard() {
    setResults(prev => ({ ...prev, skipped: prev.skipped + 1 }));
    if (cardIndex + 1 >= sessionCards.length) {
      setMode('results');
      setStartTime(null);
    } else {
      setCardIndex(prev => prev + 1);
      setFlipped(false);
    }
  }

  // Render functions
  if (mode === 'study') {
    const card = sessionCards[cardIndex];
    if (!card) return null;
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-semibold text-accent">Revision</h2>
          <div className="flex items-center gap-2 text-muted text-sm">
            <span>Card {cardIndex + 1} / {sessionCards.length}</span>
            <span>⏱ {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span>
          </div>
        </div>
        <div className="bg-card rounded p-6 mb-4 min-h-[300px] flex flex-col justify-center border border-gray-200 shadow-sm">
          <span className="text-muted text-xs mb-2">{card.topic} | {card.diff}</span>
          <h3 className="text-xl font-medium text-accent mb-4">{card.q}</h3>
          {!flipped ? (
            <div className="space-y-2">
              {card.options.map((opt, i) => (
                <button key={i} onClick={() => setFlipped(true)} className="block w-full text-left p-3 rounded bg-darker text-text hover:bg-secondary/20 transition">
                  {i + 1}. {opt}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-success font-medium mb-2">Answer: {card.options[card.ans]}</p>
              <p className="text-muted text-sm mb-4">{card.explain}</p>
              <div className="flex gap-2">
                <button onClick={() => handleResponse(true)} className="px-4 py-2 bg-success text-dark rounded hover:opacity-80">Know it ✓</button>
                <button onClick={() => handleResponse(false)} className="px-4 py-2 bg-accent2 text-dark rounded hover:opacity-80">Forgot ✗</button>
                <button onClick={skipCard} className="px-4 py-2 bg-darker text-muted rounded">Skip →</button>
              </div>
            </div>
          )}
        </div>
        {!flipped && (
          <div className="flex justify-center">
            <button onClick={() => setFlipped(true)} className="px-4 py-2 bg-secondary text-dark rounded">Show Answer</button>
          </div>
        )}
      </section>
    );
  }

  if (mode === 'results') {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-accent mb-3">Session Complete 🎉</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-card p-3 rounded text-center border border-gray-200 shadow-sm">
            <p className="text-muted text-xs">Correct</p>
            <p className="text-2xl font-bold text-success">{results.correct}</p>
          </div>
          <div className="bg-card p-3 rounded text-center border border-gray-200 shadow-sm">
            <p className="text-muted text-xs">Wrong</p>
            <p className="text-2xl font-bold text-accent2">{results.wrong}</p>
          </div>
          <div className="bg-card p-3 rounded text-center border border-gray-200 shadow-sm">
            <p className="text-muted text-xs">Skipped</p>
            <p className="text-2xl font-bold text-muted">{results.skipped}</p>
          </div>
        </div>
        <button onClick={() => setMode('menu')} className="px-4 py-2 bg-secondary text-dark rounded">Back to Menu</button>
      </section>
    );
  }

  // Menu view
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-3 text-accent">Revision Engine</h2>
      
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-card p-3 rounded border border-gray-200 shadow-sm">
          <p className="text-muted text-xs">Total Cards</p>
          <p className="text-2xl font-bold text-accent">{totalCount}</p>
        </div>
        <div className="bg-card p-3 rounded border border-gray-200 shadow-sm">
          <p className="text-muted text-xs">Due Today</p>
          <p className="text-2xl font-bold text-accent2">{dueCount}</p>
        </div>
        <div className="bg-card p-3 rounded border border-gray-200 shadow-sm">
          <p className="text-muted text-xs">Weak</p>
          <p className="text-2xl font-bold text-accent2">{weakCount}</p>
        </div>
        <div className="bg-card p-3 rounded border border-gray-200 shadow-sm">
          <p className="text-muted text-xs">Mastered</p>
          <p className="text-2xl font-bold text-success">{strongCount}</p>
        </div>
      </div>

      {/* Modes */}
      <h3 className="text-lg font-medium text-accent mb-3">Choose a Revision Mode</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button onClick={() => startSession('5min')} className="bg-card p-4 rounded text-left hover:border-secondary border border-gray-200 shadow-sm transition">
          <h4 className="text-accent font-medium">5-Minute Revision</h4>
          <p className="text-muted text-sm">Quick burst of 5 cards due today.</p>
        </button>
        <button onClick={() => startSession('30min')} className="bg-card p-4 rounded text-left hover:border-secondary border border-gray-200 shadow-sm transition">
          <h4 className="text-accent font-medium">30-Minute Revision</h4>
          <p className="text-muted text-sm">Deep review with 10 cards.</p>
        </button>
        <button onClick={() => startSession('rapid')} className="bg-card p-4 rounded text-left hover:border-secondary border border-gray-200 shadow-sm transition">
          <h4 className="text-accent font-medium">Rapid Revision</h4>
          <p className="text-muted text-sm">Blitz through 15 random cards.</p>
        </button>
        <button onClick={() => startSession('before-mock')} className="bg-card p-4 rounded text-left hover:border-secondary border border-gray-200 shadow-sm transition">
          <h4 className="text-accent font-medium">Before-Mock Review</h4>
          <p className="text-muted text-sm">Focus on weak topics only.</p>
        </button>
        <button onClick={() => startSession('last-day')} className="bg-card p-4 rounded text-left hover:border-secondary border border-gray-200 shadow-sm transition">
          <h4 className="text-accent font-medium">Last-Day Revision</h4>
          <p className="text-muted text-sm">High-priority cards, max 20.</p>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-accent mb-2">Mastery Progress</h3>
        <div className="w-full bg-darker rounded h-4 overflow-hidden">
          <div 
            className="bg-success h-full transition-all duration-500"
            style={{ width: totalCount > 0 ? `${(strongCount / totalCount) * 100}%` : '0%' }}
          />
        </div>
        <p className="text-muted text-sm mt-1">{totalCount > 0 ? Math.round((strongCount / totalCount) * 100) : 0}% mastered</p>
      </div>
    </section>
  );
}
