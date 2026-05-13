import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Search, Filter, RotateCcw, Shuffle, BookmarkX, Zap, Activity, Brain, ShieldAlert, Layers } from 'lucide-react';
import { formulas } from './formulas';

const MODES = {
  flashcards: { label: 'Flashcards', icon: Layers, desc: 'Classic double-sided memory cards.' },
  rapid: { label: 'Rapid Quiz', icon: Zap, desc: 'Identify the formula from its description.' },
  recall: { label: 'Memory Recall', icon: Brain, desc: 'Recall the exact equation from its name.' },
  forgotten: { label: 'Forgotten Bin', icon: ShieldAlert, desc: 'Review formulas you struggled with.' },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
    let pool = [...cards];
    if (filterTopic !== 'All') pool = pool.filter(f => f.topic === filterTopic);
    if (searched) pool = pool.filter(f => f.name.toLowerCase().includes(searched.toLowerCase()) || f.equation.toLowerCase().includes(searched.toLowerCase()));
    return pool;
  }, [filterTopic, searched, cards]);

  const current = mode === 'forgotten' ? forgotten[idx] || filtered[idx] : filtered[idx];
  const isLast = idx >= filtered.length - 1;

  function next() {
    if (isLast) { setIdx(0); setCards(shuffle(cards)); }
    else setIdx(i => i + 1);
    setFlipped(false);
    setReveal(false);
  }

  function markForgotten() {
    setForgotten(prev => {
      if(!current) return prev;
      const exists = prev.find(f => f.id === current.id);
      if (!exists) return [...prev, { ...current, interval: 1 }];
      return prev;
    });
    next();
  }

  return (
    <motion.section variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
      <motion.div variants={item} className="flex items-center gap-3 pb-4 border-b border-darker">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
          <Lightbulb size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">Formula Attack</h2>
          <p className="text-muted text-sm mt-1">Memorize critical engineering equations and facts at lightning speed.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Controls */}
        <motion.div variants={item} className="lg:col-span-1 space-y-4">
          <div className="dash-card p-4 space-y-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block flex items-center gap-2"><Filter size={14}/> Topic Filter</label>
              <select value={filterTopic} onChange={e => { setFilterTopic(e.target.value); setIdx(0); setFlipped(false); setReveal(false); }} className="input-field cursor-pointer py-2 text-sm">
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            
            <div className="relative">
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block flex items-center gap-2"><Search size={14}/> Search</label>
              <input 
                value={searched} 
                onChange={e => { setSearched(e.target.value); setIdx(0); setFlipped(false); setReveal(false); }} 
                placeholder="e.g. Ohms Law..." 
                className="input-field py-2 text-sm pl-9" 
              />
              <Search className="absolute left-3 top-9 text-muted" size={16}/>
            </div>
          </div>

          <div className="dash-card p-4">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Study Modes</h3>
            <div className="space-y-2">
              {Object.entries(MODES).map(([key, config]) => {
                const Icon = config.icon;
                const isActive = mode === key;
                return (
                  <button 
                    key={key} 
                    onClick={() => { setMode(key); setIdx(0); setFlipped(false); setReveal(false); }} 
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 group ${isActive ? 'bg-amber-100/50 border border-amber-200 text-amber-900 shadow-sm' : 'bg-transparent border border-transparent hover:bg-secondary text-text'}`}
                  >
                    <div className={`mt-0.5 shrink-0 ${isActive ? 'text-amber-600' : 'text-muted group-hover:text-amber-500 transition-colors'}`}>
                      <Icon size={18}/>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-0.5">{config.label}</p>
                      <p className={`text-xs ${isActive ? 'text-amber-700/80' : 'text-muted'}`}>{config.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
             <div className="dash-card p-4 text-center">
               <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Queue</p>
               <p className="text-xl font-bold text-text">{filtered.length}</p>
             </div>
             <div className="dash-card p-4 text-center">
               <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Forgotten</p>
               <p className="text-xl font-bold text-danger">{forgotten.length}</p>
             </div>
          </div>
        </motion.div>

        {/* Right Area: Flashcards */}
        <motion.div variants={item} className="lg:col-span-3 flex flex-col h-full min-h-[500px]">
          
          <div className="flex items-center justify-between mb-4">
             <span className="px-3 py-1 bg-white border border-darker shadow-sm rounded-full text-xs font-bold uppercase tracking-wider text-muted">
               Card {filtered.length > 0 ? idx + 1 : 0} of {filtered.length}
             </span>
             <button onClick={() => { setCards(shuffle(cards)); setIdx(0); }} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-2">
                <Shuffle size={14}/> Shuffle Deck
             </button>
          </div>

          <div className="flex-1 perspective-1000">
            {(!current && mode !== 'forgotten') || (mode === 'forgotten' && forgotten.length === 0) ? (
               <div className="dash-card h-full flex flex-col items-center justify-center text-muted opacity-60">
                 {mode === 'forgotten' ? <ShieldAlert size={48} className="mb-4 text-success"/> : <Search size={48} className="mb-4"/>}
                 <p className="font-medium">{mode === 'forgotten' ? 'Your forgotten bin is empty. Great job!' : 'No formulas match your filters.'}</p>
               </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={current.id + (flipped || reveal ? '-back' : '-front')}
                  initial={{ rotateY: flipped ? -90 : 90, opacity: 0, scale: 0.95 }}
                  animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                  exit={{ rotateY: flipped ? 90 : -90, opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="dash-card h-full w-full p-8 md:p-12 shadow-xl flex flex-col justify-center text-center relative border-white cursor-pointer group"
                  onClick={() => { if(mode==='flashcards') setFlipped(!flipped); else if(mode==='rapid' || mode==='recall') setReveal(true); }}
                >
                  <div className="absolute top-4 right-4 px-3 py-1 bg-secondary/50 rounded-full border border-darker text-[10px] font-bold uppercase tracking-wider text-muted">
                    {current.topic}
                  </div>

                  {mode === 'flashcards' && (
                    <>
                      {!flipped ? (
                        <div>
                          <h3 className="text-3xl font-bold text-text mb-4 leading-relaxed group-hover:text-amber-600 transition-colors">{current.name}</h3>
                          <p className="text-muted text-sm font-medium animate-pulse">Click card to reveal formula</p>
                        </div>
                      ) : (
                        <div>
                          <div className="inline-block bg-green-50 border border-green-200 p-6 rounded-2xl mb-6 shadow-inner">
                            <p className="text-3xl font-mono text-green-700 font-bold">{current.equation}</p>
                          </div>
                          <p className="text-lg text-text max-w-lg mx-auto leading-relaxed">{current.description}</p>
                        </div>
                      )}
                    </>
                  )}

                  {(mode === 'rapid' || mode === 'recall') && (
                    <>
                      <h3 className="text-2xl font-bold text-text mb-8 leading-relaxed">
                        {mode === 'rapid' ? current.description : current.name}
                      </h3>
                      {!reveal ? (
                         <p className="text-muted text-sm font-medium animate-pulse">Click card to reveal answer</p>
                      ) : (
                        <div className="animate-in fade-in zoom-in duration-300">
                          <div className="inline-block bg-green-50 border border-green-200 p-6 rounded-2xl mb-4 shadow-inner">
                            <p className="text-3xl font-mono text-green-700 font-bold">{current.equation}</p>
                          </div>
                          {mode === 'rapid' && <p className="text-lg text-text font-bold text-amber-600">{current.name}</p>}
                        </div>
                      )}
                    </>
                  )}

                  {mode === 'forgotten' && (
                    <div>
                      <h3 className="text-2xl font-bold text-text mb-6">{current.name}</h3>
                      <div className="inline-block bg-red-50 border border-red-200 p-6 rounded-2xl mb-6 shadow-inner">
                        <p className="text-3xl font-mono text-red-700 font-bold">{current.equation}</p>
                      </div>
                      <p className="text-lg text-text max-w-lg mx-auto leading-relaxed">{current.description}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex gap-4 mt-6 shrink-0">
             <button onClick={markForgotten} disabled={!current || mode === 'forgotten'} className="flex-1 btn-secondary flex justify-center items-center gap-2 py-3 border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50">
                <BookmarkX size={20}/> Send to Forgotten
             </button>
             <button onClick={next} disabled={!current} className="flex-1 btn-primary bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/20 hover:shadow-amber-500/40 border-none flex justify-center items-center gap-2 py-3 disabled:opacity-50">
                Next Card <RotateCcw size={20}/>
             </button>
          </div>

        </motion.div>
      </div>
    </motion.section>
  );
}