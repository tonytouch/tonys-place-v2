import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { ShoppingBag, MessageSquare, User } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { bag, setIsBagOpen } = useAppStore();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Listening Room', path: '/listening-room' },
    { label: 'AI Insights', path: '/ai' },
    { label: 'Shop', path: '/shop' },
    { label: 'Station OS', path: '/station-os' },
    { label: 'DJ Controller', path: '/dj-controller-pro' },
    { label: 'DJ Portal', path: '/dj-portal' },
  ];

  return (
    <header style={{
      position: 'fixed',
      top: '28px', // Below TickerBar
      left: 0,
      right: 0,
      height: '72px',
      backgroundColor: 'rgba(15, 15, 15, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--tony-border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--spacing-xl)',
      justifyContent: 'space-between',
      zIndex: 900
    }}>
      {/* Logo */}
      <div 
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <h1 style={{ 
          fontFamily: 'Bebas Neue', 
          fontSize: '28px', 
          letterSpacing: '4px',
          color: 'var(--foreground)'
        }}>
          TONY'S &nbsp;<span style={{ color: 'var(--tony-primary)' }}>PLACE</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              textDecoration: 'none',
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: isActive ? 'var(--tony-primary)' : 'rgba(255, 255, 255, 0.6)',
              transition: 'color 0.2s ease',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <button 
          onClick={() => setIsBagOpen(true)}
          style={{ position: 'relative', background: 'none', color: 'rgba(255, 255, 255, 0.6)' }}
        >
          <ShoppingBag size={20} />
          {bag.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: 'var(--tony-primary)',
              color: 'var(--tony-dark)',
              fontSize: '9px',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {bag.length}
            </div>
          )}
        </button>

        <button 
          onClick={() => navigate('/listening-room')}
          style={{ background: 'none', color: 'var(--tony-primary)', opacity: 0.6 }}
        >
          <MessageSquare size={20} />
        </button>

        <button 
          onClick={() => navigate('/account')}
          style={{ background: 'none', color: 'rgba(255, 255, 255, 0.6)' }}
        >
          <User size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
