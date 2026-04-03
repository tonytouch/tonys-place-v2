import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Radio, 
  ShoppingBag as BagIcon, 
  Music, 
  User, 
  Cpu, 
  TrendingUp, 
  Wine,
  LayoutDashboard,
  Disc3,
  Video
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Radio, label: 'Listening Room', path: '/listening-room' },
  { icon: BagIcon, label: 'Shop', path: '/shop' },
  { icon: Music, label: 'DJ Portal', path: '/dj-portal' },
  { icon: Disc3, label: 'DJ Controller', path: '/dj-controller-pro' },
  { icon: Video, label: 'StreamFlow', path: '/streamflow' },
  { icon: LayoutDashboard, label: 'Station OS', path: '/station-os' },
  { icon: Cpu, label: 'AI Insights', path: '/ai' },
  { icon: TrendingUp, label: 'Trading', path: '/trading' },
  { icon: Wine, label: 'DrinkChain', path: '/cocktail-builder' },
  { icon: User, label: 'Account', path: '/account' },
];

const Sidebar: React.FC = () => {
  const { bag, setIsBagOpen } = useAppStore();

  return (
    <div style={{
      width: '240px',
      height: 'calc(100vh - 32px)',
      backgroundColor: 'var(--surface)',
      backdropFilter: 'blur(12px)',
      borderRight: '1px solid var(--tony-border)',
      padding: 'var(--spacing-xl) var(--spacing-md)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: '32px',
      left: 0,
      zIndex: 900
    }}>
      <div style={{ marginBottom: 'var(--spacing-2xl)', padding: '0 var(--spacing-sm)' }}>
        <h1 style={{ fontSize: '32px', color: 'var(--tony-primary)' }} className="neon-text">
          TONY'S PLACE
        </h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px var(--spacing-md)',
              borderRadius: 'var(--radius-small)',
              textDecoration: 'none',
              color: isActive ? 'var(--tony-primary)' : 'var(--foreground-muted)',
              backgroundColor: isActive ? 'rgba(0, 209, 178, 0.1)' : 'transparent',
              transition: 'all 0.2s ease',
              fontWeight: isActive ? 700 : 400
            })}
          >
            <item.icon size={20} />
            <span style={{ fontSize: '14px' }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button 
        onClick={() => setIsBagOpen(true)}
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          color: 'white',
          position: 'relative'
        }}
      >
        <BagIcon size={20} color="var(--tony-secondary)" />
        <span style={{ fontSize: '14px', fontWeight: 700 }}>MY BAG</span>
        {bag.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'var(--tony-secondary)',
            color: 'white',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            boxShadow: '0 0 10px var(--tony-secondary-glow)'
          }}>
            {bag.length}
          </div>
        )}
      </button>
    </div>
  );
};

export default Sidebar;
