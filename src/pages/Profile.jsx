import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const { user, profile, signOut, isAdmin } = useAuth(); // ✅ Деструктуризация
  const [customOrders, setCustomOrders] = useState([]);
  const [catalogOrders, setCatalogOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ ПРОВЕРКА ЗДЕСЬ:
  console.log("USER:", user);
  console.log("PROFILE:", profile); // Будет null пока грузится
  console.log("IS ADMIN:", isAdmin());

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    const { data: custom } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: catalog } = await supabase
      .from("project_orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setCustomOrders(custom || []);
    setCatalogOrders(catalog || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="profile-page">Загрузка...</div>;
  }

  const totalOrders = customOrders.length + catalogOrders.length;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1>Личный кабинет</h1>
          <p className="profile-email">{user?.email}</p>
          {profile?.full_name && (
            <p className="profile-name">{profile.full_name}</p>
          )}
          {isAdmin() && <span className="admin-badge">Администратор</span>}
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </div>

      {isAdmin() && (
        <button className="admin-panel-btn" onClick={() => navigate("/admin")}>
          📊 Панель администратора
        </button>
      )}

      <div className="orders-section">
        <h2>Мои заказы ({totalOrders})</h2>

        {totalOrders === 0 ? (
          <div className="no-orders">
            <p>У вас пока нет заказов</p>
            <button onClick={() => navigate("/#order")}>Оформить заказ</button>
          </div>
        ) : (
          <>
            {/* ✅ ИНДИВИДУАЛЬНЫЕ ЗАКАЗЫ */}
            {customOrders.length > 0 && (
              <div className="order-group">
                <h3 className="order-group-title">
                  Индивидуальные проекты ({customOrders.length})
                </h3>
                <div className="orders-list">
                  {customOrders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <h3>Заказ #{order.id.slice(0, 8)}</h3>
                        <span className="order-date">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="order-details">
                        <p>
                          <strong>Площадь:</strong> {order.area_range}
                        </p>
                        <p>
                          <strong>Этажность:</strong> {order.floors}
                        </p>
                        <p>
                          <strong>Локация:</strong>{" "}
                          {order.location || "Не указана"}
                        </p>
                        {order.description && (
                          <p>
                            <strong>Комментарий:</strong> {order.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ ЗАКАЗЫ ГОТОВЫХ ПРОЕКТОВ */}
            {catalogOrders.length > 0 && (
              <div className="order-group">
                <h3 className="order-group-title">
                  Готовые проекты ({catalogOrders.length})
                </h3>
                <div className="orders-list">
                  {catalogOrders.map((order) => (
                    <div key={order.id} className="order-card catalog">
                      <div className="order-header">
                        <h3>{order.project_title}</h3>
                        <span className="order-date">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="order-details">
                        <p>
                          <strong>ID заказа:</strong> #{order.id.slice(0, 8)}
                        </p>
                        <p>
                          <strong>Телефон:</strong> {order.phone || "—"}
                        </p>
                        {order.telegram && (
                          <p>
                            <strong>Telegram:</strong> {order.telegram}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
