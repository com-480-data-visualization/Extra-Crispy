import React, { useState, useMemo, useRef, useEffect } from 'react';
import NavigationBar from '../components/NavigationBar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Plus, X, Search } from 'lucide-react';
// import artistComparisonCsv from '../../../data/Artist_Comparison.csv?raw';
import artistComparisonCsv from '../../../data/Artist_Comparison.csv?raw';


type ArtistComparisonRecord = {
  id: string;
  name: string;
  total: number;
  color: string;
  valueKey: string;
  periods: Record<string, number>;
};

type TimelinePoint = {
  period: string;
  year: string;
  [artistValueKey: string]: string | number;
};

const ARTIST_COLORS = [
  '#4285F4',
  '#EA4335',
  '#FBBC05',
  '#34A853',
  '#8E24AA',
  '#F6BF26',
  '#00ACC1',
  '#E91E63',
  '#FF5722',
  '#3F51B5',
  '#795548',
  '#00897B',
];

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
};

const parseArtistComparisonData = (csvText: string) => {
  const [headerLine, ...dataLines] = csvText.trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);
  const periodColumns = headers.filter(header => /^\d{4}-\d{4}$/.test(header));

  const artists = dataLines
    .filter(Boolean)
    .map((line, index) => {
      const values = parseCsvLine(line);
      const row = Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex] ?? '']));
      const id = row.ConstituentID;
      const periods = Object.fromEntries(
        periodColumns.map(period => [period, Number(row[period]) || 0])
      );

      return {
        id,
        name: row.Artist,
        total: Number(row.Total) || 0,
        color: ARTIST_COLORS[index % ARTIST_COLORS.length],
        valueKey: `artist_${id}`,
        periods,
      };
    })
    .filter((artist): artist is ArtistComparisonRecord => Boolean(artist.id && artist.name));

  const timelineData = periodColumns.map(period => {
    const dataPoint: TimelinePoint = {
      period,
      year: period.slice(0, 4),
    };

    artists.forEach(artist => {
      dataPoint[artist.valueKey] = artist.periods[period] ?? 0;
    });

    return dataPoint;
  });

  return { artists, timelineData };
};

const { artists: ARTISTS_DB, timelineData: TIMELINE_DATA } = parseArtistComparisonData(artistComparisonCsv);

const getDefaultArtists = () => {
  return [...ARTISTS_DB]
    .sort((a, b) => b.total - a.total)
    .slice(0, 2);
};

