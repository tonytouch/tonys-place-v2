import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { Mic, Play, Pause, RotateCcw, Sliders } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const DJPortal: React.FC = () => {
  const { isLive, setIsLive } = useAppStore();
  const [alerts, setAlerts] = useState<string[]>([]);

  const addAlert = (msg: string) => {
    setAlerts(prev => [msg, ...prev].slice(0, 5));
  };

  const Deck = ({ id, accent }: { id: string, accent: string }) => (
    <GlassCard style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: accent }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '24px' }}>DECK {id}</h3>
        <div style={{ fontSize: '12px', color: accent, fontWeight: 900 }}>124.0 BPM</div>
      </div>

      <div style={{ 
        width: '100%', 
        height: '200px', 
        borderRadius: '50%', 
        border: `2px solid ${accent}33`,
        margin: '0 auto 32px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ 
            width: '180px', 
            height: '180px', 
            borderRadius: '50%', 
            border: `1px solid ${accent}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: accent }} />
        </motion.div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button 
          onClick={() => addAlert(`Deck ${id}: Resetting loop point...`)}
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white' }}
        >
          <RotateCcw size={20} />
        </button>
        <button 
          onClick={() => addAlert(`Deck ${id}: Track Cued`)}
          style={{ backgroundColor: accent, color: 'black', padding: '12px 24px', borderRadius: '8px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Play size={20} fill="currentColor" /> CUE
        </button>
        <button 
          onClick={() => addAlert(`Deck ${id}: Playback Paused`)}
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white' }}
        >
          <Pause size={20} />
        </button>
      </div>
    </GlassCard>
  );

  return (
    <div style={{ padding: 'var(--spacing-3xl) var(--spacing-xl) 120px var(--spacing-xl)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <div>
          <h1 style={{ fontSize: '48px', marginBottom: '8px' }}>DJ <span style={{ color: 'var(--tony-primary)' }}>PORTAL</span></h1>
          <p style={{ color: 'var(--foreground-muted)' }}>Live broadcast console & engine interaction.</p>
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsLive(!isLive);
            addAlert(isLive ? "Broadcast Terminated" : "Broadcast Live to SRS Node");
          }}
          style={{ 
            backgroundColor: isLive ? 'var(--tony-secondary)' : 'rgba(255,255,255,0.05)', 
            color: isLive ? 'white' : 'var(--foreground-muted)',
            padding: '16px 32px',
            borderRadius: '12px',
            border: isLive ? 'none' : '1px solid var(--tony-border)',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: isLive ? '0 0 20px var(--tony-secondary-glow)' : 'none'
          }}
        >
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: isLive ? 'white' : 'currentColor',
            boxShadow: isLive ? '0 0 10px white' : 'none'
          }} />
          {isLive ? 'GO OFFLINE' : 'GO LIVE'}
        </motion.button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 1fr', gap: '24px', height: '550px', marginBottom: '32px' }}>
        <Deck id="A" accent="#00E5FF" />
        
        {/* Mixer Section */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--spacing-xl) var(--spacing-md)' }}>
          <div style={{ flex: 1, width: '40px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', position: 'relative', marginBottom: '24px', border: '1px solid var(--tony-border)' }}>
            <motion.div 
              drag="y"
              dragConstraints={{ top: 0, bottom: 300 }}
              onDrag={() => addAlert('Crossfader adjusted')}
              style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '-10px', 
                width: '60px', 
                height: '30px', 
                backgroundColor: 'white', 
                borderRadius: '4px',
                cursor: 'ns-resize',
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
              }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <button 
              onMouseDown={() => addAlert('MIC ACTIVE')}
              onMouseUp={() => addAlert('MIC MUTED')}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Mic size={16} /> TALK
            </button>
            <button 
              onClick={() => addAlert('FX Processor triggered')}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Sliders size={16} /> FX
            </button>
          </div>
        </div>

        <Deck id="B" accent="#FF3860" />
      </div>

      <GlassCard style={{ height: '150px', overflowY: 'auto' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--foreground-muted)' }}>SYSTEM LOGS</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {alerts.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.1)', fontSize: '12px' }}>Waiting for interaction...</div>
          ) : (
            alerts.map((a, i) => (
              <div key={i} style={{ fontSize: '12px', fontFamily: 'monospace', color: i === 0 ? 'var(--tony-primary)' : 'var(--foreground-dim)' }}>
                {`> [${new Date().toLocaleTimeString()}] ${a}`}
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default DJPortal;
