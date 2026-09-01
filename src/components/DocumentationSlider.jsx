import { useRef, useEffect } from "react";
import "./DocumentationSlider.css";

function DocumentationSlider() {
  const sliderRef = useRef(null);
  const animationRef = useRef(null);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  // Автоскролл временно останавливается после ручного скролла
  const wheelTimeout = useRef(null);
  const isWheelScrolling = useRef(false);

  const scrollSpeed = 1;

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
      title: "Принципиальные узлы 1",
    },
    {
      id: 14,
      image: "/docs/placeholder_page-0014.jpg",
      title: "Принципиальные узлы 2",
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

  const infiniteSlides = [...slides, ...slides];

  // --------------------------------------------------
  // Нормализация бесконечного скролла
  // --------------------------------------------------

  const normalizeScroll = () => {
    const slider = sliderRef.current;

    if (!slider) return;

    const loopWidth = slider.scrollWidth / 2;

    if (slider.scrollLeft <= 0) {
      slider.scrollLeft += loopWidth;
    }

    if (slider.scrollLeft >= loopWidth) {
      slider.scrollLeft -= loopWidth;
    }
  };

  // --------------------------------------------------
  // Предварительная загрузка + декодирование
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const preloadImages = async () => {
      const promises = slides.map((slide) => {
        return new Promise((resolve) => {
          const img = new Image();

          img.src = slide.image;

          if (img.complete) {
            if (img.decode) {
              img
                .decode()
                .catch(() => {})
                .finally(resolve);
            } else {
              resolve();
            }
            return;
          }

          img.onload = async () => {
            if (img.decode) {
              try {
                await img.decode();
              } catch (error) {
                // Изображение всё равно загружено
              }
            }

            resolve();
          };

          img.onerror = resolve;
        });
      });

      await Promise.all(promises);

      if (cancelled) return;

      const slider = sliderRef.current;

      if (slider) {
        slider.scrollLeft = slider.scrollWidth / 2;
      }
    };

    preloadImages();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // Автоскролл
  // --------------------------------------------------

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    slider.scrollLeft = slider.scrollWidth / 2;

    const autoScroll = () => {
      if (!isDragging.current && !isWheelScrolling.current) {
        slider.scrollLeft += scrollSpeed;

        normalizeScroll();
      }

      animationRef.current = requestAnimationFrame(autoScroll);
    };

    animationRef.current = requestAnimationFrame(autoScroll);

    return () => {
      cancelAnimationFrame(animationRef.current);

      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
      }
    };
  }, []);

  // --------------------------------------------------
  // Колёсико / горизонтальный скролл
  // --------------------------------------------------

  const handleWheel = (e) => {
    const slider = sliderRef.current;

    if (!slider) return;

    // Без Shift не вмешиваемся в обычный скролл страницы
    if (!e.shiftKey) {
      return;
    }

    // Только с Shift забираем колесо себе
    e.preventDefault();

    isWheelScrolling.current = true;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

    slider.scrollLeft += delta * 1.5;

    normalizeScroll();

    if (wheelTimeout.current) {
      clearTimeout(wheelTimeout.current);
    }

    wheelTimeout.current = setTimeout(() => {
      isWheelScrolling.current = false;
    }, 150);
  };

  // --------------------------------------------------
  // Начало перетаскивания
  // --------------------------------------------------

  const handleMouseDown = (e) => {
    const slider = sliderRef.current;

    if (!slider) return;

    isDragging.current = true;

    startX.current = e.clientX;
    startScrollLeft.current = slider.scrollLeft;

    slider.style.cursor = "grabbing";
  };

  // --------------------------------------------------
  // Перетаскивание
  // --------------------------------------------------

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;

    const slider = sliderRef.current;

    if (!slider) return;

    e.preventDefault();

    const x = e.clientX;

    const walk = (x - startX.current) * 2;

    slider.scrollLeft = startScrollLeft.current - walk;

    normalizeScroll();

    if (slider.scrollLeft <= 0 || slider.scrollLeft >= slider.scrollWidth / 2) {
      startScrollLeft.current = slider.scrollLeft;
      startX.current = x;
    }
  };

  // --------------------------------------------------
  // Отпускание мыши
  // --------------------------------------------------

  const handleMouseUp = () => {
    isDragging.current = false;

    if (sliderRef.current) {
      sliderRef.current.style.cursor = "grab";
    }
  };

  // --------------------------------------------------
  // Мышь вышла за пределы
  // --------------------------------------------------

  const handleMouseLeave = () => {
    if (!isDragging.current) return;

    isDragging.current = false;

    if (sliderRef.current) {
      sliderRef.current.style.cursor = "grab";
    }
  };

  return (
    <section className="documentation-section">
      <div className="documentation-container">
        <h2 className="section-title">Пример рабочей документации</h2>

        <p className="section-subtitle">
          Профессиональные чертежи и визуализации для строительства
        </p>

        <div
          ref={sliderRef}
          className="cards-slider"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        >
          {infiniteSlides.map((slide, index) => (
            <div key={`${slide.id}-${index}`} className="doc-card">
              <div className="card-image">
                <img
                  src={slide.image}
                  alt={slide.title}
                  loading="eager"
                  decoding="async"
                  draggable="false"
                />
              </div>

              <div className="card-title">{slide.title}</div>
            </div>
          ))}
        </div>

        <div className="scroll-hint">
          ← Тяните мышкой или скроллите, зажав Shift →
        </div>
      </div>
    </section>
  );
}

export default DocumentationSlider;
