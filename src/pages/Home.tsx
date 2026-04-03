import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import NeonText from '../components/NeonText';
import { Play, ShoppingBag, Users, Zap } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { setIsPlaying } = useAppStore();
  const navigate = useNavigate();

  const handleListenLive = () => {
    setIsPlaying(true);
    navigate('/listening-room');
  };

  return (
    <div style={{ padding: 'var(--spacing-3xl) var(--spacing-xl) 120px var(--spacing-xl)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 style={{ fontSize: '120px', lineHeight: 0.9, marginBottom: 'var(--spacing-xl)' }}>
          <NeonText text="HIGH-FIDELITY" /><br />
          DIGITAL CULTURE
        </h1>
        
        <p style={{ 
          fontSize: '20px', 
          color: 'var(--foreground-dim)', 
          maxWidth: '600px', 
          marginBottom: 'var(--spacing-2xl)',
          lineHeight: 1.6
        }}>
          Tony's Place is more than just a radio station. It's a hub for underground sounds, digital art, and community-driven broadcasting.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: 'var(--spacing-3xl)' }}>
          <button 
            className="primary-button" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={handleListenLive}
          >
            <Play size={16} fill="currentColor" /> LISTEN LIVE
          </button>
          <button className="secondary-button" onClick={() => navigate('/shop')}>EXPLORE SHOP</button>
        </div>
      </motion.div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '24px' 
      }}>
        {[
          { icon: Play, title: 'LIVE RADIO', desc: 'Non-stop high-quality audio streams from our global residents.', color: 'var(--tony-primary)' },
          { icon: ShoppingBag, title: 'CURATED SHOP', desc: 'Exclusive merchandise, physical media, and digital collectibles.', color: 'var(--tony-secondary)' },
          { icon: Zap, title: 'STATION OS', desc: 'Advanced management tools for creators and community admins.', color: 'var(--tony-primary)' },
          { icon: Users, title: 'COMMUNITY', desc: 'Real-time interaction and track requests during live sets.', color: 'var(--foreground)' },
        ].map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
          >
            <GlassCard>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                backgroundColor: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                color: feature.color
              }}>
                <feature.icon size={24} />
              </div>
              <h3 style={{ fontSize: '24px', marginBottom: '8px', color: feature.color }}>{feature.title}</h3>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '14px', lineHeight: 1.5 }}>
                {feature.desc}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
