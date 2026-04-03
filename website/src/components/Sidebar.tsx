import React, { useState } from 'react';
import { Search, ChevronLeft } from 'lucide-react';
import { artworks, artists, getCountriesStats, getArtistCountriesStats, type Artwork, type Artist } from '../data/mockData';
import { ViewMode } from '../App';

interface SidebarProps {
  selectedCountry: string | null;
  onSelectCountry: (country: string | null) => void;
  mode: ViewMode;
  selectedDecade: number | null;
}

export default function Sidebar({ selectedCountry, onSelectCountry, mode, selectedDecade }: SidebarProps) {
  const [search, setSearch] = useState('');
  type DisplayItem = Artwork | Artist;
  
  const stats = mode === 'artworks' ? getCountriesStats(selectedDecade) : getArtistCountriesStats(selectedDecade);
  const filteredStats = stats.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  
  let displayItems: DisplayItem[] = selectedCountry 
    ? (mode === 'artworks' ? artworks.filter(a => a.country === selectedCountry) : artists.filter(a => a.country === selectedCountry))
    : (mode === 'artworks' ? artworks.slice(0, 20) : artists.slice(0, 20));

  if (selectedDecade !== null) {
    displayItems = displayItems.filter(item => {
      const itemDecade = Math.floor(parseInt(item.date) / 10) * 10;
      return itemDecade === selectedDecade;
    });
  }

  return (
    <div className="absolute left-0 top-[61px] bottom-0 w-80 bg-[#EAE5D9]/50 backdrop-blur-md border-r border-[#D3CDBF]/50 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-20">
      {/* Search Bar */}
      <div className="p-4 border-b border-[#D3CDBF]/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C857B]" />
          <input 
            type="text" 
            placeholder="Search country..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F4EFE6]/60 backdrop-blur-sm border border-[#D3CDBF]/50 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#8C857B] placeholder-[#8C857B]"
          />
        </div>
      </div>

      {/* Country List or Details */}
      {!selectedCountry ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 text-xs font-semibold text-[#8C857B] uppercase tracking-wider">Countries</div>
          <ul>
            {filteredStats.map(stat => (
              <li 
                key={stat.name}
                className="px-4 py-2 hover:bg-[#D3CDBF]/40 cursor-pointer flex justify-between items-center transition-colors"
                onClick={() => onSelectCountry(stat.name)}
              >
                <span className="text-[#3A352D] font-medium">{stat.name}</span>
                <span className="text-[#8C857B] text-sm">{stat.count}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#D3CDBF]/50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#3A352D]">{selectedCountry}</h2>
              <div className="flex gap-4 mt-2 text-sm text-[#8C857B]">
                <div>
                  <span className="font-bold text-[#3A352D] block">{displayItems.length}</span>
                  {mode === 'artworks' ? 'Artifacts' : 'Artists'}
                </div>
                {mode === 'artworks' && (
                  <div>
                    <span className="font-bold text-[#3A352D] block">1800-2023</span>
                    Date Range
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => onSelectCountry(null)}
              className="p-2 hover:bg-[#D3CDBF]/50 rounded-full transition-colors text-[#8C857B]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          
          {/* Image Grid */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-2 gap-2">
              {displayItems.map(item => (
                <div key={item.id} className="aspect-square bg-[#D3CDBF]/50 rounded overflow-hidden relative group cursor-pointer">
                  <img src={item.imageUrl} alt={'title' in item ? item.title : item.name} className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-white text-xs truncate">
                      {'title' in item ? item.title : item.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
