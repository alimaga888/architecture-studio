import { useState } from "react";
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
  const { navigate } = useNavigate();
  const [loading, setLoading] = useState(false);

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
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
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

    const { error } = await supabase.from("orders").insert([
      {
        ...form,
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

          {/* Участок */}
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

          {/* Основные параметры */}
          <select name="floors" onChange={handleChange} required>
            <option value="">Этажность</option>
            <option>Одноэтажный</option>
            <option>Двухэтажный</option>
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

          {/* Галочки */}
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

          {/* Комнаты */}
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

          {/* Стиль */}
          <select name="style" onChange={handleChange}>
            <option value="">Стиль</option>
            <option>Современный</option>
            <option>Классика</option>
            <option>Минимализм</option>
            <option>Скандинавский</option>
            <option>Любой</option>
          </select>

          {/* Комментарий */}
          <textarea
            name="description"
            placeholder="Дополнительные пожелания"
            onChange={handleChange}
          />

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
