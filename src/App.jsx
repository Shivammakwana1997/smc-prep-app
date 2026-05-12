import { useState, useRef, useEffect } from 'react';
import './App.css';
import VideoWorkspace from './VideoWorkspace';
import Analytics from './Analytics';
import RevisionEngine from './RevisionEngine';
import MockTest from './MockTest';
import SubjectivePractice from './SubjectivePractice';
import FormulaAttack from './FormulaAttack';
import ExamHall from './ExamHall';
import StudyPlanner from './StudyPlanner';
import FinalStrategy from './FinalStrategy';
import PsychologyWellbeing from './PsychologyWellbeing';
import Dashboard from './Dashboard';
import AIWeaknessTracker from './AIWeaknessTracker';

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// PDF list (copied to public/pdfs)
const pdfs = [
  { name: 'Basic Electrical_6415760.pdf', title: 'Basic Electrical' },
  { name: 'Digital Electronics_6415788.pdf', title: 'Digital Electronics' },
  { name: 'Utilization of Electrical Energy & Traction_6415878.pdf', title: 'Utilization of Electrical Energy & Traction' },
  { name: 'Electrical Power System_6415877.pdf', title: 'Electrical Power System' },
  { name: 'Electrical Machine_6415810.pdf', title: 'Electrical Machine' },
  { name: 'Measurement & Instrumentation_6415830.pdf', title: 'Measurement & Instrumentation' },
  { name: 'Microprocessor_6415832.pdf', title: 'Microprocessor' },
  { name: 'Electrical Windings_6415880.pdf', title: 'Electrical Windings' },
  { name: 'Electrical Network Analysis_6415852.pdf', title: 'Electrical Network Analysis' },
  { name: 'dc machine complete pdf by Ravendra sir.pdf', title: 'DC Machine (Ravendra Sir)' },
  { name: 'complete pdf of synchronous machine.pdf', title: 'Synchronous Machine' },
  { name: 'RAG_Course_Curriculum.docx.pdf', title: 'RAG Course Curriculum' }
];

// Electrical4U topics
const elec4uTopics = [
  { url: 'https://www.electrical4u.com', label: 'Main Site', desc: 'All tutorials & theory notes' },
  { url: 'https://www.electrical4u.com/electrical-machines', label: 'Machines', desc: 'Transformers, DC & Induction Motors' },
  { url: 'https://www.electrical4u.com/power-system', label: 'Power Systems', desc: 'Generation, transmission & distribution' },
  { url: 'https://www.electrical4u.com/control-system', label: 'Control Systems', desc: 'Stability, feedback & PID' }
];

