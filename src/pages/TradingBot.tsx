import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { ArrowUpRight } from 'lucide-react';

const TradingBot: React.FC = () => {
  const [timeframe, setTimeframe] = useState('1D');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      alert('Trading parameters optimized for current market conditions.');
    }, 2000);
  };

  return (
    <div style={{ padding: 'var(--spacing-3xl) var(--spacing-xl) 120px var(--spacing-xl)' }}>
      <header style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '8px' }}>TRADING <span style={{ color: 'var(--tony-primary)' }}>DASHBOARD</span></h1>
        <p style={{ color: 'var(--foreground-muted)' }}>Real-time algorithmic trading & portfolio tracking.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {[
          { label: 'PORTFOLIO VALUE', val: '$124,500.00', change: '+12.5%', color: 'var(--tony-primary)' },
          { label: '24H PROFIT', val: '$1,240.50', change: '+2.4%', color: 'var(--tony-primary)' },
          { label: 'ACTIVE TRADES', val: '14', change: 'Stable', color: 'var(--foreground)' },
          { label: 'BOT STATUS', val: isOptimizing ? 'OPTIMIZING...' : 'OPTIMIZED', change: 'Online', color: '#FFD700' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard>
              <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--foreground-muted)', marginBottom: '8px', letterSpacing: '1px' }}>{stat.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: stat.color, marginBottom: '4px' }}>{stat.val}</div>
              <div style={{ fontSize: '12px', color: stat.change.startsWith('+') ? 'var(--tony-primary)' : 'var(--foreground-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {stat.change.startsWith('+') && <ArrowUpRight size={14} />}
                {stat.change}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px' }}>MARKET ACTIVITY</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['1H', '1D', '1W'].map((tf) => (
                <button 
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className="glass-card" 
                  style={{ 
                    padding: '4px 12px', 
                    fontSize: '10px', 
                    borderRadius: '8px',
                    backgroundColor: timeframe === tf ? 'var(--tony-primary)' : 'transparent',
                    color: timeframe === tf ? 'black' : 'white',
                    opacity: timeframe === tf ? 1 : 0.5,
                    border: '1px solid var(--tony-border)'
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ height: '300px', width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '20px' }}>
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
              <motion.path
                key={timeframe}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
                d={timeframe === '1H' 
                  ? "M0,150 L100,140 L200,160 L300,130 L400,145 L500,120 L600,135" 
                  : timeframe === '1W'
                  ? "M0,250 L100,200 L200,220 L300,100 L400,120 L500,50 L600,80"
                  : "M0,200 L50,180 L100,220 L150,150 L200,170 L250,100 L300,120 L350,50 L400,80 L450,30 L500,60 L550,10"
                }
                fill="none"
                stroke="var(--tony-primary)"
                strokeWidth="3"
                style={{ filter: 'drop-shadow(0 0 10px var(--tony-primary-glow))' }}
              />
            </svg>
            <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '1px', backgroundColor: 'var(--tony-border)' }} />
          </div>
        </GlassCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <GlassCard>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>RECENT SIGNALS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { pair: 'BTC/USDT', action: 'BUY', price: '64,230', time: '2m ago' },
                { pair: 'ETH/USDT', action: 'SELL', price: '3,450', time: '15m ago' },
                { pair: 'SOL/USDT', action: 'BUY', price: '145.2', time: '1h ago' },
              ].map((sig, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{sig.pair}</div>
                    <div style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>{sig.time}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: sig.action === 'BUY' ? 'var(--tony-primary)' : 'var(--tony-secondary)', fontWeight: 900, fontSize: '12px' }}>{sig.action}</div>
                    <div style={{ fontSize: '12px' }}>${sig.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>BOT CONFIG</h3>
            <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginBottom: '16px' }}>Strategy: <span style={{ color: 'white' }}>Trend Follower v4.2</span></p>
            <button 
              className="secondary-button" 
              style={{ width: '100%', padding: '12px' }}
              onClick={handleOptimize}
              disabled={isOptimizing}
            >
              {isOptimizing ? 'PROCESSING...' : 'ADJUST PARAMETERS'}
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default TradingBot;
