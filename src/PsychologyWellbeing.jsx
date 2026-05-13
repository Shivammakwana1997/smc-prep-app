import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Wind, Quote, Lightbulb, Activity, Brain, Target, ShieldCheck } from 'lucide-react';

const QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Don't watch the clock; do what it does. Keep going.",
  "Your only limit is your mind.",
  "Every expert was once a beginner.",
  "Believe you can and you're halfway there.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream big. Start small. Act now.",
  "Consistency is what transforms average into excellence.",
  "You don't have to be great to start, but you have to start to be great."
];

const TIPS = [
  { title: 'Pomodoro Technique', desc: 'Study 25 min, break 5 min. After 4 cycles, take a 15-30 min break.', icon: Clock },
  { title: 'Sleep Matters', desc: '7-8 hours of sleep improves memory retention by 40%.', icon: Brain },
  { title: 'Stay Hydrated', desc: 'Drink water every hour. Dehydration reduces focus.', icon: Activity },
  { title: 'Move Your Body', desc: '5 min stretch every hour boosts blood flow to brain.', icon: Activity },
  { title: 'No Phone Rule', desc: 'Keep phone in another room during study blocks.', icon: ShieldCheck },
  { title: 'Eat Brain Food', desc: 'Nuts, fruits, and dark chocolate improve concentration.', icon: Brain },
  { title: 'Positive Self-Talk', desc: "Replace 'I cannot' with 'I am learning.'", icon: Heart },
  { title: 'Visualize Success', desc: 'Spend 2 min imagining yourself clearing the exam.', icon: Target }
];

