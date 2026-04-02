import React from "react";
import Globe from "react-globe.gl";
import type { GlobeMethods } from "react-globe.gl";

type GeoFeature = {
  type: string;
  id?: string | number;
  properties?: Record<string, unknown>;
  geometry: unknown;
};

type TopologyObject = {
  type: string;
  objects: {
    countries?: unknown;
  };
};

type CountryRecord = {
  ccn3?: string;
  region?: string;
  name?: {
    common?: string;
  };
};

type IdleDeadlineLike = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

function createSolidOceanTexture(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d");

  if (!context) {
    return "";
  }

  context.fillStyle = "#4b8fca";
  context.fillRect(0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/png");
}

function getCountryInfo(feature: GeoFeature, infoByNumericId: Map<string, { name: string; region: string }>) {
  let numericCode = "";
  if (typeof feature.id === "number") {
    numericCode = String(feature.id).padStart(3, "0");
  } else if (typeof feature.id === "string") {
    numericCode = feature.id.padStart(3, "0");
  } else {
    return { name: "Unknown Country", region: "Unknown" };
  }

  return infoByNumericId.get(numericCode) ?? { name: `Country ${numericCode}`, region: "Unknown" };
}

async function loadCountriesData(): Promise<{
  countries: GeoFeature[];
}> {
  const [{ feature }, worldAtlasModule] = await Promise.all([
    import("topojson-client"),
    import("world-atlas/countries-50m.json"),
  ]);

  const topology = worldAtlasModule.default as unknown as TopologyObject;
  const countriesObject = topology.objects.countries;

  let countries: GeoFeature[] = [];
  if (countriesObject) {
    const collection = feature(topology as never, countriesObject as never) as unknown;
    if (typeof collection === "object" && collection !== null) {
      const maybe = collection as { features?: unknown };
      if (Array.isArray(maybe.features)) {
        countries = maybe.features as GeoFeature[];
      }
    }
  }

  return { countries };
}

async function loadCountryInfoMap(): Promise<Map<string, { name: string; region: string }>> {
  const worldCountriesModule = await import("world-countries");
  const records = worldCountriesModule.default as unknown as CountryRecord[];
  const infoByNumericId = new Map<string, { name: string; region: string }>();

  for (const item of records) {
    if (!item.ccn3 || !item.name?.common) {
      continue;
    }
    infoByNumericId.set(item.ccn3.padStart(3, "0"), {
      name: item.name.common,
      region: item.region || "Unknown",
    });
  }

  return infoByNumericId;
}

export default function GlobeViewport({ onContinentDoubleClick }: { onContinentDoubleClick?: (region: string) => void }) {
  const [countries, setCountries] = React.useState<GeoFeature[]>([]);
  const [infoByNumericId, setInfoByNumericId] = React.useState<Map<string, { name: string; region: string }>>(new Map());
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  const [isGlobeReady, setIsGlobeReady] = React.useState(false);
  const [globeSize, setGlobeSize] = React.useState(560);
  const [hoveredRegion, setHoveredRegion] = React.useState<string | null>(null);
  const clickRecordRef = React.useRef<{ time: number; featureId: string | number } | null>(null);

  const globeRef = React.useRef<GlobeMethods>();
  const globeHostRef = React.useRef<HTMLDivElement | null>(null);
  const oceanTextureUrl = React.useMemo(() => createSolidOceanTexture(), []);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { countries: nextCountries } = await loadCountriesData();
        if (cancelled) {
          return;
        }
        setCountries(nextCountries);
      } finally {
        if (!cancelled) {
          setIsDataLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const startLoadingNames = () => {
      void loadCountryInfoMap().then((infoMap) => {
        if (!cancelled) {
          setInfoByNumericId(infoMap);
        }
      });
    };

    let timeoutId: number | undefined;
    let idleId: number | undefined;
    const maybeWindow = window as Window & {
      requestIdleCallback?: (callback: (deadline: IdleDeadlineLike) => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof maybeWindow.requestIdleCallback === "function") {
      idleId = maybeWindow.requestIdleCallback(() => startLoadingNames(), { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(() => startLoadingNames(), 180);
    }

    return () => {
      cancelled = true;
      if (typeof timeoutId === "number") {
        window.clearTimeout(timeoutId);
      }
      if (typeof idleId === "number" && typeof maybeWindow.cancelIdleCallback === "function") {
        maybeWindow.cancelIdleCallback(idleId);
      }
    };
  }, []);

  React.useEffect(() => {
    const host = globeHostRef.current;
    if (!host) {
      return;
    }

    const updateSize = () => {
      const nextSize = Math.max(320, Math.min(host.clientWidth - 10, 760));
      setGlobeSize((current) => (current === nextSize ? current : nextSize));
    };

    updateSize();

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(host);

    return () => observer.disconnect();
  }, []);

  const configureGlobe = React.useCallback(() => {
    if (!globeRef.current) {
      return;
    }

    globeRef.current.pointOfView({ lat: 28, lng: 16, altitude: 1.9 }, 0);
    const controls = globeRef.current.controls();
    controls.enableZoom = true;
    controls.zoomSpeed = 0.9;
    controls.rotateSpeed = 0.55;
    controls.minDistance = 130;
    controls.maxDistance = 430;
    setIsGlobeReady(true);
  }, []);

  const isLoading = isDataLoading || !isGlobeReady;

  return (
    <>
      <div className="globe-wrap real-globe" ref={globeHostRef}>
        {isLoading ? (
          <div className="globe-loading-mask" role="status" aria-live="polite">
            Loading....
          </div>
        ) : null}

        <Globe
          ref={globeRef}
          width={globeSize}
          height={globeSize}
          globeImageUrl={oceanTextureUrl}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere={false}
          polygonsData={countries}
          polygonCapColor={(feat) => {
            const { region } = getCountryInfo(feat as GeoFeature, infoByNumericId);
            return hoveredRegion && hoveredRegion === region ? "rgba(238, 219, 175, 0.95)" : "rgba(214, 195, 161, 0.95)";
          }}
          polygonSideColor={() => "rgba(0, 0, 0, 0)"}
          polygonStrokeColor={(feat) => {
            const { region } = getCountryInfo(feat as GeoFeature, infoByNumericId);
            return hoveredRegion && hoveredRegion === region ? "rgba(255, 255, 255, 1)" : "rgba(249, 245, 237, 1)";
          }}
          polygonAltitude={(feat) => {
            const { region } = getCountryInfo(feat as GeoFeature, infoByNumericId);
            return hoveredRegion && hoveredRegion === region ? 0.008 : 0.0042;
          }}
          polygonCapCurvatureResolution={2}
          polygonsTransitionDuration={200}
          polygonLabel={(feature) => getCountryInfo(feature as GeoFeature, infoByNumericId).name}
          onPolygonHover={(feat) => {
            if (feat) {
              const { region } = getCountryInfo(feat as GeoFeature, infoByNumericId);
              setHoveredRegion(region !== "Unknown" ? region : null);
            } else {
              setHoveredRegion(null);
            }
          }}
          onPolygonClick={(feat) => {
            const f = feat as GeoFeature;
            if (!f.id) return;
            const now = Date.now();
            const last = clickRecordRef.current;
            if (last && last.featureId === f.id && now - last.time < 400) {
              // Double click detected
              const { region } = getCountryInfo(f, infoByNumericId);
              if (region !== "Unknown" && onContinentDoubleClick) {
                onContinentDoubleClick(region);
              }
              clickRecordRef.current = null;
            } else {
              clickRecordRef.current = { time: now, featureId: f.id };
            }
          }}
          onGlobeReady={configureGlobe}
        />
      </div>
      {/* <p className="globe-note">Real borders loaded: {countries.length} countries</p> */}
    </>
  );
}
