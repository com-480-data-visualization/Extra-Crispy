import React from "react";
import ReactECharts from "echarts-for-react";
import { geoCentroid, geoMercator, geoPath } from "d3-geo";

// Common chart settings to match homepage
const FONT_FAMILY = '"Palatino Linotype", "Book Antiqua", Palatino, serif';
const TEXT_COLOR = '#2a2418';
const TITLE_COLOR = '#3a2f20';
const EChartComponent = ReactECharts as unknown as React.ComponentType<any>;

const TOP_ARTISTS = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"];

type LonLatBounds = {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
};

const REGION_BOUNDS: Record<string, LonLatBounds> = {
  // Only trim Oceania to avoid very remote islands skewing fit;
  // keep full geometries for Europe/Americas to preserve continental shape.
  Oceania: { minLon: 110, maxLon: 180, minLat: -52, maxLat: 20 }
};

function isCentroidInBounds(centroid: [number, number], bounds: LonLatBounds): boolean {
  const [lon, lat] = centroid;
  return lon >= bounds.minLon && lon <= bounds.maxLon && lat >= bounds.minLat && lat <= bounds.maxLat;
}

function trimFeatureGeometryByBounds(feature: any, bounds: LonLatBounds): any | null {
  if (!feature?.geometry) {
    return null;
  }

  const { geometry } = feature;

  if (geometry.type === "Polygon") {
    const centroid = geoCentroid(feature) as [number, number];
    return isCentroidInBounds(centroid, bounds) ? feature : null;
  }

  if (geometry.type === "MultiPolygon" && Array.isArray(geometry.coordinates)) {
    const keptPolygons = geometry.coordinates.filter((polygonCoords: any) => {
      const polygonFeature = {
        type: "Feature",
        properties: feature.properties,
        geometry: {
          type: "Polygon",
          coordinates: polygonCoords
        }
      };
      const centroid = geoCentroid(polygonFeature as any) as [number, number];
      return isCentroidInBounds(centroid, bounds);
    });

    if (keptPolygons.length === 0) {
      return null;
    }

    return {
      ...feature,
      geometry: {
        ...geometry,
        coordinates: keptPolygons
      }
    };
  }

  return feature;
}

