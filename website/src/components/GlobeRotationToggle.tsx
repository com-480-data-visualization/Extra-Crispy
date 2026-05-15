import React from 'react';

interface GlobeRotationToggleProps {
  autoRotate: boolean;
  onChange: (autoRotate: boolean) => void;
}

export default function GlobeRotationToggle({ autoRotate, onChange }: GlobeRotationToggleProps) {
  return (
    <div className="absolute right-8 bottom-24 z-30 bg-[#F4EFE6]/50 backdrop-blur-md border border-[#D3CDBF]/50 rounded-full p-1 flex shadow-[0_4px_12px_rgba(0,0,0,0.05)] w-fit">
      <button
        onClick={() => onChange(false)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          !autoRotate
            ? 'bg-[#3A352D] text-[#EAE5D9]'
            : 'text-[#8C857B] hover:text-[#3A352D]'
        }`}
      >
        Static
      </button>
      <button
        onClick={() => onChange(true)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          autoRotate
            ? 'bg-[#3A352D] text-[#EAE5D9]'
            : 'text-[#8C857B] hover:text-[#3A352D]'
        }`}
      >
        Auto Rotate
      </button>
    </div>
  );
}
