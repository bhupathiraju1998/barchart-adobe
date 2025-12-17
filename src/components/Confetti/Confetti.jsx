import React, { useEffect, useState } from 'react';
import './Confetti.css';

const Confetti = ({ duration = 8000 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 200 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      size: `${Math.random() * 10 + 5}px`,
      animationDuration: `${3 + Math.random() * 3}s`,
      backgroundColor: `hsl(${Math.random() * 360}, 100%, 70%)`,
      rotation: `${Math.random() * 720}deg`,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div className="confetti-container">
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.animationDuration,
            backgroundColor: p.backgroundColor,
            transform: `rotate(${p.rotation})`,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;