function ArtistOverlay({ artistName }: { artistName: string }) {
  return (
    <div className="artist-overlay" role="dialog" aria-label={`Introduction of ${artistName}`}>
      <div className="artist-overlay-title">Introduction of the Artist</div>
      <div className="artist-overlay-grid">
        <div className="artist-overlay-left">
          <div className="artist-portrait-box" />
          <div className="artist-portrait-label">portrait</div>
        </div>
        <div className="artist-overlay-right">
          <div className="artist-bio-box">Bio: {artistName} placeholder bio text...</div>
          <div className="artist-growth-box">
            <div className="artist-growth-title">Artwork growth by medium:</div>
            <svg viewBox="0 0 100 28" className="artist-growth-svg" aria-hidden="true">
              <path d="M8 22 L92 22" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M90 20 L92 22 L90 24" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M10 17 C24 14, 36 14, 48 15 C61 16, 74 14, 88 9" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <div className="artist-growth-year">year</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContinentMap({ region }: { region: string }) {
  const [svgPath, setSvgPath] = React.useState<string>("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      // Lazy load to avoid blocking main thread
      const [{ feature }, worldAtlasModule, worldCountriesModule] = await Promise.all([
        import("topojson-client"),
        import("world-atlas/countries-50m.json"),
        import("world-countries")
      ]);

      const topology = worldAtlasModule.default as any;
      const countriesObject = topology.objects.countries;
      
      const records = worldCountriesModule.default as any[];
      const infoByNumericId = new Map<string, string>();
      for (const item of records) {
        if (item.ccn3 && item.region) {
          infoByNumericId.set(item.ccn3.padStart(3, "0"), item.region);
        }
      }

      const collection = feature(topology, countriesObject) as any;

      // Filter features by region
      let regionFeatures = collection.features.filter((f: any) => {
        const id = f.id ? String(f.id).padStart(3, "0") : "";
        return infoByNumericId.get(id) === region;
      });

      // Trim remote islands/outliers for cleaner continent framing while preserving mainland.
      const regionBounds = REGION_BOUNDS[region];
      if (regionBounds) {
        regionFeatures = regionFeatures
          .map((featureItem: any) => trimFeatureGeometryByBounds(featureItem, regionBounds))
          .filter(Boolean);
      }

      if (regionFeatures.length === 0 || cancelled) return;

      const regionCollection = { type: "FeatureCollection", features: regionFeatures };
      
      const width = containerRef.current?.clientWidth || 400;
      const height = containerRef.current?.clientHeight || 400;

      // Fit the projection to our container
      const projection = geoMercator().fitSize([width * 0.985, height * 0.985], regionCollection as any);
      
      const pathGenerator = geoPath().projection(projection);
      const pathData = pathGenerator(regionCollection as any) || "";
      
      if (!cancelled) {
        setSvgPath(pathData);
      }
    }

    loadMap();
    return () => { cancelled = true; };
  }, [region]);

  return (
    <div className="placeholder-map" ref={containerRef}>
      {svgPath ? (
        <svg className="continent-map-svg" viewBox={`0 0 ${containerRef.current?.clientWidth || 400} ${containerRef.current?.clientHeight || 400}`} style={{ overflow: "visible" }}>
          <g transform={`translate(${containerRef.current ? containerRef.current.clientWidth * 0.01 : 0}, ${containerRef.current ? containerRef.current.clientHeight * 0.01 : 0})`}>
            <path 
              d={svgPath} 
              fill="rgba(214, 195, 161, 0.28)"
              stroke="rgba(58, 47, 32, 0.95)"
              strokeWidth="2"
              strokeLinejoin="round" 
            />
          </g>
        </svg>
      ) : (
        <span>Loading map for {region}...</span>
      )}
    </div>
  );
}

