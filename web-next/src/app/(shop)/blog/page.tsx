'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BlogHub() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Protocol-aware image resolution node
  // Ultra-resilient image resolution protocol
  const getImageUrl = (image: string) => {
    if (!image) return 'http://127.0.0.1:3000/img/placeholder.jpg';
    if (image.startsWith('http')) return image;
    
    // Cleanse structural redundancies
    let cleanPath = image;
    if (image.includes('img/blog')) {
       // if it already has the path, just ensure a leading slash
       cleanPath = image.startsWith('/') ? image : `/${image}`;
    } else {
       // if it's a raw filename, prepend the blog path
       cleanPath = `/img/blog/${image}`;
    }

    // Handle user-uploaded assets via admin terminal
    if (image.startsWith('/uploads')) {
        cleanPath = image;
    }

    return `http://127.0.0.1:3000${cleanPath}`;
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('http://127.0.0.1:3000/api/v1/blogs');
        const data = await res.json();
        if (data.success) {
          setBlogs(data.data);
        }
      } catch (err) {
        console.error('Core sync failed');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-teal-600 font-bold">Initializing Stream...</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Space */}
      <div className="py-24 bg-teal-50 border-b border-teal-100">
          <div className="max-w-6xl mx-auto px-8">
              <h1 className="text-6xl font-black text-teal-950 tracking-tighter mb-4">EcomSphere <span className="text-teal-600 italic">Journal</span></h1>
              <p className="text-teal-800/60 font-bold uppercase tracking-widest text-xs">Stories, Trends & Insights from the Digital Frontier</p>
          </div>
      </div>

      <main className="max-w-6xl mx-auto px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {blogs.map((b, idx) => (
                  <article key={idx} className="group">
                      <div className="aspect-[16/10] bg-gray-100 rounded-[2.5rem] overflow-hidden mb-8 shadow-sm group-hover:shadow-xl transition-all duration-500">
                           <img 
                            src={getImageUrl(b.image)} 
                            alt="Story Cover" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          />
                      </div>
                      <div className="px-2">
                          <time className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-4 block">{new Date(b.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                          <h2 className="text-3xl font-black text-teal-950 leading-tight mb-4 group-hover:text-teal-600 transition-colors">{b.title}</h2>
                          <p className="text-gray-500 font-medium leading-relaxed line-clamp-3 mb-8">{b.content.replace(/<[^>]*>/g, '')}</p>
                          <Link 
                            href={`/blog/${b._id}`} 
                            className="inline-flex items-center gap-2 font-black text-teal-950 uppercase tracking-widest text-[10px] hover:gap-4 transition-all"
                          >
                            Read Full Story <span>&rarr;</span>
                          </Link>
                      </div>
                  </article>
              ))}
          </div>
      </main>
    </div>
  );
}
