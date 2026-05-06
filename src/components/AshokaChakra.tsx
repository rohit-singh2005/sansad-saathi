import React from 'react';

const AshokaChakra: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full animate-spin-slow text-chakra-blue"
        fill="currentColor"
      >
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        
        {/* Generate 24 spokes */}
        {[...Array(24)].map((_, i) => (
          <line
            key={i}
            x1="50"
            y1="50"
            x2="50"
            y2="2"
            stroke="currentColor"
            strokeWidth="1.2"
            transform={`rotate(${i * 15} 50 50)`}
          />
        ))}
        
        {/* Outer dots for each spoke */}
        {[...Array(24)].map((_, i) => (
          <circle
            key={`dot-${i}`}
            cx="50"
            cy="2"
            r="1"
            fill="currentColor"
            transform={`rotate(${i * 15} 50 50)`}
          />
        ))}
      </svg>
    </div>
  );
};

export default AshokaChakra;