export default function ContinentDashboard({
  region,
  onClose,
}: {
  region: string;
  onClose: () => void;
}) {
  const [hoveredArtist, setHoveredArtist] = React.useState<string | null>(null);

  const lineChartOptions = (title: string, color: string) => ({
    title: { 
      text: title, 
      left: "center", 
      textStyle: { fontSize: 16, fontFamily: FONT_FAMILY, color: TITLE_COLOR, fontWeight: 700 } 
    },
    grid: { left: "15%", right: "8%", bottom: "25%", top: "25%" },
    xAxis: {
      type: "category", 
      data: ["1800", "1850", "1900", "1950", "2000"], 
      name: "year",
      nameLocation: "end",
      axisLabel: { fontFamily: FONT_FAMILY, color: TEXT_COLOR, showMinLabel: true, showMaxLabel: true },
      axisLine: {
        show: true,
        symbol: ["none", "arrow"],
        symbolSize: [10, 12],
        lineStyle: { color: TITLE_COLOR, width: 2, cap: "butt" }
      },
      axisTick: { show: false }
    },
    yAxis: { 
      type: "value", 
      name: "count",
      nameLocation: "end",
      axisLabel: { show: false },
      axisLine: {
        show: true,
        symbol: ["none", "arrow"],
        symbolSize: [10, 12],
        lineStyle: { color: TITLE_COLOR, width: 2, cap: "butt" }
      },
      splitLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        data: [120, 170, 150, 152, 180, 240],
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 4, color },
        itemStyle: { color },
      },
    ],
    tooltip: { 
      trigger: "axis",
      textStyle: { fontFamily: FONT_FAMILY } 
    },
  });

  const pieChartOptions = (title: string) => ({
    title: { 
      text: title, 
      left: "center", 
      textStyle: { fontSize: 16, fontFamily: FONT_FAMILY, color: TITLE_COLOR, fontWeight: 700 } 
    },
    tooltip: { 
      trigger: "item",
      textStyle: { fontFamily: FONT_FAMILY } 
    },
    series: [
      {
        name: title,
        type: "pie",
        radius: "84%",
        center: ["50%", "54%"],
        itemStyle: {
          borderColor: TITLE_COLOR,
          borderWidth: 2,
        },
        label: {
          fontFamily: FONT_FAMILY,
          color: TITLE_COLOR,
          fontWeight: 'bold',
          position: 'inner',
          formatter: '{b}'
        },
        data: [
          { value: 1048, name: "A", itemStyle: { color: "#f6f2de" } },
          { value: 735, name: "B", itemStyle: { color: "#f3e0a9" } },
          { value: 580, name: "C", itemStyle: { color: "#ccb575" } },
          { value: 484, name: "D", itemStyle: { color: "#8a7f5f" } },
          { value: 300, name: "Others", itemStyle: { color: "#dcc595" } }
        ]
      },
    ]
  });

  const barChartOptions = () => ({
    title: { 
      text: "Top 10 artist", 
      left: "center", 
      textStyle: { fontSize: 16, fontFamily: FONT_FAMILY, color: TITLE_COLOR, fontWeight: 700 } 
    },
    grid: { left: "15%", right: "8%", bottom: "24%", top: "28%" },
    xAxis: { 
      type: "category", 
      data: TOP_ARTISTS,
      name: "artist",
      nameLocation: "end",
      axisLabel: { show: false },
      axisLine: {
        show: true,
        symbol: ["none", "arrow"],
        symbolSize: [10, 12],
        lineStyle: { color: TITLE_COLOR, width: 2, cap: "butt" }
      },
      axisTick: { show: false }
    },
    yAxis: { 
      type: "value", 
      name: "count",
      min: 0,
      max: 120,
      nameLocation: "end",
      axisLabel: { show: false },
      axisLine: {
        show: true,
        symbol: ["none", "arrow"],
        symbolSize: [10, 12],
        lineStyle: { color: TITLE_COLOR, width: 2, cap: "butt" }
      },
      splitLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        data: [64, 58, 52, 47, 43, 38, 33, 29, 24, 20],
        type: "bar",
        barWidth: "30%",
        itemStyle: { 
          color: "rgba(255, 255, 255, 0)",
          borderColor: TITLE_COLOR,
          borderWidth: 2,
        },
      },
    ],
    tooltip: { trigger: "axis", textStyle: { fontFamily: FONT_FAMILY } },
  });

  return (
    <div className="continent-dashboard">
      <div className="dashboard-header">
        <button className="nav-btn back-btn" onClick={onClose}>
          ← Back to Globe
        </button>
        <h2 className="dashboard-title">{region} Overview</h2>
      </div>

      <div className="dashboard-layout">
        <div className="left-panel">
          <div className="chart-box line-box">
            <EChartComponent option={lineChartOptions("Artwork count", TITLE_COLOR)} style={{ height: "100%", width: "100%" }} />
          </div>
          <div className="chart-box line-box">
            <EChartComponent option={lineChartOptions("Artist count", TITLE_COLOR)} style={{ height: "100%", width: "100%" }} />
          </div>
        </div>

        <div className="center-panel">
          <ContinentMap region={region} />
          {hoveredArtist ? <ArtistOverlay artistName={hoveredArtist} /> : null}
        </div>

        <div className="right-panel">
          <div className="pie-row">
            <div className="chart-box pie-box">
              <EChartComponent option={pieChartOptions("Artwork count")} style={{ height: "100%", width: "100%" }} />
            </div>
            <div className="chart-box pie-box">
              <EChartComponent option={pieChartOptions("Artist count")} style={{ height: "100%", width: "100%" }} />
            </div>
          </div>
          <div className="chart-box bar-box">
            <EChartComponent
              option={barChartOptions()}
              style={{ height: "100%", width: "100%" }}
              onEvents={{
                mouseover: (params: { componentType?: string; seriesType?: string; name?: string }) => {
                  if (params.componentType === "series" && params.seriesType === "bar" && params.name) {
                    setHoveredArtist(params.name);
                  }
                },
                globalout: () => {
                  setHoveredArtist(null);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}