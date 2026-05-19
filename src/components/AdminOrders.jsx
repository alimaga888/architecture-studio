import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import "./AdminOrders.css";

function AdminOrders() {
  const [activeTab, setActiveTab] = useState("custom");
  const [customOrders, setCustomOrders] = useState([]);
  const [catalogOrders, setCatalogOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetchOrders();
  }, []);

  const checkAdminAndFetchOrders = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        throw new Error("Пользователь не авторизован");
      }

      // Проверяем роль пользователя
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.user.id)
        .single();

      if (profileError) {
        throw new Error(`Ошибка загрузки профиля: ${profileError.message}`);
      }

      const userIsAdmin = profileData?.role === "admin";
      setIsAdmin(userIsAdmin);

      if (!userIsAdmin) {
        setError("У вас нет доступа к этой странице");
        setLoading(false);
        return;
      }

      // Загружаем все заказы (админ может видеть все)
      await fetchAllOrders();
    } catch (error) {
      console.error("Ошибка:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    try {
      // ✅ Загружаем ВСЕ заказы со ВСЕМИ полями
      const { data: custom, error: customError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: catalog, error: catalogError } = await supabase
        .from("project_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (customError) {
        console.error("Ошибка custom orders:", customError);
        throw customError;
      }

      if (catalogError) {
        console.error("Ошибка catalog orders:", catalogError);
        throw catalogError;
      }

      console.log("Custom orders:", custom); // Для отладки
      console.log("Catalog orders:", catalog); // Для отладки

      setCustomOrders(custom || []);
      setCatalogOrders(catalog || []);
    } catch (error) {
      console.error("Ошибка загрузки заказов:", error);
      setError(`Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>❌ Ошибка</h1>
          <button className="back-btn" onClick={() => navigate("/profile")}>
            ← Назад
          </button>
        </div>
        <div style={{ color: "#ff6b6b", padding: "20px", textAlign: "center" }}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div style={{ color: "#ff6b6b", padding: "40px", textAlign: "center" }}>
          <h2>❌ Доступ запрещён</h2>
          <p>Только администраторы могут видеть эту страницу</p>
          <button onClick={() => navigate("/profile")}>
            Вернуться в профиль
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>📊 Панель администратора</h1>
        <button className="back-btn" onClick={() => navigate("/profile")}>
          ← Назад в профиль
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "custom" ? "active" : ""}`}
          onClick={() => setActiveTab("custom")}
        >
          Индивидуальные проекты ({customOrders.length})
        </button>
        <button
          className={`tab ${activeTab === "catalog" ? "active" : ""}`}
          onClick={() => setActiveTab("catalog")}
        >
          Готовые проекты ({catalogOrders.length})
        </button>
      </div>

      {activeTab === "custom" && (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Площадь</th>
                <th>Этажность</th>
                <th>Материал</th>
                <th>Спальни</th>
                <th>Ванные</th>
                <th>Стиль</th>
                <th>Локация</th>
                <th>Гараж</th>
                <th>Терраса</th>
                <th>Мансарда</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {customOrders.length > 0 ? (
                customOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id.slice(0, 8)}</td>
                    <td>{order.name}</td>
                    <td>{order.email}</td>
                    <td>{order.phone || "—"}</td>
                    <td>{order.area_range || "—"}</td>
                    <td>{order.floors || "—"}</td>
                    <td>{order.material || "—"}</td>
                    <td>{order.bedrooms || "—"}</td>
                    <td>{order.bathrooms || "—"}</td>
                    <td>{order.style || "—"}</td>
                    <td>{order.location || "—"}</td>
                    <td>{order.garage ? "✅" : "❌"}</td>
                    <td>{order.terrace ? "✅" : "❌"}</td>
                    <td>{order.mansard ? "✅" : "❌"}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="15"
                    style={{ textAlign: "center", color: "#aaa" }}
                  >
                    Заказов нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "catalog" && (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Проект</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Telegram</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {catalogOrders.length > 0 ? (
                catalogOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id.slice(0, 8)}</td>
                    <td>
                      <strong>{order.project_title}</strong>
                    </td>
                    <td>{order.name}</td>
                    <td>{order.email}</td>
                    <td>{order.phone || "—"}</td>
                    <td>{order.telegram || "—"}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", color: "#aaa" }}
                  >
                    Заказов нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
