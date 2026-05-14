import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Activity, BookOpen, Video, PenTool, BarChart3, AlertTriangle, TrendingUp, Clock, Calendar } from 'lucide-react';

function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) || defaultValue; }
    catch { return defaultValue; }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

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

export default function Dashboard({ onNavigate }) {
  const [streak] = useState(() => {
    const today = new Date().toDateString();
    const streakData = JSON.parse(localStorage.getItem('smc-streak') || '{"current":0,"lastDate":""}');
    if (streakData.lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (streakData.lastDate === yesterday.toDateString()) {
        streakData.current += 1;
      } else {
        streakData.current = 1;
      }
      streakData.lastDate = today;
      localStorage.setItem('smc-streak', JSON.stringify(streakData));
    }
    localStorage.setItem('smc-last-visit', today);
    return streakData.current;
  });
  const [mockResults] = useLocalStorage('smc-mock-results', []);

  // Stats
  const notes = JSON.parse(localStorage.getItem('smc-notes') || '[]');
  const revisionQueue = JSON.parse(localStorage.getItem('smc-revision-queue') || '[]');
  const dueToday = revisionQueue.filter(q => {
    if (!q.nextReviewDate) return false;
    return new Date(q.nextReviewDate) <= new Date();
  }).length;

  const avgScore = mockResults.length > 0
    ? Math.round(mockResults.reduce((a, b) => a + b.accuracy, 0) / mockResults.length)
    : 0;

  const stats = [
    { label: 'Study Streak', value: streak, unit: 'days', color: 'text-primary', bg: 'bg-primary/10', icon: TrendingUp },
    { label: 'Notes', value: notes.length, unit: 'saved', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: PenTool },
    { label: 'Revision Due', value: dueToday, unit: 'cards', color: 'text-accent', bg: 'bg-amber-50', icon: Clock },
    { label: 'Avg Score', value: `${avgScore}%`, unit: 'accuracy', color: 'text-success', bg: 'bg-green-50', icon: Target },
  ];

  const actions = [
    { id: 'mocktest', label: 'Take Mock Test', icon: Target, color: 'text-primary' },
    { id: 'revision', label: 'Start Revision', icon: Activity, color: 'text-indigo-500' },
    { id: 'handouts', label: 'Browse PDFs', icon: BookOpen, color: 'text-emerald-500' },
    { id: 'video', label: 'Watch Videos', icon: Video, color: 'text-rose-500' },
    { id: 'notes', label: 'Open Notes', icon: PenTool, color: 'text-purple-500' },
    { id: 'analytics', label: 'View Analytics', icon: BarChart3, color: 'text-blue-500' },
  ];

  return (
    <motion.section 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item} className="flex justify-between items-end pb-4 border-b border-darker/50">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome Back! 👋</h1>
          <div className="flex items-center gap-2 text-muted text-sm">
            <Calendar size={14} />
            <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="hidden sm:block">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('mocktest')} 
            className="btn-primary flex items-center gap-2"
          >
            <Target size={16} /> Start Test
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.div 
              key={idx} 
              whileHover={{ y: -5, scale: 1.02 }}
              className="dash-card p-5 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-muted text-xs font-medium uppercase tracking-wider">{s.label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
                  {s.unit && <span className="text-muted text-xs font-medium">{s.unit}</span>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-text mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {actions.map(a => {
            const Icon = a.icon;
            return (
              <motion.button 
                key={a.id} 
                whileHover={{ y: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate(a.id)} 
                className="dash-card p-4 flex flex-col items-center justify-center gap-3 hover:border-primary/50 group transition-colors"
              >
                <div className={`w-10 h-10 rounded-full bg-secondary flex items-center justify-center ${a.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
                <span className="text-text text-sm font-medium">{a.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Activity & Weaknesses */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Mock Tests */}
        <div className="dash-card lg:col-span-2">
          <div className="dash-card-header">
            <h3 className="text-base font-semibold text-text flex items-center gap-2">
              <Activity size={18} className="text-primary" /> Recent Activity
            </h3>
            <button onClick={() => onNavigate('analytics')} className="text-primary text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="p-0">
            {mockResults.length === 0 ? (
              <div className="p-8 text-center text-muted border-b border-darker">No mock tests taken yet.</div>
            ) : (
              <div className="divide-y divide-darker">
                {mockResults.slice(-4).reverse().map((r, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex justify-between items-center p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Target size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">Mock Test</p>
                        <p className="text-xs text-muted">{r.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-text">{r.score}/{r.total}</p>
                      <p className={`text-xs font-medium ${r.accuracy >= 70 ? 'text-success' : 'text-accent'}`}>{r.accuracy}% Accuracy</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="dash-card">
           <div className="dash-card-header">
            <h3 className="text-base font-semibold text-text flex items-center gap-2">
              <AlertTriangle size={18} className="text-accent" /> Focus Areas
            </h3>
          </div>
          <div className="dash-card-body">
            {revisionQueue.length === 0 ? (
              <p className="text-muted text-sm text-center py-4">Start revision to identify weak topics.</p>
            ) : (
              <div className="space-y-3">
                {Array.from(new Set(revisionQueue.filter(q => q.interval <= 1).map(q => q.topic))).slice(0, 5).map((topic, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={topic} 
                    className="flex items-center justify-between p-3 rounded-lg bg-red-50/80 backdrop-blur border border-red-100/50"
                  >
                    <span className="text-sm font-medium text-red-700 truncate pr-2">{topic}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-200 text-red-800 rounded-full shrink-0">Review</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

      </motion.div>
    </motion.section>
  );
}
