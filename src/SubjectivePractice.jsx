import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, Clock, Play, Send, RefreshCcw, Sparkles, CheckCircle2, History, ChevronDown } from 'lucide-react';
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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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

    const wordCount = answer.trim().split(/\s+/).length;
    const hasKeywords = topic.keywords.filter(k => answer.toLowerCase().includes(k.toLowerCase())).length;
    const basicFeedback = `Word count: ${wordCount}. Keywords covered: ${hasKeywords}/${topic.keywords.length}.`;

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
    if(window.confirm('Are you sure you want to reset your answer?')) {
       setAnswer('');
       setIsActive(false);
       setTimeLeft(25 * 60);
       setFeedback('');
    }
  };

  return (
    <motion.section variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
      <motion.div variants={item} className="flex items-center gap-3 pb-4 border-b border-darker">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
          <PenTool size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">Subjective Drafting</h2>
          <p className="text-muted text-sm mt-1">Practice official noting, technical explanations, and problem-solving.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Editor */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6 flex flex-col h-full">
          <div className="dash-card flex-1 flex flex-col min-h-[600px]">
            <div className="dash-card-header bg-gradient-to-r from-purple-50/50 to-secondary flex-wrap gap-4 py-3">
              <div className="flex-1 min-w-[200px] relative">
                <select 
                  value={topic.id} 
                  onChange={e => { 
                    const t = subjectiveTopics.find(x => x.id === e.target.value); 
                    setTopic(t); 
                    setAnswer(''); setIsActive(false); setTimeLeft(25*60); setFeedback(''); 
                  }}           
                  className="w-full appearance-none bg-white border border-darker rounded-xl py-2 pl-4 pr-10 text-sm font-semibold text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {subjectiveTopics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16}/>
              </div>
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold font-mono text-lg shadow-inner border ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-white text-text border-darker'}`}>
                 <Clock size={18} className={timeLeft < 300 ? 'animate-bounce' : ''}/>
                 {formatTime(timeLeft)}
              </div>
            </div>
            
            <div className="p-5 bg-purple-50/30 border-b border-darker shrink-0">
               <p className="text-sm font-medium text-text leading-relaxed"><span className="font-bold text-purple-700">Prompt:</span> {topic.prompt}</p>
            </div>

            <div className="flex-1 p-5 flex flex-col relative">
               {!isActive && timeLeft === 25 * 60 && (
                 <div className="absolute inset-0 bg-secondary/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-b-2xl border-t border-white/50">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 text-purple-600">
                       <Clock size={32}/>
                    </div>
                    <h3 className="text-xl font-bold text-text mb-2">Ready to Draft?</h3>
                    <p className="text-muted text-sm max-w-sm text-center mb-6">You will have exactly 25 minutes to write your answer. The timer cannot be paused.</p>
                    <button onClick={startTimer} className="btn-primary py-3 px-8 text-lg font-bold flex items-center gap-2 shadow-purple-500/20 hover:shadow-purple-500/40">
                      <Play fill="currentColor" size={20}/> Start Drafting Timer
                    </button>
                 </div>
               )}
               
               <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Start typing your formal answer here..."
                  className="w-full h-full flex-1 p-4 rounded-xl bg-white border border-darker text-text focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none shadow-inner leading-relaxed transition-all"
                  disabled={!isActive && timeLeft !== 25 * 60}
               />
               
               <div className="flex flex-wrap items-center justify-between gap-4 mt-5 shrink-0">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">
                     Words: {answer.trim() ? answer.trim().split(/\s+/).length : 0}
                  </span>
                  <div className="flex items-center gap-3">
                    <button onClick={reset} className="btn-secondary flex items-center gap-2 py-2 text-sm text-muted hover:text-danger">
                      <RefreshCcw size={16}/> Reset
                    </button>
                    <button 
                      onClick={submitAnswer} 
                      disabled={!answer.trim() || loading} 
                      className="btn-primary bg-gradient-to-r from-purple-500 to-indigo-600 border-none flex items-center gap-2 py-2 px-6 shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-50"
                    >
                      {loading ? <RefreshCcw className="animate-spin" size={18}/> : <Send size={18}/>}
                      Submit for Review
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Feedback & History */}
        <motion.div variants={item} className="space-y-6">
          <AnimatePresence>
            {(feedback || loading) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="dash-card p-5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5"><Sparkles size={100}/></div>
                <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2 relative z-10">
                   <Sparkles size={18} className="text-purple-500"/> AI Feedback
                </h3>
                
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                     <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                     <p className="text-sm font-medium text-purple-700 animate-pulse">Gemini is analyzing your draft...</p>
                  </div>
                ) : (
                  <div className="prose prose-sm prose-p:leading-relaxed prose-p:text-muted max-w-none relative z-10">
                     <div className="text-sm text-text whitespace-pre-wrap leading-relaxed bg-white/50 p-4 rounded-xl border border-white/50 shadow-inner">
                        {feedback}
                     </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="dash-card flex-1">
             <div className="dash-card-header py-3">
               <h3 className="text-sm font-bold text-text uppercase tracking-wider flex items-center gap-2"><History size={16} className="text-muted"/> Past Drafts</h3>
             </div>
             <div className="dash-card-body p-0">
               {history.length === 0 ? (
                 <div className="p-8 text-center text-muted border border-dashed border-darker m-4 rounded-xl">No drafts submitted yet.</div>
               ) : (
                 <div className="divide-y divide-darker">
                   {history.slice(-5).reverse().map((h, i) => (
                     <div key={i} className="p-4 hover:bg-secondary/50 transition-colors">
                       <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-semibold text-text truncate pr-2">{h.topic}</p>
                          <span className="text-[10px] font-bold text-muted bg-gray-100 px-2 py-0.5 rounded-full shrink-0">{h.date}</span>
                       </div>
                       <p className="text-xs font-medium text-purple-600 flex items-center gap-1"><CheckCircle2 size={12}/> {h.wordCount} words</p>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}