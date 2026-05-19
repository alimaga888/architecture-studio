import { useEffect, useState } from "react";
import "./Preloader.css";

function Preloader({ isModelLoaded }) {
  const [hide, setHide] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const checkAndHide = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const minTime = 3500; // Минимум 3.5 секунды для красивой анимации

      if (isModelLoaded && elapsed >= minTime) {
        setHide(true);
        clearInterval(checkAndHide);
      }
    }, 100);

    return () => clearInterval(checkAndHide);
  }, [isModelLoaded, startTime]);

  return (
    <div className={`preloader ${hide ? "hide" : ""}`}>
      {/* ЛОГОТИП С ЗАЛИВКОЙ */}
      <svg viewBox="0 0 800 200" className="liquid-logo">
        <defs>
          {/* Голубо-фиолетовый градиент для заливки */}
          <linearGradient id="liquidGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--neon-cyan)" />
            <stop offset="100%" stopColor="var(--neon-purple)" />
          </linearGradient>

          {/* Маска для текста */}
          <clipPath id="textClip">
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              className="logo-text"
            >
              ALYAZHE
            </text>
          </clipPath>
        </defs>

        {/* ВНЕШНИЙ КОНТУР (всегда виден) */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="logo-outline"
        >
          ALYAZHE
        </text>

        {/* ГРУППА С ЖИДКОЙ ЗАЛИВКОЙ */}
        <g clipPath="url(#textClip)">
          {/* Основной заливочный прямоугольник */}
          <rect
            x="0"
            y="0"
            width="800"
            height="200"
            fill="url(#liquidGradient)"
            className="liquid-fill"
          />

          {/* Волновой эффект */}
          <g className="liquid-wave">
            <path
              d="M0,100 Q200,50 400,100 T800,100 L800,200 L0,200 Z"
              fill="rgba(184, 0, 255, 0.2)"
            />
          </g>
        </g>
      </svg>

      {/* ПУЛЬСИРУЮЩЕЕ СВЕЧЕНИЕ ВОКРУГ ЛОГОТИПА */}
      <div className="logo-glow"></div>

      {/* ИНДИКАТОР ЗАГРУЗКИ */}
      {!isModelLoaded && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Загрузка модели...</p>
        </div>
      )}
    </div>
  );
}

export default Preloader;
