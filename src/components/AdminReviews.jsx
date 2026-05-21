import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./AdminReviews.css";

function AdminReviews() {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingReviews();
  }, []);

  const loadPendingReviews = async () => {
    // ✅ Используем service role для обхода RLS (только для админов!)
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setLoading(false);
      return;
    }

    // Проверяем, что пользователь админ
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (profileData?.role !== "admin") {
      setLoading(false);
      return;
    }

    // ✅ Запрос БЕЗ ФИЛЬТРОВ (админ видит всё)
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_approved", false)
      .order("created_at", { ascending: false });

    console.log("Pending reviews:", data); // ✅ Для отладки
    console.log("Error:", error); // ✅ Для отладки

    if (!error) {
      setPendingReviews(data || []);
    } else {
      console.error("Ошибка загрузки отзывов:", error);
    }

    setLoading(false);
  };

  const approveReview = async (id) => {
    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: true })
      .eq("id", id);

    if (!error) {
      alert("✅ Отзыв одобрен!");
      loadPendingReviews();
    }
  };

  const deleteReview = async (id) => {
    if (!confirm("Удалить этот отзыв?")) return;

    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (!error) {
      alert("🗑️ Отзыв удалён");
      loadPendingReviews();
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star"}>
        ★
      </span>
    ));
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="admin-reviews">
      <h2>Модерация отзывов ({pendingReviews.length})</h2>

      {pendingReviews.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa" }}>
          Нет отзывов на модерации
        </p>
      ) : (
        <div className="pending-reviews-list">
          {pendingReviews.map((review) => (
            <div key={review.id} className="pending-review-card">
              <div className="review-info">
                <h3>{review.user_name}</h3>
                <div className="rating">{renderStars(review.rating)}</div>
                <p>{review.comment}</p>
                <span className="date">
                  {new Date(review.created_at).toLocaleDateString("ru-RU")}
                </span>
              </div>

              <div className="review-actions">
                <button
                  className="approve-btn"
                  onClick={() => approveReview(review.id)}
                >
                  ✅ Одобрить
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteReview(review.id)}
                >
                  🗑️ Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminReviews;
