'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const confettiColors = ['#A0D2EB', '#BCA0EB', '#A0EBD2', '#EBA0A0'];
const confettiCount = 50;

export function Confetti() {
  const [pieces, setPieces] = useState<
    { style: React.CSSProperties; className: string }[]
  >([]);

  useEffect(() => {
    const newPieces = Array.from({ length: confettiCount }).map((_, i) => {
      const style: React.CSSProperties = {
        left: `${Math.random() * 100}%`,
        backgroundColor: confettiColors[i % confettiColors.length],
        animationDelay: `${Math.random() * 0.5}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
        animationDuration: `${Math.random() * 2 + 1}s`,
      };
      return {
        style,
        className: 'confetti-piece',
      };
    });
    setPieces(newPieces);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10%) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120%) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          animation-name: confetti-fall;
          animation-timing-function: linear;
          animation-iteration-count: 1;
        }
      `}</style>
      {pieces.map((piece, i) => (
        <div key={i} className={piece.className} style={piece.style} />
      ))}
    </div>
  );
}
