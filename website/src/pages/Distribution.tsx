import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import GlobeVisualization from '../components/GlobeVisualization';
import GlobeRotationToggle from '../components/GlobeRotationToggle';
import TimelineBar from '../components/TimelineBar';
import { ViewMode } from '../App';
import {
  getAvailableDecades,
  getCountryDisplayName,
  getDistributionCategories,
  getDistributionTotal,
  getRegionCounts,
} from '../data/distributionData';

const getCategoryDisplayName = (name: string) => (
  name === '(not assigned)' ? 'Not Assigned' : name
);

export default function Distribution() {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>('artworks');
  const [borderMode, setBorderMode] = useState<'country' | 'continent'>('country');
  const [selectedDecade, setSelectedDecade] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [autoRotateGlobe, setAutoRotateGlobe] = useState(true);

  // Reset selected category when mode changes
  const handleModeChange = (newMode: ViewMode) => {
    setMode(newMode);
    setSelectedCategory(null);
    setSelectedDecade(decade => (
      decade !== null && getAvailableDecades(newMode).includes(decade) ? decade : null
    ));
  };

  const categoriesList = useMemo(() => getDistributionCategories(mode), [mode]);
  const totalCount = useMemo(() => getDistributionTotal(mode), [mode]);
  const availableDecades = useMemo(() => getAvailableDecades(mode), [mode]);

  const listData = useMemo(() => {
    return getRegionCounts({ mode, borderMode, selectedCategory, selectedDecade });
  }, [mode, borderMode, selectedCategory, selectedDecade]);

  return (
    <div className="relative h-screen w-full bg-[#EAE5D9] text-[#3A352D] font-sans overflow-hidden">
      {/* 3D Globe Background */}
      <div className="absolute inset-0 cursor-move">
        <GlobeVisualization 
          selectedCountry={selectedCountry} 
          mode={mode} 
          selectedDecade={selectedDecade} 
          hideImages={true} 
          borderMode={borderMode} 
          selectedCategory={selectedCategory} 
          showChoropleth={true} 
          showGraticules={false} 
          showBorders={true} 
          autoRotate={autoRotateGlobe}
        />
      </div>

      <NavigationBar />

      {/* Left Sidebar */}
      <div className="absolute top-24 left-8 z-20 flex flex-col gap-3">
        <div className="bg-[#F4EFE6]/50 backdrop-blur-md border border-[#D3CDBF]/50 rounded-full p-1 flex shadow-[0_4px_12px_rgba(0,0,0,0.05)] w-fit">
          <button
            onClick={() => handleModeChange('artworks')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mode === 'artworks' 
                ? 'bg-[#3A352D] text-[#EAE5D9]' 
                : 'text-[#8C857B] hover:text-[#3A352D]'
            }`}
          >
            Artworks
          </button>
          <button
            onClick={() => handleModeChange('artists')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mode === 'artists' 
                ? 'bg-[#3A352D] text-[#EAE5D9]' 
                : 'text-[#8C857B] hover:text-[#3A352D]'
            }`}
          >
            Artists
          </button>
        </div>

        <div className="w-64 bg-[#F4EFE6]/70 backdrop-blur-md border border-[#D3CDBF]/50 rounded-xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex flex-col gap-4">
          <h2 className="font-serif font-bold text-lg text-[#3A352D] border-b border-[#D3CDBF]/50 pb-2">
            {mode === 'artworks' ? 'Categories' : 'Gender'}
          </h2>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
            <label className="flex items-center justify-between cursor-pointer group mb-1">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={selectedCategory === null}
                  onChange={() => setSelectedCategory(null)}
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategory === null ? 'border-transparent' : 'border-[#8C857B] group-hover:border-[#3A352D]'}`} style={{ backgroundColor: selectedCategory === null ? '#3A352D' : 'transparent' }}>
                  {selectedCategory === null && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className={`text-sm font-medium transition-colors ${selectedCategory === null ? 'text-[#3A352D]' : 'text-[#8C857B] group-hover:text-[#3A352D]'}`}>
                  {mode === 'artworks' ? 'All Classifications' : 'All Genders'}
                </span>
              </div>
              <span className="text-xs font-mono text-[#8C857B]">
                {totalCount.toLocaleString()}
              </span>
            </label>
            
            {categoriesList.map(cat => (
              <label key={cat.name} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={selectedCategory === cat.name}
                    onChange={() => setSelectedCategory(cat.name)}
                  />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategory === cat.name ? 'border-transparent' : 'border-[#8C857B] group-hover:border-[#3A352D]'}`} style={{ backgroundColor: selectedCategory === cat.name ? cat.color : 'transparent' }}>
                    {selectedCategory === cat.name && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${selectedCategory === cat.name ? 'text-[#3A352D]' : 'text-[#8C857B] group-hover:text-[#3A352D]'}`}>
                    {getCategoryDisplayName(cat.name)}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#8C857B]">{cat.count.toLocaleString()}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="absolute top-24 right-8 z-20 flex flex-col gap-3 items-end">
        <div className="bg-[#F4EFE6]/50 backdrop-blur-md border border-[#D3CDBF]/50 rounded-full p-1 flex shadow-[0_4px_12px_rgba(0,0,0,0.05)] w-fit">
          <button
            onClick={() => setBorderMode('country')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              borderMode === 'country' 
                ? 'bg-[#3A352D] text-[#EAE5D9]' 
                : 'text-[#8C857B] hover:text-[#3A352D]'
            }`}
          >
            Country
          </button>
          <button
            onClick={() => setBorderMode('continent')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              borderMode === 'continent' 
                ? 'bg-[#3A352D] text-[#EAE5D9]' 
                : 'text-[#8C857B] hover:text-[#3A352D]'
            }`}
          >
            Continent
          </button>
        </div>

        {/* Distribution List */}
        <div className="w-64 bg-[#F4EFE6]/70 backdrop-blur-md border border-[#D3CDBF]/50 rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex flex-col gap-3 max-h-[50vh]">
          <div className="flex items-baseline justify-between gap-3 border-b border-[#D3CDBF]/50 pb-2 w-full">
            <h3 className="font-serif font-bold text-[#3A352D] text-left">
              {borderMode === 'country' ? 'Countries' : 'Continents'}
            </h3>
            <p className="text-[10px] leading-tight text-right text-[#8C857B] italic">
              {borderMode === 'country'
                ? 'Double-click to explore'
                : 'Double-click to explore'}
            </p>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar w-full">
            {listData.map((item, idx) => {
              const displayRegion = borderMode === 'country' ? getCountryDisplayName(item.region) : item.region;
              return (
                <div
                  key={item.region}
                  className={`flex items-center justify-between text-sm cursor-pointer hover:bg-[#D3CDBF]/30 p-1 -mx-1 rounded transition-colors`}
                  onDoubleClick={() => {
                    if (borderMode === 'country') {
                      navigate(`/country/${encodeURIComponent(displayRegion)}`);
                    } else if (borderMode === 'continent') {
                      navigate(`/continent/${encodeURIComponent(item.region)}`);
                    }
                  }}
                  title="Double click to view details"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#8C857B] font-mono text-xs w-4">{idx + 1}.</span>
                    <span className="font-medium text-[#3A352D]">{displayRegion}</span>
                  </div>
                  <span className="font-mono text-[#8C857B]">{item.count.toLocaleString()}</span>
                </div>
              );
            })}
            {listData.length === 0 && (
              <div className="text-sm text-[#8C857B] text-center py-4">No data available</div>
            )}
          </div>
        </div>
      </div>

      <GlobeRotationToggle autoRotate={autoRotateGlobe} onChange={setAutoRotateGlobe} />

      {/* Timeline Bar */}
      <TimelineBar selectedDecade={selectedDecade} onSelectDecade={setSelectedDecade} fullWidth={true} decades={availableDecades} />
    </div>
  );
}
