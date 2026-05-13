import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, CheckCircle2, Circle, Trash2, Plus, Target, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getMonthData(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function StudyPlanner() {
  const [sessions, setSessions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('smc-sessions')) || {}; }
    catch { return {}; }
  });
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [showAdd, setShowAdd] = useState(false);
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(60);
  const [note, setNote] = useState('');

  useEffect(() => {
    localStorage.setItem('smc-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const { firstDay, daysInMonth } = getMonthData(date.getFullYear(), date.getMonth());
  const year = date.getFullYear();
  const month = date.getMonth();

  const prevMonth = () => setDate(new Date(year, month - 1, 1));
  const nextMonth = () => setDate(new Date(year, month + 1, 1));

  const addSession = () => {
    if (!topic.trim()) return;
    const key = selectedDate;
    const newSession = { id: Date.now(), topic, duration: Number(duration), note, done: false };
    setSessions(prev => ({ ...prev, [key]: [...(prev[key] || []), newSession] }));
    setTopic(''); setDuration(60); setNote(''); setShowAdd(false);
  };

  const toggleDone = (key, id) => {
    setSessions(prev => ({
      ...prev,
      [key]: prev[key].map(s => s.id === id ? { ...s, done: !s.done } : s)
    }));
  };

  const deleteSession = (key, id) => {
    setSessions(prev => ({
      ...prev,
      [key]: prev[key].filter(s => s.id !== id)
    }));
  };

  const todayKey = formatDateKey(new Date());
  const selectedSessions = sessions[selectedDate] || [];
  
  const allSessions = Object.values(sessions).flat();
  const totalPlanned = allSessions.length;
  const totalDone = allSessions.filter(s => s.done).length;
  const totalMinutes = allSessions.reduce((a, s) => a + (s.duration || 0), 0);
  const doneMinutes = allSessions.filter(s => s.done).reduce((a, s) => a + (s.duration || 0), 0);

  // Generate calendar grid
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <motion.section variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">
      <motion.div variants={item} className="flex items-center gap-3 pb-4 border-b border-darker">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
          <CalendarIcon size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">Study Planner</h2>
          <p className="text-muted text-sm mt-1">Organize your daily study sessions and track progress.</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dash-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600"><BookOpen size={24}/></div>
          <div>
            <p className="text-muted text-xs font-medium uppercase tracking-wider">Planned</p>
            <p className="text-2xl font-bold text-text">{totalPlanned}</p>
          </div>
        </div>
        <div className="dash-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600"><CheckCircle2 size={24}/></div>
          <div>
            <p className="text-muted text-xs font-medium uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-success">{totalDone}</p>
          </div>
        </div>
        <div className="dash-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600"><Clock size={24}/></div>
          <div>
            <p className="text-muted text-xs font-medium uppercase tracking-wider">Study Hours</p>
            <p className="text-2xl font-bold text-text">{(totalMinutes/60).toFixed(1)}h</p>
          </div>
        </div>
        <div className="dash-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-600"><Target size={24}/></div>
          <div>
            <p className="text-muted text-xs font-medium uppercase tracking-wider">Done Hours</p>
            <p className="text-2xl font-bold text-indigo-600">{(doneMinutes/60).toFixed(1)}h</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar */}
        <motion.div variants={item} className="dash-card lg:col-span-2">
          <div className="dash-card-header bg-transparent border-b-0 pb-0">
            <div className="flex items-center justify-between w-full">
              <button onClick={prevMonth} className="p-2 hover:bg-secondary rounded-lg transition-colors"><ChevronLeft size={20} className="text-muted"/></button>
              <h3 className="text-xl font-bold text-text bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                {MONTHS[month]} {year}
              </h3>
              <button onClick={nextMonth} className="p-2 hover:bg-secondary rounded-lg transition-colors"><ChevronRight size={20} className="text-muted"/></button>
            </div>
          </div>
          <div className="dash-card-body pt-4">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {DAYS.map(d => <div key={d} className="text-center text-muted text-xs font-bold uppercase tracking-wider py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {cells.map((day, idx) => {
                if (day === null) return <div key={idx} className="aspect-square" />;
                const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const hasSessions = sessions[key] && sessions[key].length > 0;
                const isToday = key === todayKey;
                const isSelected = key === selectedDate;
                
                let style = 'bg-secondary/50 text-text border border-transparent hover:border-primary/30 hover:bg-white';
                if (isToday) style = 'bg-primary/10 text-primary border border-primary/20 font-bold';
                if (isSelected) style = 'bg-primary text-white border border-primary shadow-sm transform scale-105 z-10';

                return (
                  <button
                    key={idx}
                    onClick={() => { setSelectedDate(key); setShowAdd(false); }}
                    className={`aspect-square rounded-xl text-sm transition-all duration-200 relative flex flex-col items-center justify-center gap-1 ${style}`}
                  >
                    <span>{day}</span>
                    {hasSessions && (
                      <div className="flex gap-0.5">
                        {sessions[key].slice(0,3).map((s, i) => (
                           <div key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : s.done ? 'bg-success' : 'bg-primary'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Selected Day Panel */}
        <motion.div variants={item} className="dash-card flex flex-col h-[500px]">
          <div className="dash-card-header py-4 shrink-0">
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-0.5">Agenda for</p>
              <h3 className="text-lg font-bold text-text">{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
            </div>
            {!showAdd && (
              <button onClick={() => setShowAdd(true)} className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Plus size={18} />
              </button>
            )}
          </div>

          <div className="dash-card-body flex-1 overflow-y-auto pt-2 space-y-4">
            <AnimatePresence>
              {showAdd && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="bg-secondary/80 backdrop-blur rounded-xl p-4 border border-darker mb-4"
                >
                  <h4 className="text-sm font-semibold text-text mb-3">Add New Session</h4>
                  <div className="space-y-3">
                    <input className="input-field text-sm py-2" placeholder="Topic / Subject" value={topic} onChange={e => setTopic(e.target.value)} autoFocus />
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
                        <input type="number" className="input-field text-sm py-2 pl-9" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Min" />
                      </div>
                      <span className="text-muted text-sm self-center font-medium">min</span>
                    </div>
                    <input className="input-field text-sm py-2" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
                    <div className="flex gap-2 pt-2">
                      <button onClick={addSession} className="flex-1 btn-primary py-2 text-sm">Save</button>
                      <button onClick={() => setShowAdd(false)} className="flex-1 btn-secondary py-2 text-sm">Cancel</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {selectedSessions.length === 0 && !showAdd && (
              <div className="flex flex-col items-center justify-center h-full text-muted space-y-3 opacity-60">
                <CalendarIcon size={40} />
                <p className="text-sm font-medium">No sessions planned.</p>
              </div>
            )}
            
            <div className="space-y-3">
              <AnimatePresence>
                {selectedSessions.map((s) => (
                  <motion.div 
                    key={s.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 rounded-xl border transition-colors ${s.done ? 'bg-green-50/50 border-green-200/50 opacity-70' : 'bg-white border-darker shadow-sm hover:border-primary/30'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button onClick={() => toggleDone(selectedDate, s.id)} className="mt-1 shrink-0 transition-colors">
                         {s.done ? <CheckCircle2 size={20} className="text-success"/> : <Circle size={20} className="text-muted hover:text-primary"/>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-semibold truncate ${s.done ? 'line-through text-muted' : 'text-text'}`}>{s.topic}</h4>
                        <p className="text-xs font-medium text-primary mt-1 flex items-center gap-1"><Clock size={12}/> {s.duration} min</p>
                        {s.note && <p className="text-xs text-muted mt-2 bg-secondary p-2 rounded-lg">{s.note}</p>}
                      </div>
                      <button onClick={() => deleteSession(selectedDate, s.id)} className="text-muted hover:text-danger p-1 rounded-md hover:bg-red-50 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}