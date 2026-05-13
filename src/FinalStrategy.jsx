import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Calendar as CalendarIcon, CheckCircle2, Circle, ChevronDown, Rocket, ShieldAlert, Zap, Layers, Trophy } from 'lucide-react';

const TOPICS = [
  'Basic Electrical', 'Electrical Machines', 'Power Systems',
  'Measurements', 'Digital Electronics', 'Microprocessor',
  'Control Systems', 'Utilization & Traction', 'Network Analysis'
];

function generatePlan(daysLeft) {
  const plan = [];
  const today = new Date();
  
  if (daysLeft <= 7) {
    for (let i = 0; i < daysLeft; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const isLast = i === daysLeft - 1;
      plan.push({
        day: i + 1,
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        phase: isLast ? 'Exam Day' : 'Final Sprint',
        tasks: isLast ? ['Stay calm', 'Light revision only', 'Reach exam center early'] : [
          '2 Mock Tests (60 questions each)',
          'Revise weak topics from AI tracker',
          '30 min formula revision',
          'Previous year questions',
          'Sleep 7+ hours'
        ],
        focus: isLast ? 'Relax' : TOPICS[i % TOPICS.length]
      });
    }
  } else if (daysLeft <= 30) {
    const phaseLength = Math.floor(daysLeft / 3);
    for (let i = 0; i < daysLeft; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      let phase = 'Foundation';
      if (i >= phaseLength) phase = 'Intensive';
      if (i >= phaseLength * 2) phase = 'Revision';
      
      const tasks = [];
      if (phase === 'Foundation') {
        tasks.push(`Study theory: ${TOPICS[i % TOPICS.length]}`);
        tasks.push('20 MCQ practice');
        tasks.push('Watch 2 video lectures');
        tasks.push('Make formula notes');
      } else if (phase === 'Intensive') {
        tasks.push(`Deep dive: ${TOPICS[i % TOPICS.length]}`);
        tasks.push('40 MCQ practice');
        tasks.push('1 Full mock test (60 q)');
        tasks.push('Subjective practice');
      } else {
        tasks.push('Revision of all topics');
        tasks.push('Previous year questions');
        tasks.push('2 Mock tests');
        tasks.push('Focus on weak areas');
      }
      tasks.push('Sleep 7+ hours');
      
      plan.push({ day: i + 1, date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), phase, tasks, focus: TOPICS[i % TOPICS.length] });
    }
  } else {
    for (let i = 0; i < Math.min(daysLeft, 60); i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      plan.push({
        day: i + 1,
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        phase: i < 20 ? 'Foundation' : i < 40 ? 'Intensive' : 'Revision',
        tasks: [
          `Study: ${TOPICS[i % TOPICS.length]}`,
          '30 MCQs',
          'Video + Notes',
          'Formula revision'
        ],
        focus: TOPICS[i % TOPICS.length]
      });
    }
  }
  return plan;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function FinalStrategy() {
  const [examDate, setExamDate] = useState(() => {
    return localStorage.getItem('smc-exam-date') || '';
  });
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('smc-strategy-progress')) || {}; }
    catch { return {}; }
  });
  const [expanded, setExpanded] = useState(0); // Open first day by default

  useEffect(() => {
    localStorage.setItem('smc-exam-date', examDate);
  }, [examDate]);

  useEffect(() => {
    localStorage.setItem('smc-strategy-progress', JSON.stringify(progress));
  }, [progress]);

  const daysLeft = examDate ? Math.max(0, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24))) : null;
  const plan = daysLeft !== null ? generatePlan(daysLeft) : [];

  const toggleTask = (dayIdx, taskIdx, e) => {
    e.stopPropagation();
    const key = `${dayIdx}-${taskIdx}`;
    setProgress(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalTasks = plan.reduce((acc, day) => acc + day.tasks.length, 0);
  const completedTasks = Object.keys(progress).filter(k => progress[k]).length;
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getPhaseStyle = (phase) => {
    switch (phase) {
      case 'Foundation': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Intensive': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'Revision': return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'Final Sprint': return 'bg-red-100 text-red-700 border border-red-200';
      case 'Exam Day': return 'bg-green-100 text-green-700 border border-green-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getPhaseIcon = (phase) => {
    switch (phase) {
      case 'Foundation': return <Layers size={14}/>;
      case 'Intensive': return <Zap size={14}/>;
      case 'Revision': return <ShieldAlert size={14}/>;
      case 'Final Sprint': return <Rocket size={14}/>;
      case 'Exam Day': return <Trophy size={14}/>;
      default: return <Target size={14}/>;
    }
  };

  return (
    <motion.section variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
      <motion.div variants={item} className="flex items-center gap-3 pb-4 border-b border-darker">
        <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shadow-sm">
          <Target size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">Final Strategy</h2>
          <p className="text-muted text-sm mt-1">Your AI-generated daily battle plan leading up to the exam.</p>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Date & Overall Progress */}
        <motion.div variants={item} className="md:col-span-1 space-y-6">
          <div className="dash-card">
            <div className="dash-card-header bg-rose-50/50 py-3">
              <h3 className="text-sm font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2">
                 <CalendarIcon size={16}/> Target Date
              </h3>
            </div>
            <div className="dash-card-body">
              <input 
                type="date" 
                value={examDate} 
                onChange={e => setExamDate(e.target.value)}
                className="input-field cursor-pointer font-medium mb-4"
              />
              
              {daysLeft !== null && (
                <div className="text-center pt-2">
                  <motion.p 
                    key={daysLeft}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl font-bold text-primary mb-1"
                  >
                    {daysLeft}
                  </motion.p>
                  <p className="text-muted font-medium uppercase tracking-wider text-xs">Days Remaining</p>
                </div>
              )}
            </div>
          </div>

          {plan.length > 0 && (
            <div className="dash-card p-5">
              <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Plan Completion</h3>
              <div className="flex justify-between items-end mb-2">
                 <span className="text-2xl font-bold text-success">{Math.round(overallProgress)}%</span>
                 <span className="text-xs text-muted font-medium">{completedTasks} of {totalTasks} tasks</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden shadow-inner border border-darker">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, overallProgress)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-green-400 to-green-500 h-full"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Right Column: The Plan */}
        <motion.div variants={item} className="md:col-span-2">
          {plan.length === 0 ? (
            <div className="dash-card h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4"><CalendarIcon size={32}/></div>
              <h3 className="text-xl font-bold text-text mb-2">Set Your Exam Date</h3>
              <p className="text-muted text-sm max-w-sm">Enter the date of your SMC Assistant Engineer exam on the left to generate your personalized day-by-day strategy.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-text px-1">Your Daily Missions</h3>
              {plan.map((day, idx) => {
                const isOpen = expanded === idx;
                const dayProgress = day.tasks.filter((_, tidx) => progress[`${idx}-${tidx}`]).length;
                const allDone = dayProgress === day.tasks.length && day.tasks.length > 0;
                
                return (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`dash-card overflow-hidden transition-all duration-300 ${allDone ? 'border-success/50 bg-green-50/10' : ''}`}
                  >
                    <button 
                      onClick={() => setExpanded(isOpen ? null : idx)}
                      className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isOpen ? 'bg-secondary/50' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${allDone ? 'bg-success text-white' : 'bg-white border border-darker text-text'}`}>
                           {allDone ? <CheckCircle2 size={20}/> : day.day}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-text">Day {day.day}</span>
                            <span className="text-muted text-xs font-medium">• {day.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm ${getPhaseStyle(day.phase)}`}>
                               {getPhaseIcon(day.phase)} {day.phase}
                            </span>
                            <span className="text-xs font-medium text-muted truncate max-w-[150px] sm:max-w-xs">{day.focus}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Tasks</p>
                          <p className={`text-sm font-bold ${allDone ? 'text-success' : 'text-primary'}`}>{dayProgress}/{day.tasks.length}</p>
                        </div>
                        <ChevronDown size={20} className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/>
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-darker bg-white"
                        >
                          <div className="p-4 space-y-2">
                            {day.tasks.map((task, tidx) => {
                              const isTaskDone = !!progress[`${idx}-${tidx}`];
                              return (
                                <div 
                                  key={tidx} 
                                  onClick={(e) => toggleTask(idx, tidx, e)}
                                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors group border border-transparent ${isTaskDone ? 'bg-secondary/50' : 'hover:border-darker hover:bg-gray-50'}`}
                                >
                                  <button className={`mt-0.5 shrink-0 transition-colors ${isTaskDone ? 'text-success' : 'text-muted group-hover:text-primary'}`}>
                                     {isTaskDone ? <CheckCircle2 size={20}/> : <Circle size={20}/>}
                                  </button>
                                  <span className={`text-sm font-medium transition-all ${isTaskDone ? 'line-through text-muted opacity-70' : 'text-text'}`}>
                                     {task}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}