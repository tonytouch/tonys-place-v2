import React, { useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import TickerBar from './components/TickerBar';
import FloatingPlayer from './components/FloatingPlayer';
import ShoppingBag from './components/ShoppingBag';
import { useAppStore } from './store/useAppStore';

// Pages
import Home from './pages/Home';
import ListeningRoom from './pages/ListeningRoom';
import StationOS from './pages/StationOS';
import Shop from './pages/Shop';
import DJPortal from './pages/DJPortal';
import DjControllerPro from './pages/DjControllerPro';
import StreamFlow from './pages/StreamFlow';
import AIInsights from './pages/AIInsights';
import TradingBot from './pages/TradingBot';
import DrinkChain from './pages/DrinkChain';
import Account from './pages/Account';

const App: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isPlaying, currentTrack, setCurrentTrack } = useAppStore();

  // API base URL - uses environment variable or production backend
  const apiBase = window.location.origin === 'https://tonysplace.co.uk'
    ? 'https://tonys-place-backend.onrender.com'
    : window.location.origin;

  useEffect(() => {
    // Initial fetch to get the current stream URL
    fetch(`${apiBase}/api/radio/now-playing`)
      .then(res => res.json())
      .then(data => {
        if (data.now_playing?.song) {
          const track = data.now_playing.song;
          setCurrentTrack(track.title, track.artist, track.audio_url);
        }
      })
      .catch(err => console.error('Initial fetch failed:', err));
  }, [setCurrentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && currentTrack.audioUrl) {
        const fullUrl = currentTrack.audioUrl.startsWith('http') 
          ? currentTrack.audioUrl 
          : `${apiBase}${currentTrack.audioUrl}`;

        if (audioRef.current.src !== fullUrl) {
          audioRef.current.src = fullUrl;
        }
        audioRef.current.play().catch(err => console.error('Playback failed:', err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack.audioUrl, apiBase]);
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--tony-dark)' }}>
        <audio ref={audioRef} />
        <TickerBar />
        <Header />
        <main style={{ paddingTop: '100px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listening-room" element={<ListeningRoom />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/dj-portal" element={<DJPortal />} />
            <Route path="/dj-controller-pro" element={<DjControllerPro />} />
            <Route path="/streamflow" element={<StreamFlow />} />
            <Route path="/station-os" element={<StationOS />} />
            <Route path="/ai" element={<AIInsights />} />
            <Route path="/trading" element={<TradingBot />} />
            <Route path="/cocktail-builder" element={<DrinkChain />} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </main>
        <FloatingPlayer />
        <ShoppingBag />
        </div>
        </Router>
  );
};

export default App;
