import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function NavigationBar() {
  const location = useLocation();

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#F4EFE6]/70 backdrop-blur-md border-b border-[#D3CDBF]/50 shadow-sm">
      <div className="flex items-center gap-12">
        <span className="font-serif font-bold text-xl tracking-widest text-[#3A352D]">DIGITAL MoMA</span>
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-medium pb-1 transition-colors ${
              location.pathname === '/' 
                ? 'text-[#3A352D] border-b-2 border-[#3A352D]' 
                : 'text-[#8C857B] hover:text-[#3A352D]'
            }`}
          >
            Homepage
          </Link>
          <Link 
            to="/distribution" 
            className={`text-sm font-medium pb-1 transition-colors ${
              location.pathname === '/distribution' 
                ? 'text-[#3A352D] border-b-2 border-[#3A352D]' 
                : 'text-[#8C857B] hover:text-[#3A352D]'
            }`}
          >
            Distribution
          </Link>
          <Link 
            to="/artist-comparison" 
            className={`text-sm font-medium pb-1 transition-colors ${
              location.pathname === '/artist-comparison' 
                ? 'text-[#3A352D] border-b-2 border-[#3A352D]' 
                : 'text-[#8C857B] hover:text-[#3A352D]'
            }`}
          >
            Artist Comparison
          </Link>
          <Link 
            to="/epilogue" 
            className={`text-sm font-medium pb-1 transition-colors ${
              location.pathname === '/epilogue' 
                ? 'text-[#3A352D] border-b-2 border-[#3A352D]' 
                : 'text-[#8C857B] hover:text-[#3A352D]'
            }`}
          >
            Epilogue Story
          </Link>
        </div>
      </div>
    </nav>
  );
}
