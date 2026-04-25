import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, X } from 'lucide-react';
import { ContinentTopArtist, getContinentTopArtists } from '../data/continentTopArtists';
import { getContinentBubble } from '../data/continentBubbles';

export default function ContinentDetails() {
  const { continentName } = useParams<{ continentName: string }>();
  const navigate = useNavigate();
  const [selectedArtist, setSelectedArtist] = useState<ContinentTopArtist | null>(null);

  const decodedContinentName = decodeURIComponent(continentName || 'Unknown');
  const topArtists = useMemo(() => getContinentTopArtists(decodedContinentName), [decodedContinentName]);
  const artistBubble = useMemo(() => getContinentBubble(decodedContinentName, 'Artist'), [decodedContinentName]);
  const artworkBubble = useMemo(() => getContinentBubble(decodedContinentName, 'Artwork'), [decodedContinentName]);
  const totalWorks = useMemo(() => topArtists.reduce((sum, artist) => sum + artist.count, 0), [topArtists]);

  useEffect(() => {
    setSelectedArtist(null);
  }, [decodedContinentName]);

  return (
    <div className="relative h-screen w-full bg-[#EAE5D9] text-[#3A352D] font-sans overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => navigate('/distribution')}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-[#F4EFE6]/70 backdrop-blur-md border border-[#D3CDBF]/50 rounded-full text-[#3A352D] hover:bg-[#EAE5D9] transition-colors shadow-sm"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back to Distribution</span>
        </button>
        <h1 className="font-serif text-3xl font-bold text-[#3A352D] drop-shadow-sm">
          {decodedContinentName}
        </h1>
        <div className="w-[150px]" />
      </div>

      <div className="flex-1 flex w-full h-full pt-24 pb-6 px-6 gap-6 z-10">
        <div className="w-[30%] grid grid-cols-2 grid-rows-2 gap-4 h-full">
          <SummaryCard label="Top Artist Works" value={totalWorks.toLocaleString()} detail="Works represented by the continent's listed artists" tone="warm" />
          <SummaryCard label="Artists Listed" value={topArtists.length.toString()} detail="Ranked by artwork count in the dataset" tone="cool" />
          <BubbleCard label="Artist Bubble" imageUrl={artistBubble?.imageUrl} />
          <BubbleCard label="Artwork Bubble" imageUrl={artworkBubble?.imageUrl} />
        </div>

        <div className="flex-1 relative rounded-xl overflow-hidden border border-[#D3CDBF]/30 bg-[#EAE5D9] shadow-inner p-2">
          {selectedArtist ? (
            <div className="w-full h-full bg-[#F4EFE6]/95 backdrop-blur-xl rounded-lg p-6 flex flex-col gap-4 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar relative">
              <button
                onClick={() => setSelectedArtist(null)}
                className="absolute top-4 right-4 text-[#8C857B] hover:text-[#3A352D] transition-colors z-10"
                aria-label="Close artist details"
              >
                <X size={20} />
              </button>

              <div className="flex gap-6 shrink-0 pr-10">
                <div className="w-32 h-40 shrink-0 rounded-lg overflow-hidden border-4 border-[#EAE5D9] shadow-md bg-[#D3CDBF]/30 flex items-center justify-center">
                  {selectedArtist.photoUrl ? (
                    <img
                      src={selectedArtist.photoUrl}
                      alt={selectedArtist.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="px-3 text-center text-sm text-[#8C857B]">No portrait</span>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="font-serif text-2xl font-bold text-[#3A352D] mb-2">{selectedArtist.name}</h2>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-[#D3CDBF]/40 rounded-full text-xs font-medium text-[#5C554A]">
                      {selectedArtist.nationality}
                    </span>
                    <span className="px-3 py-1 bg-[#D3CDBF]/40 rounded-full text-xs font-medium text-[#5C554A]">
                      {selectedArtist.count.toLocaleString()} Artworks
                    </span>
                    <span className="px-3 py-1 bg-[#D3CDBF]/40 rounded-full text-xs font-medium text-[#5C554A]">
                      Rank #{selectedArtist.rank}
                    </span>
                  </div>
                  <p className="text-[#5C554A] text-sm leading-relaxed">
                    {selectedArtist.description}
                  </p>
                </div>
              </div>

              <div className="w-full flex-1 min-h-[240px] rounded-xl overflow-hidden border border-[#D3CDBF]/50 mt-2 relative">
                {selectedArtist.plotUrl ? (
                  <img
                    src={selectedArtist.plotUrl}
                    alt={`${selectedArtist.name} creative timeline`}
                    className="absolute inset-0 w-full h-full object-contain p-4"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#8C857B]">No creative timeline available</div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-full rounded-lg bg-[#F4EFE6]/80 p-8 flex flex-col justify-center">
              <p className="text-sm uppercase tracking-widest text-[#8C857B] mb-3">Continent Profile</p>
              <h2 className="font-serif text-5xl font-bold text-[#3A352D] mb-6">{decodedContinentName}</h2>
              {topArtists.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 max-w-3xl">
                  {topArtists.slice(0, 6).map(artist => (
                    <button
                      key={artist.id}
                      onClick={() => setSelectedArtist(artist)}
                      className="text-left bg-[#EAE5D9]/70 border border-[#D3CDBF]/60 rounded-lg p-4 hover:bg-[#EAE5D9] transition-colors"
                    >
                      <div className="text-xs font-mono text-[#8C857B]">#{artist.rank}</div>
                      <div className="font-serif font-bold text-[#3A352D] truncate">{artist.name}</div>
                      <div className="text-sm text-[#8C857B]">{artist.count.toLocaleString()} artworks</div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="max-w-xl text-[#5C554A] leading-relaxed">
                  No top artist data is available for this continent in the current dataset.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="w-[30%] bg-[#F4EFE6]/70 backdrop-blur-md border border-[#D3CDBF]/50 rounded-xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex flex-col">
          <h3 className="font-serif font-bold text-lg text-[#3A352D] border-b border-[#D3CDBF]/50 pb-2 mb-6">Top 10 Artists</h3>
          <div className="flex-1 w-full min-h-[300px]">
            {topArtists.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topArtists}
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
                    width={92}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(211, 205, 191, 0.4)' }}
                    contentStyle={{ backgroundColor: '#F4EFE6', border: '1px solid #D3CDBF', borderRadius: '8px', color: '#3A352D' }}
                    formatter={(value) => [Number(value).toLocaleString(), 'Artworks']}
                  />
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    onClick={(data) => setSelectedArtist(data)}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  >
                    {topArtists.map((entry) => (
                      <Cell key={entry.id} fill={selectedArtist?.id === entry.id ? '#D95C3A' : '#4A6D7C'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-sm text-[#8C857B] px-6">
                No top artist data is available for this continent.
              </div>
            )}
          </div>
          <p className="text-xs text-center text-[#8C857B] mt-4 italic">Click on a bar to view artist details</p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: 'warm' | 'cool' | 'dark' }) {
  const valueColor = tone === 'warm' ? 'text-[#D95C3A]' : tone === 'cool' ? 'text-[#4A6D7C]' : 'text-[#3A352D]';

  return (
    <div className="bg-[#F4EFE6]/70 backdrop-blur-md border border-[#D3CDBF]/50 rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex flex-col justify-center">
      <h3 className="font-serif font-bold text-sm text-[#3A352D] border-b border-[#D3CDBF]/50 pb-2 mb-3">{label}</h3>
      <div className={`text-3xl font-serif font-bold ${valueColor}`}>{value}</div>
      <p className="text-xs text-[#8C857B] mt-2 leading-relaxed">{detail}</p>
    </div>
  );
}

function BubbleCard({ label, imageUrl }: { label: string; imageUrl?: string }) {
  return (
    <div className="bg-[#F4EFE6]/70 backdrop-blur-md border border-[#D3CDBF]/50 rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex flex-col min-h-0">
      <h3 className="font-serif font-bold text-sm text-[#3A352D] border-b border-[#D3CDBF]/50 pb-2 mb-3">{label}</h3>
      <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-[#D3CDBF]/40 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="w-[130%] h-[130%] max-w-none object-contain"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="px-4 text-center text-sm text-[#8C857B]">No bubble chart available</span>
        )}
      </div>
    </div>
  );
}
