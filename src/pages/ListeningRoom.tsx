import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { MessageSquare, Send, Music, List, History } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';

const ListeningRoom: React.FC = () => {
  const { isPlaying, currentTrack, setCurrentTrack, messages, addMessage, setActiveStationTab } = useAppStore();
  const [history, setHistory] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNowPlaying = () => {
      fetch('/api/radio/now-playing')
        .then(res => res.json())
        .then(data => {
          if (data.now_playing?.song) {
            const track = data.now_playing.song;
            setCurrentTrack(track.title, track.artist, track.audio_url);
          }
          if (data.song_history) {
            setHistory(data.song_history);
          }
        })
        .catch(err => console.error('Failed to fetch now playing:', err));
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 10000);
    return () => clearInterval(interval);
  }, [setCurrentTrack]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      addMessage('TONY', chatInput);
      setChatInput('');
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-3xl) var(--spacing-xl) 120px var(--spacing-xl)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        
        {/* Main Player Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass-card" style={{ 
              height: '500px', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(180deg, rgba(0,209,178,0.05) 0%, rgba(0,0,0,0) 100%)'
            }}>
              {/* Visualizer Placeholder */}
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '8px',
                zIndex: 0,
                opacity: 0.3
              }}>
                {isPlaying && [...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [40, Math.random() * 200 + 40, 40] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.05 }}
                    style={{ width: '4px', backgroundColor: 'var(--tony-primary)', borderRadius: '2px' }}
                  />
                ))}
              </div>

              <div style={{ zIndex: 1, textAlign: 'center' }}>
                <div style={{ 
                  width: '240px', 
                  height: '240px', 
                  borderRadius: '50%', 
                  background: isPlaying ? 'linear-gradient(45deg, var(--tony-primary), var(--tony-secondary))' : 'rgba(255,255,255,0.05)',
                  marginBottom: '32px',
                  boxShadow: isPlaying ? '0 0 50px var(--tony-primary-glow)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.5s ease'
                }}>
                  <Music size={80} color={isPlaying ? 'var(--tony-dark)' : 'var(--foreground-muted)'} />
                </div>
                <h2 style={{ fontSize: '48px', marginBottom: '8px' }}>{currentTrack.title}</h2>
                <p style={{ color: 'var(--tony-primary)', fontSize: '18px', fontWeight: 700, letterSpacing: '2px' }}>{currentTrack.artist}</p>
              </div>
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <List size={20} color="var(--tony-primary)" />
                <h3 style={{ fontSize: '20px' }}>AI QUEUE</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,209,178,0.05)', border: '1px dashed var(--tony-primary-glow)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--tony-primary)', fontWeight: 900, marginBottom: '4px' }}>AI SELECTING...</div>
                  <div style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>Analyzing mood & sentiment for next transition</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <History size={20} color="var(--tony-secondary)" />
                <h3 style={{ fontSize: '20px' }}>RECENT PLAYS</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.slice(0, 3).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', opacity: 0.6 }}>
                    <div style={{ maxWidth: '70%', overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>{item.artist}</div>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>{item.played_at ? new Date(item.played_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'JUST NOW'}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Sidebar / Chat Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <GlassCard style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: 'var(--spacing-sm)' }}>
              <MessageSquare size={20} color="var(--tony-primary)" />
              <h3 style={{ fontSize: '20px' }}>COMMUNITY CHAT</h3>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', padding: '0 var(--spacing-sm)' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0,209,178,0.05)', border: '1px solid rgba(0,209,178,0.1)', marginBottom: '8px' }}>
                <span style={{ color: 'var(--tony-primary)', fontWeight: 900, fontSize: '10px', display: 'block', marginBottom: '4px' }}>🤖 AI AUTO-DJ SYSTEM</span>
                <p style={{ color: 'var(--foreground)', fontSize: '12px', fontStyle: 'italic' }}>"Selecting next high-fidelity track based on current mood..."</p>
              </div>
              {messages.map((c, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ color: 'var(--tony-primary)', fontWeight: 900, fontSize: '12px' }}>{c.user}</span>
                    <span style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>{c.time}</span>
                  </div>
                  <p style={{ color: 'var(--foreground-dim)', fontSize: '14px' }}>{c.msg}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              style={{ position: 'relative' }}
            >
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Say something..." 
                style={{ 
                  width: '100%', 
                  backgroundColor: 'rgba(0,0,0,0.3)', 
                  border: '1px solid var(--tony-border)', 
                  borderRadius: '12px',
                  padding: '12px 40px 12px 16px',
                  color: 'white',
                  fontFamily: 'inherit'
                }} 
              />
              <button 
                type="submit"
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--tony-primary)', background: 'none' }}
              >
                <Send size={18} />
              </button>
            </form>
          </GlassCard>

          <GlassCard>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>SEND A REQUEST</h3>
            <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginBottom: '16px' }}>Support the artists and request a track from our vault.</p>
            <button 
              className="primary-button" 
              style={{ width: '100%', padding: '12px' }}
              onClick={() => {
                setActiveStationTab('media');
                navigate('/station-os');
              }}
            >
              OPEN VAULT
            </button>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default ListeningRoom;
