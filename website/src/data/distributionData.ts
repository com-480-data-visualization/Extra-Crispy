import artworksCountryDistribution from './distribution/artworks_country_distribution.json';
import artworksContinentDistribution from './distribution/artworks_continent_distribution.json';
import artistsCountryDistribution from './distribution/artists_country_distribution.json';
import artistsContinentDistribution from './distribution/artists_continent_distribution.json';

export type DistributionMode = 'artworks' | 'artists';
export type BorderMode = 'country' | 'continent';

export interface DistributionOption {
  name: string;
  count: number;
  color: string;
}

export interface RegionCount {
  region: string;
  count: number;
}

interface ArtworkBucket {
  decade: string;
  all_artwork_num: number;
  classifications: Record<string, {
    total: number;
    nationalities?: Record<string, number>;
    continents?: Record<string, number>;
  }>;
}

interface ArtistBucket {
  decade: string;
  all_artist_num: number;
  genders: Record<string, {
    total: number;
    nationalities?: Record<string, number>;
    continents?: Record<string, number>;
  }>;
}

const ARTWORK_COLORS = [
  '#D95C3A',
  '#4A6D7C',
  '#5C7A52',
  '#C2933E',
  '#8A5A73',
  '#3D5A80',
  '#E07A5F',
  '#81B29A',
  '#7A5C3E',
  '#6D597A',
  '#4F6F52',
  '#B56576',
  '#577590',
  '#9C6644',
  '#52796F',
  '#BC6C25',
];

const GENDER_COLORS: Record<string, string> = {
  Male: '#4A6B82',
  Female: '#824A5B',
};

const COUNTRY_NAME_TO_NATIONALITY: Record<string, string> = {
  Afghanistan: 'Afghan',
  Albania: 'Albanian',
  Algeria: 'Algerian',
  Argentina: 'Argentine',
  Australia: 'Australian',
  Austria: 'Austrian',
  Azerbaijan: 'Azerbaijani',
  Bahamas: 'Bahamian',
  Bangladesh: 'Bangladeshi',
  Belgium: 'Belgian',
  Benin: 'Beninese',
  Bolivia: 'Bolivian',
  'Bosnia and Herzegovina': 'Bosnian',
  Brazil: 'Brazilian',
  Bulgaria: 'Bulgarian',
  'Burkina Faso': 'Burkinabe',
  Cambodia: 'Cambodian',
  Cameroon: 'Cameroonian',
  Canada: 'Canadian',
  Chile: 'Chilean',
  China: 'Chinese',
  Colombia: 'Colombian',
  Congo: 'Congolese',
  'Democratic Republic of the Congo': 'Congolese',
  'Costa Rica': 'Costa Rican',
  Croatia: 'Croatian',
  Cuba: 'Cuban',
  Cyprus: 'Cypriot',
  Czechia: 'Czech',
  'Czech Republic': 'Czech',
  Denmark: 'Danish',
  Ecuador: 'Ecuadorian',
  Egypt: 'Egyptian',
  Estonia: 'Estonian',
  Ethiopia: 'Ethiopian',
  Fiji: 'Fijian',
  Finland: 'Finnish',
  France: 'French',
  Georgia: 'Georgian',
  Germany: 'German',
  Ghana: 'Ghanaian',
  Greece: 'Greek',
  Guatemala: 'Guatemalan',
  Guyana: 'Guyanese',
  Haiti: 'Haitian',
  Hungary: 'Hungarian',
  Iceland: 'Icelandic',
  India: 'Indian',
  Iran: 'Iranian',
  Ireland: 'Irish',
  Israel: 'Israeli',
  Italy: 'Italian',
  'Ivory Coast': 'Ivorian',
  "Cote d'Ivoire": 'Ivorian',
  Japan: 'Japanese',
  Kazakhstan: 'Kazakhstani',
  Kenya: 'Kenyan',
  Kuwait: 'Kuwaiti',
  Kyrgyzstan: 'Kyrgyzstani',
  Latvia: 'Latvian',
  Lebanon: 'Lebanese',
  Lithuania: 'Lithuanian',
  Luxembourg: 'Luxembourgish',
  Malaysia: 'Malaysian',
  Mali: 'Malian',
  Mexico: 'Mexican',
  Morocco: 'Moroccan',
  Namibia: 'Namibian',
  Netherlands: 'Dutch',
  'New Zealand': 'New Zealander',
  Nicaragua: 'Nicaraguan',
  Nigeria: 'Nigerian',
  Norway: 'Norwegian',
  Pakistan: 'Pakistani',
  Palestine: 'Palestinian',
  Panama: 'Panamanian',
  Paraguay: 'Paraguayan',
  Peru: 'Peruvian',
  Philippines: 'Filipino',
  Poland: 'Polish',
  Portugal: 'Portuguese',
  Romania: 'Romanian',
  Russia: 'Russian',
  'Russian Federation': 'Russian',
  Senegal: 'Senegalese',
  Serbia: 'Serbian',
  'Sierra Leone': 'Sierra Leonean',
  Singapore: 'Singaporean',
  Slovakia: 'Slovak',
  Slovenia: 'Slovenian',
  'South Africa': 'South African',
  Spain: 'Spanish',
  Sudan: 'Sudanese',
  Sweden: 'Swedish',
  Switzerland: 'Swiss',
  Taiwan: 'Taiwanese',
  Tanzania: 'Tanzanian',
  Thailand: 'Thai',
  Turkey: 'Turkish',
  Turkiye: 'Turkish',
  Uganda: 'Ugandan',
  Ukraine: 'Ukrainian',
  'United Arab Emirates': 'Emirati',
  'United Kingdom': 'British',
  'United States': 'American',
  'United States of America': 'American',
  Uruguay: 'Uruguayan',
  Venezuela: 'Venezuelan',
  Vietnam: 'Vietnamese',
  Zimbabwe: 'Zimbabwean',
};

