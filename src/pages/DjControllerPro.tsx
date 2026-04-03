import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { djControllerService, supportedControllers, type AudioEngine } from '../services/djControllerService';
import { 
  Play, Pause, Square, SkipBack, FastForward, RotateCcw, 
  Mic, Sliders, Volume2, Headphones, Grid3X3, Settings,
  Wifi, Usb, Bluetooth
} from 'lucide-react';

const DjControllerPro: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedController, setSelectedController] = useState<string>('');
  const [selectedMapping, setSelectedMapping] = useState<string>('Generic MIDI');
  const [deckA, setDeckA] = useState<AudioEngine>(djControllerService.getDeckA());
  const [deckB, setDeckB] = useState<AudioEngine>(djControllerService.getDeckB());
  const [masterVolume, setMasterVolume] = useState(djControllerService.getMasterVolume());
  const [crossfader, setCrossfader] = useState(djControllerService.getCrossfader());
  const [padMode, setPadMode] = useState<'hotcue' | 'loop' | 'sampler' | 'stem'>('hotcue');
  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  useEffect(() => {
    djControllerService.initialize().then(() => {
      setIsInitialized(true);
      addLog('DJ Controller initialized');
    });

    const unsubscribe = djControllerService.onStateChange(() => {
      setDeckA(djControllerService.getDeckA());
      setDeckB(djControllerService.getDeckB());
      setMasterVolume(djControllerService.getMasterVolume());
      setCrossfader(djControllerService.getCrossfader());
    });

    // Simulate playback position updates
    const interval = setInterval(() => {
      djControllerService.tick();
    }, 100);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const addLog = (msg: string) => {
    setSystemLogs(prev => [`> [${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));
  };

  const controllers = Object.keys(supportedControllers);
  const mappings = ['Generic MIDI', 'Pioneer DDJ-1000', 'Pioneer DDJ-800', 'Denon DJ MC7000', 'Numark NS7III', 'Roland DJ-505', 'Traktor Kontrol S4', 'Hercules DJControl'];

  const hotcueColors = ['#FF3860', '#FF9F1C', '#00E5FF', '#00D1B2'];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderDeck = (deck: AudioEngine, deckId: 'A' | 'B', accentColor: string) => {
    const isDeckA = deckId === 'A';
    const togglePlay = isDeckA ? () => { djControllerService.togglePlayA(); addLog(`Deck ${deckId}: Play/Pause`); } : () => { djControllerService.togglePlayB(); addLog(`Deck ${deckId}: Play/Pause`); };
    const stop = isDeckA ? () => { djControllerService.stopA(); addLog(`Deck ${deckId}: Stop`); } : () => { djControllerService.stopB(); addLog(`Deck ${deckId}: Stop`); };
    const setPitch = isDeckA ? (v: number) => djControllerService.setPitchA(v) : (v: number) => djControllerService.setPitchB(v);
    const setEq = isDeckA ? (b: 'low'|'mid'|'high', v: number) => djControllerService.setEqA(b, v) : (b: 'low'|'mid'|'high', v: number) => djControllerService.setEqB(b, v);
    const setFilter = isDeckA ? (v: number) => djControllerService.setFilterA(v) : (v: number) => djControllerService.setFilterB(v);
    const triggerHotcue = isDeckA ? (i: number, p: boolean) => djControllerService.triggerHotcueA(i, p) : (i: number, p: boolean) => djControllerService.triggerHotcueB(i, p);
    const sync = isDeckA ? () => { djControllerService.syncA(); addLog(`Deck ${deckId}: Synced to Deck B`); } : () => { djControllerService.syncB(); addLog(`Deck ${deckId}: Synced to Deck A`); };
    const setLoopIn = isDeckA ? () => { djControllerService.setLoopInA(); addLog(`Deck ${deckId}: Loop In set`); } : () => { djControllerService.setLoopInB(); addLog(`Deck ${deckId}: Loop In set`); };
    const setLoopOut = isDeckA ? () => { djControllerService.setLoopOutA(); addLog(`Deck ${deckId}: Loop Out set`); } : () => { djControllerService.setLoopOutB(); addLog(`Deck ${deckId}: Loop Out set`); };

    return (
      <GlassCard style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: accentColor }} />
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '3px', color: accentColor }}>
            DECK {deckId}
          </h3>
          <div style={{ 
            backgroundColor: `${accentColor}20`, 
            padding: '8px 16px', 
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '14px',
            fontWeight: 900,
            color: accentColor
          }}>
            {deck.bpm.toFixed(1)} BPM
          </div>
        </div>

        {/* Waveform Display */}
        <div style={{ 
          height: '80px', 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          borderRadius: '12px', 
          border: `1px solid ${accentColor}33`,
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <svg width="100%" height="100%" viewBox="0 0 400 80" preserveAspectRatio="none">
            <path 
              d={`M 0 40 ${Array.from({length: 100}, (_, i) => `L ${i * 4} ${40 + Math.sin(i * 0.3) * (20 + Math.random() * 10)}`).join(' ')} L 400 40`}
              fill="none"
              stroke={accentColor}
              strokeWidth="1"
              opacity="0.6"
            />
            <rect 
              x={`${(deck.currentPosition / deck.duration) * 400 - 2}`} 
              y="0" 
              width="4" 
              height="80" 
              fill={accentColor}
            />
          </svg>
          <div style={{ position: 'absolute', bottom: '4px', right: '8px', fontSize: '10px', color: accentColor, fontFamily: 'monospace' }}>
            {formatTime(deck.currentPosition)} / {formatTime(deck.duration)}
          </div>
        </div>

        {/* Transport Controls */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
          <button onClick={stop} style={transportButtonStyle}>
            <Square size={18} fill="currentColor" />
          </button>
          <button onClick={togglePlay} style={{ ...transportButtonStyle, backgroundColor: deck.isPlaying ? accentColor : undefined, color: deck.isPlaying ? 'black' : undefined }}>
            {deck.isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button onClick={sync} style={{ ...transportButtonStyle, color: accentColor }}>
            <RotateCcw size={18} />
          </button>
          <button onClick={() => { setLoopIn(); }} style={transportButtonStyle}>
            <span style={{ fontSize: '10px' }}>IN</span>
          </button>
          <button onClick={() => { setLoopOut(); }} style={transportButtonStyle}>
            <span style={{ fontSize: '10px' }}>OUT</span>
          </button>
          <button onClick={sync} style={{ ...transportButtonStyle, color: accentColor }}>
            SYNC
          </button>
        </div>

        {/* Pitch Fader */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>PITCH</span>
            <span style={{ fontSize: '10px', color: accentColor, fontFamily: 'monospace' }}>
              {(deck.pitch * 100).toFixed(1)}%
            </span>
          </div>
          <div style={{ height: '100px', position: 'relative', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
            <input 
              type="range" 
              min="-0.5" 
              max="0.5" 
              step="0.01"
              value={deck.pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              style={{
                ...verticalSliderStyle,
                accentColor,
              }}
            />
            <div style={{ position: 'absolute', bottom: '4px', left: '8px', fontSize: '10px', color: accentColor }}>-50%</div>
            <div style={{ position: 'absolute', top: '4px', left: '8px', fontSize: '10px', color: accentColor }}>+50%</div>
          </div>
        </div>

        {/* EQ Section */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {['high', 'mid', 'low'].map((band) => (
            <div key={band} style={{ flex: 1 }}>
              <div style={{ fontSize: '9px', color: 'var(--foreground-muted)', textAlign: 'center', marginBottom: '4px' }}>
                {band.toUpperCase()}
              </div>
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="0.01"
                value={deck.eqValues[band as keyof typeof deck.eqValues]}
                onChange={(e) => setEq(band as 'low'|'mid'|'high', parseFloat(e.target.value))}
                style={{ ...horizontalSliderStyle, accentColor }}
              />
              <div style={{ fontSize: '9px', textAlign: 'center', color: accentColor, fontFamily: 'monospace' }}>
                {(deck.eqValues[band as keyof typeof deck.eqValues] * 12).toFixed(1)}dB
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '9px', color: 'var(--foreground-muted)', marginBottom: '4px' }}>FILTER</div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={deck.filter}
            onChange={(e) => setFilter(parseFloat(e.target.value))}
            style={{ ...horizontalSliderStyle, accentColor }}
          />
        </div>

        {/* Hotcue Buttons */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--foreground-muted)', marginBottom: '8px' }}>HOTCUES</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <button
                key={i}
                onMouseDown={() => triggerHotcue(i, true)}
                onMouseUp={() => triggerHotcue(i, false)}
                style={{
                  flex: 1,
                  height: '40px',
                  backgroundColor: deck.hotcues[i] !== null ? `${hotcueColors[i]}33` : 'rgba(0,0,0,0.3)',
                  border: `1px solid ${deck.hotcues[i] !== null ? hotcueColors[i] : 'var(--tony-border)'}`,
                  borderRadius: '8px',
                  color: hotcueColors[i],
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>
    );
  };

  const renderMixer = () => (
    <GlassCard style={{ width: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <div style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '2px', marginBottom: '20px', color: 'white' }}>
        MIXER
      </div>

      {/* Channel A Fader */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', color: 'var(--tony-primary)', marginBottom: '8px' }}>CH A</div>
        <div style={{ height: '80px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', position: 'relative' }}>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={deckA.volume}
            onChange={(e) => djControllerService.setVolumeA(parseFloat(e.target.value))}
            style={{ ...verticalSliderStyle, accentColor: 'var(--tony-primary)' }}
          />
        </div>
      </div>

      {/* Crossfader */}
      <div style={{ marginBottom: '20px', width: '100%' }}>
        <div style={{ fontSize: '10px', color: 'var(--foreground-muted)', marginBottom: '8px', textAlign: 'center' }}>XFADER</div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01"
          value={crossfader}
          onChange={(e) => djControllerService.setCrossfader(parseFloat(e.target.value))}
          style={{ ...horizontalSliderStyle, width: '100%', accentColor: 'white' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '4px' }}>
          <span style={{ color: 'var(--tony-primary)' }}>A</span>
          <span style={{ color: 'var(--tony-secondary)' }}>B</span>
        </div>
      </div>

      {/* Channel B Fader */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', color: 'var(--tony-secondary)', marginBottom: '8px' }}>CH B</div>
        <div style={{ height: '80px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', position: 'relative' }}>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={deckB.volume}
            onChange={(e) => djControllerService.setVolumeB(parseFloat(e.target.value))}
            style={{ ...verticalSliderStyle, accentColor: 'var(--tony-secondary)' }}
          />
        </div>
      </div>

      {/* Master Volume */}
      <div style={{ width: '100%' }}>
        <div style={{ fontSize: '10px', color: 'var(--foreground-muted)', marginBottom: '8px' }}>MASTER</div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01"
          value={masterVolume}
          onChange={(e) => djControllerService.setMasterVolume(parseFloat(e.target.value))}
          style={{ ...horizontalSliderStyle, width: '100%', accentColor: 'var(--tony-primary)' }}
        />
      </div>

      {/* Level Meters */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '20px', width: '100%' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '8px', color: 'var(--foreground-muted)', textAlign: 'center' }}>L</div>
          <div style={{ height: '60px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '2px', padding: '4px' }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  height: '4px', 
                  backgroundColor: i > 7 ? '#FF3860' : (i > 5 ? '#FF9F1C' : 'var(--tony-primary)'),
                  borderRadius: '2px',
                  opacity: masterVolume * (i + 1) / 10
                }} 
              />
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '8px', color: 'var(--foreground-muted)', textAlign: 'center' }}>R</div>
          <div style={{ height: '60px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '2px', padding: '4px' }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  height: '4px', 
                  backgroundColor: i > 7 ? '#FF3860' : (i > 5 ? '#FF9F1C' : 'var(--tony-primary)'),
                  borderRadius: '2px',
                  opacity: masterVolume * (i + 1) / 10
                }} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mic & FX Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '20px', width: '100%' }}>
        <button onMouseDown={() => addLog('MIC ACTIVE')} onMouseUp={() => addLog('MIC MUTED')} style={{ ...smallButtonStyle, flex: 1 }}>
          <Mic size={14} /> TALK
        </button>
        <button onClick={() => addLog('FX triggered')} style={{ ...smallButtonStyle, flex: 1 }}>
          <Sliders size={14} /> FX
        </button>
      </div>
    </GlassCard>
  );

  const renderPerformancePads = () => (
    <GlassCard style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '2px', color: 'white' }}>
          PERFORMANCE PADS
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['hotcue', 'loop', 'sampler', 'stem'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => { setPadMode(mode); addLog(`Pad mode: ${mode}`); }}
              style={{
                padding: '8px 12px',
                backgroundColor: padMode === mode ? 'var(--tony-primary)20' : 'transparent',
                border: `1px solid ${padMode === mode ? 'var(--tony-primary)' : 'var(--tony-border)'}`,
                borderRadius: '8px',
                color: padMode === mode ? 'var(--tony-primary)' : 'var(--foreground-muted)',
                fontSize: '10px',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {Array.from({ length: 16 }).map((_, i) => {
          const colors = ['#FF3860', '#FF9F1C', '#00E5FF', '#00D1B2'];
          const color = colors[i % 4];
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => addLog(`Pad ${i + 1} (${padMode}) triggered`)}
              style={{
                height: '60px',
                backgroundColor: `${color}15`,
                border: `1px solid ${color}66`,
                borderRadius: '12px',
                color: color,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Grid3X3 size={24} />
            </motion.button>
          );
        })}
      </div>
    </GlassCard>
  );

  return (
    <div style={{ padding: 'var(--spacing-xl) var(--spacing-xl) 120px var(--spacing-xl)', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px', color: 'white' }}>
            DJ <span style={{ color: 'var(--tony-primary)' }}>CONTROLLER</span>
            <span style={{ color: 'var(--tony-secondary)' }}> PRO</span>
          </h1>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '12px' }}>World-class mixing interface</p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: isInitialized ? 'rgba(0, 209, 178, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          border: `1px solid ${isInitialized ? 'rgba(0, 209, 178, 0.3)' : 'var(--tony-border)'}`,
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: isInitialized ? '#00D1B2' : '#FF9F1C' 
          }} />
          <span style={{ 
            fontSize: '11px', 
            fontFamily: 'monospace', 
            color: isInitialized ? '#00D1B2' : '#FF9F1C' 
          }}>
            {isInitialized ? 'READY' : 'INITIALIZING'}
          </span>
        </div>
      </header>

      {/* Controller Connection Panel */}
      <GlassCard style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Usb size={18} color="var(--tony-secondary)" />
          <span style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '2px', color: 'white' }}>
            CONTROLLER CONNECTION
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <select 
            value={selectedController}
            onChange={(e) => { setSelectedController(e.target.value); addLog(`Controller: ${e.target.value}`); }}
            style={selectStyle}
          >
            <option value="">Select a controller...</option>
            {controllers.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select 
            value={selectedMapping}
            onChange={(e) => { 
              setSelectedMapping(e.target.value); 
              djControllerService.setSelectedMapping(e.target.value);
              addLog(`Mapping: ${e.target.value}`);
            }}
            style={selectStyle}
          >
            {mappings.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Connected Devices */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {djControllerService.getDevices().map((device) => (
            <div 
              key={device.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: device.isConnected ? 'rgba(0, 209, 178, 0.1)' : 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                border: `1px solid ${device.isConnected ? 'rgba(0, 209, 178, 0.3)' : 'var(--tony-border)'}`,
              }}
            >
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: device.isConnected ? '#00D1B2' : 'var(--foreground-muted)' 
              }} />
              <span style={{ fontSize: '11px', color: 'white' }}>{device.name}</span>
              <span style={{ fontSize: '9px', color: 'var(--foreground-muted)', fontFamily: 'monospace' }}>
                VID:{device.vendorId.toString(16).toUpperCase()} PID:{device.productId.toString(16).toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Main DJ Interface */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        {renderDeck(deckA, 'A', '#00D5FF')}
        {renderMixer()}
        {renderDeck(deckB, 'B', '#FF3860')}
      </div>

      {/* Performance Pads */}
      {renderPerformancePads()}

      {/* System Logs */}
      <GlassCard style={{ marginTop: '24px', height: '120px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>SYSTEM LOGS</h4>
          <button onClick={() => setSystemLogs([])} style={{ fontSize: '10px', color: 'var(--foreground-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            CLEAR
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {systemLogs.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.1)', fontSize: '11px' }}>Waiting for interaction...</div>
          ) : (
            systemLogs.map((log, i) => (
              <div 
                key={i} 
                style={{ 
                  fontSize: '11px', 
                  fontFamily: 'monospace', 
                  color: i === 0 ? 'var(--tony-primary)' : 'var(--foreground-dim)' 
                }}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};

// Styles
const transportButtonStyle: React.CSSProperties = {
  width: '44px',
  height: '44px',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--tony-border)',
  borderRadius: '12px',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const verticalSliderStyle: React.CSSProperties = {
  position: 'absolute',
  width: '100px',
  height: '6px',
  transform: 'rotate(-90deg)',
  transformOrigin: 'center',
  left: 'calc(50% - 50px)',
  top: 'calc(50% - 3px)',
  WebkitAppearance: 'none',
  appearance: 'none',
  background: 'transparent',
  cursor: 'ns-resize',
};

const horizontalSliderStyle: React.CSSProperties = {
  width: '100%',
  WebkitAppearance: 'none',
  appearance: 'none',
  background: 'transparent',
  cursor: 'ew-resize',
};

const smallButtonStyle: React.CSSProperties = {
  padding: '10px',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--tony-border)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '10px',
  fontWeight: 900,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
};

const selectStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px 16px',
  backgroundColor: 'rgba(0,0,0,0.4)',
  border: '1px solid var(--tony-border)',
  borderRadius: '12px',
  color: 'white',
  fontSize: '12px',
  cursor: 'pointer',
};

export default DjControllerPro;