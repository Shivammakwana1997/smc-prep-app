import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Target, Flag, CheckCircle2, XCircle, AlertTriangle, BookOpen, ChevronLeft, ChevronRight, Award, LogOut } from 'lucide-react';
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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
    if (!auto && submitConfirm === false) {
      setSubmitConfirm(true);
      return;
    }
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
  }, [questions, answers, totalTime, timer, submitConfirm]);

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
        if(submitConfirm) setSubmitConfirm(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [current, questions, submitted, results, submitConfirm]);

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;

  if (!q && !results) return <div className="text-muted text-center mt-10">Loading...</div>;

  if (results) {
    const score = results.correct;
    const total = questions.length;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="fixed inset-0 z-[100] bg-secondary text-text flex flex-col items-center justify-center p-4 overflow-auto">
        {/* Animated Mesh Background */}
        <div className="mesh-bg">
          <div className="mesh-blob bg-blue-300 w-96 h-96 top-0 left-0"></div>
          <div className="mesh-blob bg-purple-300 w-96 h-96 top-1/2 left-1/4" style={{ animationDelay: '2s' }}></div>
          <div className="mesh-blob bg-pink-300 w-96 h-96 bottom-0 right-0" style={{ animationDelay: '4s' }}></div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl w-full space-y-6 relative z-10 pt-10">
          <div className="text-center py-6">
             <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white mx-auto shadow-neon mb-6">
                <Award size={48} />
             </div>
             <h1 className="text-4xl font-bold text-text mb-2">Exam Complete</h1>
             <p className="text-muted text-lg">You finished in {formatTime(results.timeTaken)}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="dash-card p-5 text-center">
              <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-1">Final Score</p>
              <p className="text-3xl font-bold text-primary">{score}<span className="text-lg text-muted">/{total}</span></p>
            </div>
            <div className="dash-card p-5 text-center">
              <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-1">Accuracy</p>
              <p className={`text-3xl font-bold ${accuracy >= 70 ? 'text-success' : 'text-accent'}`}>{accuracy}%</p>
            </div>
            <div className="dash-card p-5 text-center">
              <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-1">Correct</p>
              <p className="text-3xl font-bold text-success">{results.correct}</p>
            </div>
            <div className="dash-card p-5 text-center">
              <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-1">Wrong</p>
              <p className="text-3xl font-bold text-danger">{results.wrong}</p>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-header">
               <h3 className="text-lg font-semibold text-text">Topic Breakdown</h3>
            </div>
            <div className="dash-card-body space-y-4">
              {Object.entries(results.topicStats).map(([topic, stats]) => {
                const perc = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={topic}>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-medium text-text">{topic}</span>
                      <span className="text-xs font-bold text-muted">{perc}% ({stats.correct}/{stats.total})</span>
                    </div>
                    <div className="w-full h-2 bg-darker rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${perc}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${perc >= 70 ? 'bg-success' : perc >= 40 ? 'bg-accent' : 'bg-danger'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-center pt-4 pb-10">
            <button onClick={onExit} className="btn-secondary px-8 py-3 flex items-center gap-2">
               <LogOut size={20}/> Exit Exam Hall
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-secondary text-text flex flex-col overflow-hidden">
      {/* Strict UI Background */}
      <div className="absolute inset-0 bg-[#f1f5f9] z-[-1]"></div>

      {/* Header */}
      <header className="bg-white border-b border-darker shadow-sm px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
             <Target size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text leading-tight">Exam Hall Simulation</h1>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">{paperType} Paper</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Answered</p>
                <p className="text-sm font-bold text-primary">{answeredCount} / {questions.length}</p>
             </div>
             <div className="w-px h-8 bg-darker"></div>
             <div className="text-left">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Marked</p>
                <p className="text-sm font-bold text-amber-600">{marked.size}</p>
             </div>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold font-mono text-xl shadow-inner border ${timer < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-gray-50 text-text border-darker'}`}>
            <Clock size={20} className={timer < 300 ? 'animate-bounce' : ''}/> 
            {formatTime(timer)}
          </div>
          
          <button onClick={() => setSubmitConfirm(true)} className="btn-primary bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/20 border-none px-6">
            Finish Exam
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="w-full bg-darker h-1 shrink-0">
        <div className="bg-primary h-full transition-all duration-300" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden relative z-10">
        
        {/* Main Question Area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                   <BookOpen size={16}/> {q.topic}
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold uppercase tracking-wider text-muted">
                   Q. {current + 1}
                </span>
              </div>
              
              <h2 className="text-2xl font-semibold text-text mb-8 leading-relaxed">{q.q}</h2>
              
              <div className="space-y-4 mb-8">
                {q.options.map((opt, i) => {
                  const isSelected = answers[q.id] === i;
                  const style = isSelected 
                    ? 'bg-blue-50 border-primary text-primary shadow-sm' 
                    : 'bg-white text-text border-darker hover:border-primary/50 hover:bg-gray-50';
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: i }))}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group ${style}`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${isSelected ? 'border-primary bg-primary text-white' : 'border-gray-300 text-muted group-hover:border-primary/50'}`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-lg">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-6 border-t border-darker">
            <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} className="btn-secondary flex items-center gap-2 py-3 px-6 disabled:opacity-50">
               <ChevronLeft size={20}/> Previous
            </button>
            
            <button 
              onClick={() => setMarked(prev => {
                const next = new Set(prev);
                next.has(q.id) ? next.delete(q.id) : next.add(q.id);
                return next;
              })} 
              className={`flex items-center gap-2 py-3 px-6 rounded-xl font-medium transition-colors ${marked.has(q.id) ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-white text-muted border border-darker hover:bg-gray-50'}`}
            >
              <Flag size={18} fill={marked.has(q.id) ? 'currentColor' : 'none'} />
              {marked.has(q.id) ? 'Marked for Review' : 'Mark for Review'}
            </button>
            
            <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1} className="btn-primary flex items-center gap-2 py-3 px-8 disabled:opacity-50 shadow-md">
               Next <ChevronRight size={20}/>
            </button>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className="w-80 bg-white border-l border-darker flex flex-col shrink-0 z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="p-4 border-b border-darker bg-gray-50">
             <h3 className="font-bold text-text text-sm uppercase tracking-wider">Question Map</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((qItem, i) => {
                const isAnswered = answers[qItem.id] !== undefined;
                const isMarked = marked.has(qItem.id);
                const isActive = i === current;
                
                let bg = 'bg-white text-muted border border-darker hover:bg-gray-50';
                if (isAnswered) bg = 'bg-primary text-white border-primary shadow-sm';
                else if (isMarked) bg = 'bg-amber-100 text-amber-700 border-amber-300';
                
                return (
                  <button
                    key={qItem.id}
                    onClick={() => setCurrent(i)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 ${bg} ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-white scale-110 z-10' : ''}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-8 space-y-3 text-xs font-medium text-muted bg-gray-50 p-4 rounded-xl border border-darker">
               <div className="flex items-center gap-3"><div className="w-4 h-4 rounded shadow-sm bg-primary"></div> Answered</div>
               <div className="flex items-center gap-3"><div className="w-4 h-4 rounded shadow-sm bg-amber-100 border border-amber-300"></div> Marked for Review</div>
               <div className="flex items-center gap-3"><div className="w-4 h-4 rounded shadow-sm bg-white border border-darker"></div> Not Visited / Unanswered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirmation */}
      <AnimatePresence>
        {submitConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6 mx-auto">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-text mb-2 text-center">Submit Exam?</h3>
              <p className="text-muted text-center mb-6 text-lg">
                You have answered <strong className="text-text">{answeredCount}</strong> out of <strong className="text-text">{questions.length}</strong> questions.<br/>
                <span className="text-sm">Time remaining: {formatTime(timer)}</span>
              </p>
              <div className="flex gap-3">
                <button onClick={() => setSubmitConfirm(false)} className="btn-secondary flex-1 py-3 text-base">Return to Exam</button>
                <button onClick={() => { setSubmitConfirm(false); handleSubmit(false); }} className="btn-primary bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/20 hover:shadow-red-500/40 flex-1 py-3 text-base border-none">Confirm Submit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <motion.section variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
      <motion.div variants={item} className="flex items-center gap-3 pb-4 border-b border-darker">
        <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shadow-sm">
          <Target size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">Exam Hall Simulation</h2>
          <p className="text-muted text-sm mt-1">Experience the pressure of the real examination.</p>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={item} className="dash-card">
          <div className="dash-card-header">
             <h3 className="text-lg font-semibold flex items-center gap-2 text-text"><BookOpen size={18} className="text-primary"/> Setup Simulation</h3>
          </div>
          <div className="dash-card-body space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Select Paper Type</label>
              <select value={paperType} onChange={e => setPaperType(e.target.value)} className="input-field cursor-pointer">
                <option value="easy">Easy Paper (1.5 min/q)</option>
                <option value="moderate">Moderate Paper (1 min/q)</option>
                <option value="brutal">Brutal Paper (0.75 min/q)</option>
                <option value="pyq">Previous Year Format (1 min/q)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Number of Questions</label>
              <select value={qCount} onChange={e => setQCount(Number(e.target.value))} className="input-field cursor-pointer">
                <option value={10}>10 Questions (Quick Check)</option>
                <option value={30}>30 Questions (Half Paper)</option>
                <option value={60}>60 Questions (Full Exam)</option>
              </select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="text-amber-500 shrink-0" size={20}/>
              <div>
                 <p className="text-sm font-bold text-amber-800">Strict Environment</p>
                 <p className="text-xs text-amber-700/80 mt-1">Once you enter the exam hall, the timer cannot be paused. Make sure you have uninterrupted time.</p>
              </div>
            </div>

            <button onClick={() => setSimulating(true)} className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-neon">
              Enter Exam Hall <ChevronRight size={20}/>
            </button>
          </div>
        </motion.div>

        <motion.div variants={item} className="space-y-6 flex flex-col">
          <div className="dash-card flex-1 flex flex-col justify-center items-center p-8 text-center bg-gradient-to-br from-secondary to-blue-50/50">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary shadow-sm mb-6">
               <Clock size={40}/>
             </div>
             <h3 className="text-xl font-bold text-text mb-2">Time Management</h3>
             <p className="text-muted text-sm leading-relaxed max-w-sm">
               The real SMC exam requires speed and accuracy. Use the "Brutal Paper" mode to train your brain to answer under extreme time pressure.
             </p>
          </div>
          
          <div className="dash-card p-5">
             <h4 className="text-sm font-bold text-text mb-3 uppercase tracking-wider text-muted">Keyboard Shortcuts</h4>
             <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between p-2 bg-secondary rounded-lg border border-darker"><span className="text-muted">Select Option</span><kbd className="font-mono font-bold">1-4</kbd></div>
                <div className="flex justify-between p-2 bg-secondary rounded-lg border border-darker"><span className="text-muted">Navigation</span><kbd className="font-mono font-bold">← / →</kbd></div>
                <div className="flex justify-between p-2 bg-secondary rounded-lg border border-darker"><span className="text-muted">Mark Review</span><kbd className="font-mono font-bold">M</kbd></div>
                <div className="flex justify-between p-2 bg-secondary rounded-lg border border-darker"><span className="text-muted">Submit Test</span><kbd className="font-mono font-bold">S</kbd></div>
             </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}