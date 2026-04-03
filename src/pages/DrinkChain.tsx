import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { Info } from 'lucide-react';

const ingredients = [
  { id: 1, name: 'NEON GIN', icon: '🍸' },
  { id: 2, name: 'TEAL TONIC', icon: '🥤' },
  { id: 3, name: 'LIME SYRUP', icon: '🍋' },
  { id: 4, name: 'VODKA BASE', icon: '🥃' },
  { id: 5, name: 'BERRY BLEND', icon: '🫐' },
  { id: 6, name: 'CARBONATED H2O', icon: '🫧' },
];

const DrinkChain: React.FC = () => {
  const [selected, setSelected] = useState<number[]>([]);
  const [isMixing, setIsMixing] = useState(false);

  const toggleIngredient = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleMix = () => {
    if (selected.length === 0) {
      alert('Select at least one ingredient first!');
      return;
    }
    setIsMixing(true);
    setTimeout(() => {
      setIsMixing(false);
      alert('Algorithmic cocktail recipe finalized and stored on-chain.');
      setSelected([]);
    }, 2500);
  };

  return (
    <div style={{ padding: 'var(--spacing-3xl) var(--spacing-xl) 120px var(--spacing-xl)' }}>
      <header style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '8px' }}>DRINK<span style={{ color: 'var(--tony-primary)' }}>CHAIN</span></h1>
        <p style={{ color: 'var(--foreground-muted)' }}>Algorithmic cocktail builder and recipe engine.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Ingredient Picker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <GlassCard>
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>SELECT INGREDIENTS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {ingredients.map((ing) => (
                <button 
                  key={ing.id} 
                  onClick={() => toggleIngredient(ing.id)}
                  style={{ 
                    padding: '20px', 
                    borderRadius: '16px', 
                    background: selected.includes(ing.id) ? 'var(--tony-primary)' : 'rgba(255,255,255,0.03)', 
                    border: '1px solid var(--tony-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    color: selected.includes(ing.id) ? 'black' : 'white',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{ing.icon}</span>
                  <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '1px' }}>{ing.name}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Info size={20} color="var(--tony-primary)" />
              <h3 style={{ fontSize: '18px' }}>HOW IT WORKS</h3>
            </div>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '14px', lineHeight: 1.6 }}>
              Select your base and modifiers. Our algorithm calculates the optimal proportions for a high-fidelity taste experience. All recipes are stored on-chain for transparency.
            </p>
          </GlassCard>
        </div>

        {/* Builder Area */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
          <div style={{ 
            width: '200px', 
            height: '300px', 
            border: '2px solid var(--tony-border)', 
            borderTop: 'none', 
            borderRadius: '0 0 100px 100px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '40px'
          }}>
            <AnimatePresence>
              {selected.length > 0 && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: isMixing ? '90%' : `${selected.length * 15}%` }}
                  exit={{ height: 0 }}
                  transition={{ duration: isMixing ? 2.5 : 0.5 }}
                  style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    width: '100%', 
                    background: isMixing ? 'linear-gradient(180deg, var(--tony-secondary), var(--tony-primary))' : 'var(--tony-primary)',
                    opacity: 0.6,
                    boxShadow: '0 0 20px var(--tony-primary-glow)'
                  }} 
                />
              )}
            </AnimatePresence>
            <div style={{ 
              position: 'absolute', 
              top: '20%', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              color: 'white', 
              fontSize: '12px', 
              fontWeight: 900,
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              opacity: isMixing ? 1 : 0
            }}>
              MIXING...
            </div>
          </div>

          <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>{isMixing ? 'CALCULATING PROPORTIONS' : selected.length > 0 ? `NEON MIX #${selected.join('')}` : 'SELECT INGREDIENTS'}</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            <span style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,209,178,0.1)', color: 'var(--tony-primary)' }}>ALGORITHMIC</span>
            <span style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,56,96,0.1)', color: 'var(--tony-secondary)' }}>HIGH PROOF</span>
          </div>

          <button 
            className="primary-button" 
            style={{ width: '100%' }}
            onClick={handleMix}
            disabled={isMixing || selected.length === 0}
          >
            {isMixing ? 'FINALIZING...' : 'FINALIZE RECIPE'}
          </button>
        </GlassCard>

      </div>
    </div>
  );
};

export default DrinkChain;
