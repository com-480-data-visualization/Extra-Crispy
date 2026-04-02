/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import NavigationBar from './components/NavigationBar';
import GlobeVisualization from './components/GlobeVisualization';
import TimelineBar from './components/TimelineBar';

export type ViewMode = 'artworks' | 'artists';

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>('artworks');
  const [selectedDecade, setSelectedDecade] = useState<number | null>(null);

  return (
    <div className="relative h-screen w-full bg-[#EAE5D9] text-[#3A352D] font-sans overflow-hidden">
      {/* 3D Globe Background */}
      <div className="absolute inset-0 cursor-move">
        <GlobeVisualization selectedCountry={selectedCountry} mode={mode} selectedDecade={selectedDecade} />
      </div>

      <NavigationBar />

      {/* Header */}
      <header className="absolute top-24 left-0 right-0 z-10 flex flex-col items-center pointer-events-none">
        <h1 className="text-2xl md:text-3xl font-serif tracking-wider font-bold">MoMA Collection</h1>
        <p className="text-sm mt-1 opacity-70">
          {mode === 'artworks' ? '4948 artifacts' : '150 artists'} · 99 countries
        </p>
        {selectedCountry && (
          <h2 className="text-4xl font-serif mt-2">{selectedCountry}</h2>
        )}
      </header>

      {/* Mode Toggle */}
      <div className="absolute top-24 right-8 z-20 bg-[#F4EFE6]/50 backdrop-blur-md border border-[#D3CDBF]/50 rounded-full p-1 flex shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setMode('artworks')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            mode === 'artworks' 
              ? 'bg-[#3A352D] text-[#EAE5D9]' 
              : 'text-[#8C857B] hover:text-[#3A352D]'
          }`}
        >
          Artworks
        </button>
        <button
          onClick={() => setMode('artists')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            mode === 'artists' 
              ? 'bg-[#3A352D] text-[#EAE5D9]' 
              : 'text-[#8C857B] hover:text-[#3A352D]'
          }`}
        >
          Artists
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar selectedCountry={selectedCountry} onSelectCountry={setSelectedCountry} mode={mode} selectedDecade={selectedDecade} />

      {/* Timeline Bar */}
      <TimelineBar selectedDecade={selectedDecade} onSelectDecade={setSelectedDecade} />
    </div>
  );
}
