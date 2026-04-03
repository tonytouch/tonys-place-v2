import React from 'react';
import { Play, Pause, SkipForward, Volume2, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const FloatingPlayer: React.FC = () => {
  const { isPlaying, setIsPlaying, currentTrack } = useAppStore();

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      right: '24px',
      height: '80px',
      zIndex: 1000,
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div className="glass-card" style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--spacing-xl)',
        justifyContent: 'space-between',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        {/* Track Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            background: 'linear-gradient(45deg, var(--tony-primary), var(--tony-secondary))',
            boxShadow: '0 0 10px var(--tony-primary-glow)'
          }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: '14px' }}>{currentTrack.title}</div>
            <div style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>{currentTrack.artist}</div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button style={{ color: 'var(--foreground-muted)' }}>
            <SkipForward size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--tony-primary)',
              color: 'var(--tony-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />}
          </motion.button>

          <button style={{ color: 'var(--foreground-muted)' }}>
            <SkipForward size={20} />
          </button>
        </div>

        {/* Volume & Extra */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px', justifyContent: 'flex-end' }}>
          <Volume2 size={20} color="var(--foreground-muted)" />
          <div style={{
            width: '100px',
            height: '4px',
            backgroundColor: 'var(--tony-border)',
            borderRadius: '2px',
            position: 'relative'
          }}>
            <div style={{
              width: '80%',
              height: '100%',
              backgroundColor: 'var(--tony-primary)',
              borderRadius: '2px',
              boxShadow: '0 0 5px var(--tony-primary-glow)'
            }} />
          </div>
          <button style={{ color: 'var(--foreground-muted)', marginLeft: '8px' }}>
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingPlayer;