const allCountryRegions = new Set([
  ...collectRegions('artworks', 'country'),
  ...collectRegions('artists', 'country'),
]);

function artworkBuckets(borderMode: BorderMode): ArtworkBucket[] {
  return (borderMode === 'country'
    ? artworksCountryDistribution.decades
    : artworksContinentDistribution.decades) as ArtworkBucket[];
}

function artistBuckets(borderMode: BorderMode): ArtistBucket[] {
  return (borderMode === 'country'
    ? artistsCountryDistribution.decades
    : artistsContinentDistribution.decades) as ArtistBucket[];
}

function dimensionKey(borderMode: BorderMode) {
  return borderMode === 'country' ? 'nationalities' : 'continents';
}

function decadeStart(label: string) {
  const match = label.match(/\d{3,4}/);
  return match ? Number(match[0]) : null;
}

function bucketMatchesDecade(label: string, decade: number | null) {
  return decade === null || decadeStart(label) === decade;
}

function sumRecord(target: Map<string, number>, values: Record<string, number> | undefined) {
  if (!values) return;
  for (const [region, count] of Object.entries(values)) {
    target.set(region, (target.get(region) ?? 0) + count);
  }
}

function collectRegions(mode: DistributionMode, borderMode: BorderMode) {
  const counts = getRegionCounts({ mode, borderMode, selectedCategory: null, selectedDecade: null });
  return counts.map(item => item.region);
}

export function getDistributionCategories(mode: DistributionMode): DistributionOption[] {
  if (mode === 'artworks') {
    return (artworksCountryDistribution.classifications as string[])
      .map((name, index) => ({
        name,
        count: getArtworkCategoryTotal(name),
        color: ARTWORK_COLORS[index % ARTWORK_COLORS.length],
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }

  return (artistsCountryDistribution.genders as string[])
    .map(name => ({
      name,
      count: getArtistGenderTotal(name),
      color: GENDER_COLORS[name] ?? '#8C857B',
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function getAvailableDecades(mode: DistributionMode) {
  const buckets = mode === 'artworks' ? artworkBuckets('country') : artistBuckets('country');
  return buckets
    .map(bucket => decadeStart(bucket.decade))
    .filter((decade): decade is number => decade !== null);
}

export function getDistributionTotal(mode: DistributionMode, selectedDecade: number | null = null) {
  const buckets = mode === 'artworks' ? artworkBuckets('country') : artistBuckets('country');
  return buckets
    .filter(bucket => bucketMatchesDecade(bucket.decade, selectedDecade))
    .reduce((total, bucket) => total + (mode === 'artworks'
      ? (bucket as ArtworkBucket).all_artwork_num
      : (bucket as ArtistBucket).all_artist_num), 0);
}

export function getRegionCounts({
  mode,
  borderMode,
  selectedCategory,
  selectedDecade,
}: {
  mode: DistributionMode;
  borderMode: BorderMode;
  selectedCategory: string | null;
  selectedDecade: number | null;
}): RegionCount[] {
  const counts = new Map<string, number>();
  const key = dimensionKey(borderMode);

  if (mode === 'artworks') {
    for (const bucket of artworkBuckets(borderMode).filter(item => bucketMatchesDecade(item.decade, selectedDecade))) {
      if (selectedCategory) {
        sumRecord(counts, bucket.classifications[selectedCategory]?.[key]);
      } else {
        for (const classification of Object.values(bucket.classifications)) {
          sumRecord(counts, classification[key]);
        }
      }
    }
  } else {
    for (const bucket of artistBuckets(borderMode).filter(item => bucketMatchesDecade(item.decade, selectedDecade))) {
      if (selectedCategory) {
        sumRecord(counts, bucket.genders[selectedCategory]?.[key]);
      } else {
        for (const gender of Object.values(bucket.genders)) {
          sumRecord(counts, gender[key]);
        }
      }
    }
  }

  return [...counts.entries()]
    .map(([region, count]) => ({ region, count }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count || a.region.localeCompare(b.region));
}

export function getDistributionCount(params: {
  mode: DistributionMode;
  borderMode: BorderMode;
  region: string;
  selectedCategory: string | null;
  selectedDecade: number | null;
}) {
  return getRegionCounts(params).find(item => item.region === params.region)?.count ?? 0;
}

export function getDistributionMaxCount(params: {
  mode: DistributionMode;
  borderMode: BorderMode;
  selectedCategory: string | null;
  selectedDecade: number | null;
}) {
  return Math.max(...getRegionCounts(params).map(item => item.count), 1);
}

export function getGeoFeatureRegion(countryName: string) {
  const nationality = COUNTRY_NAME_TO_NATIONALITY[countryName];
  if (nationality && allCountryRegions.has(nationality)) return nationality;
  if (allCountryRegions.has(countryName)) return countryName;
  return null;
}

export function getChartImageUrl(mode: DistributionMode, region: string) {
  const baseUrl = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBaseUrl}distribution/${mode}_5year/${encodeURIComponent(region)}.png`;
}

function getArtworkCategoryTotal(category: string) {
  return artworkBuckets('country').reduce((sum, bucket) => (
    sum + (bucket.classifications[category]?.total ?? 0)
  ), 0);
}

function getArtistGenderTotal(gender: string) {
  return artistBuckets('country').reduce((sum, bucket) => (
    sum + (bucket.genders[gender]?.total ?? 0)
  ), 0);
}
