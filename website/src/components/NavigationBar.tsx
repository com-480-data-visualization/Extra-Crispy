import React from 'react';

export default function NavigationBar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#F4EFE6]/70 backdrop-blur-md border-b border-[#D3CDBF]/50 shadow-sm">
      <div className="flex items-center gap-12">
        <span className="font-serif font-bold text-xl tracking-widest text-[#3A352D] uppercase">MoMA Visualized</span>
        <div className="flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-[#3A352D] border-b-2 border-[#3A352D] pb-1">Homepage</a>
          <a href="#" className="text-sm font-medium text-[#8C857B] hover:text-[#3A352D] transition-colors pb-1">Distribution</a>
          <a href="#" className="text-sm font-medium text-[#8C857B] hover:text-[#3A352D] transition-colors pb-1">Artist Comparison</a>
          <a href="#" className="text-sm font-medium text-[#8C857B] hover:text-[#3A352D] transition-colors pb-1">Epilogue Story</a>
        </div>
      </div>
    </nav>
  );
}
