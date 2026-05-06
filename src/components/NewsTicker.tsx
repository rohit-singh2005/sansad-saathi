import React from 'react';
import { useNews, type NewsItem } from '../hooks/useNews';
import { ExternalLink, Clock } from 'lucide-react';

const NewsTicker: React.FC = () => {
  const { data: news, isLoading, error } = useNews();

  if (isLoading) {
    return (
      <div className="w-full bg-slate-900 text-white py-2 overflow-hidden">
        <div className="animate-pulse flex space-x-4 px-4">
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error || !news || news.length === 0) return null;

  return (
    <div className="w-full bg-slate-900 text-white py-3 border-y border-white/10 relative overflow-hidden group z-50 pointer-events-auto">
      <div className="flex whitespace-nowrap animate-marquee group-hover:pause">
        {/* Render double for seamless loop */}
        {[...news, ...news].map((item: NewsItem, idx) => (
          <div 
            key={`${item.url}-${idx}`}
            className="flex items-center px-8 border-r border-white/20 last:border-r-0"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-saffron mr-3">
              {item.source.name}
            </span>
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium hover:text-saffron transition-colors flex items-center gap-2"
            >
              {item.title}
              <ExternalLink size={12} className="opacity-50" />
            </a>
            <div className="ml-4 flex items-center gap-1 text-[10px] text-white/40">
              <Clock size={10} />
              {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsTicker;