// Placeholder for icons not imported directly
function Clock(props) { return <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function BreathingExercise() {
  const [phase, setPhase] = useState('idle'); // idle, inhale, hold, exhale
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (phase === 'idle') return;
    const id = setInterval(() => {
      setCount(c => {
        if (phase === 'inhale' && c >= 4) { setPhase('hold'); return 0; }
        if (phase === 'hold' && c >= 7) { setPhase('exhale'); return 0; }
        if (phase === 'exhale' && c >= 8) { setPhase('inhale'); setCycles(x => x + 1); return 0; }
        return c + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  const start = () => { setPhase('inhale'); setCount(0); setCycles(0); };
  const stop = () => { setPhase('idle'); setCount(0); };

  const circleSize = phase === 'inhale' ? 'scale-125' : phase === 'hold' ? 'scale-125' : 'scale-100';
  const circleColor = phase === 'inhale' ? 'bg-gradient-to-tr from-green-400 to-emerald-500 shadow-green-500/50' : 
                      phase === 'hold' ? 'bg-gradient-to-tr from-amber-400 to-orange-500 shadow-amber-500/50' : 
                      phase === 'exhale' ? 'bg-gradient-to-tr from-blue-400 to-indigo-500 shadow-blue-500/50' :
                      'bg-gradient-to-tr from-gray-200 to-gray-300';

  const getPhaseText = () => {
    switch(phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold Breath';
      case 'exhale': return 'Breathe Out';
      default: return 'Ready';
    }
  };

  return (
    <motion.div variants={item} className="dash-card p-6 md:p-8 text-center flex flex-col h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
        <Wind size={120} />
      </div>
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <h3 className="text-xl font-bold text-text mb-1 flex items-center gap-2">
           <Wind className="text-sky-500"/> 4-7-8 Breathing
        </h3>
        <p className="text-muted text-sm font-medium mb-8 bg-sky-50 px-3 py-1 rounded-full border border-sky-100 text-sky-700">
          Inhale 4s → Hold 7s → Exhale 8s
        </p>
        
        <div className="flex justify-center mb-8 relative">
          {/* Animated rings */}
          {phase !== 'idle' && (
            <>
              <div className="absolute inset-0 bg-sky-200 rounded-full animate-ping opacity-20 scale-150"></div>
              <div className="absolute inset-0 bg-sky-300 rounded-full animate-ping opacity-20 scale-125" style={{ animationDelay: '0.5s' }}></div>
            </>
          )}
          
          <div className={`w-40 h-40 rounded-full transition-all duration-1000 ease-in-out flex items-center justify-center shadow-lg relative z-10 ${circleColor} ${circleSize}`}>
            <div className="bg-white/20 backdrop-blur-sm w-[90%] h-[90%] rounded-full flex flex-col items-center justify-center border border-white/30">
              <span className={`font-bold text-xl ${phase === 'idle' ? 'text-gray-600' : 'text-white drop-shadow-md'}`}>
                {getPhaseText()}
              </span>
              {phase !== 'idle' && (
                <span className="text-white text-3xl font-mono font-bold mt-1 drop-shadow-md">
                  {count}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-6 mb-8 w-full max-w-xs">
           <div className="flex-1 text-center p-3 bg-secondary/50 rounded-xl border border-darker">
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Time</p>
              <p className="text-xl font-mono font-bold text-text">{count}s</p>
           </div>
           <div className="flex-1 text-center p-3 bg-secondary/50 rounded-xl border border-darker">
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Cycles</p>
              <p className="text-xl font-mono font-bold text-text">{cycles}</p>
           </div>
        </div>
        
        <div className="w-full max-w-xs">
          {phase === 'idle' ? (
            <button onClick={start} className="btn-primary w-full py-3 text-lg bg-gradient-to-r from-sky-400 to-blue-500 shadow-blue-500/20 border-none">
              Start Exercise
            </button>
          ) : (
            <button onClick={stop} className="btn-primary w-full py-3 text-lg bg-gradient-to-r from-gray-400 to-gray-500 shadow-gray-500/20 border-none">
              Stop Breathing
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PsychologyWellbeing() {
  const [quoteIdx, setQuoteIdx] = useState(0);

  const nextQuote = () => {
    setQuoteIdx(i => (i + 1) % QUOTES.length);
  };

  return (
    <motion.section variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">
      <motion.div variants={item} className="flex items-center gap-3 pb-4 border-b border-darker">
        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 shadow-sm">
          <Heart size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">Mindset & Wellness</h2>
          <p className="text-muted text-sm mt-1">Optimize your psychological state for peak performance.</p>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6 flex flex-col">
          {/* Quote Card */}
          <motion.div variants={item} className="dash-card relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8">
            <div className="absolute top-4 right-4 text-white/10"><Quote size={80}/></div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-4">Daily Inspiration</p>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[100px] flex items-center"
                >
                  <p className="text-2xl md:text-3xl font-medium italic leading-relaxed drop-shadow-sm">
                    "{QUOTES[quoteIdx]}"
                  </p>
                </motion.div>
              </AnimatePresence>
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={nextQuote} 
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-bold transition-colors border border-white/20 flex items-center gap-2"
                >
                  Next Quote <Quote size={14} className="opacity-70"/>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Breathing Exercise */}
          <BreathingExercise />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <motion.div variants={item} className="dash-card p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-amber-200/50">
            <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="text-amber-600"/> Exam Day Mindset
            </h3>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white">
              <ul className="space-y-3">
                {[
                  "Arrive 30 min early to settle down",
                  "Take 3 deep breaths before starting",
                  "Read all questions before answering",
                  "Skip hard questions, come back later",
                  "Trust your preparation - you've got this!",
                  "Stay hydrated but don't drink too much water",
                  "If anxious, use 4-7-8 breathing technique"
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-amber-900/80">
                    <CheckCircle2 size={18} className="text-amber-500 shrink-0 mt-0.5"/>
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Wellness Tips Grid */}
          <motion.div variants={item} className="dash-card p-6">
            <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <Lightbulb className="text-primary"/> Wellness Tips
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TIPS.map((tip, idx) => {
                const Icon = tip.icon;
                return (
                  <div key={idx} className="p-4 rounded-xl border border-darker bg-secondary/50 hover:bg-white hover:border-primary/30 transition-colors group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-white shadow-sm text-primary group-hover:text-white group-hover:bg-primary transition-colors">
                        <Icon size={16}/>
                      </div>
                      <h4 className="font-bold text-text text-sm">{tip.title}</h4>
                    </div>
                    <p className="text-muted text-xs leading-relaxed font-medium pl-11">{tip.desc}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

      </div>
    </motion.section>
  );
}