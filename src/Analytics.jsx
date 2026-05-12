import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// ---------- Colors ----------
const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

// ---------- Mock Data Generators (simulating stored data) ----------
function generateMockData() {
  // Subject mastery (percentage per topic)
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

  // Weekly study hours (last 7 days)
  const studyHours = [
    { day: 'Mon', hours: 3, revision: 1 },
    { day: 'Tue', hours: 5, revision: 2 },
    { day: 'Wed', hours: 2, revision: 0 },
    { day: 'Thu', hours: 4, revision: 1 },
    { day: 'Fri', hours: 6, revision: 2 },
    { day: 'Sat', hours: 7, revision: 3 },
    { day: 'Sun', hours: 3, revision: 1 }
  ];

  // Mock test scores over attempts
  const mockScores = [
    { attempt: '1st', score: 45, total: 60 },
    { attempt: '2nd', score: 52, total: 60 },
    { attempt: '3rd', score: 48, total: 60 },
    { attempt: '4th', score: 55, total: 60 },
    { attempt: '5th', score: 58, total: 60 },
    { attempt: '6th', score: 54, total: 60 }
  ];

  // Weak vs Strong areas (for pie chart)
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
    <div className="bg-card border border-gray-700 rounded p-2 shadow-lg">
      <p className="text-accent font-medium">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-muted text-sm">{entry.name}: {entry.value}</p>
      ))}
    </div>
  );
}

// ---------- Analytics Component ----------
export default function Analytics() {
  const [data] = useState(() => {
    const mockData = generateMockData();
    // Try to load any stored mock test results
    try {
      const stored = JSON.parse(localStorage.getItem('smc-mock-results'));
      if (stored && stored.length > 0) {
        // Merge real data with mock data
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

  if (!data) return <div className="text-muted">Loading analytics...</div>;

  const { subjects, studyHours, mockScores, weakVsStrong } = data;

  // Calculate stats
  const avgScore = subjects.reduce((a, b) => a + b.score, 0) / subjects.length;
  const totalStudyHours = studyHours.reduce((a, b) => a + b.hours, 0);
  const strongestSubject = [...subjects].sort((a, b) => b.score - a.score)[0];
  const weakestSubject = [...subjects].sort((a, b) => a.score - b.score)[0];

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-3 text-accent">Performance Analytics</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-card p-3 rounded border border-gray-200 shadow-sm">
          <p className="text-muted text-xs">Avg Score</p>
          <p className="text-2xl font-bold text-accent">{avgScore.toFixed(0)}%</p>
        </div>
        <div className="bg-card p-3 rounded border border-gray-200 shadow-sm">
          <p className="text-muted text-xs">Study Hours (7d)</p>
          <p className="text-2xl font-bold text-accent">{totalStudyHours}h</p>
        </div>
        <div className="bg-card p-3 rounded border border-gray-200 shadow-sm">
          <p className="text-muted text-xs">Strongest</p>
          <p className="text-lg font-bold text-success truncate">{strongestSubject.name}</p>
        </div>
        <div className="bg-card p-3 rounded border border-gray-200 shadow-sm">
          <p className="text-muted text-xs">Needs Work</p>
          <p className="text-lg font-bold text-accent2 truncate">{weakestSubject.name}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Subject Mastery */}
        <div className="bg-card p-4 rounded border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-accent mb-3">Subject Mastery</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjects} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" width={120} stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mock Test Progress */}
        <div className="bg-card p-4 rounded border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-accent mb-3">Mock Test Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="attempt" stroke="#94a3b8" />
              <YAxis domain={[0, 60]} stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Study Hours */}
        <div className="bg-card p-4 rounded border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-accent mb-3">Study Hours (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studyHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="hours" fill="#3b82f6" name="Study" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revision" fill="#10b981" name="Revision" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weak vs Strong Areas */}
        <div className="bg-card p-4 rounded border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-accent mb-3">Subject Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={weakVsStrong}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {weakVsStrong.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart for overall skills */}
      <div className="bg-card p-4 rounded mb-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-accent mb-3">Skill Radar</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={subjects}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis stroke="#334155" />
            <Radar name="Mastery" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
