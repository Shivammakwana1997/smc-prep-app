import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
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
import SyllabusTracker from './SyllabusTracker';

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import { 
  LayoutDashboard, BookOpen, FileText, Video, PenTool, 
  BrainCircuit, Activity, Calendar, Target, Heart, Search, Menu, X, Lightbulb, Moon, Sun, Clock
} from 'lucide-react';

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
  const { user, login, logout } = useAuth();
  const [section, setSection] = useState('dashboard');
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [time, setTime] = useState(new Date());
  
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    try { return JSON.parse(localStorage.getItem('smc-theme-dark')) || false; }
    catch { return false; }
  });

  // Clock ticker
  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  // Theme applier
  useEffect(() => {
    localStorage.setItem('smc-theme-dark', JSON.stringify(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const navGroups = [
    {
      title: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'syllabus', label: 'Syllabus Map', icon: BookOpen },
        { id: 'analytics', label: 'Analytics', icon: Activity },
        { id: 'aiweakness', label: 'AI Tracker', icon: BrainCircuit },
      ]
    },
    {
      title: 'Study Material',
      items: [
        { id: 'handouts', label: 'Handouts', icon: BookOpen },
        { id: 'electrical4u', label: 'Electrical4U', icon: Search },
        { id: 'pdfviewer', label: 'PDF Viewer', icon: FileText },
        { id: 'video', label: 'Videos', icon: Video },
        { id: 'notes', label: 'Notes', icon: PenTool },
      ]
    },
    {
      title: 'Practice & Testing',
      items: [
        { id: 'formula', label: 'Formulas', icon: Lightbulb },
        { id: 'mocktest', label: 'Mock Test', icon: Target },
        { id: 'subjective', label: 'Subjective', icon: PenTool },
        { id: 'examhall', label: 'Exam Hall', icon: Target },
        { id: 'revision', label: 'Revision', icon: Activity },
      ]
    },
    {
      title: 'Planning & Mindset',
      items: [
        { id: 'planner', label: 'Planner', icon: Calendar },
        { id: 'strategy', label: 'Strategy', icon: Target },
        { id: 'mindset', label: 'Mindset', icon: Heart },
      ]
    }
  ];

  const handleSelectPdf = (pdf) => {
    setSelectedPdf(pdf);
    setSection('pdfviewer');
  };

  const renderSection = () => {
    switch (section) {
      case 'dashboard': return <Dashboard onNavigate={setSection} />;
      case 'syllabus': return <SyllabusTracker />;
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
    <div className="flex h-screen text-text font-sans overflow-hidden bg-transparent">
      
      {/* Animated Mesh Background */}
      <div className="mesh-bg">
        <div className="mesh-blob bg-blue-300 w-96 h-96 top-0 left-0"></div>
        <div className="mesh-blob bg-purple-300 w-96 h-96 top-1/2 left-1/4" style={{ animationDelay: '2s' }}></div>
        <div className="mesh-blob bg-pink-300 w-96 h-96 bottom-0 right-0" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Sidebar */}
      <aside className={`glass-sidebar w-64 flex-shrink-0 flex flex-col transition-transform duration-300 z-30 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full absolute h-full'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white font-bold text-sm shadow-sm">
              S
            </div>
            <span className="font-bold text-text truncate">SMC Prep</span>
          </div>
          <button className="md:hidden text-muted hover:text-text" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-3 text-xs font-semibold text-muted uppercase tracking-wider mb-2">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map(it => {
                  const Icon = it.icon;
                  return (
                    <button
                      key={it.id}
                      onClick={() => { setSection(it.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                      className={section === it.id ? 'sidebar-link-active' : 'sidebar-link'}
                    >
                      <Icon size={18} />
                      {it.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-white/50 dark:border-[#222222]">
          <div className="bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur text-blue-700 dark:text-blue-300 text-xs p-3 rounded-xl border border-blue-200/50 dark:border-blue-800/30 flex items-start gap-2 shadow-sm">
            <Target size={16} className="mt-0.5 flex-shrink-0" />
            <span>Target: Assistant Engineer (Electrical)</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!isSidebarOpen ? 'md:ml-0' : ''}`}>
        
        {/* Topbar */}
        <header className="h-16 glass-topbar flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20">
          <div className="flex items-center gap-4">
            <button 
              className="text-muted hover:text-text dark:text-gray-300 p-2 bg-white/50 dark:bg-black/40 rounded-lg backdrop-blur shadow-sm border border-white/50 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize truncate">
              {section === 'dashboard' ? 'Dashboard Overview' : navGroups.flatMap(g => g.items).find(i => i.id === section)?.label || section}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Clock & Date Widget */}
             <div className="hidden lg:flex items-center gap-3">
               <div className="flex items-center gap-2 bg-white dark:bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                 <Clock size={14} className="text-blue-500" />
                 <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
               </div>
               <div className="flex items-center gap-2 bg-white dark:bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                 <Calendar size={14} className="text-purple-500" />
                 <span className="font-bold text-gray-900 dark:text-white text-sm">{time.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
               </div>
             </div>

             <button
               onClick={() => setIsDark(!isDark)}
               className="p-2 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
               title="Toggle Theme"
             >
               {isDark ? <Sun size={18} /> : <Moon size={18} />}
             </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 z-10 relative">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

      </div>
    </div>
  );
}

// ---------- Handouts ----------
function Handouts({ onSelect }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-darker">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          <BookOpen size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text">Handouts</h2>
          <p className="text-sm text-muted">Click any card to open the PDF in the built-in viewer.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pdfs.map(p => (
          <button
            key={p.name}
            onClick={() => onSelect(p)}
            className="dash-card p-5 text-left group hover:border-primary/50"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-14 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center text-red-500 shrink-0 group-hover:bg-red-100 transition-colors">
                <FileText size={24} />
              </div>
              <div className="min-w-0 pt-1">
                <h3 className="text-text font-semibold text-[15px] leading-snug group-hover:text-primary transition-colors">{p.title}</h3>
                <p className="text-muted text-xs mt-1.5 truncate">{p.name}</p>
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
    <section className="space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-darker">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
          <Search size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text">Electrical4U Hub</h2>
          <p className="text-sm text-muted">Curated Electrical4U topics for exam preparation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {elec4uTopics.map(t => (
          <a
            key={t.url}
            href={t.url}
            target="_blank"
            rel="noopener noreferrer"
            className="dash-card p-5 group hover:border-primary/50 block"
          >
            <h3 className="text-primary font-semibold text-[15px] mb-1.5 group-hover:underline">{t.label}</h3>
            <p className="text-muted text-sm">{t.desc}</p>
          </a>
        ))}
      </div>

      <div className="dash-card">
        <div className="dash-card-header">
          <h3 className="text-lg font-semibold text-text">Live Preview</h3>
          <a
            href="https://www.electrical4u.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm py-1.5"
          >
            Open in new tab
          </a>
        </div>
        <div className="p-0 border-t border-darker">
          {previewError ? (
            <div className="bg-secondary p-8 text-center text-muted">
              <p>Preview blocked by the website.</p>
              <p className="text-sm mt-1">Use the “Open in new tab” button above.</p>
            </div>
          ) : (
            <iframe
              src="https://www.electrical4u.com"
              onError={() => setPreviewError(true)}
              className="w-full h-[500px] border-0 bg-white"
              loading="lazy"
              title="Electrical4U Preview"
            />
          )}
        </div>
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
      <section className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
          <FileText size={32} />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">PDF Viewer</h2>
        <p className="text-muted">No PDF selected. Go to Handouts and pick one.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="dash-card">
        <div className="dash-card-header flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text truncate max-w-sm md:max-w-md">{pdf.title}</h2>
              <p className="text-xs text-muted">{numPages > 0 && `Page ${pageNum} of ${numPages}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPageNum(p => Math.max(1, p - 1))} disabled={pageNum <= 1} className="btn-secondary text-sm py-1.5 px-3">Prev</button>
            <button onClick={() => setPageNum(p => Math.min(numPages, p + 1))} disabled={pageNum >= numPages} className="btn-secondary text-sm py-1.5 px-3">Next</button>
            <div className="h-6 w-px bg-darker mx-1" />
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="btn-secondary text-sm py-1.5 px-3">−</button>
            <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="btn-secondary text-sm py-1.5 px-3">+</button>
            <span className="text-muted text-sm font-medium px-2 min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
          </div>
        </div>
        <div className="bg-secondary/50 border-t border-darker p-4 md:p-6 flex justify-center min-h-[60vh] overflow-auto">
          <canvas ref={canvasRef} className="shadow-lg bg-white rounded" />
        </div>
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
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-darker">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
            <PenTool size={20} />
          </div>
          <h2 className="text-xl font-bold text-text">{editingId === 'new' ? 'New Note' : 'Edit Note'}</h2>
        </div>
        <div className="dash-card">
          <div className="dash-card-body space-y-4">
            <input className="input-field" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <input className="input-field" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
            <textarea className="input-field min-h-[200px] resize-y" placeholder="Write your note here..." value={content} onChange={e => setContent(e.target.value)} />
          </div>
          <div className="dash-card-header bg-secondary/30">
             <div className="flex gap-3">
              <button onClick={save} className="btn-primary">Save Note</button>
              <button onClick={cancel} className="btn-secondary">Cancel</button>
            </div>
            {editingId !== 'new' && <button onClick={() => del(editingId)} className="btn-danger">Delete</button>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-darker gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
            <PenTool size={20} />
          </div>
          <h2 className="text-xl font-bold text-text">Notes Workspace</h2>
        </div>
        <button onClick={startNew} className="btn-primary text-sm flex items-center gap-2">
           <PenTool size={16} /> New Note
        </button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input className="input-field pl-10" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-card rounded-xl border border-dashed border-darker">
          <PenTool className="mx-auto text-muted mb-3" size={32} />
          <p className="text-muted">No notes found.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(n => (
          <div key={n.id} onClick={() => edit(n.id)} className="dash-card p-5 cursor-pointer group hover:border-primary/50 flex flex-col">
            <h3 className="text-text font-semibold text-[15px] truncate group-hover:text-primary transition-colors">{n.title || 'Untitled'}</h3>
            <p className="text-muted text-sm mt-2 line-clamp-3 flex-1">{n.content}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-darker">
              <span className="text-muted text-xs font-medium">{n.date}</span>
              {n.tags && <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">{n.tags}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
