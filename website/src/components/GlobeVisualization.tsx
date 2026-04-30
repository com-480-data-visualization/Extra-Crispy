import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import * as d3 from 'd3';
import { artworks, artists, countryData } from '../data/mockData';
import { ViewMode } from '../App';
import {
  getDistributionCategories,
  getDistributionCount,
  getDistributionMaxCount,
  getGeoFeatureRegion,
} from '../data/distributionData';

const RADIUS = 5;
const MAX_ALL_TIME_ARTWORKS_PER_COUNTRY = 40;
const CHOROPLETH_RADIUS = RADIUS * 1.001;
const BORDER_RADIUS = RADIUS * 1.003;
const CHOROPLETH_TEXTURE_WIDTH = 4096;
const CHOROPLETH_TEXTURE_HEIGHT = 2048;
const CHOROPLETH_RAMP = ['#D9EBF7', '#9DCCE3', '#5CA8C8', '#267A9C', '#164B63'];

function latLngToVector3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  country: string;
  date: string;
}

function Marker({ data, isSelected }: { data: MarkerData, isSelected: boolean }) {
  const position = useMemo(() => latLngToVector3(data.lat, data.lng, RADIUS), [data.lat, data.lng]);
  const [hovered, setHovered] = useState(false);
  
  const quaternion = useMemo(() => {
    const normal = position.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    return q;
  }, [position]);

  const scale = isSelected ? 0.3 : (hovered ? 0.4 : 0.25);
  
  // Load texture for the image
  const texture = useMemo(() => new THREE.TextureLoader().load(data.imageUrl), [data.imageUrl]);

  return (
    <group position={position} quaternion={quaternion}>
      <mesh 
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
        scale={[scale, scale, scale]}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent={true} />
        {/* Add a subtle border/background to make it look like a photo */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.1, 1.1]} />
          <meshBasicMaterial color={isSelected ? '#D95C3A' : '#F4EFE6'} side={THREE.DoubleSide} />
        </mesh>
      </mesh>
      
      {/* Only show individual tooltip on hover to prevent stacking */}
      {hovered && (
        <Html distanceFactor={15} zIndexRange={[100, 0]} className="pointer-events-none">
          <div className="bg-[#F4EFE6]/95 backdrop-blur-md p-2 rounded shadow-lg border border-[#D3CDBF] w-48 -translate-x-1/2 translate-y-2 text-[#3A352D]">
            <img src={data.imageUrl} alt={data.title} className="w-full h-24 object-cover rounded mb-2 mix-blend-multiply" />
            <h3 className="font-serif font-bold text-sm truncate">{data.title}</h3>
            <p className="text-xs text-[#8C857B] truncate">{data.subtitle}</p>
            <p className="text-xs text-[#8C857B] mt-1">{data.country}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function CountryGallery({ country, mode, displayData }: { country: string, mode: ViewMode, displayData: MarkerData[] }) {
  const countryInfo = countryData.find(c => c.name === country);
  if (!countryInfo) return null;

  // Position it slightly above the surface
  const position = useMemo(() => latLngToVector3(countryInfo.lat, countryInfo.lng, RADIUS + 0.5), [countryInfo]);
  
  const items = useMemo(() => displayData.filter(d => d.country === country).slice(0, 9), [displayData, country]);

  if (items.length === 0) return null;

  return (
    <group position={position}>
      <Html center zIndexRange={[90, 0]} className="pointer-events-none">
        <div className="bg-[#F4EFE6]/80 backdrop-blur-md p-3 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-[#D3CDBF]/50 flex flex-col gap-2 w-72">
          <h3 className="font-serif font-bold text-lg text-[#3A352D] text-center border-b border-[#D3CDBF]/50 pb-2">
            {country} {mode === 'artworks' ? 'Artifacts' : 'Artists'}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {items.map(item => (
              <div key={item.id} className="aspect-square rounded-md overflow-hidden relative bg-[#D3CDBF]/30">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover mix-blend-multiply" />
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-[#8C857B] pt-1">
            Showing {items.length} of {displayData.filter(d => d.country === country).length}
          </p>
        </div>
      </Html>
    </group>
  );
}

function CountryBorders() {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(res => res.json())
      .then(data => {
        const points: THREE.Vector3[] = [];
        data.features.forEach((feature: any) => {
          const geometry = feature.geometry;
          if (!geometry) return;

          if (geometry.type === 'Polygon') {
            geometry.coordinates.forEach((ring: any[]) => {
              for (let i = 0; i < ring.length - 1; i++) {
                points.push(latLngToVector3(ring[i][1], ring[i][0], BORDER_RADIUS));
                points.push(latLngToVector3(ring[i+1][1], ring[i+1][0], BORDER_RADIUS));
              }
            });
          } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach((polygon: any[]) => {
              polygon.forEach((ring: any[]) => {
                for (let i = 0; i < ring.length - 1; i++) {
                  points.push(latLngToVector3(ring[i][1], ring[i][0], BORDER_RADIUS));
                  points.push(latLngToVector3(ring[i+1][1], ring[i+1][0], BORDER_RADIUS));
                }
              });
            });
          }
        });
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        setGeometry(geo);
      })
      .catch(err => console.error("Failed to load country borders", err));
  }, []);

  if (!geometry) return null;

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#8C857B" transparent opacity={0.3} />
    </lineSegments>
  );
}

export const getContinent = (countryName: string) => {
  const normalizedCountryName = countryName.trim();
  const continents: Record<string, string[]> = {
    'Africa': ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Democratic Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe', 'United Republic of Tanzania'],
    'Asia': ['Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China', 'Cyprus', 'Georgia', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan', 'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine', 'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria', 'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkey', 'Turkmenistan', 'United Arab Emirates', 'Uzbekistan', 'Vietnam', 'Yemen'],
    'Europe': ['Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Czechia', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Macedonia', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Republic of Serbia', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'UK'],
    'North America': ['Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba', 'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'United States of America', 'USA', 'United States'],
    'South America': ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela'],
    'Oceania': ['Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu']
  };

  for (const [continent, countries] of Object.entries(continents)) {
    if (countries.includes(normalizedCountryName)) return continent;
  }
  return 'Unknown';
};

function getChoroplethColor(count: number, maxCount: number, baseColor: string, selectedCategory: string | null) {
  const intensity = Math.log1p(count) / Math.log1p(Math.max(maxCount, 1));
  const scaledIntensity = Math.max(0.08, Math.min(1, intensity));

  if (selectedCategory) {
    return d3.interpolateRgb('#F6E7BE', baseColor)(scaledIntensity);
  }

  const scale = d3.scaleQuantize<string>()
    .domain([0, 1])
    .range(CHOROPLETH_RAMP);
  return scale(scaledIntensity);
}

function createChoroplethTexture(canvas: HTMLCanvasElement) {
  const nextTexture = new THREE.CanvasTexture(canvas);
  nextTexture.generateMipmaps = false;
  nextTexture.minFilter = THREE.LinearFilter;
  nextTexture.magFilter = THREE.LinearFilter;
  nextTexture.wrapS = THREE.ClampToEdgeWrapping;
  nextTexture.wrapT = THREE.ClampToEdgeWrapping;
  return nextTexture;
}

function ChoroplethGlobe({ selectedCategory, selectedDecade, borderMode, mode }: { selectedCategory: string | null, selectedDecade: number | null, borderMode: 'country' | 'continent', mode: ViewMode }) {
  const [geojson, setGeojson] = useState<any>(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(res => res.json())
      .then(data => setGeojson(data));
  }, []);

  useEffect(() => {
    if (!geojson) return;
    const canvas = canvasRef.current;
    if (canvas.width !== CHOROPLETH_TEXTURE_WIDTH) {
      canvas.width = CHOROPLETH_TEXTURE_WIDTH;
      canvas.height = CHOROPLETH_TEXTURE_HEIGHT;
    }
    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    const projection = d3.geoEquirectangular()
      .scale(canvas.width / (2 * Math.PI))
      .translate([canvas.width / 2, canvas.height / 2]);
    const path = d3.geoPath(projection, context);

    const categoriesList = getDistributionCategories(mode);
    const categoryData = selectedCategory ? categoriesList.find(c => c.name === selectedCategory) : null;
    const baseColor = selectedCategory ? categoryData?.color || '#3A352D' : '#3A352D';
    const maxCount = getDistributionMaxCount({ mode, borderMode, selectedCategory, selectedDecade });

    if (borderMode === 'continent') {
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
      const offscreenCtx = offscreenCanvas.getContext('2d');
      if (!offscreenCtx) return;

      const offscreenPath = d3.geoPath(projection, offscreenCtx);

      const continentsMap = new Map();
      geojson.features.forEach((feature: any) => {
        const countryName = feature.properties.ADMIN || feature.properties.name || 'Unknown';
        const continent = getContinent(countryName);
        if (!continentsMap.has(continent)) continentsMap.set(continent, []);
        continentsMap.get(continent).push(feature);
      });

      continentsMap.forEach((features, continent) => {
        const count = getDistributionCount({ mode, borderMode, region: continent, selectedCategory, selectedDecade });
        if (count > 0) {
          offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
          
          const fillColor = getChoroplethColor(count, maxCount, baseColor, selectedCategory);
          offscreenCtx.fillStyle = fillColor;
          offscreenCtx.strokeStyle = fillColor;
          offscreenCtx.lineWidth = 1.5;
          offscreenCtx.lineJoin = 'round';
          
          offscreenCtx.beginPath();
          features.forEach((feature: any) => {
            offscreenPath(feature);
          });
          offscreenCtx.fill();
          offscreenCtx.stroke();

          context.drawImage(offscreenCanvas, 0, 0);
        }
      });
    } else {
      geojson.features.forEach((feature: any) => {
        context.beginPath();
        path(feature);

        const countryName = feature.properties.ADMIN || feature.properties.name || 'Unknown';
        const region = getGeoFeatureRegion(countryName);
        if (!region) return;
        const count = getDistributionCount({ mode, borderMode, region, selectedCategory, selectedDecade });
        
        if (count > 0) {
          context.fillStyle = getChoroplethColor(count, maxCount, baseColor, selectedCategory);
          context.fill();
        }
      });
    }

    if (!texture) {
      setTexture(createChoroplethTexture(canvas));
    } else {
      texture.needsUpdate = true;
    }
  }, [geojson, selectedCategory, selectedDecade, borderMode, mode, texture]);

  if (!texture) return null;

  return (
    <mesh>
      <sphereGeometry args={[CHOROPLETH_RADIUS, 96, 96]} />
      <meshBasicMaterial map={texture} transparent={true} />
    </mesh>
  );
}

function Globe({ selectedCountry, mode, selectedDecade, hideImages, borderMode = 'country', selectedCategory = null, showChoropleth = false, showGraticules = true, showBorders = true }: { selectedCountry: string | null, mode: ViewMode, selectedDecade: number | null, hideImages: boolean, borderMode?: 'country' | 'continent', selectedCategory?: string | null, showChoropleth?: boolean, showGraticules?: boolean, showBorders?: boolean }) {
  const globeRef = useRef<THREE.Group>(null);
  
  const displayData: MarkerData[] = useMemo(() => {
    let data = [];
    if (mode === 'artworks') {
      data = artworks.map(art => ({
        id: art.id,
        lat: art.lat,
        lng: art.lng,
        imageUrl: art.imageUrl,
        title: art.title,
        subtitle: `${art.artist}, ${art.date}`,
        country: art.country,
        date: art.date
      }));
    } else {
      data = artists.map(artist => ({
        id: artist.id,
        lat: artist.lat,
        lng: artist.lng,
        imageUrl: artist.imageUrl,
        title: artist.name,
        subtitle: 'Artist',
        country: artist.country,
        date: artist.date
      }));
    }

    if (selectedDecade !== null) {
      data = data.filter(item => {
        const itemDecade = Math.floor(parseInt(item.date) / 10) * 10;
        return itemDecade === selectedDecade;
      });
    }

    return data;
  }, [mode, selectedDecade]);

  const targetLng = useMemo(() => {
    if (!selectedCountry) return null;
    const item = displayData.find(a => a.country === selectedCountry);
    return item ? item.lng : null;
  }, [selectedCountry, displayData]);

  const visibleMarkers = useMemo(() => {
    if (mode !== 'artworks' || selectedDecade !== null) return displayData;

    const countryCounts = new Map<string, number>();
    return displayData.filter(item => {
      const count = countryCounts.get(item.country) || 0;
      if (count >= MAX_ALL_TIME_ARTWORKS_PER_COUNTRY) return false;
      countryCounts.set(item.country, count + 1);
      return true;
    });
  }, [displayData, mode, selectedDecade]);

  useFrame(() => {
    if (globeRef.current) {
      if (targetLng !== null) {
        // Rotate globe so the target longitude faces the camera
        // Adjust the offset (+Math.PI / 2) depending on the initial coordinate system
        const targetRotationY = (targetLng * Math.PI) / 180 + Math.PI / 2;
        
        // Normalize current rotation to be close to target
        let currentY = globeRef.current.rotation.y;
        while (currentY - targetRotationY > Math.PI) currentY -= Math.PI * 2;
        while (currentY - targetRotationY < -Math.PI) currentY += Math.PI * 2;
        globeRef.current.rotation.y = currentY;

        globeRef.current.rotation.y = THREE.MathUtils.lerp(globeRef.current.rotation.y, targetRotationY, 0.05);
      } else {
        globeRef.current.rotation.y += 0.001;
      }
    }
  });

  const latitudes = useMemo(() => {
    const lines = [];
    for (let lat = -80; lat <= 80; lat += 5) {
      const points = [];
      const radiusAtLat = RADIUS * Math.cos(lat * (Math.PI / 180));
      const y = RADIUS * Math.sin(lat * (Math.PI / 180));
      for (let lng = -180; lng <= 180; lng += 5) {
        const x = -(radiusAtLat * Math.cos(lng * (Math.PI / 180)));
        const z = radiusAtLat * Math.sin(lng * (Math.PI / 180));
        points.push(new THREE.Vector3(x, y, z));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(geometry);
    }
    return lines;
  }, []);

  return (
    <group ref={globeRef}>
      {showGraticules && latitudes.map((geo, i) => (
        <primitive 
          key={i} 
          object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#D3CDBF', transparent: true, opacity: 0.4 }))} 
        />
      ))}
      
      <mesh>
        <sphereGeometry args={[RADIUS * 0.99, 32, 32]} />
        <meshBasicMaterial color="#EAE5D9" transparent opacity={0.8} />
      </mesh>

      {showChoropleth && <ChoroplethGlobe selectedCategory={selectedCategory} selectedDecade={selectedDecade} borderMode={borderMode} mode={mode} />}

      {showBorders && <CountryBorders />}

      {!hideImages && visibleMarkers.map(data => (
        <Marker 
          key={data.id} 
          data={data} 
          isSelected={selectedCountry === data.country} 
        />
      ))}

      {selectedCountry && (
        <CountryGallery country={selectedCountry} mode={mode} displayData={displayData} />
      )}
    </group>
  );
}

export default function GlobeVisualization({ selectedCountry, mode, selectedDecade, hideImages = false, borderMode = 'country', selectedCategory = null, showChoropleth = false, showGraticules = true, showBorders = true }: { selectedCountry: string | null, mode: ViewMode, selectedDecade: number | null, hideImages?: boolean, borderMode?: 'country' | 'continent', selectedCategory?: string | null, showChoropleth?: boolean, showGraticules?: boolean, showBorders?: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
      <ambientLight intensity={1} />
      <OrbitControls 
        enablePan={false} 
        minDistance={6} 
        maxDistance={20}
        autoRotate={false}
      />
      <Globe selectedCountry={selectedCountry} mode={mode} selectedDecade={selectedDecade} hideImages={hideImages} borderMode={borderMode} selectedCategory={selectedCategory} showChoropleth={showChoropleth} showGraticules={showGraticules} showBorders={showBorders} />
    </Canvas>
  );
}
