import { useState, useEffect } from 'react';

const TOPICS = [
  'Basic Electrical', 'Electrical Machines', 'Power Systems',
  'Measurements', 'Digital Electronics', 'Microprocessor',
  'Control Systems', 'Utilization & Traction', 'Network Analysis'
];

function generatePlan(daysLeft) {
  const plan = [];
  const today = new Date();
  
  if (daysLeft <= 7) {
    // Final 7-day sprint
    for (let i = 0; i < daysLeft; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const isLast = i === daysLeft - 1;
      plan.push({
        day: i + 1,
        date: date.toLocaleDateString(),
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
    // 30-day plan
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
      
      plan.push({ day: i + 1, date: date.toLocaleDateString(), phase, tasks, focus: TOPICS[i % TOPICS.length] });
    }
  } else {
    // More than 30 days - general plan
    for (let i = 0; i < Math.min(daysLeft, 60); i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      plan.push({
        day: i + 1,
        date: date.toLocaleDateString(),
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

export default function FinalStrategy() {
  const [examDate, setExamDate] = useState(() => {
    return localStorage.getItem('smc-exam-date') || '';
  });
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('smc-strategy-progress')) || {}; }
    catch { return {}; }
  });
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    localStorage.setItem('smc-exam-date', examDate);
  }, [examDate]);

  useEffect(() => {
    localStorage.setItem('smc-strategy-progress', JSON.stringify(progress));
  }, [progress]);

  const daysLeft = examDate ? Math.max(0, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24))) : null;
  const plan = daysLeft !== null ? generatePlan(daysLeft) : [];

  const toggleTask = (dayIdx, taskIdx) => {
    const key = `${dayIdx}-${taskIdx}`;
    setProgress(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const overallProgress = plan.length > 0 ? (
    Object.keys(progress).filter(k => progress[k]).length / (plan.length * 5) * 100
  ) : 0;

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-3 text-accent">Final Strategy</h2>
      
      <div className="bg-card p-4 rounded mb-4 border border-gray-200 shadow-sm">
        <label className="text-muted text-sm mb-1 block">Exam Date</label>
        <input 
          type="date" 
          value={examDate} 
          onChange={e => setExamDate(e.target.value)}
          className="p-2 rounded bg-darker text-text border border-gray-700"
        />
        {daysLeft !== null && (
          <div className="mt-3">
            <p className="text-3xl font-bold text-accent">{daysLeft} <span className="text-lg text-muted">days remaining</span></p>
            <div className="w-full bg-darker h-2 rounded mt-2">
              <div className="bg-secondary h-2 rounded transition-all" style={{ width: `${Math.min(100, overallProgress)}%` }} />
            </div>
            <p className="text-muted text-xs mt-1">Plan progress: {Math.round(overallProgress)}%</p>
          </div>
        )}
      </div>

      {plan.length === 0 && (
        <p className="text-muted">Set your exam date above to generate your personalized study plan.</p>
      )}

      <div className="space-y-2">
        {plan.map((day, idx) => {
          const isOpen = expanded === idx;
          const dayProgress = day.tasks.filter((_, tidx) => progress[`${idx}-${tidx}`]).length;
          return (
            <div key={idx} className="bg-card rounded overflow-hidden border border-gray-200 shadow-sm">
              <button 
                onClick={() => setExpanded(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-darker transition"
              >
                <div>
                  <span className="text-accent font-medium">Day {day.day}</span>
                  <span className="text-muted text-sm ml-2">{day.date}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    day.phase === 'Foundation' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    day.phase === 'Intensive' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                    day.phase === 'Revision' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                    'bg-green-100 text-green-700 border border-green-200'
                  }`}>{day.phase}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted text-xs">{dayProgress}/{day.tasks.length}</span>
                  <span className="text-muted">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>
              {isOpen && (
                <div className="p-3 pt-0 border-t border-gray-700">
                  <p className="text-muted text-sm mb-2">Focus: <span className="text-accent">{day.focus}</span></p>
                  <div className="space-y-1">
                    {day.tasks.map((task, tidx) => (
                      <label key={tidx} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={!!progress[`${idx}-${tidx}`]}
                          onChange={() => toggleTask(idx, tidx)}
                          className="w-4 h-4 accent-secondary"
                        />
                        <span className={`text-sm ${progress[`${idx}-${tidx}`] ? 'line-through text-muted' : 'text-text'}`}>{task}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
