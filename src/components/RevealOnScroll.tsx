import React from 'react';

interface RevealOnScrollProps {
  children: React.ReactNode;
  delayMs?: number;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({ children }) => {
  return <div className="transition-all duration-300">{children}</div>;
};
