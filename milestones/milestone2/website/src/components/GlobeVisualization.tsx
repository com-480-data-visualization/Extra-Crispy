import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { artworks, artists, countryData } from '../data/mockData';
import { ViewMode } from '../App';

const RADIUS = 5;

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
                points.push(latLngToVector3(ring[i][1], ring[i][0], RADIUS + 0.01));
                points.push(latLngToVector3(ring[i+1][1], ring[i+1][0], RADIUS + 0.01));
              }
            });
          } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach((polygon: any[]) => {
              polygon.forEach((ring: any[]) => {
                for (let i = 0; i < ring.length - 1; i++) {
                  points.push(latLngToVector3(ring[i][1], ring[i][0], RADIUS + 0.01));
                  points.push(latLngToVector3(ring[i+1][1], ring[i+1][0], RADIUS + 0.01));
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

function Globe({ selectedCountry, mode, selectedDecade }: { selectedCountry: string | null, mode: ViewMode, selectedDecade: number | null }) {
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
      {latitudes.map((geo, i) => (
        <primitive 
          key={i} 
          object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#D3CDBF', transparent: true, opacity: 0.4 }))} 
        />
      ))}
      
      <mesh>
        <sphereGeometry args={[RADIUS * 0.99, 32, 32]} />
        <meshBasicMaterial color="#EAE5D9" transparent opacity={0.8} />
      </mesh>

      <CountryBorders />

      {displayData.map(data => (
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

export default function GlobeVisualization({ selectedCountry, mode, selectedDecade }: { selectedCountry: string | null, mode: ViewMode, selectedDecade: number | null }) {
  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
      <ambientLight intensity={1} />
      <OrbitControls 
        enablePan={false} 
        minDistance={6} 
        maxDistance={20}
        autoRotate={false}
      />
      <Globe selectedCountry={selectedCountry} mode={mode} selectedDecade={selectedDecade} />
    </Canvas>
  );
}
