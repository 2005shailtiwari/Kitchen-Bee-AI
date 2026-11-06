import React from 'react';

interface BeeLogoProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

export const BeeLogo: React.FC<BeeLogoProps> = ({ className = '', size = 48, animate = false }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${animate ? 'hover:scale-105 transition-transform' : ''} ${className}`}
      style={{ width: size, height: size }}
      aria-label="KitchenBee AI Logo"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
      >
        {/* Soft Glow Background Circle */}
        <circle cx="50" cy="50" r="46" fill="#F4F8F4" stroke="#D1E2D3" strokeWidth="2" />
        
        {/* Bee Wings (translucent honey/cyan tint) */}
        <ellipse
          cx="38"
          cy="32"
          rx="14"
          ry="9"
          transform="rotate(-35 38 32)"
          fill="#D6EFFF"
          fillOpacity="0.85"
          stroke="#93C5FD"
          strokeWidth="1.5"
        />
        <ellipse
          cx="62"
          cy="32"
          rx="14"
          ry="9"
          transform="rotate(35 62 32)"
          fill="#D6EFFF"
          fillOpacity="0.85"
          stroke="#93C5FD"
          strokeWidth="1.5"
        />

        {/* Bee Body (Chubby oval) */}
        <ellipse cx="50" cy="56" rx="24" ry="26" fill="#FBBF24" />
        
        {/* Warm honey shadow on body */}
        <path
          d="M 28 58 Q 50 82 72 58 Q 50 86 28 58 Z"
          fill="#D97706"
          fillOpacity="0.3"
        />

        {/* Bee Stripes */}
        <path
          d="M 30 50 Q 50 56 70 50 Q 50 60 30 50 Z"
          fill="#27302B"
        />
        <path
          d="M 32 63 Q 50 69 68 63 Q 50 73 32 63 Z"
          fill="#27302B"
        />

        {/* Cute Stinger / Tail */}
        <polygon points="50,83 46,78 54,78" fill="#27302B" />

        {/* Cheerful Eyes with highlights */}
        <circle cx="43" cy="46" r="3.2" fill="#1E293B" />
        <circle cx="44.2" cy="45" r="1.2" fill="#FFFFFF" />
        <circle cx="57" cy="46" r="3.2" fill="#1E293B" />
        <circle cx="58.2" cy="45" r="1.2" fill="#FFFFFF" />

        {/* Rosy Cheeks */}
        <circle cx="36" cy="51" r="3" fill="#F87171" fillOpacity="0.5" />
        <circle cx="64" cy="51" r="3" fill="#F87171" fillOpacity="0.5" />

        {/* Sweet Smile */}
        <path
          d="M 46 52 Q 50 56 54 52"
          stroke="#1E293B"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Antennae */}
        <path
          d="M 43 30 Q 40 22 36 21"
          stroke="#27302B"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="35" cy="20" r="2.5" fill="#F59E0B" />

        <path
          d="M 57 30 Q 60 22 64 21"
          stroke="#27302B"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="65" cy="20" r="2.5" fill="#F59E0B" />

        {/* Chef Hat atop the Bee's head */}
        <g transform="translate(36, 16) scale(0.7)">
          {/* Hat base band */}
          <rect x="5" y="20" width="30" height="6" rx="2" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
          {/* Hat puffy tops */}
          <ellipse cx="11" cy="14" rx="7" ry="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          <ellipse cx="29" cy="14" rx="7" ry="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          <ellipse cx="20" cy="11" rx="9" ry="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          {/* Chef Hat highlight/folds */}
          <path d="M 16 16 Q 18 20 18 21" stroke="#E2E8F0" strokeWidth="1" strokeLinecap="round" />
          <path d="M 24 16 Q 22 20 22 21" stroke="#E2E8F0" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Tiny Whisk / Spoon in hand */}
        <g transform="translate(68, 48) rotate(25) scale(0.65)">
          <line x1="0" y1="0" x2="0" y2="22" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="0" cy="26" rx="4.5" ry="7" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
          <path d="M -2 24 Q 0 31 2 24" stroke="#94A3B8" strokeWidth="1" fill="none" />
        </g>
      </svg>
    </div>
  );
};
