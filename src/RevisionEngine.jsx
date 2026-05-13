import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Clock, Layers, Zap, Target, BookOpen, AlertTriangle, CheckCircle2, XCircle, RotateCcw, Award } from 'lucide-react';

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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
      <div className="max-w-3xl mx-auto flex flex-col h-[80vh]">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
               <BrainCircuit size={20} />
             </div>
             <h2 className="text-xl font-bold text-text">Spaced Repetition</h2>
          </div>
          <div className="flex items-center gap-4 bg-white/50 backdrop-blur px-4 py-2 rounded-xl border border-white shadow-sm">
            <span className="font-bold text-muted text-sm">Card {cardIndex + 1} of {sessionCards.length}</span>
            <div className="w-px h-4 bg-darker"></div>
            <span className="font-mono font-bold text-primary flex items-center gap-1.5 text-lg">
               <Clock size={16}/> {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex-1 perspective-1000 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={card.id + (flipped ? '-back' : '-front')}
              initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="dash-card w-full p-8 md:p-12 shadow-2xl flex flex-col justify-center min-h-[400px] relative border-white"
            >
              <div className="absolute top-4 right-4 px-3 py-1 bg-secondary rounded-full border border-darker text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                 <BookOpen size={12}/> {card.topic}
              </div>
              <div className="absolute top-4 left-4 px-3 py-1 bg-amber-100 text-amber-700 rounded-full border border-amber-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                 <AlertTriangle size={12}/> {card.diff}
              </div>

              {!flipped ? (
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-semibold text-text leading-relaxed mb-8">{card.q}</h3>
                  <button onClick={() => setFlipped(true)} className="btn-primary py-3 px-8 text-lg mx-auto inline-flex items-center gap-2">
                     <RotateCcw size={20}/> Reveal Answer
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-xl text-text opacity-50 mb-6 line-clamp-2">{card.q}</h3>
                  <div className="bg-green-50/50 border border-green-200 p-6 rounded-2xl mb-6 shadow-inner">
                    <p className="text-2xl font-bold text-green-700 mb-2">Answer:</p>
                    <p className="text-xl font-medium text-green-900">{card.options[card.ans]}</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-xl border border-darker mb-8">
                     <p className="text-sm font-bold text-muted uppercase tracking-wider mb-1">Explanation</p>
                     <p className="text-text">{card.explain}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button onClick={() => handleResponse(true)} className="btn-primary bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/20 py-3 px-6 flex items-center gap-2 border-none">
                      <CheckCircle2 size={18}/> Remembered
                    </button>
                    <button onClick={() => handleResponse(false)} className="btn-primary bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/20 py-3 px-6 flex items-center gap-2 border-none">
                      <XCircle size={18}/> Forgot
                    </button>
                    <button onClick={skipCard} className="btn-secondary py-3 px-6 text-muted">Skip Card</button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (mode === 'results') {
    return (
      <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto space-y-6 text-center pt-10">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white mx-auto shadow-neon mb-6">
           <Award size={48} />
        </div>
        <h2 className="text-3xl font-bold text-text mb-2">Session Complete! 🎉</h2>
        <p className="text-muted mb-8">You've successfully reviewed {sessionCards.length} cards.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="dash-card p-5">
            <p className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Remembered</p>
            <p className="text-3xl font-bold text-success">{results.correct}</p>
          </div>
          <div className="dash-card p-5">
            <p className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Forgot</p>
            <p className="text-3xl font-bold text-danger">{results.wrong}</p>
          </div>
          <div className="dash-card p-5">
            <p className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Skipped</p>
            <p className="text-3xl font-bold text-muted">{results.skipped}</p>
          </div>
        </div>
        <button onClick={() => setMode('menu')} className="btn-primary px-8 py-3 text-lg">Return to Engine</button>
      </motion.section>
    );
  }

  // Menu view
  return (
    <motion.section variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
      <motion.div variants={item} className="flex items-center gap-3 pb-4 border-b border-darker">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">Revision Engine</h2>
          <p className="text-muted text-sm mt-1">Smart spaced-repetition flashcards to optimize your memory.</p>
        </div>
      </motion.div>
      
      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="dash-card p-5">
          <div className="flex items-center gap-3 mb-2 text-indigo-500">
             <Layers size={18}/> <p className="text-xs font-bold uppercase tracking-wider">Total Cards</p>
          </div>
          <p className="text-3xl font-bold text-text">{totalCount}</p>
        </div>
        <div className="dash-card p-5">
          <div className="flex items-center gap-3 mb-2 text-amber-500">
             <Clock size={18}/> <p className="text-xs font-bold uppercase tracking-wider">Due Today</p>
          </div>
          <p className="text-3xl font-bold text-text">{dueCount}</p>
        </div>
        <div className="dash-card p-5">
          <div className="flex items-center gap-3 mb-2 text-rose-500">
             <AlertTriangle size={18}/> <p className="text-xs font-bold uppercase tracking-wider">Weak Areas</p>
          </div>
          <p className="text-3xl font-bold text-text">{weakCount}</p>
        </div>
        <div className="dash-card p-5">
          <div className="flex items-center gap-3 mb-2 text-green-500">
             <CheckCircle2 size={18}/> <p className="text-xs font-bold uppercase tracking-wider">Mastered</p>
          </div>
          <p className="text-3xl font-bold text-text">{strongCount}</p>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div variants={item} className="dash-card p-5">
        <div className="flex justify-between items-end mb-2">
           <h3 className="text-sm font-bold text-text flex items-center gap-2"><Target size={16} className="text-primary"/> Mastery Progress</h3>
           <span className="text-sm font-bold text-success">{totalCount > 0 ? Math.round((strongCount / totalCount) * 100) : 0}% Mastered</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden shadow-inner border border-darker">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: totalCount > 0 ? `${(strongCount / totalCount) * 100}%` : '0%' }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-green-400 to-green-500 h-full"
          />
        </div>
      </motion.div>

      {/* Modes */}
      <motion.div variants={item}>
        <h3 className="text-lg font-semibold text-text mb-4">Choose a Session Type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button onClick={() => startSession('5min')} className="dash-card p-5 text-left hover:border-primary/50 group transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Zap size={60}/></div>
            <h4 className="text-lg font-bold text-text mb-1 flex items-center gap-2"><Clock size={16} className="text-primary"/> 5-Min Sprint</h4>
            <p className="text-muted text-sm relative z-10">Quick burst of 5 cards due today.</p>
          </button>
          <button onClick={() => startSession('30min')} className="dash-card p-5 text-left hover:border-primary/50 group transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><BrainCircuit size={60}/></div>
            <h4 className="text-lg font-bold text-text mb-1 flex items-center gap-2"><Clock size={16} className="text-indigo-500"/> Deep Dive</h4>
            <p className="text-muted text-sm relative z-10">Intense 30-minute review with 10 cards.</p>
          </button>
          <button onClick={() => startSession('rapid')} className="dash-card p-5 text-left hover:border-primary/50 group transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Zap size={60}/></div>
            <h4 className="text-lg font-bold text-text mb-1 flex items-center gap-2"><Zap size={16} className="text-amber-500"/> Rapid Fire</h4>
            <p className="text-muted text-sm relative z-10">Blitz through 15 random cards.</p>
          </button>
          <button onClick={() => startSession('before-mock')} className="dash-card p-5 text-left hover:border-primary/50 group transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><AlertTriangle size={60}/></div>
            <h4 className="text-lg font-bold text-text mb-1 flex items-center gap-2"><Target size={16} className="text-rose-500"/> Weakness Target</h4>
            <p className="text-muted text-sm relative z-10">Focus exclusively on your weak topics.</p>
          </button>
          <button onClick={() => startSession('last-day')} className="dash-card p-5 text-left hover:border-primary/50 group transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><CheckCircle2 size={60}/></div>
            <h4 className="text-lg font-bold text-text mb-1 flex items-center gap-2"><Layers size={16} className="text-success"/> Exam Prep</h4>
            <p className="text-muted text-sm relative z-10">High-priority cards, up to 20.</p>
          </button>
        </div>
      </motion.div>
    </motion.section>
  );
}