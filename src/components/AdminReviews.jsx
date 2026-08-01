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

    // ✅ Загружаем отзывы на модерации
    const { data: reviewsData, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_approved", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Ошибка загрузки отзывов:", error);
      setLoading(false);
      return;
    }

    // ✅ Загружаем профили для отзывов с user_id
    const userIds = reviewsData
      .map((r) => r.user_id)
      .filter((id) => id !== null && id !== undefined);

    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, avatar_url, full_name")
        .in("id", userIds);

      // Объединяем данные
      const reviewsWithProfiles = reviewsData.map((review) => ({
        ...review,
        profile: profilesData?.find((p) => p.id === review.user_id) || null,
      }));

      setPendingReviews(reviewsWithProfiles);
    } else {
      setPendingReviews(reviewsData);
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
                {/* ✅ БЛОК С АВАТАРКОЙ И ИМЕНЕМ */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "15px",
                  }}
                >
                  <div
                    className="author-avatar"
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      background:
                        "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "var(--bg-primary)",
                      boxShadow: "0 0 15px rgba(0, 240, 255, 0.4)",
                    }}
                  >
                    {review.profile?.avatar_url ? (
                      <img
                        src={review.profile.avatar_url}
                        alt={review.user_name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span>{review.user_name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        color: "var(--neon-cyan)",
                      }}
                    >
                      {review.profile?.full_name || review.user_name}
                    </h3>
                    <span
                      className="date"
                      style={{
                        fontSize: "12px",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {new Date(review.created_at).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                </div>

                <div className="rating">{renderStars(review.rating)}</div>
                <p>{review.comment}</p>

                {review.project_photo_url && (
                  <div className="review-photo-preview">
                    <img
                      src={review.project_photo_url}
                      alt="Фото проекта"
                      onClick={() =>
                        window.open(review.project_photo_url, "_blank")
                      }
                    />
                  </div>
                )}
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
