import { useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "./OrderFromProject.css";
import "./OrderForm.css";

function OrderFromProject({ project, close }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    telegram: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!user) {
      const shouldLogin = window.confirm(
        "Для заказа проекта необходимо войти в систему.\n\nПерейти на страницу входа?",
      );

      if (shouldLogin) {
        close();
        navigate("/auth");
      }
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("project_orders").insert([
      {
        ...form,
        email: user?.email || "",
        user_id: user?.id || null,
        project_id: project.id,
        project_title: project.title,
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

  return (
    <div className="order-overlay" onClick={close}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={close}>
          ✕
        </button>

        <h2>{project.title}</h2>
        <p style={{ color: "#aaa", marginBottom: 20 }}>
          Оставьте контакты мы с вами свяжемся
        </p>

        {!user && (
          <div className="auth-warning">
            ⚠️ Для заказа необходимо
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
              Войти в систему
            </span>
          </div>
        )}

        <form onSubmit={submit}>
          <input
            name="name"
            placeholder="Имя"
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
            <input name="email" placeholder="Email" onChange={handleChange} />
          )}
          <input name="phone" placeholder="Телефон" onChange={handleChange} />

          <input
            name="telegram"
            placeholder="Telegram (по желанию)"
            onChange={handleChange}
          />

          <button type="submit" className="submit-btn">
            {loading ? "Отправка..." : "Отправить"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OrderFromProject;
