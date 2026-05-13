import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Home from './pages/Home';
import Admin from './pages/Admin';
import AnimeDetails from './pages/AnimeDetails';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="bg-mesh"></div>
        <Helmet>
          <title>AnimeStream | Watch Anime Online Free in HD - Sub & Dub</title>
          <meta name="description" content="Watch anime online free in HD with sub & dub. Fast streaming servers, clean interface, no sign-up required and daily updates. Watch One Piece, Solo Leveling, and more!" />
          <meta name="keywords" content="anime, watch anime, online anime, free anime, hd anime, sub, dub, streaming, solo leveling, one piece" />
          <link rel="canonical" href="https://animestream.example.com" />
          <meta property="og:title" content="AnimeStream | Watch Anime Online Free in HD" />
          <meta property="og:description" content="Fast streaming, clean interface, no sign-up required. Daily updates." />
          <meta property="og:type" content="website" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Helmet>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
