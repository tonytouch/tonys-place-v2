import React from 'react';
import { motion } from 'framer-motion';

const TickerBar: React.FC = () => {
  return (
    <div style={{
      width: '100%',
      height: '28px',
      backgroundColor: 'rgba(0, 209, 178, 0.1)',
      borderBottom: '1px solid var(--tony-border)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      zIndex: 1000
    }}>
      <motion.div
        animate={{ x: ['100%', '-100%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}
      >
        <span style={{ color: 'var(--tony-primary)', fontWeight: 900, marginRight: '8px' }}>NOW PLAYING:</span>
        <span style={{ color: 'white', marginRight: '40px' }}>TONY'S PLACE - HIGH FIDELITY RADIO - DIGITAL CULTURE & MUSIC - LIVE FROM THE UNDERGROUND</span>
        
        <span style={{ color: 'var(--tony-primary)', fontWeight: 900, marginRight: '8px' }}>NOW PLAYING:</span>
        <span style={{ color: 'white', marginRight: '40px' }}>TONY'S PLACE - HIGH FIDELITY RADIO - DIGITAL CULTURE & MUSIC - LIVE FROM THE UNDERGROUND</span>
      </motion.div>
    </div>
  );
};

export default TickerBar;
