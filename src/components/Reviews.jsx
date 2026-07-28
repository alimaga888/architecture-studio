import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "./Reviews.css";

function Reviews() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showReviews, setShowReviews] = useState(false); // ✅ Новое состояние
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    projectPhoto: null, // ✅ Фото проекта
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      // ✅ Сначала загружаем отзывы
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (reviewsError) {
        console.error("Ошибка загрузки отзывов:", reviewsError);
        setLoading(false);
        return;
      }

      // ✅ Загружаем профили пользователей (только для тех, у кого есть user_id)
      const userIds = reviewsData
        .map((r) => r.user_id)
        .filter((id) => id !== null && id !== undefined);

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, avatar_url, full_name")
          .in("id", userIds);

        // ✅ Объединяем данные вручную
        const reviewsWithProfiles = reviewsData.map((review) => ({
          ...review,
          profile: profilesData?.find((p) => p.id === review.user_id) || null,
        }));

        setReviews(reviewsWithProfiles);
      } else {
        setReviews(reviewsData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error);
      setLoading(false);
    }
  };

  // ✅ Загрузка фото проекта
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("📤 Загрузка файла:", file.name);

    setUploadingPhoto(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("reviews")
      .upload(fileName, file);

    if (uploadError) {
      console.error("❌ Ошибка загрузки:", uploadError);
      alert(`Ошибка загрузки фото: ${uploadError.message}`);
      setUploadingPhoto(false);
      return;
    }

    // console.log("✅ Файл загружен:", data);

    const { data: urlData } = supabase.storage
      .from("reviews")
      .getPublicUrl(fileName);

    setNewReview({ ...newReview, projectPhoto: urlData.publicUrl });
    setUploadingPhoto(false);
  };

  const handleRemovePhoto = () => {
    setNewReview({ ...newReview, projectPhoto: null });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Войдите, чтобы оставить отзыв");
      navigate("/auth");
      return;
    }

    const { error } = await supabase.from("reviews").insert([
      {
        user_id: user.id,
        user_name: profile?.full_name || user.email.split("@")[0],
        rating: newReview.rating,
        comment: newReview.comment,
        project_photo_url: newReview.projectPhoto, // ✅ Сохраняем фото
      },
    ]);

    if (error) {
      alert("Ошибка при добавлении отзыва");
      console.error(error);
    } else {
      alert("✅ Отзыв отправлен на модерацию!");
      setNewReview({ rating: 5, comment: "", projectPhoto: null });
      setShowForm(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star"}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <section id="reviews" className="reviews-section">
        <div className="loading">Загрузка отзывов...</div>
      </section>
    );
  }

  return (
    <section id="reviews" className="reviews-section">
      <div className="reviews-container">
        <h2 className="section-title">Отзывы клиентов ({reviews.length})</h2>

        <button
          className="add-review-btn"
          onClick={() => {
            if (!user) {
              navigate("/auth");
            } else {
              setShowForm(!showForm);
            }
          }}
        >
          {showForm ? "✕ Закрыть" : "➕ Оставить отзыв"}
        </button>

        {/* ✅ КНОПКА ПОКАЗАТЬ/СКРЫТЬ ОТЗЫВЫ */}
        {reviews.length > 0 && (
          <button
            className="toggle-reviews-btn"
            onClick={() => setShowReviews(!showReviews)}
          >
            {showReviews ? "▲ Скрыть отзывы" : "▼ Показать отзывы"}
          </button>
        )}

        {/* ФОРМА ДОБАВЛЕНИЯ ОТЗЫВА */}
        {showForm && (
          <form className="review-form" onSubmit={handleSubmit}>
            <h3>Ваш отзыв</h3>

            <div className="rating-input">
              <label>Оценка:</label>
              <div className="stars-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={
                      star <= newReview.rating ? "star filled" : "star"
                    }
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <textarea
              placeholder="Расскажите о вашем опыте работы с нами..."
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
              required
              rows="5"
            />

            {/* ✅ ЗАГРУЗКА ФОТО ПРОЕКТА */}
            <div className="photo-upload-block">
              <label className="photo-upload-label">
                📸 Добавить фото построенного дома (по желанию)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                key={newReview.projectPhoto ? "has-photo" : "no-photo"}
              />
              {uploadingPhoto && <p className="uploading-text">Загрузка...</p>}
              {newReview.projectPhoto && (
                <div className="photo-preview">
                  <img src={newReview.projectPhoto} alt="Превью" />
                  <button type="button" onClick={handleRemovePhoto}>
                    ✕ Удалить
                  </button>
                </div>
              )}
            </div>

            <button type="submit" className="submit-review-btn">
              Отправить отзыв
            </button>

            <p className="moderation-notice">
              ℹ️ Отзыв появится на сайте после модерации
            </p>
          </form>
        )}

        {/* ✅ СПИСОК ОТЗЫВОВ (СВЕРНУТЫЙ ПО УМОЛЧАНИЮ) */}
        {showReviews && (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-author">
                    {/* ✅ АВАТАРКА ПОЛЬЗОВАТЕЛЯ */}
                    <div className="author-avatar">
                      {review.profiles?.avatar_url ? (
                        <img
                          src={review.profiles.avatar_url}
                          alt={review.user_name}
                        />
                      ) : (
                        <span>{review.user_name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h4>{review.profile?.full_name || review.user_name}</h4>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString(
                          "ru-RU",
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>

                <p className="review-comment">{review.comment}</p>

                {/* ✅ ФОТО ПРОЕКТА */}
                {review.project_photo_url && (
                  <div className="review-project-photo">
                    <img
                      src={review.project_photo_url}
                      alt="Построенный дом"
                      onClick={() =>
                        window.open(review.project_photo_url, "_blank")
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!showReviews && reviews.length === 0 && (
          <div className="no-reviews">
            <p>Пока нет отзывов. Будьте первым!</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Reviews;
