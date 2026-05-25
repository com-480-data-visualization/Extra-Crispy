/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Distribution from './pages/Distribution';
import CountryDetails from './pages/CountryDetails';
import ContinentDetails from './pages/ContinentDetails';
import ArtistComparison from './pages/ArtistComparison';
import EpilogueStory from './pages/EpilogueStory';
import IntroAnimation from './components/IntroAnimation';

export type ViewMode = 'artworks' | 'artists';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <Router basename={import.meta.env.BASE_URL}>
      {showIntro ? (
        <IntroAnimation onComplete={() => setShowIntro(false)} />
      ) : (
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/distribution" element={<Distribution />} />
          <Route path="/country/:countryName" element={<CountryDetails />} />
          <Route path="/continent/:continentName" element={<ContinentDetails />} />
          <Route path="/artist-comparison" element={<ArtistComparison />} />
          <Route path="/epilogue" element={<EpilogueStory />} />
        </Routes>
      )}
    </Router>
  );
}
