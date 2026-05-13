import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Clock, Settings, Play, ChevronRight, ChevronLeft, Flag, Award, CheckCircle2, XCircle, AlertTriangle, ListFilter } from 'lucide-react';
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

  // Save results to localStorage
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
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-darker">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text">Mock Test Engine</h2>
            <p className="text-muted text-sm mt-1">Configure your exam parameters and begin the simulation.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="dash-card">
             <div className="dash-card-header">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-text"><Settings size={18} className="text-primary"/> Setup Test</h3>
             </div>
             <div className="dash-card-body space-y-5">
               <div>
                  <label className="block text-sm font-medium text-muted mb-2">Number of Questions</label>
                  <select value={config.count} onChange={e => setConfig(c => ({ ...c, count: Number(e.target.value) }))} className="input-field cursor-pointer">
                    <option value={10}>10 Questions (Quick Quiz)</option>
                    <option value={20}>20 Questions (Standard)</option>
                    <option value={30}>30 Questions (Extended)</option>
                    <option value={60}>60 Questions (Full Exam)</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-muted mb-2">Difficulty Level</label>
                  <select value={config.diff} onChange={e => setConfig(c => ({ ...c, diff: e.target.value }))} className="input-field cursor-pointer">
                    <option value="all">Mixed (All Difficulties)</option>
                    <option value="easy">Easy Only</option>
                    <option value="medium">Medium Only</option>
                    <option value="hard">Hard Only</option>
                  </select>
               </div>
               
               <button onClick={startQuiz} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-4 text-lg">
                  <Play fill="currentColor" size={20} /> Start Simulation
               </button>
             </div>
          </div>

          <div className="space-y-6">
            <div className="dash-card p-5 flex items-center justify-between border-l-4 border-l-primary">
              <div>
                <p className="text-muted text-sm font-medium">Question Bank</p>
                <h4 className="text-2xl font-bold text-text">{mockQuestions.length} <span className="text-sm font-normal text-muted">MCQs loaded</span></h4>
              </div>
              <ListFilter className="text-primary/30" size={40} />
            </div>

            <div className="dash-card flex-1">
              <div className="dash-card-header bg-transparent pb-3">
                <h3 className="font-semibold text-text flex items-center gap-2"><Award size={18} className="text-accent"/> Recent Attempts</h3>
              </div>
              <div className="dash-card-body pt-0">
                {(() => {
                  const data = JSON.parse(localStorage.getItem('smc-mock-results') || '[]');
                  if (data.length === 0) return <div className="py-8 text-center text-muted border border-dashed border-darker rounded-xl">No attempts yet. Start practicing!</div>;
                  return (
                    <div className="space-y-3">
                      {data.slice(-4).reverse().map((r, i) => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-secondary/50 border border-darker/50 hover:bg-white transition-colors">
                          <span className="text-sm font-medium text-muted flex items-center gap-2"><Calendar size={14}/> {r.date}</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-text">{r.score}/{r.total}</span>
                            <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${r.accuracy >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.accuracy}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  if (screen === 'results') {
    return (
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div className="text-center py-8">
           <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 shadow-glass ${accuracy >= 70 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <Award size={40} />
           </div>
           <h2 className="text-3xl font-bold text-text mb-2">Test Completed!</h2>
           <p className="text-muted">You scored {score} out of {total} questions correctly.</p>
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

        <div className="flex justify-center pt-4">
          <button onClick={() => setScreen('menu')} className="btn-secondary px-8 py-3">Return to Menu</button>
        </div>
      </motion.section>
    );
  }

  // Quiz screen
  if (!current) return null;
  
  return (
    <div className="max-w-5xl mx-auto h-[80vh] flex flex-col">
      {/* Quiz Header */}
      <header className="dash-card p-4 flex flex-wrap gap-4 items-center justify-between mb-6 shrink-0 border-b-4 border-b-primary/50">
        <div>
           <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Question {qIndex + 1} of {questions.length}</p>
           <h2 className="text-lg font-bold text-text truncate max-w-sm">{current.topic}</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold font-mono text-lg shadow-inner ${timer < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-secondary text-text border border-darker'}`}>
            <Clock size={20} className={timer < 60 ? 'animate-bounce' : ''}/> 
            {formatTime(timer)}
          </div>
          <button onClick={() => setShowSubmit(true)} className="btn-secondary border-red-200 text-red-600 hover:bg-red-50">
            Submit Test
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        
        {/* Main Question Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div 
              key={current.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="dash-card flex-1 flex flex-col"
            >
              <div className="dash-card-header bg-transparent border-b-0 pb-0 justify-end">
                <button 
                  onClick={toggleMark} 
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${marked.has(current.id) ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-secondary text-muted hover:bg-darker'}`}
                >
                  <Flag size={16} fill={marked.has(current.id) ? 'currentColor' : 'none'} />
                  {marked.has(current.id) ? 'Marked for Review' : 'Mark Question'}
                </button>
              </div>
              
              <div className="dash-card-body flex-1 flex flex-col pt-2">
                <h3 className="text-xl font-semibold text-text mb-6 leading-relaxed">{current.q}</h3>
                
                <div className="space-y-3 flex-1">
                  {current.options.map((opt, i) => {
                    const isSelected = selected[current.id] === i;
                    const isAnswered = selected[current.id] !== undefined;
                    const isCorrect = i === current.ans;
                    
                    let style = 'bg-secondary border-transparent text-text hover:border-primary/30 hover:bg-white/80';
                    if (isSelected && !isAnswered) style = 'bg-blue-50 border-primary text-primary shadow-sm';
                    if (isAnswered) {
                       if (isCorrect) style = 'bg-green-50 border-success text-green-800 font-medium shadow-sm';
                       else if (isSelected) style = 'bg-red-50 border-danger text-red-800 shadow-sm';
                       else style = 'bg-secondary/50 border-transparent text-muted opacity-60';
                    }

                    return (
                      <button 
                        key={i} 
                        disabled={isAnswered}
                        onClick={() => chooseOption(i)} 
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${style}`}
                      >
                        <span className="text-[15px]">{opt}</span>
                        {isAnswered && isCorrect && <CheckCircle2 className="text-success shrink-0" size={20}/>}
                        {isAnswered && isSelected && !isCorrect && <XCircle className="text-danger shrink-0" size={20}/>}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Area */}
                <AnimatePresence>
                  {selected[current.id] !== undefined && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                      className="bg-blue-50/50 backdrop-blur rounded-xl p-4 border border-blue-100"
                    >
                      <p className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
                        <AlertTriangle size={16}/> Explanation
                      </p>
                      <p className="text-sm text-blue-900/80 leading-relaxed">{current.explain}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex gap-4 mt-6 shrink-0">
            <button 
              onClick={() => setQIndex(i => Math.max(0, i - 1))} 
              disabled={qIndex === 0} 
              className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
            >
              <ChevronLeft size={20}/> Previous
            </button>
            <button 
              onClick={() => setQIndex(i => Math.min(questions.length - 1, i + 1))} 
              disabled={qIndex === questions.length - 1} 
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 shadow-lg"
            >
              Next <ChevronRight size={20}/>
            </button>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className="dash-card w-full md:w-72 shrink-0 flex flex-col h-full">
          <div className="dash-card-header py-3">
             <h3 className="font-semibold text-text text-sm">Question Map</h3>
          </div>
          <div className="dash-card-body overflow-y-auto flex-1">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, i) => {
                const isAnswered = selected[q.id] !== undefined;
                const isMarked = marked.has(q.id);
                const isActive = i === qIndex;
                
                let bg = 'bg-secondary text-text border border-darker/50 hover:bg-darker';
                if (isAnswered) bg = 'bg-primary text-white border-primary shadow-sm';
                else if (isMarked) bg = 'bg-amber-100 text-amber-700 border-amber-300';
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setQIndex(i)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 ${bg} ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-white scale-110' : ''}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-darker space-y-2 text-xs font-medium text-muted">
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary"></div> Answered</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></div> Marked for Review</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-secondary border border-darker"></div> Unanswered</div>
            </div>
          </div>
        </div>

      </div>

      {/* Submit confirmation Modal */}
      <AnimatePresence>
        {showSubmit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="dash-card max-w-md w-full p-6 shadow-2xl border-white"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-text mb-2 text-center">Submit Test?</h3>
              <p className="text-muted text-center mb-6">
                You have answered <strong className="text-text">{Object.keys(selected).length}</strong> out of <strong className="text-text">{questions.length}</strong> questions.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowSubmit(false)} className="btn-secondary flex-1 py-2.5">Return to Test</button>
                <button onClick={() => { setShowSubmit(false); finishQuiz(); }} className="btn-primary bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/20 hover:shadow-red-500/40 flex-1 py-2.5 border-none">Confirm Submit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}