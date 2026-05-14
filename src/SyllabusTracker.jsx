import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SYLLABUS } from './syllabus';
import { BookOpen, CheckCircle, BrainCircuit } from 'lucide-react';
import FocusMode from './FocusMode';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function SyllabusTracker() {
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('smc-syllabus-progress')) || {}; }
    catch { return {}; }
  });
  const [activeTopic, setActiveTopic] = useState(null);

  const toggleTopic = (topicId, subtopic) => {
    setProgress(prev => {
      const topicProgress = prev[topicId] || [];
      const updated = topicProgress.includes(subtopic)
        ? topicProgress.filter(t => t !== subtopic)
        : [...topicProgress, subtopic];
      const newProgress = { ...prev, [topicId]: updated };
      localStorage.setItem('smc-syllabus-progress', JSON.stringify(newProgress));
      return newProgress;
    });
  };

  if (activeTopic) return <FocusMode topic={activeTopic} onExit={() => setActiveTopic(null)} />;

  const calculateProgress = (topic) => {
    const total = topic.subtopics.length;
    const completed = (progress[topic.id] || []).length;
    return Math.round((completed / total) * 100);
  };

  return (
    <motion.section variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-darker">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
          <BookOpen size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text">Syllabus Map</h2>
          <p className="text-sm text-muted">Track your coverage and launch focus sessions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SYLLABUS.map((topic) => {
          const percent = calculateProgress(topic);
          return (
            <motion.div variants={item} key={topic.id} className="dash-card flex flex-col">
              <div className="dash-card-header bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center justify-between w-full">
                  <h3 className="font-bold text-text truncate pr-2">{topic.title}</h3>
                  <button onClick={() => setActiveTopic(topic)} className="btn-primary flex items-center gap-2 py-1 px-3 text-xs shrink-0">
                     <BrainCircuit size={12}/> Start Class
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-2 flex-1 border-b border-darker/50">
                {topic.subtopics.map(sub => {
                  const isDone = (progress[topic.id] || []).includes(sub);
                  return (
                    <div 
                      key={sub} 
                      onClick={() => toggleTopic(topic.id, sub)}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${isDone ? 'bg-green-50' : 'hover:bg-secondary'}`}
                    >
                      <CheckCircle size={16} className={isDone ? 'text-success' : 'text-muted'} />
                      <span className={`text-sm ${isDone ? 'line-through text-muted' : 'text-text'}`}>{sub}</span>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 bg-secondary/30">
                <div className="flex items-center justify-between text-xs mb-1 font-medium">
                  <span className="text-muted">Progress</span>
                  <span className={percent === 100 ? 'text-success' : 'text-primary'}>{percent}%</span>
                </div>
                <div className="w-full h-2 bg-darker rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${percent === 100 ? 'bg-success' : 'bg-primary'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
