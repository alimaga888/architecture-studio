import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";
import ProjectViewer from "./ProjectViewer";
import ProjectGallery from "./ProjectGallery";
import "./FeaturedProjects.css";
import OrderFromProject from "./OrderFromProject";
import AddProjectForm from "./AddProjectForm";
import { formatPrice } from "../utils/priceCalculator";
import { useAuth } from "./AuthContext";

function FeaturedProjects() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTeam] = useState("");
  const [bedroomsFilter, setBedroomsFilter] = useState("");
  const [locationFilter, setlocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [orderProject, setOrderProject] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      const { data } = await supabase.from("projects").select(
        `
        *,
        project_types:type_id (name),
        project_styles:style_id (name)
      `,
      );

      setProjects(data || []);
    };

    const loadTypes = async () => {
      const { data } = await supabase.from("project_types").select("*");
      setTypes(data || []);
    };

    loadProjects();
    loadTypes();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesTitle = project.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesBedrooms =
      bedroomsFilter === "" || project.bedrooms === Number(bedroomsFilter);

    const matchesLocation = project.location
      .toLowerCase()
      .includes(locationFilter.toLowerCase());

    const matchesType = typeFilter === "" || project.type_id === typeFilter;

    return matchesTitle && matchesBedrooms && matchesLocation && matchesType;
  });

  const galleryImages = selectedProject?.gallery_images
    ? JSON.parse(selectedProject.gallery_images)
    : [];

  // const projectPrice = selectedProject
  //   ? calculateProjectPrice(selectedProject)
  //   : 0;

  const handleProjectAdded = () => {
    setShowAddProject(false);
    // Перезагружаем проекты
    const loadProjects = async () => {
      const { data } = await supabase.from("projects").select("*");
      setProjects(data || []);
    };
    loadProjects();
  };

  return (
    <>
      <section id="projects" className="project-section">
        <div className="section-header">
          <h1 className="section-title">Каталог проектов</h1>
          {/* ✅ КНОПКА ДОБАВЛЕНИЯ (видна только админам) */}
          {profile?.role === "admin" && (
            <button
              className="add-project-btn"
              onClick={() => setShowAddProject(true)}
            >
              ➕ Добавить проект
            </button>
          )}
        </div>
        <div className="filters">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchTerm}
            onChange={(e) => setSearchTeam(e.target.value)}
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="neon-select"
          >
            <option value="">Все типы</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {/* <select
            value={bedroomsFilter}
            onChange={(e) => setBedroomsFilter(e.target.value)}
          >
            <option value="">Спальни</option>
            <option value="">1 спальня</option>
            <option value="">2 спальни</option>
            <option value="">3 спальни</option>
            <option value="">4 спальни</option>
          </select> */}

          <input
            type="text"
            placeholder="Локация..."
            value={locationFilter}
            onChange={(e) => setlocationFilter(e.target.value)}
          />
        </div>
        <div className="youtube-grid">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="youtube-card"
              onClick={() => {
                setSelectedProject(project);
                setShowGallery(false);
              }}
            >
              <div className="thumbnail">
                <img src={project.cover_image} alt={project.title} />
              </div>

              <div className="card-info">
                <h3>{project.title}</h3>
                <p>{project.location}</p>
                <span>
                  {project.year} • {project.area} м²
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ПРОЕКТА */}
      {showAddProject && (
        <AddProjectForm
          close={() => setShowAddProject(false)}
          onProjectAdded={handleProjectAdded}
        />
      )}

      {selectedProject && (
        <div className="project-modal" onClick={() => setSelectedProject(null)}>
          <button
            className="close-btn"
            onClick={() => setSelectedProject(null)}
          >
            ✕
          </button>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* ✅ СЛАЙД 1: 3D МОДЕЛЬ */}
            <div
              className={`modal-slide modal-slide--3d ${
                !showGallery ? "active" : ""
              }`}
            >
              <div className="viewer">
                <ProjectViewer modelUrl={selectedProject.model_url} />
              </div>

              <div className="project-details">
                <h2>{selectedProject.title}</h2>

                <div className="project-price">
                  <span className="price-label">Cтоимость:</span>
                  <span className="price-value">
                    {formatPrice(selectedProject.Price || 0)}
                  </span>
                </div>

                <p>{selectedProject.description}</p>

                <ul>
                  <li>
                    📍 <strong>Локация:</strong> {selectedProject.location}
                  </li>
                  <li>
                    📅 <strong>Год:</strong> {selectedProject.year}
                  </li>
                  <li>
                    📐 <strong>Площадь:</strong> {selectedProject.area} м²
                  </li>
                  {selectedProject.floors && (
                    <li>
                      🏢 <strong>Этажи:</strong> {selectedProject.floors}
                    </li>
                  )}
                  {selectedProject.bedrooms && (
                    <li>
                      🛏️ <strong>Спальни:</strong> {selectedProject.bedrooms}
                    </li>
                  )}
                  {/* ✅ НОВОЕ: Тип проекта */}
                  {selectedProject.project_types && (
                    <li>
                      🏗️ <strong>Тип:</strong>{" "}
                      {selectedProject.project_types.name}
                    </li>
                  )}
                  {/* ✅ НОВОЕ: Стиль */}
                  {selectedProject.project_styles && (
                    <li>
                      🎨 <strong>Стиль:</strong>{" "}
                      {selectedProject.project_styles.name}
                    </li>
                  )}
                </ul>

                <button
                  className="order-from-project-btn"
                  onClick={() => setOrderProject(selectedProject)}
                >
                  Заказать этот проект
                </button>
              </div>
            </div>

            {/* ✅ СЛАЙД 2: ГАЛЕРЕЯ (если есть фото) */}
            {galleryImages.length > 0 && (
              <div
                className={`modal-slide modal-slide--gallery ${
                  showGallery ? "active" : ""
                }`}
              >
                <ProjectGallery
                  images={galleryImages}
                  projectTitle={selectedProject.title}
                />
              </div>
            )}

            {/* ✅ СТРЕЛКИ ПЕРЕКЛЮЧЕНИЯ (только если есть галерея) */}
            {galleryImages.length > 0 && (
              <>
                {/* Стрелка влево - при просмотре галереи */}
                {showGallery && (
                  <button
                    className="slide-nav-btn slide-nav-btn--left"
                    onClick={() => setShowGallery(false)}
                    title="Назад к 3D модели"
                  >
                    ←
                  </button>
                )}

                {/* Стрелка вправо - при просмотре 3D */}
                {!showGallery && (
                  <button
                    className="slide-nav-btn slide-nav-btn--right"
                    onClick={() => setShowGallery(true)}
                    title="Смотреть фотографии"
                  >
                    →
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {orderProject && (
        <OrderFromProject
          project={orderProject}
          close={() => setOrderProject(null)}
        />
      )}
    </>
  );
}

export default FeaturedProjects;
