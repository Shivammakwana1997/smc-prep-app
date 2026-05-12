import { useState, useEffect } from 'react';

const QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Don't watch the clock; do what it does. Keep going.",
  "Your only limit is your mind.",
  "Every expert was once a beginner.",
  "Believe you can and you're halfway there.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream big. Start small. Act now.",
  "Consistency is what transforms average into excellence.",
  "You don't have to be great to start, but you have to start to be great."
];

const TIPS = [
  { title: 'Pomodoro Technique', desc: 'Study 25 min, break 5 min. After 4 cycles, take a 15-30 min break.' },
  { title: 'Sleep Matters', desc: '7-8 hours of sleep improves memory retention by 40%.' },
  { title: 'Stay Hydrated', desc: 'Drink water every hour. Dehydration reduces focus.' },
  { title: 'Move Your Body', desc: '5 min stretch every hour boosts blood flow to brain.' },
  { title: 'No Phone Rule', desc: 'Keep phone in another room during study blocks.' },
  { title: 'Eat Brain Food', desc: 'Nuts, fruits, and dark chocolate improve concentration.' },
  { title: 'Positive Self-Talk', desc: "Replace 'I cannot' with 'I am learning.'" },
  { title: 'Visualize Success', desc: 'Spend 2 min imagining yourself clearing the exam.' }
];

function BreathingExercise() {
  const [phase, setPhase] = useState('idle'); // idle, inhale, hold, exhale
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (phase === 'idle') return;
    const id = setInterval(() => {
      setCount(c => {
        if (phase === 'inhale' && c >= 4) { setPhase('hold'); return 0; }
        if (phase === 'hold' && c >= 7) { setPhase('exhale'); return 0; }
        if (phase === 'exhale' && c >= 8) { setPhase('inhale'); setCycles(x => x + 1); return 0; }
        return c + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  const start = () => { setPhase('inhale'); setCount(0); setCycles(0); };
  const stop = () => { setPhase('idle'); setCount(0); };

  const circleSize = phase === 'inhale' ? 'scale-125' : phase === 'hold' ? 'scale-125' : 'scale-100';
  const circleColor = phase === 'inhale' ? 'bg-success' : phase === 'hold' ? 'bg-accent' : 'bg-accent2';

  return (
    <div className="bg-card p-4 rounded text-center mb-4 border border-gray-200 shadow-sm">
      <h3 className="text-accent font-medium mb-2">4-7-8 Breathing</h3>
      <p className="text-muted text-sm mb-3">Inhale 4s → Hold 7s → Exhale 8s</p>
      
      <div className="flex justify-center mb-4">
        <div className={`w-32 h-32 rounded-full ${circleColor} transition-all duration-1000 flex items-center justify-center ${circleSize}`}>
          <span className="text-dark font-bold text-lg">
            {phase === 'idle' ? 'Ready' : phase === 'inhale' ? 'Inhale' : phase === 'hold' ? 'Hold' : 'Exhale'}
          </span>
        </div>
      </div>
      
      <p className="text-2xl font-mono text-accent mb-2">{count}s</p>
      <p className="text-muted text-sm mb-3">Cycles: {cycles}</p>
      
      <div className="flex justify-center gap-2">
        {phase === 'idle' ? (
          <button onClick={start} className="px-4 py-2 bg-secondary text-dark rounded">Start</button>
        ) : (
          <button onClick={stop} className="px-4 py-2 bg-accent2 text-dark rounded">Stop</button>
        )}
      </div>
    </div>
  );
}

export default function PsychologyWellbeing() {
  const [quoteIdx, setQuoteIdx] = useState(0);

  const nextQuote = () => setQuoteIdx(i => (i + 1) % QUOTES.length);

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-3 text-accent">Mindset & Wellness</h2>
      
      {/* Breathing Exercise */}
      <BreathingExercise />

      {/* Quote Card */}
      <div className="bg-card p-4 rounded mb-4 text-center border border-gray-200 shadow-sm">
        <p className="text-lg text-text italic mb-3">"{QUOTES[quoteIdx]}"</p>
        <button onClick={nextQuote} className="px-3 py-1 bg-darker text-muted rounded text-sm hover:text-accent transition">Next Quote</button>
      </div>

      {/* Wellness Tips Grid */}
      <h3 className="text-lg font-medium text-accent mb-2">Wellness Tips</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TIPS.map((tip, idx) => (
          <div key={idx} className="bg-card p-3 rounded border border-gray-200 shadow-sm hover:border-secondary transition">
            <h4 className="text-accent font-medium text-sm mb-1">{tip.title}</h4>
            <p className="text-muted text-xs">{tip.desc}</p>
          </div>
        ))}
      </div>

      {/* Exam Day Psychology */}
      <div className="bg-card p-4 rounded mt-4 border border-gray-200 shadow-sm">
        <h3 className="text-accent font-medium mb-2">Exam Day Mindset</h3>
        <ul className="space-y-1 text-sm text-muted">
          <li>• Arrive 30 min early to settle down</li>
          <li>• Take 3 deep breaths before starting</li>
          <li>• Read all questions before answering</li>
          <li>• Skip hard questions, come back later</li>
          <li>• Trust your preparation - you've got this!</li>
          <li>• Stay hydrated but don't drink too much water</li>
          <li>• If anxious, use 4-7-8 breathing technique</li>
        </ul>
      </div>
    </section>
  );
}
