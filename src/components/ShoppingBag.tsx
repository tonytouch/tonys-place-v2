import React from 'react';
import { X, Trash2, CreditCard } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

const ShoppingBag: React.FC = () => {
  const { bag, removeFromBag, isBagOpen, setIsBagOpen } = useAppStore();

  const total = bag.reduce((sum, item) => sum + item.price, 0);

  return (
    <AnimatePresence>
      {isBagOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsBagOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              zIndex: 2000,
              backdropFilter: 'blur(4px)'
            }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '400px',
              backgroundColor: 'var(--tony-dark)',
              borderLeft: '1px solid var(--tony-border)',
              zIndex: 2001,
              padding: 'var(--spacing-xl)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2xl)' }}>
              <h2 style={{ fontSize: '32px' }}>YOUR <span style={{ color: 'var(--tony-secondary)' }}>BAG</span></h2>
              <button onClick={() => setIsBagOpen(false)} style={{ color: 'var(--foreground-muted)' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bag.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--foreground-muted)' }}>
                  Your bag is empty.
                </div>
              ) : (
                bag.map((item, i) => (
                  <div key={`${item.id}-${i}`} style={{ display: 'flex', gap: '16px', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--tony-border)' }}>
                    <img src={item.image} alt={item.title} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{item.title}</div>
                      <div style={{ color: 'var(--tony-primary)', fontSize: '14px', fontWeight: 900 }}>£{item.price.toFixed(2)}</div>
                    </div>
                    <button onClick={() => removeFromBag(item.id)} style={{ color: 'var(--tony-secondary)', opacity: 0.6 }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {bag.length > 0 && (
              <div style={{ marginTop: 'var(--spacing-2xl)', borderTop: '1px solid var(--tony-border)', paddingTop: 'var(--spacing-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <span style={{ color: 'var(--foreground-muted)' }}>TOTAL</span>
                  <span style={{ fontSize: '24px', fontWeight: 900 }}>£{total.toFixed(2)}</span>
                </div>
                <button className="primary-button" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <CreditCard size={20} /> CHECKOUT
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShoppingBag;
