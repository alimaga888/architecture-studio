import { useNavigate } from "react-router-dom";
import ProjectViewer from "./ProjectViewer";
import "./ProjectPage.css";

function ProjectPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Возвращаемся на предыдущую страницу
  };

  const handleZoomIn = () => {
    console.log("Zoom in");
    // Функционал можно добавить позже
  };

  const handleZoomOut = () => {
    console.log("Zoom out");
    // Функционал можно добавить позже
  };

  const handleReset = () => {
    console.log("Reset view");
    // Сброс позиции камеры
  };

  return (
    <div className="project-page-container">
      {/* КНОПКА НАЗАД */}
      <button className="project-back-btn" onClick={handleGoBack}>
        ← Назад в каталог
      </button>

      {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
      <div className="project-controls-panel">
        <button
          className="control-btn"
          title="Сброс вида"
          onClick={handleReset}
        >
          ⟲
        </button>
        <button
          className="control-btn"
          title="Увеличить"
          onClick={handleZoomIn}
        >
          ⊕
        </button>
        <button
          className="control-btn"
          title="Уменьшить"
          onClick={handleZoomOut}
        >
          ⊖
        </button>
      </div>

      {/* ОСНОВНОЙ КОНТЕЙНЕР С 3D */}
      <div className="project-viewer-wrapper">
        <ProjectViewer modelUrl="/models/homework.glb" />
      </div>

      {/* ИНФОРМАЦИОННАЯ ПАНЕЛЬ */}
      <div className="project-info-overlay">
        <h3>Современный дом</h3>
        <p>
          <span>Площадь:</span> 250 м²
        </p>
        <p>
          <span>Год:</span> 2024
        </p>
        <p>
          <span>Локация:</span> Москва
        </p>
        <p>
          Современный жилой проект с минималистичным дизайном и открытой
          планировкой.
        </p>
      </div>
    </div>
  );
}

export default ProjectPage;
