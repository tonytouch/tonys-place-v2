import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { 
  Music, 
  Users, 
  Calendar, 
  Radio, 
  Settings, 
  Database, 
  BarChart3, 
  FileText,
  Layers
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const tabs = [
  { id: 'media', label: 'Media Vault', icon: Music },
  { id: 'insights', label: 'Data Insights', icon: Layers },
  { id: 'playlists', label: 'Playlists', icon: Database },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'streamers', label: 'Streamers', icon: Radio },
  { id: 'subscribers', label: 'Listeners', icon: Users },
  { id: 'stats', label: 'Analytics', icon: BarChart3 },
  { id: 'logs', label: 'Logs', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const StationOS: React.FC = () => {
  const { activeStationTab: activeTab, setActiveStationTab: setActiveTab } = useAppStore();
  const [unifiedStats, setUnifiedStats] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    fetch('/api/unified/stats')
      .then(res => res.json())
      .then(data => setUnifiedStats(data))
      .catch(err => console.error('Failed to fetch unified stats:', err));
  }, []);

  useEffect(() => {
    if (activeTab === 'media') {
      setLoadingMedia(true);
      fetch('/api/station-os/media')
        .then(res => res.json())
        .then(data => {
          setMedia(data);
          setLoadingMedia(false);
        })
        .catch(err => {
          console.error('Failed to fetch media:', err);
          setLoadingMedia(false);
        });
    }
  }, [activeTab]);

  return (
    <div style={{ padding: 'var(--spacing-3xl) var(--spacing-xl) 120px var(--spacing-xl)' }}>
      <header style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '8px' }}>STATION OS <span style={{ color: 'var(--tony-primary)' }}>v2.0</span></h1>
        <p style={{ color: 'var(--foreground-muted)' }}>Advanced broadcast management & engine control</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px' }}>
        
        {/* Tab Navigation */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: activeTab === tab.id ? 'var(--tony-primary)' : 'rgba(255,255,255,0.03)',
                color: activeTab === tab.id ? 'var(--tony-dark)' : 'var(--foreground-muted)',
                fontWeight: activeTab === tab.id ? 700 : 400,
                transition: 'all 0.2s ease',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <tab.icon size={18} />
              <span style={{ fontSize: '14px' }}>{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard style={{ minHeight: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', textTransform: 'uppercase' }}>{activeTab.replace('_', ' ')}</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="secondary-button" 
                    style={{ padding: '8px 16px', fontSize: '10px' }}
                    onClick={() => alert(`Exporting ${activeTab} data as CSV...`)}
                  >
                    EXPORT
                  </button>
                  <button 
                    className="primary-button" 
                    style={{ padding: '8px 16px', fontSize: '10px' }}
                    onClick={() => alert(`Opening modal to add new ${activeTab} entry...`)}
                  >
                    + ADD NEW
                  </button>
                </div>
              </div>

              {activeTab === 'insights' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                  <GlassCard style={{ background: 'rgba(0,209,178,0.05)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--tony-primary)', fontWeight: 900, marginBottom: '8px' }}>TOTAL AGGREGATED TRACKS</div>
                    <div style={{ fontSize: '48px', fontWeight: 900 }}>{unifiedStats?.total_tracks || '...'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: '8px' }}>Across all databases</div>
                  </GlassCard>
                  <GlassCard>
                    <div style={{ fontSize: '12px', color: 'var(--foreground-dim)', fontWeight: 900, marginBottom: '8px' }}>FLUTTER DB MEDIA</div>
                    <div style={{ fontSize: '32px', fontWeight: 900 }}>{unifiedStats?.flutter_tracks || '...'}</div>
                    <div style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>tonys_place_flutter</div>
                  </GlassCard>
                  <GlassCard>
                    <div style={{ fontSize: '12px', color: 'var(--foreground-dim)', fontWeight: 900, marginBottom: '8px' }}>RADIO DB MEDIA</div>
                    <div style={{ fontSize: '32px', fontWeight: 900 }}>{unifiedStats?.radio_tracks || '...'}</div>
                    <div style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>tonys_radio_db</div>
                  </GlassCard>
                  <GlassCard style={{ gridColumn: 'span 3' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>SYSTEM HEALTH</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {unifiedStats?.databases?.map((db: string) => (
                        <div key={db} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--tony-primary)' }} />
                          <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{db}: CONNECTED</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}

              {activeTab === 'media' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {loadingMedia ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--tony-primary)' }} className="neon-text">ACCESSING MEDIA VAULT...</div>
                  ) : Array.isArray(media) ? (
                    <>
                      {media.slice(0, 50).map((item) => (
                        <div key={item.id} style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '48px 1fr 150px 100px 80px',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '16px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '4px', 
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            backgroundImage: item.art_url ? `url(${item.art_url})` : 'none',
                            backgroundSize: 'cover'
                          }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                            <div style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>{item.artist}</div>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--foreground-dim)' }}>{item.genre || 'Uncategorized'}</div>
                          <div style={{ 
                            fontSize: '10px', 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            backgroundColor: 'rgba(0,209,178,0.1)', 
                            color: 'var(--tony-primary)',
                            textAlign: 'center',
                            fontWeight: 900
                          }}>{item.mime_type?.split('/').pop()?.toUpperCase() || 'AUDIO'}</div>
                          <button style={{ color: 'var(--foreground-muted)', fontSize: '12px' }}>EDIT</button>
                        </div>
                      ))}
                      {media.length > 50 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--foreground-muted)', fontSize: '12px' }}>
                          + {media.length - 50} more tracks in vault
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--foreground-muted)' }}>No media records found in database.</div>
                  )}
                </div>
              )}

              {activeTab !== 'insights' && activeTab !== 'media' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '48px 1fr 150px 100px 80px',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>SYSTEM ENTITY {i}</div>
                        <div style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>Metadata information string</div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--foreground-dim)' }}>2026-04-03 14:30</div>
                      <div style={{ 
                        fontSize: '10px', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        backgroundColor: 'rgba(0,209,178,0.1)', 
                        color: 'var(--tony-primary)',
                        textAlign: 'center',
                        fontWeight: 900
                      }}>ACTIVE</div>
                      <button style={{ color: 'var(--foreground-muted)' }}>EDIT</button>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </main>

      </div>
    </div>
  );
};

export default StationOS;
