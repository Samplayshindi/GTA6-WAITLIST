import React, { useEffect, useState } from 'react';

interface AtmosphericBackdropProps {
  parallaxX?: number;
  parallaxY?: number;
}

export const AtmosphericBackdrop: React.FC<AtmosphericBackdropProps> = ({
  parallaxX = 0,
  parallaxY = 0,
}) => {
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; opacity: number }>>([]);

  useEffect(() => {
    // Generate subtle starry background for Leonida night sky
    const generated = Array.from({ length: 45 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 45,
      size: Math.random() * 2 + 0.8,
      opacity: Math.random() * 0.7 + 0.3,
    }));
    setStars(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#08090D]">
      {/* Dynamic Ambient Color Blobs */}
      <div
        className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 bg-[#FF4FA3] transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${parallaxX * 25}px, ${parallaxY * 20}px, 0)`,
        }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[550px] h-[550px] rounded-full blur-[150px] opacity-20 bg-[#36B9E9] transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${parallaxX * -30}px, ${parallaxY * -25}px, 0)`,
        }}
      />
      <div
        className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full blur-[160px] opacity-20 bg-[#FF9B54] transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${parallaxX * 15}px, ${parallaxY * 15}px, 0)`,
        }}
      />

      {/* Stars in upper sky */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white transition-opacity duration-1000"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            boxShadow: `0 0 4px rgba(255, 255, 255, 0.8)`,
          }}
        />
      ))}

      {/* Atmospheric Horizon Glow */}
      <div className="absolute inset-x-0 bottom-0 h-[60vh] bg-gradient-to-t from-[#08090D] via-[#171025]/60 to-transparent" />

      {/* Stylized Vice City Skyline & Palms Vector Silhouette */}
      <div
        className="absolute inset-x-0 bottom-0 h-64 md:h-96 opacity-40 transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${parallaxX * 10}px, ${parallaxY * 6}px, 0)`,
        }}
      >
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="skylineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#25163A" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#08090D" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="neonStripes" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF4FA3" />
              <stop offset="50%" stopColor="#FF9B54" />
              <stop offset="100%" stopColor="#36B9E9" />
            </linearGradient>
          </defs>

          {/* Distant Skyscrapers */}
          <path
            fill="url(#skylineGrad)"
            d="M0,320 L0,220 L60,220 L60,180 L90,180 L90,210 L150,210 L150,140 L190,140 L190,110 L230,110 L230,190 L320,190 L320,130 L360,130 L360,90 L400,90 L400,200 L490,200 L490,160 L540,160 L540,70 L580,70 L580,180 L670,180 L670,140 L720,140 L720,80 L760,80 L760,190 L850,190 L850,120 L900,120 L900,160 L980,160 L980,95 L1020,95 L1020,190 L1100,190 L1100,130 L1150,130 L1150,85 L1190,85 L1190,210 L1280,210 L1280,150 L1340,150 L1340,190 L1440,190 L1440,320 Z"
          />

          {/* Subtle Neon Rooflines */}
          <line x1="190" y1="110" x2="230" y2="110" stroke="#FF4FA3" strokeWidth="2" strokeOpacity="0.8" />
          <line x1="360" y1="90" x2="400" y2="90" stroke="#36B9E9" strokeWidth="2" strokeOpacity="0.8" />
          <line x1="540" y1="70" x2="580" y2="70" stroke="#FF9B54" strokeWidth="2" strokeOpacity="0.9" />
          <line x1="720" y1="80" x2="760" y2="80" stroke="#FF4FA3" strokeWidth="2" strokeOpacity="0.8" />
          <line x1="980" y1="95" x2="1020" y2="95" stroke="#36B9E9" strokeWidth="2" strokeOpacity="0.8" />
          <line x1="1150" y1="85" x2="1190" y2="85" stroke="#FF4FA3" strokeWidth="2" strokeOpacity="0.8" />

          {/* Ocean Drive Highway Horizon Line */}
          <path d="M0,280 Q720,270 1440,280" stroke="url(#neonStripes)" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />

          {/* Iconic Vice City Palm Silhouette (Left) */}
          <path
            d="M80,320 Q95,240 100,200 Q75,175 40,185 M100,200 Q95,160 80,140 M100,200 Q120,165 145,160 M100,200 Q135,185 155,210 M100,200 Q70,195 50,225"
            stroke="#08090D"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Iconic Vice City Palm Silhouette (Right) */}
          <path
            d="M1360,320 Q1340,240 1335,190 Q1365,165 1400,175 M1335,190 Q1340,150 1355,130 M1335,190 Q1315,155 1290,150 M1335,190 Q1300,175 1280,200 M1335,190 Q1365,185 1385,215"
            stroke="#08090D"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Film Grain & Scanline Grid Overlay */}
      <div className="absolute inset-0 film-grain pointer-events-none opacity-60" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none" />
    </div>
  );
};
