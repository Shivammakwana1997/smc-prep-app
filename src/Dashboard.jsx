import { useState, useEffect } from 'react';

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
    { label: 'Study Streak', value: streak, unit: 'days', color: 'text-accent' },
    { label: 'Notes', value: notes.length, unit: '', color: 'text-secondary' },
    { label: 'Revision Due', value: dueToday, unit: 'cards', color: 'text-accent2' },
    { label: 'Avg Score', value: `${avgScore}%`, unit: '', color: 'text-success' },
  ];

  const actions = [
    { id: 'mocktest', label: 'Take Mock Test', icon: '📝' },
    { id: 'revision', label: 'Start Revision', icon: '🔄' },
    { id: 'handouts', label: 'Browse PDFs', icon: '📚' },
    { id: 'video', label: 'Watch Videos', icon: '🎥' },
    { id: 'notes', label: 'Open Notes', icon: '📝' },
    { id: 'analytics', label: 'View Analytics', icon: '📊' },
  ];

  return (
    <section>
      <h1 className="text-3xl font-bold mb-2 text-accent">Dashboard</h1>
      <p className="text-muted mb-4">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-card p-3 rounded border border-gray-200 shadow-sm">
            <p className="text-muted text-xs">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            {s.unit && <p className="text-muted text-xs">{s.unit}</p>}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold text-accent mb-2">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {actions.map(a => (
          <button key={a.id} onClick={() => onNavigate(a.id)} className="bg-card p-3 rounded hover:border-secondary border border-gray-200 shadow-sm transition text-center">
            <div className="text-2xl mb-1">{a.icon}</div>
            <p className="text-accent text-sm font-medium">{a.label}</p>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-card p-4 rounded border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-accent mb-2">📈 Recent Mock Tests</h3>
          {mockResults.length === 0 ? (
            <p className="text-muted text-sm">No mock tests taken yet.</p>
          ) : (
            <div className="space-y-2">
              {mockResults.slice(-3).reverse().map((r, i) => (
                <div key={i} className="flex justify-between text-muted text-sm py-1 border-b border-gray-700 last:border-0">
                  <span>{r.date}</span>
                  <span className="text-accent">{r.score}/{r.total} ({r.accuracy}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-card p-4 rounded border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-accent mb-2">📝 Recent Notes</h3>
          {notes.length === 0 ? (
            <p className="text-muted text-sm">No notes yet.</p>
          ) : (
            <div className="space-y-2">
              {notes.slice(-3).reverse().map((n, i) => (
                <div key={i} className="flex justify-between text-muted text-sm py-1 border-b border-gray-700 last:border-0">
                  <span className="truncate max-w-[200px]">{n.title || 'Untitled'}</span>
                  <span>{n.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weak Topics */}
      <div className="bg-card p-4 rounded border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-accent mb-2">⚠️ Weak Topics</h3>
        {revisionQueue.length === 0 ? (
          <p className="text-muted text-sm">Start revision to identify weak topics.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {Array.from(new Set(revisionQueue.filter(q => q.interval <= 1).map(q => q.topic))).slice(0, 4).map(topic => (
              <div key={topic} className="bg-darker p-2 rounded text-center border border-gray-200">
                <p className="text-accent text-sm font-medium">{topic}</p>
                <p className="text-muted text-xs">Needs work</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
