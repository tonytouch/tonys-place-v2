import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onTap?: () => void;
  style?: React.CSSProperties;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onTap, style }) => {
  return (
    <div 
      className={`glass-card ${className}`} 
      onClick={onTap}
      style={{ cursor: onTap ? 'pointer' : 'default', ...style }}
    >
      {children}
    </div>
  );
};

export default GlassCard;
