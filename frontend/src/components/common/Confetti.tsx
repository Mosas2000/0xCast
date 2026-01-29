import React, { useEffect, useState } from 'react';

/**
 * Confetti celebration component for successful trades or wins.
 */
export const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        if (active) {
            const newParticles = Array.from({ length: 50 }).map((_, i) => ({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * 2,
                duration: 2 + Math.random() * 3,
                color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
            }));
            setParticles(newParticles);

            const timer = setTimeout(() => setParticles([]), 5000);
            return () => clearTimeout(timer);
        }
    }, [active]);

    if (!active || particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute w-2 h-2 rounded-sm"
                    style={{
                        left: `${p.left}%`,
                        top: '-20px',
                        backgroundColor: p.color,
                        animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
                    }}
                />
            ))}
            <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
        </div>
    );
};
