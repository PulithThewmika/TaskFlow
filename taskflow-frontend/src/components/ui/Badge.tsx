import React from 'react';

interface BadgeProps {
  label: string;
  color: string;
}

const Badge: React.FC<BadgeProps> = ({ label, color }) => {
  return (
    <span
      className="badge"
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  );
};

export default Badge;
