import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, X } from 'lucide-react';

// Mock data for the bar chart
const generateMockArtists = (countryName: string) => {
  return Array.from({ length: 10 }).map((_, i) => ({
    name: `Artist ${i + 1}`,
    count: Math.floor(Math.random() * 500) + 50,
    photo: `https://picsum.photos/seed/${countryName}-artist-${i}/150/150`,
    artwork: `https://picsum.photos/seed/${countryName}-art-${i}/300/200`,
    bio: `This is a brief introduction for Artist ${i + 1} from ${countryName}. They are known for their unique style and profound impact on the local art scene. Their works often explore themes of nature and society.`
  })).sort((a, b) => b.count - a.count);
};

export default function CountryDetails() {
  const { countryName } = useParams<{ countryName: string }>();
  const navigate = useNavigate();
  const [selectedArtist, setSelectedArtist] = useState<any | null>(null);

  const decodedCountryName = decodeURIComponent(countryName || 'Unknown');
  const mockArtists = useMemo(() => generateMockArtists(decodedCountryName), [decodedCountryName]);

  return (
    <div className="relative h-screen w-full bg-[#EAE5D9] text-[#3A352D] font-sans overflow-hidden flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex items-center justify-between pointer-events-none">
        <button 
          onClick={() => navigate('/distribution')}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-[#F4EFE6]/70 backdrop-blur-md border border-[#D3CDBF]/50 rounded-full text-[#3A352D] hover:bg-[#EAE5D9] transition-colors shadow-sm"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back to Distribution</span>
        </button>
        <h1 className="font-serif text-3xl font-bold text-[#3A352D] drop-shadow-sm">
          {decodedCountryName}
        </h1>
        <div className="w-[150px]"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex w-full h-full pt-24 pb-6 px-6 gap-6 z-10">
        
        {/* Left Column: Static Stats */}
        <div className="w-1/4 flex flex-col gap-6 h-full">
          <div className="bg-[#F4EFE6]/70 backdrop-blur-md border border-[#D3CDBF]/50 rounded-xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex-1 flex flex-col">
            <h3 className="font-serif font-bold text-lg text-[#3A352D] border-b border-[#D3CDBF]/50 pb-2 mb-4">Artwork Count</h3>
            <div className="flex-1 rounded-lg overflow-hidden relative bg-[#D3CDBF]/30 flex items-center justify-center">
              <img 
                src={`https://picsum.photos/seed/${decodedCountryName}-stats1/400/300`} 
                alt="Artwork Stats" 
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          
          <div className="bg-[#F4EFE6]/70 backdrop-blur-md border border-[#D3CDBF]/50 rounded-xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex-1 flex flex-col">
            <h3 className="font-serif font-bold text-lg text-[#3A352D] border-b border-[#D3CDBF]/50 pb-2 mb-4">Artist Count</h3>
            <div className="flex-1 rounded-lg overflow-hidden relative bg-[#D3CDBF]/30 flex items-center justify-center">
              <img 
                src={`https://picsum.photos/seed/${decodedCountryName}-stats2/400/300`} 
                alt="Artist Stats" 
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Center Column: Visualization / Artist Info */}
        <div className="flex-1 relative rounded-xl overflow-hidden border border-[#D3CDBF]/30 bg-[#EAE5D9] shadow-inner p-2">
          {selectedArtist ? (
            <div className="w-full h-full bg-[#F4EFE6]/95 backdrop-blur-xl rounded-lg p-6 flex flex-col gap-4 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar relative">
              <button 
                onClick={() => setSelectedArtist(null)}
                className="absolute top-4 right-4 text-[#8C857B] hover:text-[#3A352D] transition-colors z-10"
              >
                <X size={20} />
              </button>
              
              <div className="flex gap-6 shrink-0">
                {/* Top Left: Photo */}
                <div className="w-32 h-40 shrink-0 rounded-lg overflow-hidden border-4 border-[#EAE5D9] shadow-md">
                  <img 
                    src={selectedArtist.photo} 
                    alt={selectedArtist.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                {/* Top Right: Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="font-serif text-2xl font-bold text-[#3A352D] mb-2">{selectedArtist.name}</h2>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-[#D3CDBF]/40 rounded-full text-xs font-medium text-[#5C554A]">
                      {decodedCountryName}
                    </span>
                    <span className="px-3 py-1 bg-[#D3CDBF]/40 rounded-full text-xs font-medium text-[#5C554A]">
                      {selectedArtist.count} Artworks
                    </span>
                  </div>
                  <p className="text-[#5C554A] text-sm leading-relaxed">
                    {selectedArtist.bio}
                  </p>
                </div>
              </div>
              
              {/* Bottom: Artwork Image */}
              <div className="w-full flex-1 min-h-[200px] rounded-xl overflow-hidden border border-[#D3CDBF]/50 mt-2 relative">
                <img 
                  src={selectedArtist.artwork} 
                  alt={`${selectedArtist.name} artwork`} 
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-full rounded-lg overflow-hidden relative animate-in fade-in duration-300">
              <img 
                src={`https://picsum.photos/seed/${decodedCountryName}-landscape/800/800`} 
                alt={`${decodedCountryName} landscape`}
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3A352D]/80 via-transparent to-transparent flex items-end justify-center pb-10">
                <h2 className="text-5xl font-serif font-bold text-[#F4EFE6] drop-shadow-lg tracking-wide">{decodedCountryName}</h2>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Bar Chart */}
        <div className="w-1/3 bg-[#F4EFE6]/70 backdrop-blur-md border border-[#D3CDBF]/50 rounded-xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex flex-col">
          <h3 className="font-serif font-bold text-lg text-[#3A352D] border-b border-[#D3CDBF]/50 pb-2 mb-6">Top 10 Artists</h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockArtists}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8C857B', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(211, 205, 191, 0.4)' }}
                  contentStyle={{ backgroundColor: '#F4EFE6', border: '1px solid #D3CDBF', borderRadius: '8px', color: '#3A352D' }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[0, 4, 4, 0]}
                  onClick={(data) => setSelectedArtist(data)}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                >
                  {mockArtists.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={selectedArtist?.name === entry.name ? '#D95C3A' : '#4A6D7C'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-[#8C857B] mt-4 italic">Click on a bar to view artist details</p>
        </div>
      </div>
    </div>
  );
}