export default function ArtistComparison() {
  const [selectedArtists, setSelectedArtists] = useState<ArtistComparisonRecord[]>(getDefaultArtists);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddArtist = (artist: ArtistComparisonRecord) => {
    if (selectedArtists.length < 3 && !selectedArtists.find(a => a.id === artist.id)) {
      setSelectedArtists([...selectedArtists, artist]);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleRemoveArtist = (id: string) => {
    setSelectedArtists(selectedArtists.filter(a => a.id !== id));
  };

  const filteredArtists = ARTISTS_DB
    .filter(a =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedArtists.find(sa => sa.id === a.id)
    );

  const totalData = useMemo(() => {
    return selectedArtists.map(artist => ({
      name: artist.name,
      total: artist.total,
      color: artist.color,
    }));
  }, [selectedArtists]);

  return (
    <div className="min-h-screen w-full bg-[#EAE5D9] text-[#3A352D] font-sans flex flex-col">
      <NavigationBar />

      <div className="flex-1 flex flex-col pt-24 px-8 pb-8 max-w-[1600px] mx-auto w-full gap-6">
        <div className="flex items-center gap-4 bg-[#F4EFE6]/70 backdrop-blur-md border border-[#D3CDBF]/50 rounded-2xl p-4 shadow-sm relative z-20">
          {selectedArtists.map(artist => (
            <div
              key={artist.id}
              className="flex items-center gap-3 bg-white/60 border border-[#D3CDBF] rounded-xl px-4 py-2 shadow-sm"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: artist.color }}></div>
              <span className="font-medium text-[#3A352D]">{artist.name}</span>
              <button
                onClick={() => handleRemoveArtist(artist.id)}
                className="text-[#8C857B] hover:text-[#3A352D] transition-colors ml-2"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          {selectedArtists.length < 3 && (
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="flex items-center justify-center w-10 h-10 bg-white/60 border border-[#D3CDBF] rounded-xl text-[#8C857B] hover:text-[#3A352D] hover:bg-white transition-all shadow-sm"
              >
                <Plus size={20} />
              </button>

              {isSearchOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-[#D3CDBF] rounded-xl shadow-lg overflow-hidden flex flex-col">
                  <div className="p-2 border-b border-[#D3CDBF]/50 flex items-center gap-2">
                    <Search size={16} className="text-[#8C857B]" />
                    <input
                      type="text"
                      placeholder="Search artists..."
                      className="w-full bg-transparent border-none outline-none text-sm text-[#3A352D]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredArtists.length > 0 ? (
                      filteredArtists.map(artist => (
                        <button
                          key={artist.id}
                          onClick={() => handleAddArtist(artist)}
                          className="w-full text-left px-4 py-2 text-sm text-[#3A352D] hover:bg-[#F4EFE6] transition-colors flex items-center gap-2"
                        >
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: artist.color }}></div>
                          <span className="truncate">{artist.name}</span>
                          <span className="ml-auto text-xs text-[#8C857B]">{artist.total}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-[#8C857B] text-center">No artists found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="ml-auto text-sm text-[#8C857B] italic">
            Select up to 3 influential artists to compare
          </div>
        </div>

        <div className="flex-1 flex gap-6 min-h-0 z-10">
          <div className="flex-[3] bg-[#F4EFE6]/70 backdrop-blur-md border border-[#D3CDBF]/50 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="mb-6">
              <h2 className="font-serif text-xl font-bold text-[#3A352D]">Artwork Production Over Time</h2>
              <p className="text-sm text-[#8C857B]">Number of artworks created per 5-year period</p>
            </div>

            <div className="flex-1 w-full relative">
              {selectedArtists.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={TIMELINE_DATA}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D3CDBF" opacity={0.5} />
                    <XAxis
                      dataKey="year"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#8C857B', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#8C857B', fontSize: 12 }}
                      dx={-10}
                    />
                    <RechartsTooltip
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.period ?? ''}
                      contentStyle={{ backgroundColor: '#F4EFE6', border: '1px solid #D3CDBF', borderRadius: '8px', color: '#3A352D' }}
                      itemStyle={{ fontWeight: 500 }}
                    />
                    {selectedArtists.map(artist => (
                      <Line
                        key={artist.id}
                        type="monotone"
                        dataKey={artist.valueKey}
                        name={artist.name}
                        stroke={artist.color}
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#8C857B] italic">
                  Please select at least one artist to view data.
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 bg-[#F4EFE6]/70 backdrop-blur-md border border-[#D3CDBF]/50 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="mb-6">
              <h2 className="font-serif text-xl font-bold text-[#3A352D]">Total Artworks</h2>
              <p className="text-sm text-[#8C857B]">Overall production volume</p>
            </div>

            <div className="flex-1 w-full relative">
              {selectedArtists.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={totalData}
                    margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D3CDBF" opacity={0.5} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#8C857B', fontSize: 11 }}
                      dy={10}
                      tickFormatter={(value) => value.split(' ').pop() || value}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#8C857B', fontSize: 12 }}
                    />
                    <RechartsTooltip
                      cursor={{ fill: 'rgba(211, 205, 191, 0.4)' }}
                      contentStyle={{ backgroundColor: '#F4EFE6', border: '1px solid #D3CDBF', borderRadius: '8px', color: '#3A352D' }}
                    />
                    <Bar
                      dataKey="total"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    >
                      {totalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#8C857B] italic text-center px-4">
                  Select artists to see total comparison.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
