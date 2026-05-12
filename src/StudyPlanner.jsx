import { useState, useEffect } from 'react';

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
  const totalPlanned = Object.values(sessions).flat().length;
  const totalDone = Object.values(sessions).flat().filter(s => s.done).length;
  const totalMinutes = Object.values(sessions).flat().reduce((a, s) => a + (s.duration || 0), 0);
  const doneMinutes = Object.values(sessions).flat().filter(s => s.done).reduce((a, s) => a + (s.duration || 0), 0);

  // Generate calendar grid
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-3 text-accent">Study Planner</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-card p-3 rounded text-center border border-gray-200 shadow-sm">
          <p className="text-muted text-xs">Planned</p>
          <p className="text-2xl font-bold text-accent">{totalPlanned}</p>
        </div>
        <div className="bg-card p-3 rounded text-center border border-gray-200 shadow-sm">
          <p className="text-muted text-xs">Completed</p>
          <p className="text-2xl font-bold text-success">{totalDone}</p>
        </div>
        <div className="bg-card p-3 rounded text-center border border-gray-200 shadow-sm">
          <p className="text-muted text-xs">Study Hours</p>
          <p className="text-2xl font-bold text-accent">{(totalMinutes/60).toFixed(1)}h</p>
        </div>
        <div className="bg-card p-3 rounded text-center border border-gray-200 shadow-sm">
          <p className="text-muted text-xs">Done Hours</p>
          <p className="text-2xl font-bold text-success">{(doneMinutes/60).toFixed(1)}h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-card p-4 rounded border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="px-3 py-1 bg-darker text-muted rounded">←</button>
            <h3 className="text-lg font-medium text-accent">{MONTHS[month]} {year}</h3>
            <button onClick={nextMonth} className="px-3 py-1 bg-darker text-muted rounded">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map(d => <div key={d} className="text-center text-muted text-xs font-medium py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={idx} />;
              const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const hasSessions = sessions[key] && sessions[key].length > 0;
              const isToday = key === todayKey;
              const isSelected = key === selectedDate;
              return (
                <button
                  key={idx}
                  onClick={() => { setSelectedDate(key); setShowAdd(false); }}
                  className={`p-2 rounded text-sm text-center transition relative ${
                    isSelected ? 'bg-secondary text-dark' : isToday ? 'bg-accent text-dark' : 'bg-darker text-text hover:bg-gray-700'
                  }`}
                >
                  {day}
                  {hasSessions && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-accent2 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Panel */}
        <div className="bg-card p-4 rounded border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-accent">{selectedDate}</h3>
            <button onClick={() => setShowAdd(true)} className="px-3 py-1 bg-secondary text-dark rounded text-sm">+ Add</button>
          </div>

          {showAdd && (
            <div className="mb-3 bg-darker p-3 rounded">
              <input className="w-full mb-2 p-2 rounded bg-card text-text border border-gray-700 text-sm" placeholder="Topic / Subject" value={topic} onChange={e => setTopic(e.target.value)} />
              <div className="flex gap-2 mb-2">
                <input type="number" className="w-20 p-2 rounded bg-card text-text border border-gray-700 text-sm" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Min" />
                <span className="text-muted text-sm self-center">minutes</span>
              </div>
              <input className="w-full mb-2 p-2 rounded bg-card text-text border border-gray-700 text-sm" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={addSession} className="px-3 py-1 bg-secondary text-dark rounded text-sm">Save</button>
                <button onClick={() => setShowAdd(false)} className="px-3 py-1 bg-darker text-muted rounded text-sm">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-80 overflow-auto">
            {selectedSessions.length === 0 && <p className="text-muted text-sm">No sessions planned.</p>}
            {selectedSessions.map(s => (
              <div key={s.id} className={`p-2 rounded border ${s.done ? 'border-success bg-darker/50' : 'border-gray-200 bg-darker'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${s.done ? 'line-through text-muted' : 'text-text'}`}>{s.topic}</span>
                  <span className="text-muted text-xs">{s.duration}m</span>
                </div>
                {s.note && <p className="text-muted text-xs mt-1">{s.note}</p>}
                <div className="flex gap-2 mt-2">
                  <button onClick={() => toggleDone(selectedDate, s.id)} className={`text-xs px-2 py-1 rounded ${s.done ? 'bg-darker text-muted' : 'bg-success text-dark'}`}>{s.done ? 'Undo' : 'Done'}</button>
                  <button onClick={() => deleteSession(selectedDate, s.id)} className="text-xs px-2 py-1 bg-accent2 text-dark rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
