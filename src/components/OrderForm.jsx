import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../supabase";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import {
  calculateCustomProjectPrice,
  formatPrice,
} from "../utils/priceCalculator";
import "./OrderForm.css";

function OrderForm({ close }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",

    plot_size: "",
    location: "",
    floors: "",
    area_range: "",
    material: "",

    garage: false,
    terrace: false,
    mansard: false,

    bedrooms: "",
    bathrooms: "",
    style: "",

    description: "",

    attachedFiles: [], // ✅ НОВОЕ: массив загруженных файлов
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ✅ ЗАГРУЗКА ФАЙЛОВ
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Проверка размера (макс 10MB на файл)
    const oversized = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      alert(
        `Файлы слишком большие (макс 10MB): ${oversized.map((f) => f.name).join(", ")}`,
      );
      return;
    }

    setUploadingFiles(true);

    try {
      const uploadedUrls = [];

      for (const file of files) {
        const fileExt = file.name.split(".").pop().toLowerCase();
        const fileName = `${user?.id || "guest"}/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("order_files")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("order_files")
          .getPublicUrl(fileName);

        uploadedUrls.push({
          url: urlData.publicUrl,
          name: file.name,
          size: file.size,
        });
      }

      setForm({
        ...form,
        attachedFiles: [...form.attachedFiles, ...uploadedUrls],
      });

      alert(`✅ Загружено файлов: ${uploadedUrls.length}`);
    } catch (error) {
      console.error("Ошибка загрузки файлов:", error);
      alert(`Ошибка: ${error.message}`);
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ✅ УДАЛЕНИЕ ФАЙЛА
  const handleRemoveFile = async (index) => {
    const file = form.attachedFiles[index];

    try {
      // Удаляем из Storage
      const path = file.url.split("/order_files/")[1]?.split("?")[0];
      if (path) {
        await supabase.storage.from("order_files").remove([path]);
      }

      // Удаляем из состояния
      const newFiles = form.attachedFiles.filter((_, i) => i !== index);
      setForm({ ...form, attachedFiles: newFiles });
    } catch (error) {
      console.error("Ошибка удаления файла:", error);
    }
  };

  const estimatedPrice = calculateCustomProjectPrice(form);

  const submit = async (e) => {
    e.preventDefault();

    if (!user) {
      const shouldLogin = window.confirm(
        "Для оформления заказа необходимо войти",
      );

      if (shouldLogin) {
        close();
        navigate("/auth");
      }
      return;
    }

    setLoading(true);

    // ✅ Сохраняем только URL файлов (массив строк)
    const fileUrls = form.attachedFiles.map((f) => f.url);

    const { error } = await supabase.from("orders").insert([
      {
        ...form,
        attached_files: fileUrls, // ✅ НОВОЕ: массив URL
        email: user?.email || "",
        user_id: user?.id || null,
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Ошибка отправки");
      console.log(error);
    } else {
      alert("Заявка отправлена");
      close();
    }
  };

  return createPortal(
    <div className="order-overlay" onClick={close}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={close}>
          ✕
        </button>
        <form onSubmit={submit}>
          <h2>Индивидуальный проект</h2>

          <div className="estimated-price">
            <span className="price-label">Примерная стоимость</span>
            <span className="price-value">{formatPrice(estimatedPrice)}</span>
          </div>

          {!user && (
            <div className="auth-warning">
              ⚠️ Для оформления заказа необходимо{" "}
              <span
                onClick={() => {
                  close();
                  navigate("/auth");
                }}
                style={{
                  color: "#c9a227",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                войти в систему
              </span>
            </div>
          )}

          <input
            name="name"
            placeholder="Ваше имя"
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="Телефон"
            onChange={handleChange}
            required
          />

          {user ? (
            <input
              value={user.email}
              disabled
              placeholder="Email"
              style={{
                opacity: 0.6,
                cursor: "not-allowed",
                background: "#1a1a1a",
              }}
            />
          ) : (
            <input
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
          )}

          <input
            name="plot_size"
            placeholder="Размер участка (например 10x20)"
            onChange={handleChange}
          />

          <input
            name="location"
            placeholder="Город / регион"
            onChange={handleChange}
          />

          <select name="floors" onChange={handleChange} required>
            <option value="">Этажность</option>
            <option value="1">1 этаж</option>
            <option value="2">2 этажа</option>
            <option value="3">3 этажа</option>
            <option value="4+">4+ этажа</option>
          </select>

          <select name="area_range" onChange={handleChange} required>
            <option value="">Площадь</option>
            <option>до 100 м²</option>
            <option>до 150 м²</option>
            <option>150–200 м²</option>
            <option>200+ м²</option>
          </select>

          <select name="material" onChange={handleChange}>
            <option value="">Материал</option>
            <option>Кирпич</option>
            <option>Газобетон</option>
            <option>Дерево</option>
            <option>Каркасный</option>
          </select>

          <div style={{ marginBottom: 15 }}>
            <label>
              <input type="checkbox" name="garage" onChange={handleChange} />{" "}
              Гараж
            </label>
            <br />
            <label>
              <input type="checkbox" name="terrace" onChange={handleChange} />{" "}
              Терраса
            </label>
            <br />
            <label>
              <input type="checkbox" name="mansard" onChange={handleChange} />{" "}
              Мансарда
            </label>
          </div>

          <select name="bedrooms" onChange={handleChange}>
            <option value="">Спальни</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5+</option>
          </select>

          <select name="bathrooms" onChange={handleChange}>
            <option value="">Ванные</option>
            <option>1</option>
            <option>2</option>
            <option>3+</option>
          </select>

          <select name="style" onChange={handleChange}>
            <option value="">Стиль</option>
            <option>Современный</option>
            <option>Классика</option>
            <option>Минимализм</option>
            <option>Скандинавский</option>
            <option>Любой</option>
          </select>

          <textarea
            name="description"
            placeholder="Дополнительные пожелания"
            onChange={handleChange}
          />

          {/* ✅ БЛОК ЗАГРУЗКИ ФАЙЛОВ */}
          <div className="file-upload-block">
            <label className="file-upload-label">
              📎 Прикрепить файлы (эскизы, планы, фото участка)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploadingFiles}
              style={{ display: "none" }}
            />

            <button
              type="button"
              className="file-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFiles}
            >
              {uploadingFiles ? "Загрузка..." : "📁 Выбрать файлы"}
            </button>

            {form.attachedFiles.length > 0 && (
              <div className="uploaded-files-list">
                {form.attachedFiles.map((file, index) => (
                  <div key={index} className="uploaded-file-item">
                    <span className="file-name">
                      📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      className="file-remove-btn"
                      onClick={() => handleRemoveFile(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <span className="loader"></span> : "Отправить заявку"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export default OrderForm;
