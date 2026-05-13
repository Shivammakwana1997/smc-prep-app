import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Search, PlayCircle, X, ExternalLink, Library } from 'lucide-react';

// ---------- Video Data (organized per syllabus) ----------
const videoCategories = [
  {
    title: 'Basic Electrical Engineering',
    icon: '⚡',
    videos: [
      { id: 'O2KBzfdljWs', title: 'Basic Electrical Series', source: 'youtube', duration: 'Playlist' }
    ]
  },
  {
    title: 'Question Bank / Practice',
    icon: '📝',
    videos: [
      { id: 'nkvUhRMJDr4', title: 'Question Bank Analysis', source: 'youtube', duration: 'Full Session' }
    ]
  },
  {
    title: 'Electrical Machines',
    icon: '⚙️',
    videos: [
      { id: 'Ma9Bf1Ma7ZE', title: 'Electrical Machines Masterclass', source: 'youtube', duration: 'Deep Dive' }
    ]
  },
  {
    title: 'Power Systems',
    icon: '🔌',
    videos: [
      { id: 'GMQseU_PoK4', title: 'Power Systems Complete Revision', source: 'youtube', duration: 'Revision' }
    ]
  },
  {
    title: 'Control Systems',
    icon: '🎛️',
    videos: [
      { id: 'dBbfMK5elcM', title: 'Control Systems (Part 1)', source: 'youtube', duration: 'Part 1' },
      { id: 'o8-Nq6g3ME4', title: 'Control Systems (Part 2)', source: 'youtube', duration: 'Part 2' }
    ]
  },
  {
    title: 'Switch Gear & Protection',
    icon: '🛡️',
    videos: [
      { id: 'pTgZxYOwc5Q', title: 'Switchgear & Protection Basics', source: 'youtube', duration: 'Foundations' }
    ]
  },
  {
    title: 'Electrical Measurements',
    icon: '📏',
    videos: [
      { id: '_I-g0CFmXKg', title: 'Measurements & Instrumentation', source: 'youtube', duration: 'Full Module' }
    ]
  },
  {
    title: 'Digital Electronics & Microprocessors',
    icon: '💻',
    videos: [
      { id: 'Zq6H9qC1cfE', title: 'Digital Electronics Crash Course', source: 'youtube', duration: 'Crash Course' },
      { id: 'PLfAyhgJ1kc', title: 'Microprocessor Architecture', source: 'youtube', duration: 'Architecture' }
    ]
  },
  {
    title: 'Energy & Laws',
    icon: '⚖️',
    videos: [
      { id: 'FteX0Iz6O_Q', title: 'Electricity Act 2003 & Laws', source: 'youtube', duration: 'Legal Framework' }
    ]
  },
  {
    title: 'Pump Motors',
    icon: '💧',
    videos: [] // No video provided yet
  }
];

function getThumb(id) {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function VideoWorkspace() {
  const [activeVideo, setActiveVideo] = useState(null);
  const [search, setSearch] = useState('');

  // Flatten all videos for search
  const allVideos = videoCategories.flatMap(cat =>
    cat.videos.map(v => ({ ...v, category: cat.title, icon: cat.icon }))
  );

  const filteredCategories = search
    ? [{ title: 'Search Results', icon: '🔍', videos: allVideos.filter(v => v.title.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase())) }]
    : videoCategories;

  return (
    <motion.section variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6 pb-10">
      
      {/* Header */}
      <motion.div variants={item} className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-darker">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 shadow-sm">
            <Video size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text">Video Learning Workspace</h2>
            <p className="text-muted text-sm mt-1">Curated video lectures and crash courses for SMC preparation.</p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18}/>
           <input
             className="input-field pl-10 bg-white"
             placeholder="Search by topic or title..."
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </div>
      </motion.div>

      {/* Active Video Player */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="dash-card overflow-hidden border-2 border-primary/50 shadow-2xl"
          >
            <div className="bg-dark text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <PlayCircle size={18}/>
                </div>
                <div>
                   <h3 className="text-sm font-bold text-white">{activeVideo.title}</h3>
                   <p className="text-xs text-gray-400">{activeVideo.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={`https://www.youtube.com/watch?v=${activeVideo.id}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-white transition-colors tooltip-trigger" title="Open in YouTube">
                   <ExternalLink size={18}/>
                </a>
                <button onClick={() => setActiveVideo(null)} className="p-2 text-gray-400 hover:text-red-400 transition-colors bg-white/10 rounded-lg hover:bg-white/20">
                  <X size={18}/>
                </button>
              </div>
            </div>
            <div className="aspect-video w-full bg-black relative">
              {/* Using a key on iframe forces a full re-render when video changes */}
              <iframe
                key={activeVideo.id}
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={activeVideo.title}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Categories Grid */}
      <motion.div variants={item} className="space-y-8 mt-8">
        {filteredCategories.map(cat => (
          <div key={cat.title} className="relative">
            
            <div className="flex items-center gap-3 mb-4">
               <span className="text-2xl">{cat.icon || '📚'}</span>
               <h3 className="text-xl font-bold text-text">{cat.title}</h3>
               <div className="h-px bg-darker flex-1 ml-4 hidden sm:block"></div>
               <span className="text-xs font-bold text-muted uppercase tracking-wider bg-secondary px-2 py-1 rounded-full border border-darker hidden sm:block">
                 {cat.videos.length} Videos
               </span>
            </div>

            {cat.videos.length === 0 ? (
              <div className="dash-card border-dashed border-2 bg-transparent p-8 text-center flex flex-col items-center justify-center text-muted opacity-60">
                 <Library size={32} className="mb-2"/>
                 <p className="font-medium text-sm">Content coming soon for this module.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cat.videos.map((v, i) => (
                  <motion.button
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={v.id}
                    onClick={() => {
                      // Scroll to top when playing a new video
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setActiveVideo(v);
                    }}
                    className="dash-card group text-left flex flex-col overflow-hidden border-2 border-transparent hover:border-primary/50 relative"
                  >
                    <div className="relative aspect-video overflow-hidden bg-darker">
                      <img 
                        src={getThumb(v.id)} 
                        alt={v.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        loading={i > 4 ? "lazy" : "eager"}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                         <div className="w-12 h-12 bg-primary/90 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm scale-75 group-hover:scale-100 transition-transform">
                            <PlayCircle size={24} className="ml-1"/>
                         </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">
                        {v.duration}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                      <h4 className="text-text text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{v.title}</h4>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                           <PlayCircle size={10}/>
                        </span>
                        <p className="text-muted text-xs truncate">{v.category || cat.title}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        ))}
      </motion.div>

    </motion.section>
  );
}