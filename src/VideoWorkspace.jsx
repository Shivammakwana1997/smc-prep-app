import { useState } from 'react';

// ---------- Video Data (organized per syllabus) ----------
const videoCategories = [
  {
    title: 'Basic Electrical Engineering',
    videos: [
      { id: 'O2KBzfdljWs', title: 'Basic Electrical Series', source: 'youtube' }
    ]
  },
  {
    title: 'Question Bank / Practice',
    videos: [
      { id: 'nkvUhRMJDr4', title: 'Question Bank', source: 'youtube' }
    ]
  },
  {
    title: 'Electrical Machines',
    videos: [
      { id: 'Ma9Bf1Ma7ZE', title: 'Electrical Machines', source: 'youtube' }
    ]
  },
  {
    title: 'Power Systems',
    videos: [
      { id: 'GMQseU_PoK4', title: 'Power Systems', source: 'youtube' }
    ]
  },
  {
    title: 'Control Systems',
    videos: [
      { id: 'dBbfMK5elcM', title: 'Control Systems (Part 1)', source: 'youtube' },
      { id: 'o8-Nq6g3ME4', title: 'Control Systems (Part 2)', source: 'youtube' }
    ]
  },
  {
    title: 'Switch Gear & Protection',
    videos: [
      { id: 'pTgZxYOwc5Q', title: 'Switchgear & Protection', source: 'youtube' }
    ]
  },
  {
    title: 'Electrical Measurements & Instrumentation',
    videos: [
      { id: '_I-g0CFmXKg', title: 'Electrical Measurements', source: 'youtube' }
    ]
  },
  {
    title: 'Digital Electronics & Microprocessors',
    videos: [
      { id: 'Zq6H9qC1cfE', title: 'Digital Electronics', source: 'youtube' },
      { id: 'PLfAyhgJ1kc', title: 'Microprocessor', source: 'youtube' }
    ]
  },
  {
    title: 'Energy & Laws',
    videos: [
      { id: 'FteX0Iz6O_Q', title: 'Electrical Laws / Electricity Act 2003', source: 'youtube' }
    ]
  },
  {
    title: 'Pump Motors',
    videos: [] // No video provided yet
  }
];

// Get YouTube thumbnail from video ID
function getThumb(id) {
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

export default function VideoWorkspace() {
  const [activeVideo, setActiveVideo] = useState(null);
  const [search, setSearch] = useState('');

  // Flatten all videos for search
  const allVideos = videoCategories.flatMap(cat =>
    cat.videos.map(v => ({ ...v, category: cat.title }))
  );

  const filteredCategories = search
    ? [{ title: 'Search Results', videos: allVideos.filter(v => v.title.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase())) }]
    : videoCategories;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
        <h2 className="text-2xl font-semibold text-accent">Video Learning Workspace</h2>
        <input
          className="p-2 rounded bg-darker text-text border border-gray-300 focus:outline-none focus:border-secondary w-full sm:w-64"
          placeholder="Search videos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {activeVideo && (
        <div className="mb-4 bg-card rounded p-2 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-accent">{activeVideo.title}</h3>
            <button onClick={() => setActiveVideo(null)} className="px-3 py-1 bg-darker text-muted rounded text-sm">Close</button>
          </div>
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo.id}?rel=0`}
              className="w-full h-full rounded"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={activeVideo.title}
            />
          </div>
        </div>
      )}

      {filteredCategories.map(cat => (
        <div key={cat.title} className="mb-6">
          <h3 className="text-xl font-semibold text-accent mb-2">{cat.title}</h3>
          {cat.videos.length === 0 ? (
            <p className="text-muted text-sm">No videos yet for this topic.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {cat.videos.map(v => (
                <button
                  key={v.id}
                  onClick={() => setActiveVideo(v)}
                  className="flex-shrink-0 w-64 bg-card rounded overflow-hidden text-left hover:bg-darker transition border border-gray-200 shadow-sm hover:border-secondary"
                >
                  <img src={getThumb(v.id)} alt={v.title} className="w-full h-36 object-cover" />
                  <div className="p-2">
                    <h4 className="text-accent text-sm font-medium truncate">{v.title}</h4>
                    <p className="text-muted text-xs">{cat.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
