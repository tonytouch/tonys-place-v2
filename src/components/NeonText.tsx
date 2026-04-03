import React from 'react';

interface NeonTextProps {
  text: string;
  className?: string;
  secondary?: boolean;
}

const NeonText: React.FC<NeonTextProps> = ({ text, className = '', secondary = false }) => {
  return (
    <span className={`${secondary ? 'neon-text-secondary' : 'neon-text'} ${className}`}>
      {text}
    </span>
  );
};

export default NeonText;
