import { useState } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate("/profile");
      } else {
        // ✅ РЕГИСТРАЦИЯ С АВАТАРКОЙ
        const { data, error } = await signUp(email, password, fullName);
        if (error) throw error;

        // Если есть аватарка - загружаем
        if (avatarFile && data.user) {
          const fileExt = avatarFile.name.split(".").pop();
          const fileName = `${data.user.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, avatarFile);

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from("avatars")
              .getPublicUrl(fileName);

            await supabase
              .from("profiles")
              .update({ avatar_url: urlData.publicUrl })
              .eq("id", data.user.id);
          }
        }

        alert("Регистрация успешна! Проверьте почту для подтверждения.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button className="back-to-home" onClick={() => navigate("/")}>
        ← На главную
      </button>
      <div className="auth-container">
        <h1>{isLogin ? "Вход" : "Регистрация"}</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Имя"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              {/* ✅ ЗАГРУЗКА АВАТАРА ПРИ РЕГИСТРАЦИИ */}
              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "14px",
                  }}
                >
                  Аватар (необязательно)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files[0])}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>

        <p className="toggle-mode">
          {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Зарегистрируйтесь" : "Войдите"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;