export default function App() {
  const [section, setSection] = useState('dashboard');
  const [selectedPdf, setSelectedPdf] = useState(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'handouts', label: 'Handouts' },
    { id: 'electrical4u', label: 'Electrical4U' },
    { id: 'pdfviewer', label: 'PDF Viewer' },
    { id: 'video', label: 'Videos' },
    { id: 'mocktest', label: 'Mock Test' },
    { id: 'examhall', label: 'Exam Hall' },
    { id: 'subjective', label: 'Subjective' },
    { id: 'formula', label: 'Formulas' },
    { id: 'revision', label: 'Revision' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'planner', label: 'Planner' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'mindset', label: 'Mindset' },
    { id: 'notes', label: 'Notes' },
    { id: 'aiweakness', label: 'AI Tracker' }
  ];

  const handleSelectPdf = (pdf) => {
    setSelectedPdf(pdf);
    setSection('pdfviewer');
  };

  const renderSection = () => {
    switch (section) {
      case 'dashboard': return <Dashboard onNavigate={setSection} />;
      case 'handouts': return <Handouts onSelect={handleSelectPdf} />;
      case 'electrical4u': return <Electrical4U />;
      case 'pdfviewer': return <PdfViewer pdf={selectedPdf} />;
      case 'video': return <VideoWorkspace />;
      case 'mocktest': return <MockTest />;
      case 'examhall': return <ExamHall />;
      case 'formula': return <FormulaAttack />;
      case 'revision': return <RevisionEngine />;
      case 'analytics': return <Analytics />;
      case 'planner': return <StudyPlanner />;
      case 'strategy': return <FinalStrategy />;
      case 'mindset': return <PsychologyWellbeing />;
      case 'subjective': return <SubjectivePractice />;
      case 'notes': return <Notes />;
      case 'aiweakness': return <AIWeaknessTracker />;
      default: return <Dashboard onNavigate={setSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-darker text-text font-sans">
      {/* Top Header */}
      <header className="bg-card shadow-page sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <h1 className="text-lg font-bold text-text leading-tight">SMC Prep App</h1>
              <p className="text-xs text-muted">Assistant Engineer (Electrical)</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-muted">
            <span className="px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200">Gujarat Govt Exam</span>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200">PDF & Mockup Mode</span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b border-gray-200 sticky top-[61px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">
            {navItems.map(it => (
              <button
                key={it.id}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  section === it.id 
                    ? 'nav-pill-active' 
                    : 'nav-pill'
                }`}
                onClick={() => setSection(it.id)}
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content - Document/Page Style */}
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="pdf-page-lg p-6 md:p-8 min-h-[70vh]">
          {renderSection()}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 pb-6 text-center text-xs text-muted">
        <p>SMC Assistant Engineer (Electrical) Preparation App — Built for focused study</p>
      </footer>
    </div>
  );
}

// ---------- Handouts ----------
function Handouts({ onSelect }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">📚</div>
        <div>
          <h2 className="text-2xl font-bold text-text">Handouts</h2>
          <p className="text-sm text-muted">Click any card to open the PDF in the built-in viewer.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pdfs.map(p => (
          <button
            key={p.name}
            onClick={() => onSelect(p)}
            className="pdf-page p-4 text-left hover:shadow-page-lg transition-all duration-200 group border border-gray-200 bg-white"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-12 bg-red-50 border border-red-100 rounded flex items-center justify-center text-red-500 font-bold text-xs shrink-0 group-hover:bg-red-100 transition">
                PDF
              </div>
              <div className="min-w-0">
                <h3 className="text-text font-semibold text-sm leading-snug group-hover:text-primary transition">{p.title}</h3>
                <p className="text-muted text-xs mt-1 truncate">{p.name}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

// ---------- Electrical4U ----------
function Electrical4U() {
  const [previewError, setPreviewError] = useState(false);

  return (
    <section>
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">⚡</div>
        <div>
          <h2 className="text-2xl font-bold text-text">Electrical4U Hub</h2>
          <p className="text-sm text-muted">Curated Electrical4U topics for exam preparation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {elec4uTopics.map(t => (
          <a
            key={t.url}
            href={t.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pdf-page p-4 hover:shadow-page-lg transition-all duration-200 group border border-gray-200 bg-white block"
          >
            <h3 className="text-primary font-semibold text-sm mb-1 group-hover:underline">{t.label}</h3>
            <p className="text-muted text-xs">{t.desc}</p>
          </a>
        ))}
      </div>

      <div className="pdf-page p-4 border border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-text">Live Preview</h3>
          <a
            href="https://www.electrical4u.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-primary text-white rounded-md text-sm hover:bg-blue-700 transition shadow-sm"
          >
            Open in new tab
          </a>
        </div>
        {previewError ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-muted border border-dashed border-gray-300">
            <p>Preview blocked by the website.</p>
            <p className="text-sm mt-1">Use the “Open in new tab” button above.</p>
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
            <iframe
              src="https://www.electrical4u.com"
              onError={() => setPreviewError(true)}
              className="w-full h-96 border-0"
              loading="lazy"
              title="Electrical4U Preview"
            />
          </div>
        )}
      </div>
    </section>
  );
}

// ---------- PDF Viewer ----------
function PdfViewer({ pdf }) {
  const canvasRef = useRef(null);
  const [doc, setDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);

  useEffect(() => {
    if (!pdf) return;
    let cancelled = false;
    const load = async () => {
      const d = await pdfjsLib.getDocument(`/pdfs/${encodeURIComponent(pdf.name)}`).promise;
      if (cancelled) return;
      setDoc(d);
      setNumPages(d.numPages);
      setPageNum(1);
    };
    load();
    return () => { cancelled = true; setDoc(null); };
  }, [pdf]);

  useEffect(() => {
    if (!doc || !canvasRef.current) return;
    let cancelled = false;
    const render = async () => {
      const page = await doc.getPage(pageNum);
      if (cancelled) return;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
    };
    render();
    return () => { cancelled = true; };
  }, [doc, pageNum, scale]);

  if (!pdf) {
    return (
      <section className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📄</div>
        <h2 className="text-2xl font-bold text-text mb-2">PDF Viewer</h2>
        <p className="text-muted">No PDF selected. Go to Handouts and pick one.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600">📄</div>
          <div>
            <h2 className="text-xl font-bold text-text">{pdf.title}</h2>
            <p className="text-xs text-muted">{numPages > 0 && `Page ${pageNum} of ${numPages}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPageNum(p => Math.max(1, p - 1))} disabled={pageNum <= 1} className="px-3 py-1.5 bg-gray-100 text-text rounded-md text-sm hover:bg-gray-200 disabled:opacity-40 border border-gray-200">← Prev</button>
          <button onClick={() => setPageNum(p => Math.min(numPages, p + 1))} disabled={pageNum >= numPages} className="px-3 py-1.5 bg-gray-100 text-text rounded-md text-sm hover:bg-gray-200 disabled:opacity-40 border border-gray-200">Next →</button>
          <div className="h-6 w-px bg-gray-300 mx-1" />
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="px-3 py-1.5 bg-gray-100 text-text rounded-md text-sm hover:bg-gray-200 border border-gray-200">−</button>
          <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="px-3 py-1.5 bg-gray-100 text-text rounded-md text-sm hover:bg-gray-200 border border-gray-200">+</button>
          <span className="text-muted text-xs px-2">{Math.round(scale * 100)}%</span>
        </div>
      </div>
      <div className="overflow-auto bg-gray-100 rounded-xl border border-gray-200 p-4 flex justify-center" style={{ minHeight: '60vh' }}>
        <canvas ref={canvasRef} className="shadow-2xl bg-white" />
      </div>
    </section>
  );
}

// ---------- Placeholder components ----------
function Notes() {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('smc-notes')) || []; }
    catch { return []; }
  });
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('smc-notes', JSON.stringify(notes));
  }, [notes]);

  const filtered = notes.filter(n => {
    const q = search.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.toLowerCase().includes(q);
  });

  const startNew = () => { setEditingId('new'); setTitle(''); setContent(''); setTags(''); };
  const edit = (id) => { const n = notes.find(x => x.id === id); if (!n) return; setEditingId(id); setTitle(n.title); setContent(n.content); setTags(n.tags); };
  const cancel = () => { setEditingId(null); };
  const save = () => {
    if (!title.trim()) return;
    if (editingId === 'new') {
      setNotes(prev => [{ id: Date.now(), title, content, tags, date: new Date().toLocaleDateString() }, ...prev]);
    } else {
      setNotes(prev => prev.map(n => n.id === editingId ? { ...n, title, content, tags } : n));
    }
    setEditingId(null);
  };
  const del = (id) => { setNotes(prev => prev.filter(n => n.id !== id)); };

  if (editingId !== null) {
    return (
      <section>
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">📝</div>
          <h2 className="text-2xl font-bold text-text">{editingId === 'new' ? 'New Note' : 'Edit Note'}</h2>
        </div>
        <input className="w-full mb-3 p-3 rounded-lg bg-gray-50 text-text border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input className="w-full mb-3 p-3 rounded-lg bg-gray-50 text-text border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
        <textarea className="w-full h-48 mb-3 p-3 rounded-lg bg-gray-50 text-text border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-y" placeholder="Write your note here..." value={content} onChange={e => setContent(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={save} className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium">Save</button>
          <button onClick={cancel} className="px-5 py-2 bg-gray-100 text-text rounded-lg hover:bg-gray-200 transition border border-gray-200 font-medium">Cancel</button>
          {editingId !== 'new' && <button onClick={() => del(editingId)} className="px-5 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition border border-red-200 font-medium">Delete</button>}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between mb-4 pb-3 border-b border-gray-200 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">📝</div>
          <h2 className="text-2xl font-bold text-text">Notes</h2>
        </div>
        <button onClick={startNew} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium text-sm">+ New Note</button>
      </div>
      <input className="w-full mb-4 p-3 rounded-lg bg-gray-50 text-text border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
      {filtered.length === 0 && <p className="text-muted text-center py-8">No notes found.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(n => (
          <div key={n.id} onClick={() => edit(n.id)}             className="pdf-page p-4 cursor-pointer hover:shadow-page-lg transition-all duration-200 border border-gray-200 bg-white group">
            <h3 className="text-text font-semibold text-sm truncate group-hover:text-primary transition">{n.title || 'Untitled'}</h3>
            <p className="text-muted text-sm mt-1 line-clamp-2">{n.content}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-muted text-xs">{n.date}</span>
              {n.tags && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">{n.tags}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
