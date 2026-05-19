import { useEffect, useRef, useState } from "react";
import "./Header.css";
import { useAuth } from "./AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

function Header() {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");

  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const lastScrollY = useRef(0);
  const clickingMenu = useRef(false);

  const sections = ["home", "projects", "order", "faq", "contacts"];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 10);

      if (!clickingMenu.current) {
        if (currentScrollY < lastScrollY.current) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }

      lastScrollY.current = currentScrollY;

      sections.forEach((section) => {
        const el = document.getElementById(section);

        if (!el) return;

        const rect = el.getBoundingClientRect();

        if (rect.top <= 150 && rect.bottom >= 150) {
          setActive(section);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
      return;
    }

    clickingMenu.current = true;

    const el = document.getElementById(id);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
      });
    }

    setTimeout(() => {
      clickingMenu.current = false;
    }, 700);
  };

  return (
    <header
      className={`header ${visible ? "visible" : "hidden"} ${
        scrolled ? "scrolled" : ""
      }`}
    >
      <div className="container">
        <div
          className="logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          ALY<span>AZHE®</span>
        </div>

        <nav className="nav">
          <a
            className={active === "home" ? "active" : ""}
            onClick={() => scrollToSection("home")}
          >
            Главная
          </a>

          <a
            className={active === "projects" ? "active" : ""}
            onClick={() => scrollToSection("projects")}
          >
            Каталог проектов
          </a>

          <a
            className={active === "order" ? "active" : ""}
            onClick={() => scrollToSection("order")}
          >
            Индивидуальный проект
          </a>

          <a
            className={active === "faq" ? "active" : ""}
            onClick={() => scrollToSection("faq")}
          >
            Частые вопросы
          </a>
        </nav>

        <div className="auth-buttons">
          {user ? (
            <button
              className="profile-btn"
              onClick={() => navigate("/profile")}
            >
              👤 {profile?.full_name || "Профиль"}
            </button>
          ) : (
            <>
              <button className="login-btn" onClick={() => navigate("/auth")}>
                Вход
              </button>
              <button
                className="register-btn"
                onClick={() => navigate("/auth")}
              >
                Регистрация
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
