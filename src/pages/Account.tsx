import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { User, Shield, Key, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({
    audio: true,
    visualizer: true,
    chat: false
  });

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      navigate('/');
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-3xl) var(--spacing-xl) 120px var(--spacing-xl)' }}>
      <header style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '8px' }}>USER <span style={{ color: 'var(--tony-primary)' }}>ACCOUNT</span></h1>
        <p style={{ color: 'var(--foreground-muted)' }}>Manage your profile and security settings.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Profile Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--tony-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--tony-dark)'
            }}>
              <User size={40} />
            </div>
            <div>
              <h2 style={{ fontSize: '24px' }}>TONY TOUCH</h2>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '14px' }}>tonytouch.kw@gmail.com</p>
              <div style={{ 
                marginTop: '8px',
                fontSize: '10px', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                background: 'rgba(0,209,178,0.1)', 
                color: 'var(--tony-primary)',
                display: 'inline-block',
                fontWeight: 900
              }}>ADMIN</div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>PREFERENCES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { id: 'audio', label: 'High-Fidelity Audio', desc: 'Stream at 320kbps (lossless)', enabled: prefs.audio },
                { id: 'visualizer', label: 'Neon Visualizer', desc: 'Enable dynamic GPU-accelerated visuals', enabled: prefs.visualizer },
                { id: 'chat', label: 'Community Chat', desc: 'Show real-time message feed', enabled: prefs.chat },
              ].map((pref, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{pref.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>{pref.desc}</div>
                  </div>
                  <button 
                    onClick={() => togglePref(pref.id as keyof typeof prefs)}
                    style={{ 
                      width: '40px', 
                      height: '20px', 
                      borderRadius: '10px', 
                      backgroundColor: pref.enabled ? 'var(--tony-primary)' : 'rgba(255,255,255,0.1)',
                      position: 'relative',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ 
                      width: '40px', 
                      height: '20px', 
                      borderRadius: '10px', 
                      backgroundColor: pref.enabled ? 'var(--tony-primary)' : 'rgba(255,255,255,0.1)',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }} />
                    <motion.div 
                      animate={{ x: pref.enabled ? 22 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '50%', 
                        backgroundColor: pref.enabled ? 'var(--tony-dark)' : 'var(--foreground-muted)',
                        position: 'absolute',
                        top: '2px',
                        left: 0,
                        zIndex: 1
                      }} 
                    />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Security Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Shield size={20} color="var(--tony-primary)" />
              <h3 style={{ fontSize: '20px' }}>SECURITY</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => alert('Passkey integration active. Biometric verification required.')}
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--tony-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'white',
                  textAlign: 'left'
                }}
              >
                <Key size={18} color="var(--tony-primary)" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>PASSKEY (WEBAUTHN)</div>
                  <div style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>Biometric authentication enabled</div>
                </div>
              </button>

              <button 
                onClick={() => alert('Redirecting to secure password reset...')}
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--tony-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'white',
                  textAlign: 'left'
                }}
              >
                <Settings size={18} color="var(--foreground-dim)" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>CHANGE PASSWORD</div>
                  <div style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>Last changed 3 months ago</div>
                </div>
              </button>
            </div>

            <button 
              className="secondary-button" 
              style={{ width: '100%', marginTop: '32px', color: 'var(--tony-secondary)', borderColor: 'rgba(255,56,96,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
              onClick={handleLogout}
            >
              <LogOut size={18} /> LOG OUT
            </button>
          </GlassCard>

          <GlassCard style={{ background: 'rgba(255,56,96,0.05)', borderColor: 'rgba(255,56,96,0.1)' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--tony-secondary)', marginBottom: '12px' }}>DANGER ZONE</h3>
            <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginBottom: '16px' }}>Permanently delete your account and all associated station data. This action is irreversible.</p>
            <button 
              style={{ color: 'var(--tony-secondary)', fontSize: '12px', fontWeight: 900, textDecoration: 'underline', background: 'none' }}
              onClick={() => { if(confirm('PERMANENTLY DELETE ACCOUNT? This cannot be undone.')) navigate('/'); }}
            >
              DELETE ACCOUNT
            </button>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default Account;
