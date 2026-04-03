import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { streamFlowService, type StreamStats, type FilterSettings } from '../services/streamFlowService';
import { 
  Video, VideoOff, Mic, MicOff, Radio, CircleDot, 
  Settings, Camera, Monitor, Volume2, Sliders, Film,
  Play, Square, Download, RefreshCw, Zap
} from 'lucide-react';

const StreamFlow: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stats, setStats] = useState<StreamStats>({
    fps: 0,
    bitrate: 0,
    audioLevel: 0,
    isStreaming: false,
    isRecording: false,
    duration: 0,
  });

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [selectedAudio, setSelectedAudio] = useState<string>('');
  const [rtmpUrl, setRtmpUrl] = useState('rtmp://localhost:1935/live/stream');
  
  const [filters, setFilters] = useState<FilterSettings>({
    brightness: 100,
    contrast: 100,
    blur: 0,
    saturation: 100,
  });

  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  useEffect(() => {
    loadDevices();
    
    const unsubscribe = streamFlowService.onStatsUpdate((newStats) => {
      setStats(newStats);
    });

    return () => {
      unsubscribe();
      streamFlowService.stopPreview();
    };
  }, []);

  const loadDevices = async () => {
    const devices = await streamFlowService.getDevices();
    setVideoDevices(devices.videoInputs);
    setAudioDevices(devices.audioInputs);
    if (devices.videoInputs.length > 0) {
      setSelectedVideo(devices.videoInputs[0].deviceId);
    }
    if (devices.audioInputs.length > 0) {
      setSelectedAudio(devices.audioInputs[0].deviceId);
    }
    setIsInitialized(true);
    addLog('StreamFlow initialized');
    addLog(`Found ${devices.videoInputs.length} video devices, ${devices.audioInputs.length} audio devices`);
  };

  const addLog = (msg: string) => {
    setSystemLogs(prev => [`> [${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 15));
  };

  const startPreview = async () => {
    if (!videoRef.current) return;
    
    const success = await streamFlowService.startPreview(videoRef.current, {
      videoSource: selectedVideo,
      audioSource: selectedAudio,
    });
    
    if (success) {
      setIsPreviewing(true);
      addLog('Preview started');
    } else {
      addLog('Failed to start preview');
    }
  };

  const stopPreview = () => {
    streamFlowService.stopPreview();
    setIsPreviewing(false);
    setIsStreaming(false);
    setIsRecording(false);
    addLog('Preview stopped');
  };

  const startStreaming = async () => {
    if (!isPreviewing) {
      await startPreview();
    }
    
    const success = await streamFlowService.startStreaming(rtmpUrl);
    if (success) {
      setIsStreaming(true);
      addLog(`Streaming started to ${rtmpUrl}`);
    } else {
      addLog('Failed to start streaming');
    }
  };

  const stopStreaming = async () => {
    await streamFlowService.stopStreaming();
    setIsStreaming(false);
    addLog('Streaming stopped');
  };

  const startRecording = async () => {
    if (!isPreviewing) {
      await startPreview();
    }
    
    const success = await streamFlowService.startRecording();
    if (success) {
      setIsRecording(true);
      addLog('Recording started');
    } else {
      addLog('Failed to start recording');
    }
  };

  const stopRecording = async () => {
    const blob = await streamFlowService.stopRecording();
    setIsRecording(false);
    if (blob) {
      streamFlowService.downloadRecording(blob);
      addLog('Recording saved and downloaded');
    }
  };

  const updateFilter = (key: keyof FilterSettings, value: number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    streamFlowService.setFilters(newFilters);
  };

  const captureScreenshot = async () => {
    const dataUrl = await streamFlowService.captureScreenshot();
    if (dataUrl) {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `screenshot_${Date.now()}.png`;
      link.click();
      addLog('Screenshot captured');
    }
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFilterStyle = (): React.CSSProperties => ({
    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) blur(${filters.blur}px) saturate(${filters.saturation}%)`,
  });

  return (
    <div style={{ padding: 'var(--spacing-xl) var(--spacing-xl) 120px var(--spacing-xl)', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px', color: 'white' }}>
            <span style={{ color: 'var(--tony-primary)' }}>Stream</span>
            <span style={{ color: 'var(--tony-secondary)' }}>Flow</span>
          </h1>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '12px' }}>Self-hosted live streaming studio</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Status Indicators */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 12px',
              backgroundColor: isPreviewing ? 'rgba(0, 209, 178, 0.1)' : 'rgba(255,255,255,0.05)',
              borderRadius: '20px', border: `1px solid ${isPreviewing ? 'rgba(0, 209, 178, 0.3)' : 'var(--tony-border)'}`,
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isPreviewing ? '#00D1B2' : 'var(--foreground-muted)' }} />
              <span style={{ fontSize: '10px', color: isPreviewing ? '#00D1B2' : 'var(--foreground-muted)' }}>
                {isPreviewing ? 'PREVIEW' : 'OFF'}
              </span>
            </div>
            
            {isStreaming && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 56, 96, 0.1)',
                borderRadius: '20px', border: '1px solid rgba(255, 56, 96, 0.3)',
                animation: 'pulse 1.5s infinite',
              }}>
                <CircleDot size={8} color="#FF3860" fill="#FF3860" />
                <span style={{ fontSize: '10px', color: '#FF3860', fontWeight: 900 }}>LIVE</span>
              </div>
            )}
            
            {isRecording && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 159, 28, 0.1)',
                borderRadius: '20px', border: '1px solid rgba(255, 159, 28, 0.3)',
              }}>
                <CircleDot size={8} color="#FF9F1C" fill="#FF9F1C" style={{ animation: 'blink 1s infinite' }} />
                <span style={{ fontSize: '10px', color: '#FF9F1C', fontWeight: 900 }}>REC</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        {/* Main Preview Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Video Preview */}
          <GlassCard style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
            <div style={{ 
              width: '100%', 
              aspectRatio: '16/9', 
              backgroundColor: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {isPreviewing ? (
                <video 
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    ...getFilterStyle(),
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--foreground-muted)' }}>
                  <Video size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                  <p>No video source</p>
                  <p style={{ fontSize: '12px' }}>Select input and start preview</p>
                </div>
              )}
            </div>
            
            {/* Overlay Stats */}
            {isPreviewing && (
              <div style={{ 
                position: 'absolute', 
                top: '16px', 
                right: '16px',
                display: 'flex', 
                gap: '12px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '8px 16px',
                borderRadius: '8px',
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>FPS</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--tony-primary)' }}>{stats.fps}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>BITRATE</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: isStreaming ? '#FF3860' : 'white' }}>{stats.bitrate} kbps</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>AUDIO</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: stats.audioLevel > 80 ? '#FF3860' : '#00D1B2' }}>
                    {stats.audioLevel.toFixed(0)}%
                  </div>
                </div>
                {(isStreaming || isRecording) && (
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>DURATION</div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: 'white' }}>{formatDuration(stats.duration)}</div>
                  </div>
                )}
              </div>
            )}

            {/* Audio Level Meter */}
            {isPreviewing && (
              <div style={{ 
                position: 'absolute', 
                bottom: '16px', 
                left: '16px',
                display: 'flex', 
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '8px 12px',
                borderRadius: '8px',
              }}>
                <Volume2 size={16} color="var(--tony-primary)" />
                <div style={{ 
                  width: '100px', 
                  height: '8px', 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{ 
                    width: `${stats.audioLevel}%`, 
                    height: '100%',
                    backgroundColor: stats.audioLevel > 80 ? '#FF3860' : (stats.audioLevel > 60 ? '#FF9F1C' : '#00D1B2'),
                    borderRadius: '4px',
                    transition: 'width 0.1s',
                  }} />
                </div>
              </div>
            )}
          </GlassCard>

          {/* Control Bar */}
          <GlassCard style={{ padding: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Source Selection */}
              <select 
                value={selectedVideo}
                onChange={(e) => setSelectedVideo(e.target.value)}
                style={selectStyle}
              >
                {videoDevices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</option>
                ))}
              </select>
              
              <select 
                value={selectedAudio}
                onChange={(e) => setSelectedAudio(e.target.value)}
                style={selectStyle}
              >
                {audioDevices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>
                ))}
              </select>

              <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--tony-border)' }} />

              {/* Preview Toggle */}
              {!isPreviewing ? (
                <button onClick={startPreview} style={{ ...buttonStyle, backgroundColor: 'var(--tony-primary)', color: 'black' }}>
                  <Play size={16} /> PREVIEW
                </button>
              ) : (
                <button onClick={stopPreview} style={buttonStyle}>
                  <Square size={16} /> STOP
                </button>
              )}

              <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--tony-border)' }} />

              {/* Stream Button */}
              {!isStreaming ? (
                <button 
                  onClick={startStreaming} 
                  disabled={!isPreviewing}
                  style={{ ...buttonStyle, backgroundColor: '#FF3860', color: 'white', opacity: isPreviewing ? 1 : 0.5 }}
                >
                  <Radio size={16} /> GO LIVE
                </button>
              ) : (
                <button onClick={stopStreaming} style={{ ...buttonStyle, backgroundColor: '#FF386020', color: '#FF3860', border: '1px solid #FF3860' }}>
                  <Square size={16} /> END STREAM
                </button>
              )}

              {/* Record Button */}
              {!isRecording ? (
                <button 
                  onClick={startRecording}
                  disabled={!isPreviewing}
                  style={{ ...buttonStyle, backgroundColor: '#FF9F1C20', color: '#FF9F1C', border: '1px solid #FF9F1C', opacity: isPreviewing ? 1 : 0.5 }}
                >
                  <Film size={16} /> RECORD
                </button>
              ) : (
                <button onClick={stopRecording} style={{ ...buttonStyle, backgroundColor: '#FF9F1C', color: 'black' }}>
                  <Square size={16} /> STOP REC
                </button>
              )}

              <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--tony-border)' }} />

              {/* Screenshot */}
              <button 
                onClick={captureScreenshot}
                disabled={!isPreviewing}
                style={{ ...iconButtonStyle, opacity: isPreviewing ? 1 : 0.5 }}
              >
                <Camera size={18} />
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar - Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Stream Settings */}
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Radio size={16} color="var(--tony-secondary)" />
              <span style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '1px', color: 'white' }}>STREAM</span>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '10px', color: 'var(--foreground-muted)', display: 'block', marginBottom: '6px' }}>RTMP URL</label>
              <input 
                type="text"
                value={rtmpUrl}
                onChange={(e) => setRtmpUrl(e.target.value)}
                style={inputStyle}
                placeholder="rtmp://localhost:1935/live/stream"
              />
            </div>
          </GlassCard>

          {/* Video Filters */}
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sliders size={16} color="var(--tony-primary)" />
              <span style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '1px', color: 'white' }}>FILTERS</span>
            </div>

            {Object.entries(filters).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '10px', color: 'var(--foreground-muted)', textTransform: 'capitalize' }}>
                    {key}
                  </label>
                  <span style={{ fontSize: '10px', color: 'var(--tony-primary)', fontFamily: 'monospace' }}>
                    {value}{key === 'blur' ? 'px' : '%'}
                  </span>
                </div>
                <input 
                  type="range"
                  min={key === 'blur' ? 0 : 0}
                  max={key === 'blur' ? 20 : 200}
                  value={value}
                  onChange={(e) => updateFilter(key as keyof FilterSettings, parseFloat(e.target.value))}
                  style={{ ...rangeStyle, accentColor: 'var(--tony-primary)' }}
                />
              </div>
            ))}

            <button 
              onClick={() => {
                setFilters({ brightness: 100, contrast: 100, blur: 0, saturation: 100 });
                streamFlowService.setFilters({ brightness: 100, contrast: 100, blur: 0, saturation: 100 });
                addLog('Filters reset');
              }}
              style={{ ...buttonStyle, width: '100%', fontSize: '10px', padding: '8px' }}
            >
              <RefreshCw size={12} /> RESET FILTERS
            </button>
          </GlassCard>

          {/* System Logs */}
          <GlassCard style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={14} color="var(--tony-secondary)" />
                <span style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '1px', color: 'white' }}>LOGS</span>
              </div>
              <button 
                onClick={() => setSystemLogs([])}
                style={{ fontSize: '9px', color: 'var(--foreground-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                CLEAR
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto' }}>
              {systemLogs.map((log, i) => (
                <div 
                  key={i}
                  style={{ 
                    fontSize: '10px', 
                    fontFamily: 'monospace',
                    color: i === 0 ? 'var(--tony-primary)' : 'var(--foreground-dim)',
                  }}
                >
                  {log}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

const selectStyle: React.CSSProperties = {
  padding: '10px 12px',
  backgroundColor: 'rgba(0,0,0,0.4)',
  border: '1px solid var(--tony-border)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '11px',
  minWidth: '120px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: 'rgba(0,0,0,0.4)',
  border: '1px solid var(--tony-border)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '11px',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--tony-border)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '11px',
  fontWeight: 900,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const iconButtonStyle: React.CSSProperties = {
  padding: '10px',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--tony-border)',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const rangeStyle: React.CSSProperties = {
  width: '100%',
  WebkitAppearance: 'none',
  appearance: 'none',
  background: 'transparent',
  cursor: 'pointer',
};

export default StreamFlow;