import { useState, useEffect, useRef } from "react";
import "./DocumentationSlider.css";
import { div } from "three/tsl";

function DocumentationSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayRef = useRef(null);

  const slides = [
    {
      id: 1,
      image: "/docs/placeholder_page-0001.jpg",
      title: "Начальная страница",
    },
    {
      id: 2,
      image: "/docs/placeholder_page-0002.jpg",
      title: "Технико-экономические показатели обоих домов",
    },
    {
      id: 3,
      image: "/docs/placeholder_page-0003.jpg",
      title: "Общий план",
    },
    {
      id: 4,
      image: "/docs/placeholder_page-0004.jpg",
      title: "План котлована",
    },
    {
      id: 5,
      image: "/docs/placeholder_page-0005.jpg",
      title: "План подвала; План дренажа",
    },
    {
      id: 6,
      image: "/docs/placeholder_page-0006.jpg",
      title: "План 1-этажа; План 2-этажа",
    },
    {
      id: 7,
      image: "/docs/placeholder_page-0007.jpg",
      title: "План коммуникаций",
    },
    {
      id: 8,
      image: "/docs/placeholder_page-0008.jpg",
      title: "План кровли",
    },
    {
      id: 9,
      image: "/docs/placeholder_page-0009.jpg",
      title: "Фасад 1-4; Д-А",
    },
    {
      id: 10,
      image: "/docs/placeholder_page-0010.jpg",
      title: "Фасад А-Д; 4-1",
    },
    {
      id: 11,
      image: "/docs/placeholder_page-0011.jpg",
      title: "Разрез 1-1; 2-2",
    },
    {
      id: 12,
      image: "/docs/placeholder_page-0012.jpg",
      title: "Летняя кухня / Парковка; Беседка",
    },
    {
      id: 13,
      image: "/docs/placeholder_page-0013.jpg",
      title: "Принципиальне узлы 1",
    },
    {
      id: 14,
      image: "/docs/placeholder_page-0014.jpg",
      title: "Принципиальне узлы 2",
    },
    {
      id: 15,
      image: "/docs/placeholder_page-0015.jpg",
      title: "Вентиляционные каналы",
    },
    {
      id: 16,
      image: "/docs/placeholder_page-0016.jpg",
      title: "Деталировка фасада 1-4",
    },
    {
      id: 17,
      image: "/docs/placeholder_page-0017.jpg",
      title: "Ведомость дверных и оконных проемов",
    },
    {
      id: 18,
      image: "/docs/placeholder_page-0018.jpg",
      title: "3D модель-1",
    },
    {
      id: 19,
      image: "/docs/placeholder_page-0019.jpg",
      title: "3D модель-2",
    },
  ];

  const goToNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!isPaused) {
      autoplayRef.current = setInterval(() => {
        goToNext();
      }, 4000);
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isPaused, currentSlide]);

  return (
    <section
      className="documentation-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="documentation-container">
        <h2 className="section-title">Пример рабочей документации</h2>
        <p className="section-subtitle">
          Профессиональные чертежи и визуализации для строительства
        </p>

        <div className="slider-wrapper">
          <div className="slider-track">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`slide ${index === currentSlide ? "active" : ""}`}
                style={{
                  transform: `translateX(${(index - currentSlide) * 100}%)`,
                }}
              >
                <img src={slide.image} alt={slide.title} />
                <div className="slide-caption">{slide.title}</div>
              </div>
            ))}
          </div>

          <button className="slider-btn slider-btn--prev" onClick={goToPrev}>
            ←
          </button>
          <button className="slider-btn slider-btn--next" onClick={goToNext}>
            →
          </button>

          <div className="slide-counter">
            {currentSlide + 1} / {slides.length}
          </div>

          <div className="slider-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? "active" : ""}`}
                onClick={() => goToSlide(index)}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
export default DocumentationSlider;
