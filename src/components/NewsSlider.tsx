import React, { useState, useEffect } from 'react';
import { useNews } from '../hooks/useNews';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const NewsSlider: React.FC = () => {
  const { data: news, isLoading } = useNews();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!news || news.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [news]);

  if (isLoading) {
    return (
      <div className="w-full h-48 bg-slate-100 animate-pulse flex items-center justify-center">
        <span className="text-slate-400 font-medium">Loading Latest News...</span>
      </div>
    );
  }

  if (!news || news.length === 0) return null;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % news.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);

  const item = news[currentIndex];

  return (
    <div className="w-full bg-white py-12 border-b border-slate-100 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 relative">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-slate-900 font-tiro flex items-center gap-2">
            <span className="w-2 h-8 bg-saffron rounded-full"></span>
            Lok Sabha Live Updates
          </h3>
          <div className="flex gap-2">
            <button onClick={prevSlide} className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextSlide} className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10"
          >
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="aspect-video rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-slate-200 block group/img hover:shadow-xl transition-all cursor-pointer pointer-events-auto"
            >
              <img 
                src={item.urlToImage || 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?auto=format&fit=crop&q=80&w=1200'} 
                alt={item.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?auto=format&fit=crop&q=80&w=1200';
                }}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
              />
            </a>
            <div className="flex flex-col h-full justify-center">
              <span className="text-xs font-bold text-chakra-blue uppercase tracking-widest mb-3 block">
                {item.source.name} • {new Date(item.publishedAt).toLocaleDateString()}
              </span>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group/text"
              >
                <h4 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 leading-tight group-hover/text:text-chakra-blue transition-colors">
                  {item.title}
                </h4>
              </a>
              <p className="text-slate-600 mb-6 font-noto line-clamp-3">
                {item.description}
              </p>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-chakra-blue font-bold hover:underline cursor-pointer pointer-events-auto"
              >
                Read Full Coverage <ExternalLink size={16} />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-10">
          {news.slice(0, 5).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${currentIndex === idx ? 'w-6 bg-chakra-blue' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsSlider;
