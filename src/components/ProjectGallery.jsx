import { useState, useEffect } from "react";
import "./ProjectGallery.css";

function ProjectGallery({ images = [], projectTitle = "" }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentImageIndex];

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [images.length]);

  return (
    <div className="project-gallery">
      <div className="gallery-image-container">
        <img
          src={currentImage}
          alt={`${projectTitle} - фото ${currentImageIndex + 1}`}
          className="gallery-image"
        />

        <button
          className="gallery-nav-btn gallery-nav-btn--prev"
          onClick={goToPrevious}
          aria-label="Предыдущее фото"
        >
          ←
        </button>

        <button
          className="gallery-nav-btn gallery-nav-btn--next"
          onClick={goToNext}
          aria-label="Следующее фото"
        >
          →
        </button>
      </div>

      <div className="gallery-counter">
        <span className="current-image">{currentImageIndex + 1}</span>
        <span className="total-image">/ {images.length}</span>
      </div>

      <div className="gallery-dots">
        {images.map((_, index) => (
          <button
            key={index}
            className={`gallery-dot ${
              index === currentImageIndex ? "gallery-dot--active" : ""
            }`}
            onClick={() => setCurrentImageIndex(index)}
            aria-label={`Перейти к фото ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default ProjectGallery;
