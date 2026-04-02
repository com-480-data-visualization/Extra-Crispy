import React from 'react';

interface TimelineBarProps {
  selectedDecade: number | null;
  onSelectDecade: (decade: number | null) => void;
}

export default function TimelineBar({ selectedDecade, onSelectDecade }: TimelineBarProps) {
  const decades = Array.from({ length: 18 }, (_, i) => 1850 + i * 10);

  return (
    <div className="absolute bottom-0 left-80 right-0 z-20 bg-[#F4EFE6]/70 backdrop-blur-md border-t border-[#D3CDBF]/50 py-4 px-8 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <button
          onClick={() => onSelectDecade(null)}
          className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-colors ${
            selectedDecade === null
              ? 'bg-[#3A352D] text-[#EAE5D9]'
              : 'text-[#8C857B] hover:text-[#3A352D] hover:bg-[#D3CDBF]/30'
          }`}
        >
          All Time
        </button>
        
        <div className="flex-1 flex items-center justify-between ml-8 relative">
          {/* Timeline track */}
          <div className="absolute left-0 right-0 h-[2px] bg-[#D3CDBF] top-1/2 -translate-y-1/2 -z-10"></div>
          
          {decades.map(decade => {
            const isSelected = selectedDecade === decade;
            return (
              <div key={decade} className="flex flex-col items-center group relative">
                <button
                  onClick={() => onSelectDecade(isSelected ? null : decade)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    isSelected 
                      ? 'bg-[#D95C3A] scale-150 shadow-[0_0_8px_rgba(217,92,58,0.5)]' 
                      : 'bg-[#8C857B] group-hover:bg-[#3A352D] group-hover:scale-125'
                  }`}
                />
                <span 
                  className={`absolute top-4 text-xs font-mono transition-colors ${
                    isSelected ? 'text-[#D95C3A] font-bold' : 'text-[#8C857B] group-hover:text-[#3A352D]'
                  }`}
                >
                  {decade}s
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
