import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Activity, Clock, Trophy, TrendingUp, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// ---------- Colors ----------
const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

// ---------- Mock Data Generators ----------
function generateMockData() {
  const subjects = [
    { name: 'Basic Electrical', score: 85 },
    { name: 'Machines', score: 72 },
    { name: 'Power Systems', score: 65 },
    { name: 'Control Systems', score: 90 },
    { name: 'Switchgear', score: 78 },
    { name: 'Measurements', score: 58 },
    { name: 'Digital Electronics', score: 82 },
    { name: 'Energy & Laws', score: 70 }
  ];

  const studyHours = [
    { day: 'Mon', hours: 3, revision: 1 },
    { day: 'Tue', hours: 5, revision: 2 },
    { day: 'Wed', hours: 2, revision: 0 },
    { day: 'Thu', hours: 4, revision: 1 },
    { day: 'Fri', hours: 6, revision: 2 },
    { day: 'Sat', hours: 7, revision: 3 },
    { day: 'Sun', hours: 3, revision: 1 }
  ];

  const mockScores = [
    { attempt: '1st', score: 45, total: 60 },
    { attempt: '2nd', score: 52, total: 60 },
    { attempt: '3rd', score: 48, total: 60 },
    { attempt: '4th', score: 55, total: 60 },
    { attempt: '5th', score: 58, total: 60 },
    { attempt: '6th', score: 54, total: 60 }
  ];

  const weakVsStrong = [
    { name: 'Strong (>80%)', value: subjects.filter(s => s.score > 80).length },
    { name: 'Moderate (60-80%)', value: subjects.filter(s => s.score >= 60 && s.score <= 80).length },
    { name: 'Weak (<60%)', value: subjects.filter(s => s.score < 60).length }
  ];

  return { subjects, studyHours, mockScores, weakVsStrong };
}

// ---------- Custom Tooltip ----------
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white/90 backdrop-blur border border-white/50 rounded-xl p-3 shadow-glass z-50">
      <p className="text-text font-bold mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color || entry.fill }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Analytics() {
  const [data] = useState(() => {
    const mockData = generateMockData();
    try {
      const stored = JSON.parse(localStorage.getItem('smc-mock-results'));
      if (stored && stored.length > 0) {
        return {
          ...mockData,
          mockScores: stored.map((r, i) => ({
            attempt: `${i + 1}${['st','nd','rd'][i] || 'th'}`,
            score: r.score,
            total: r.total
          }))
        };
      }
    } catch { /* ignore */ }
    return mockData;
  });

  if (!data) return <div className="text-muted text-center py-10">Loading analytics...</div>;

  const { subjects, studyHours, mockScores, weakVsStrong } = data;

  const avgScore = subjects.reduce((a, b) => a + b.score, 0) / subjects.length;
  const totalStudyHours = studyHours.reduce((a, b) => a + b.hours, 0);
  const strongestSubject = [...subjects].sort((a, b) => b.score - a.score)[0];
  const weakestSubject = [...subjects].sort((a, b) => a.score - b.score)[0];

  const stats = [
    { label: 'Avg Score', value: `${avgScore.toFixed(0)}%`, icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Study (7d)', value: `${totalStudyHours}h`, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Strongest', value: strongestSubject.name, icon: Trophy, color: 'text-success', bg: 'bg-green-50' },
    { label: 'Needs Work', value: weakestSubject.name, icon: AlertTriangle, color: 'text-accent', bg: 'bg-amber-50' },
  ];

  return (
    <motion.section variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center gap-3 pb-4 border-b border-darker">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
          <Activity size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">Performance Analytics</h2>
          <p className="text-muted text-sm mt-1">Track your progress and identify areas for improvement.</p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.div key={idx} whileHover={{ y: -5, scale: 1.02 }} className="dash-card p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
                <Icon size={24} />
              </div>
              <div className="overflow-hidden">
                <p className="text-muted text-xs font-medium uppercase tracking-wider">{s.label}</p>
                <p className={`text-xl font-bold truncate ${s.color}`}>{s.value}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Mastery */}
        <motion.div variants={item} className="dash-card p-5">
          <h3 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-primary"/> Subject Mastery
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjects} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} />
              <YAxis dataKey="name" type="category" width={110} stroke="#64748b" fontSize={11} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} />
              <Bar dataKey="score" fill="url(#colorScore)" radius={[0, 4, 4, 0]}>
                {subjects.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.score > 80 ? '#10b981' : entry.score > 60 ? '#3b82f6' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Mock Test Progress */}
        <motion.div variants={item} className="dash-card p-5">
          <h3 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500"/> Mock Test Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockScores} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="attempt" stroke="#64748b" fontSize={12} />
              <YAxis domain={[0, 'dataMax + 10']} stroke="#64748b" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Hours */}
        <motion.div variants={item} className="dash-card p-5">
          <h3 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
            <Clock size={18} className="text-amber-500"/> Study Hours (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studyHours} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="hours" fill="#3b82f6" name="New Topics" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="revision" fill="#10b981" name="Revision" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weak vs Strong Areas */}
        <motion.div variants={item} className="dash-card p-5">
          <h3 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
            <Target size={18} className="text-success"/> Subject Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={weakVsStrong}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                stroke="none"
              >
                {weakVsStrong.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Radar Chart for overall skills */}
      <motion.div variants={item} className="dash-card p-5 mb-6">
        <h3 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
           <Activity size={18} className="text-rose-500"/> Skill Radar
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={subjects} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="#cbd5e1" />
            <PolarAngleAxis dataKey="name" stroke="#64748b" tick={{ fill: '#475569', fontSize: 11 }} />
            <PolarRadiusAxis stroke="#cbd5e1" angle={30} domain={[0, 100]} />
            <Radar name="Mastery" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} strokeWidth={2} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.section>
  );
}