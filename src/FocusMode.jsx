import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, BrainCircuit, X, MessageSquare, BookOpen, Send } from 'lucide-react';
import { askGemini } from './ai';

export default function FocusMode({ topic, onExit }) {
  const [timer, setTimer] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState([{ role: 'ai', text: `Welcome to the classroom! I am your AI Tutor for ${topic.title}. What do you want to explore today?` }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await askGemini(`You are an AI Electrical Engineering Tutor for SMC AE Exam. Topic: ${topic.title}.
      Context: ${topic.subtopics.join(', ')}.
      Student question: ${userMsg}
      Keep it brief, encouraging, and highly technical.`);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting.' }]);
    } finally {
      setLoading(false);
    }
  };

  const [startTime] = useState(Date.now());

  const handleExit = () => {
    const duration = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes
    const history = JSON.parse(localStorage.getItem('smc-study-history') || '[]');
    localStorage.setItem('smc-study-history', JSON.stringify([...history, { topic: topic.title, duration, date: new Date().toISOString() }]));
    onExit();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-secondary flex flex-col">
      <header className="bg-white border-b border-darker p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary"><BrainCircuit/></div>
          <div>
            <h2 className="font-bold text-text">{topic.title} - Active Class</h2>
            <p className="text-xs text-muted font-mono">{Math.floor(timer/60)}:{String(timer%60).padStart(2,'0')}</p>
          </div>
        </div>
        <button onClick={handleExit} className="btn-secondary flex items-center gap-2"><X size={16}/> Exit Class</button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
           <div className="dash-card p-8">
              <h2 className="text-2xl font-bold mb-4">{topic.title} Overview</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {topic.subtopics.map(st => <div key={st} className="p-3 bg-secondary rounded-lg font-medium text-sm">{st}</div>)}
              </div>
              <div className="prose max-w-none text-muted">Study your primary material here...</div>
           </div>
        </main>

        <aside className="w-96 bg-white border-l border-darker flex flex-col">
          <div className="p-4 border-b border-darker font-bold flex items-center gap-2"><MessageSquare size={18}/> AI Tutor</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
             {messages.map((m, i) => (
               <div key={i} className={`p-3 rounded-xl text-sm max-w-[80%] ${m.role === 'user' ? 'bg-primary text-white ml-auto' : 'bg-secondary text-text'}`}>
                 {m.text}
               </div>
             ))}
             {loading && <div className="p-3 bg-secondary text-muted text-sm rounded-xl">Typing...</div>}
          </div>
          <div className="p-4 border-t border-darker flex gap-2">
            <input className="input-field" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
            <button onClick={sendMessage} className="btn-primary"><Send size={18}/></button>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}