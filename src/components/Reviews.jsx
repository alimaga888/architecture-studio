import { useEffect, useState } from "react";
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

  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (!error) {
      setReviews(data || []);
    }
    setLoading(false);
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
      },
    ]);

    if (error) {
      alert("Ошибка при добавлении отзыва");
      console.error(error);
    } else {
      alert("✅ Отзыв отправлен на модерацию!");
      setNewReview({ rating: 5, comment: "" });
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
        <h2 className="section-title">Отзывы клиентов</h2>

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

            <button type="submit" className="submit-review-btn">
              Отправить отзыв
            </button>

            <p className="moderation-notice">
              ℹ️ Отзыв появится на сайте после модерации
            </p>
          </form>
        )}

        {/* СПИСОК ОТЗЫВОВ */}
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>Пока нет отзывов. Будьте первым!</p>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-author">
                    <div className="author-avatar">
                      {review.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4>{review.user_name}</h4>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Reviews;
