import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import "./styles.css";

const GlobeViewport = React.lazy(() => import("./GlobeViewport"));
const ContinentDashboard = React.lazy(() => import("./ContinentDashboard"));

const tabs = [
  { label: "Homepage", to: "/" },
  { label: "Distribution", to: "/distribution" },
  { label: "Artist Comparison", to: "/artist-comparison" },
  { label: "Story", to: "/story" },
];

function NavigationBar() {
  return (
    <nav className="nav-bar" aria-label="Primary">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === "/"}
          className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="home-page">
      <div className="paper-layer" />
      <section className="page-stack">
        <NavigationBar />
        <section className="frame">{children}</section>
      </section>
    </main>
  );
}

function HomepageView() {
  const [mode, setMode] = React.useState("Artwork");
  const [year, setYear] = React.useState(1920);
  const [selectedContinent, setSelectedContinent] = React.useState<string | null>(null);

  if (selectedContinent) {
    return (
      <AppFrame>
        <React.Suspense fallback={<div className="globe-loading-mask">Loading...</div>}>
          <ContinentDashboard region={selectedContinent} onClose={() => setSelectedContinent(null)} />
        </React.Suspense>
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <section className="canvas-shell">
        <aside className="mode-panel">
          <p className="panel-label">Mode Selection</p>
          <div className="toggle-row" role="group" aria-label="Mode selection">
            {[
              { key: "Artwork", label: "Artwork" },
              { key: "Artist", label: "Artist" },
            ].map((item) => (
              <button
                type="button"
                key={item.key}
                className={`toggle-btn ${mode === item.key ? "active" : ""}`}
                onClick={() => setMode(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="globe-stage">
          <React.Suspense
            fallback={
              <div className="globe-wrap real-globe">
                <div className="globe-loading-mask" role="status" aria-live="polite">
                  Loading....
                </div>
              </div>
            }
          >
            <GlobeViewport onContinentDoubleClick={setSelectedContinent} />
          </React.Suspense>
        </section>

        <aside className="info-panel">
          <h2>{mode} Introduction</h2>
          <div className="preview-slot">No Image</div>
          <p className="info-title">Name: --</p>
          <p className="info-copy">Content placeholder. Data will be displayed here once available.</p>
        </aside>

        <section className="timeline-panel">
          <span className="timeline-mark">18xx</span>
          <input
            type="range"
            min={1800}
            max={2099}
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            aria-label="Year timeline"
          />
          <span className="timeline-mark">20xx</span>
          <strong className="timeline-focus">{year}</strong>
        </section>
      </section>
    </AppFrame>
  );
}

function EmptyPage({ title }: { title: string }) {
  return (
    <AppFrame>
      <section className="empty-page" aria-label={`${title} content placeholder`} />
    </AppFrame>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomepageView />} />
        <Route path="/distribution" element={<EmptyPage title="Distribution" />} />
        <Route path="/artist-comparison" element={<EmptyPage title="Artist Comparison" />} />
        <Route path="/story" element={<EmptyPage title="Story" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);