import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./AddProjectForm.css";

function AddProjectForm({ close, onProjectAdded }) {
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState([]);
  const [styles, setStyles] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    year: new Date().getFullYear(),
    area: "",
    bedrooms: "",
    floors: "",
    cover_image: "",
    model_url: "",
    gallery_images: "",
    type_id: "",
    style_id: "",
  });

  useEffect(() => {
    const loadTypeAndStyles = async () => {
      const { data: typesData } = await supabase
        .from("project_types")
        .select("*");

      const { data: stylesData } = await supabase.from("styles").select("*");

      setTypes(typesData || []);
      setStyles(stylesData || []);
    };

    loadTypeAndStyles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Парсим gallery_images (JSON)
      let galleryImages = "[]";
      if (form.gallery_images.trim()) {
        try {
          galleryImages = JSON.stringify(
            form.gallery_images.split("\n").filter((url) => url.trim()),
          );
        } catch {
          galleryImages = "[]";
        }
      }

      const { error } = await supabase.from("projects").insert([
        {
          title: form.title,
          description: form.description,
          location: form.location,
          year: parseInt(form.year),
          area: parseFloat(form.area),
          bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
          floors: form.floors ? parseInt(form.floors) : null,
          cover_image: form.cover_image,
          model_url: form.model_url,
          gallery_images: galleryImages,
          type_id: form.type_id || null,
          style_id: form.style_id || null,
          is_featured: true,
        },
      ]);

      if (error) {
        alert("Ошибка при добавлении проекта: " + error.message);
        return;
      }

      alert("✅ Проект успешно добавлен!");
      onProjectAdded();
    } catch (error) {
      alert("Ошибка: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-project-overlay" onClick={close}>
      <div className="add-project-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={close}>
          ✕
        </button>

        <h2>Добавить новый проект</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Название проекта"
            value={form.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Описание"
            value={form.description}
            onChange={handleChange}
            rows="4"
          />

          <input
            name="location"
            placeholder="Локация"
            value={form.location}
            onChange={handleChange}
          />

          <div className="form-row">
            <input
              type="number"
              name="year"
              placeholder="Год"
              value={form.year}
              onChange={handleChange}
            />
            <input
              type="number"
              name="area"
              placeholder="Площадь (м²)"
              value={form.area}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="number"
              name="bedrooms"
              placeholder="Спальни"
              value={form.bedrooms}
              onChange={handleChange}
            />
            <input
              type="number"
              name="floors"
              placeholder="Этажи"
              value={form.floors}
              onChange={handleChange}
            />
          </div>

          {/* ✅ НОВОЕ: Выбор типа проекта */}
          <select name="type_id" value={form.type_id} onChange={handleChange}>
            <option value="">Выбери тип проекта</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          {/* ✅ НОВОЕ: Выбор стиля */}
          <select name="style_id" value={form.style_id} onChange={handleChange}>
            <option value="">Выбери стиль</option>
            {styles.map((style) => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>

          <input
            name="cover_image"
            placeholder="URL обложки"
            value={form.cover_image}
            onChange={handleChange}
            required
          />

          <input
            name="model_url"
            placeholder="URL 3D модели (glb файл)"
            value={form.model_url}
            onChange={handleChange}
            required
          />

          <textarea
            name="gallery_images"
            placeholder="URL галереи (по одному на строку)"
            value={form.gallery_images}
            onChange={handleChange}
            rows="4"
          />

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Добавление..." : "Добавить проект"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProjectForm;
