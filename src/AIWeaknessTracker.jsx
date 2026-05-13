import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, KeyRound, Sparkles, Activity, AlertTriangle, ShieldCheck, Target, ChevronRight } from 'lucide-react';
import { askGemini, getApiKey, setApiKey as persistApiKey } from './ai';

// Sample wrong answers for initial analysis (in real app, loaded from revision engine)
const sampleWrongAnswers = [
  { q: "Power factor of a purely resistive circuit is:", options: ["1","0","0.5","Infinity"], ans: 0, studentAnswer: "0", topic: "Basic Electrical", diff: 'easy' },
  { q: "Transformer efficiency is maximum when:", options: ["Copper loss = Iron loss","Copper loss > Iron loss","Copper loss < Iron loss","Always maximum at full load"], ans: 0, studentAnswer: "Always maximum at full load", topic: "Electrical Machines", diff: 'medium' },
  { q: "Ferranti effect occurs in:", options: ["Long transmission lines during light load","Short lines","Transformers","Generators"], ans: 0, studentAnswer: "Transformers", topic: "Power Systems", diff: 'medium' },
  { q: "Routh-Hurwitz criterion is related to:", options: ["Stability analysis","Transfer function","Frequency response","State variables"], ans: 0, studentAnswer: "Frequency response", topic: "Control Systems", diff: 'medium' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AIWeaknessTracker() {
  const [apiKey, setLocalApiKey] = useState(getApiKey());
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const topics = ['Basic Electrical','Electrical Machines','Power Systems','Control Systems','Switchgear','Measurements','Digital Electronics','Energy & Laws'];

  const [topicMastery] = useState(() => {
    return topics.map(t => ({
      name: t,
      mastery: Math.floor(Math.random() * 60 + 40)
    }));
  });

  const handleSaveKey = () => {
    if (!keyInput.trim()) return;
    persistApiKey(keyInput.trim());
    setLocalApiKey(keyInput.trim());
    setKeyInput('');
  };

  const removeKey = () => {
    if(window.confirm('Remove API Key?')) {
      setLocalApiKey(''); 
      persistApiKey(''); 
      localStorage.removeItem('smc-gemini-api-key');
    }
  };

  const runAnalysis = async () => {
    setError('');
    setResult('');
    setLoading(true);
    try {
      const prompt = `You are an expert exam preparation tutor for the SMC Assistant Engineer (Electrical) exam in Gujarat, India.

A student has answered the following questions incorrectly:
${sampleWrongAnswers.map((w, i) => `${i+1}. Topic: ${w.topic} | Difficulty: ${w.diff}\n   Q: ${w.q}\n   Correct: ${w.options[w.ans]}\n   Student chose: ${w.studentAnswer}`).join('\n\n')}

Based on these wrong answers, analyze the student's weak areas.
Provide in **Gujarat** context (exam syllabus includes Basic Electrical, Machines, Power Systems, Control Systems, Switchgear, Measurements, Digital Electronics & Microprocessors, Energy & Laws):

1. **Weakest Topics** (top 3, with reasoning)
2. **Recommended Resources** (specific YouTube channels, websites, PDFs)
3. **7-Day Focus Plan** (day-by-day schedule to improve)
4. **Practice Strategy** (how many MCQs per topic per day)

Format the response using clean, semantic HTML (e.g., <h3>, <ul>, <li>, <strong>, <p>). Do not use markdown syntax like ** or #.`;

      const response = await askGemini(prompt);
      
      // Basic formatting if Gemini returns raw markdown despite instructions
      let formattedHtml = response
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br/>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/## (.*?)</g, '<h3>$1</h3><')
        .replace(/# (.*?)</g, '<h2>$1</h2><');
      
      setResult(`<p>${formattedHtml}</p>`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3 pb-4 border-b border-darker">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">AI Weakness Tracker</h2>
          <p className="text-muted text-sm mt-1">Connect Gemini AI to analyze your mistakes and generate custom study plans.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Config & Action */}
        <motion.div variants={item} className="lg:col-span-1 space-y-6">
          <div className="dash-card">
            <div className="dash-card-header bg-gradient-to-r from-indigo-50/50 to-purple-50/50 py-3">
              <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-2">
                 <KeyRound size={16}/> API Configuration
              </h3>
            </div>
            <div className="dash-card-body">
              {apiKey ? (
                <div className="space-y-4 text-center">
                   <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ShieldCheck size={32}/>
                   </div>
                   <h4 className="font-bold text-text text-lg">Connected to Gemini</h4>
                   <p className="text-sm text-muted bg-gray-50 p-2 rounded-lg font-mono border border-darker">
                     {apiKey.slice(0, 4)}...{apiKey.slice(-4)}
                   </p>
                   <button onClick={removeKey} className="text-xs font-bold text-danger hover:underline">Remove Key</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted">A free Google Gemini API key is required to use this feature.</p>
                  <input 
                    type="password" 
                    value={keyInput}
                    onChange={e => setKeyInput(e.target.value)} 
                    placeholder="Paste API key here..."
                    className="input-field py-2"
                  />
                  <button onClick={handleSaveKey} disabled={!keyInput.trim()} className="btn-primary w-full py-2 disabled:opacity-50">
                    Connect AI
                  </button>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="block text-center text-xs font-bold text-primary hover:underline">
                    Get a free API key here
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="dash-card p-5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Sparkles size={80}/></div>
             <h3 className="text-xl font-bold mb-2 relative z-10">Generate AI Plan</h3>
             <p className="text-sm text-white/80 mb-6 relative z-10 leading-relaxed">
               Analyze recent mock test mistakes and build a personalized 7-day recovery sprint.
             </p>
             <button 
               onClick={runAnalysis} 
               disabled={!apiKey || loading} 
               className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative z-10"
             >
               {loading ? <Activity className="animate-spin" size={20}/> : <Sparkles size={20}/>}
               {loading ? 'Analyzing Data...' : 'Analyze Weaknesses'}
             </button>
          </div>
        </motion.div>

        {/* Right Column: Results & Mastery Grid */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6 flex flex-col h-full">
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-start gap-3 shadow-sm">
                 <AlertTriangle className="shrink-0 mt-0.5" size={18}/>
                 <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="dash-card flex-1 flex flex-col relative overflow-hidden border-2 border-indigo-200"
              >
                <div className="dash-card-header bg-gradient-to-r from-indigo-50/50 to-purple-50/50 py-4 flex items-center gap-2">
                   <Sparkles className="text-indigo-600" size={20}/>
                   <h3 className="text-lg font-bold text-text">Your Personalized Strategy</h3>
                </div>
                <div className="dash-card-body flex-1 overflow-y-auto bg-white/50 backdrop-blur-sm">
                  {/* Styling the raw HTML returned from AI */}
                  <div 
                    className="prose prose-sm md:prose-base max-w-none text-text 
                               prose-headings:text-indigo-900 prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-6
                               prose-h3:text-lg prose-h3:border-b prose-h3:border-indigo-100 prose-h3:pb-2
                               prose-p:leading-relaxed prose-p:mb-4
                               prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-4
                               prose-li:mb-1 prose-li:marker:text-indigo-400
                               prose-strong:text-indigo-700" 
                    dangerouslySetInnerHTML={{ __html: result }} 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !loading && (
             <div className="dash-card p-5">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-text uppercase tracking-wider flex items-center gap-2"><Target size={16} className="text-primary"/> Topic Mastery Radar</h3>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {topicMastery.map((t, i) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: i * 0.05 }}
                      key={t.name} 
                      className="p-3 rounded-xl border border-darker bg-secondary/30 hover:bg-white transition-colors"
                    >
                      <p className="text-muted text-[10px] font-bold uppercase tracking-wider mb-2 truncate">{t.name}</p>
                      <p className="text-xl font-bold text-text mb-2">{t.mastery}%</p>
                      <div className="w-full bg-darker rounded-full h-1.5 overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${t.mastery}%` }}
                           transition={{ duration: 1, delay: 0.2 }}
                           className={`h-full rounded-full ${t.mastery >= 70 ? 'bg-success' : t.mastery >= 50 ? 'bg-amber-500' : 'bg-danger'}`} 
                        />
                      </div>
                    </motion.div>
                  ))}
               </div>
             </div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}