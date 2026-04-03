export interface Artwork {
  id: string;
  title: string;
  artist: string;
  date: string;
  country: string;
  lat: number;
  lng: number;
  imageUrl: string;
}

export interface Artist {
  id: string;
  name: string;
  date: string;
  country: string;
  lat: number;
  lng: number;
  imageUrl: string;
}

export const countryData = [
  { name: 'USA', lat: 37.0902, lng: -95.7129 },
  { name: 'France', lat: 46.2276, lng: 2.2137 },
  { name: 'Germany', lat: 51.1657, lng: 10.4515 },
  { name: 'Italy', lat: 41.8719, lng: 12.5674 },
  { name: 'Japan', lat: 36.2048, lng: 138.2529 },
  { name: 'UK', lat: 55.3781, lng: -3.4360 },
  { name: 'Spain', lat: 40.4637, lng: -3.7492 },
  { name: 'Netherlands', lat: 52.1326, lng: 5.2913 },
  { name: 'Russia', lat: 61.5240, lng: 105.3188 },
  { name: 'China', lat: 35.8617, lng: 104.1954 },
];

export const artworks: Artwork[] = Array.from({ length: 300 }).map((_, i) => {
  const country = countryData[Math.floor(Math.random() * countryData.length)];
  // Add some jitter to lat/lng so they don't all overlap exactly
  const lat = country.lat + (Math.random() - 0.5) * 15;
  const lng = country.lng + (Math.random() - 0.5) * 15;
  
  return {
    id: `art-${i}`,
    title: `Artwork ${i + 1}`,
    artist: `Artist ${Math.floor(Math.random() * 50) + 1}`,
    date: `${1850 + Math.floor(Math.random() * 171)}`,
    country: country.name,
    lat,
    lng,
    imageUrl: `https://picsum.photos/seed/${i + 100}/200/200`,
  };
});

export const artists: Artist[] = Array.from({ length: 150 }).map((_, i) => {
  const country = countryData[Math.floor(Math.random() * countryData.length)];
  const lat = country.lat + (Math.random() - 0.5) * 15;
  const lng = country.lng + (Math.random() - 0.5) * 15;
  
  return {
    id: `artist-${i}`,
    name: `Artist ${i + 1}`,
    date: `${1850 + Math.floor(Math.random() * 171)}`,
    country: country.name,
    lat,
    lng,
    imageUrl: `https://picsum.photos/seed/artist${i + 100}/200/200`,
  };
});

export const getCountriesStats = (decade: number | null = null) => {
  const stats: Record<string, number> = {};
  artworks.forEach(art => {
    if (decade !== null) {
      const artDecade = Math.floor(parseInt(art.date) / 10) * 10;
      if (artDecade !== decade) return;
    }
    stats[art.country] = (stats[art.country] || 0) + 1;
  });
  return Object.entries(stats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};

export const getArtistCountriesStats = (decade: number | null = null) => {
  const stats: Record<string, number> = {};
  artists.forEach(artist => {
    if (decade !== null) {
      const artistDecade = Math.floor(parseInt(artist.date) / 10) * 10;
      if (artistDecade !== decade) return;
    }
    stats[artist.country] = (stats[artist.country] || 0) + 1;
  });
  return Object.entries(stats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};
