import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToBag, setIsBagOpen } = useAppStore();

  useEffect(() => {
    fetch('/api/shop/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: 'var(--spacing-3xl) var(--spacing-xl) 120px var(--spacing-xl)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-2xl)' }}>
        <div>
          <h1 style={{ fontSize: '48px', marginBottom: '8px' }}>CURATED <span style={{ color: 'var(--tony-secondary)' }}>SHOP</span></h1>
          <p style={{ color: 'var(--foreground-muted)' }}>Exclusive drops and limited edition culture.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="glass-card" style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '12px' }}>ALL ITEMS</button>
        </div>
      </header>

      {loading ? (
        <div style={{ color: 'var(--tony-primary)', textAlign: 'center', padding: '100px' }} className="neon-text">LOADING PRODUCT VAULT...</div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '24px' 
        }}>
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <div className="glass-card" style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                  width: '100%', 
                  height: '280px', 
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  backgroundImage: `url(${product.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    right: '12px', 
                    backgroundColor: 'rgba(0,0,0,0.6)', 
                    backdropFilter: 'blur(4px)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 900,
                    color: 'var(--tony-primary)',
                    letterSpacing: '1px'
                  }}>
                    {product.category?.toUpperCase() || 'ITEM'}
                  </div>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{product.title}</h3>
                  <div style={{ fontSize: '16px', color: 'var(--tony-primary)', fontWeight: 700, marginBottom: '20px' }}>£{product.price.toFixed(2)}</div>
                  <button 
                    className="primary-button" 
                    style={{ width: '100%', marginTop: 'auto', padding: '12px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={() => {
                      addToBag(product);
                      setIsBagOpen(true);
                    }}
                  >
                    <ShoppingBag size={14} /> ADD TO BAG
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
