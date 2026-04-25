import { homepageArtworks } from './homepageArtworks';
import { homepageArtists } from './homepageArtists';

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  date: string;
  country: string;
  lat: number;
  lng: number;
  imageUrl: string;
  nationality?: string;
}

export interface Artist {
  id: string;
  name: string;
  date: string;
  country: string;
  lat: number;
  lng: number;
  imageUrl: string;
  gender?: string;
  nationality?: string;
  endDate?: string;
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
  { name: 'Switzerland', lat: 46.8182, lng: 8.2275 },
  { name: 'Mexico', lat: 23.6345, lng: -102.5528 },
  { name: 'Austria', lat: 47.5162, lng: 14.5501 },
  { name: 'Belgium', lat: 50.5039, lng: 4.4699 },
  { name: 'South Africa', lat: -30.5595, lng: 22.9375 },
  { name: 'Venezuela', lat: 6.4238, lng: -66.5897 },
  { name: 'Lebanon', lat: 33.8547, lng: 35.8623 },
  { name: 'Chile', lat: -35.6751, lng: -71.5430 },
  { name: 'Poland', lat: 51.9194, lng: 19.1451 },
  { name: 'Brazil', lat: -14.2350, lng: -51.9253 },
  { name: 'Canada', lat: 56.1304, lng: -106.3468 },
  { name: 'Argentina', lat: -38.4161, lng: -63.6167 },
  { name: 'Iceland', lat: 64.9631, lng: -19.0208 },
  { name: 'Serbia', lat: 44.0165, lng: 21.0059 },
  { name: 'Egypt', lat: 26.8206, lng: 30.8025 },
  { name: 'Finland', lat: 61.9241, lng: 25.7482 },
  { name: 'Mali', lat: 17.5707, lng: -3.9962 },
  { name: 'Romania', lat: 45.9432, lng: 24.9668 },
  { name: 'Greece', lat: 39.0742, lng: 21.8243 },
  { name: 'Czech Republic', lat: 49.8175, lng: 15.4730 },
  { name: 'Denmark', lat: 56.2639, lng: 9.5018 },
  { name: 'Peru', lat: -9.1900, lng: -75.0152 },
  { name: 'Australia', lat: -25.2744, lng: 133.7751 },
  { name: 'Colombia', lat: 4.5709, lng: -74.2973 },
  { name: 'Ukraine', lat: 48.3794, lng: 31.1656 },
  { name: 'Norway', lat: 60.4720, lng: 8.4689 },
  { name: 'Albania', lat: 41.1533, lng: 20.1683 },
  { name: 'Algeria', lat: 28.0339, lng: 1.6596 },
  { name: 'Bahamas', lat: 25.0343, lng: -77.3963 },
  { name: 'Bangladesh', lat: 23.6850, lng: 90.3563 },
  { name: 'Benin', lat: 9.3077, lng: 2.3158 },
  { name: 'Bolivia', lat: -16.2902, lng: -63.5887 },
  { name: 'Bosnia and Herzegovina', lat: 43.9159, lng: 17.6791 },
  { name: 'Bulgaria', lat: 42.7339, lng: 25.4858 },
  { name: 'Burkina Faso', lat: 12.2383, lng: -1.5616 },
  { name: 'Cambodia', lat: 12.5657, lng: 104.9910 },
  { name: 'Cameroon', lat: 7.3697, lng: 12.3547 },
  { name: 'Democratic Republic of the Congo', lat: -4.0383, lng: 21.7587 },
  { name: 'Costa Rica', lat: 9.7489, lng: -83.7534 },
  { name: 'Croatia', lat: 45.1000, lng: 15.2000 },
  { name: 'Cuba', lat: 21.5218, lng: -77.7812 },
  { name: 'Cyprus', lat: 35.1264, lng: 33.4299 },
  { name: 'Ecuador', lat: -1.8312, lng: -78.1834 },
  { name: 'United Arab Emirates', lat: 23.4241, lng: 53.8478 },
  { name: 'Ethiopia', lat: 9.1450, lng: 40.4897 },
  { name: 'Philippines', lat: 12.8797, lng: 121.7740 },
  { name: 'Georgia', lat: 42.3154, lng: 43.3569 },
  { name: 'Ghana', lat: 7.9465, lng: -1.0232 },
  { name: 'Guatemala', lat: 15.7835, lng: -90.2308 },
  { name: 'Guyana', lat: 4.8604, lng: -58.9302 },
  { name: 'Haiti', lat: 18.9712, lng: -72.2852 },
  { name: 'Hungary', lat: 47.1625, lng: 19.5033 },
  { name: 'India', lat: 20.5937, lng: 78.9629 },
  { name: 'Iran', lat: 32.4279, lng: 53.6880 },
  { name: 'Ireland', lat: 53.1424, lng: -7.6921 },
  { name: 'Israel', lat: 31.0461, lng: 34.8516 },
  { name: 'Kenya', lat: -0.0236, lng: 37.9062 },
  { name: 'South Korea', lat: 35.9078, lng: 127.7669 },
  { name: 'Kuwait', lat: 29.3117, lng: 47.4818 },
  { name: 'Latvia', lat: 56.8796, lng: 24.6032 },
  { name: 'Lithuania', lat: 55.1694, lng: 23.8813 },
  { name: 'Luxembourg', lat: 49.8153, lng: 6.1296 },
  { name: 'North Macedonia', lat: 41.6086, lng: 21.7453 },
  { name: 'Malaysia', lat: 4.2105, lng: 101.9758 },
  { name: 'Morocco', lat: 31.7917, lng: -7.0926 },
  { name: 'Namibia', lat: -22.9576, lng: 18.4904 },
  { name: 'New Zealand', lat: -40.9006, lng: 174.8860 },
  { name: 'Nicaragua', lat: 12.8654, lng: -85.2072 },
  { name: 'Nigeria', lat: 9.0820, lng: 8.6753 },
  { name: 'Pakistan', lat: 30.3753, lng: 69.3451 },
  { name: 'Palestine', lat: 31.9522, lng: 35.2332 },
  { name: 'Panama', lat: 8.5380, lng: -80.7821 },
  { name: 'Paraguay', lat: -23.4425, lng: -58.4438 },
  { name: 'Portugal', lat: 39.3999, lng: -8.2245 },
  { name: 'El Salvador', lat: 13.7942, lng: -88.8965 },
  { name: 'Senegal', lat: 14.4974, lng: -14.4524 },
  { name: 'Slovakia', lat: 48.6690, lng: 19.6990 },
  { name: 'Slovenia', lat: 46.1512, lng: 14.9955 },
  { name: 'Sudan', lat: 12.8628, lng: 30.2176 },
  { name: 'Sweden', lat: 60.1282, lng: 18.6435 },
  { name: 'Taiwan', lat: 23.6978, lng: 120.9605 },
  { name: 'Tanzania', lat: -6.3690, lng: 34.8888 },
  { name: 'Thailand', lat: 15.8700, lng: 100.9925 },
  { name: 'Turkey', lat: 38.9637, lng: 35.2433 },
  { name: 'Uruguay', lat: -32.5228, lng: -55.7658 },
  { name: 'Vietnam', lat: 14.0583, lng: 108.2772 },
  { name: 'Zimbabwe', lat: -19.0154, lng: 29.1549 },
  { name: 'Azerbaijan', lat: 40.1431, lng: 47.5769 },
  { name: 'Estonia', lat: 58.5953, lng: 25.0136 },
  { name: 'Ivory Coast', lat: 7.5400, lng: -5.5471 },
  { name: 'Kazakhstan', lat: 48.0196, lng: 66.9237 },
  { name: 'Sierra Leone', lat: 8.4606, lng: -11.7799 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Uganda', lat: 1.3733, lng: 32.2903 },
];

export const artworks: Artwork[] = homepageArtworks;

export const artists: Artist[] = homepageArtists;

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
