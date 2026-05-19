import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <h3>ALY AZHE®</h3>
          <p>
            Архитектурное бюро, специализирующееся на современных жилых проектах
            и индивидуальной архитектуре.
          </p>
        </div>

        <div className="footer-col">
          <h4>Навигация</h4>
          <ul>
            <li>
              <a href="#home">Главная</a>
            </li>
            <li>
              <a href="#projects">Каталог проектов</a>
            </li>
            <li>
              <a href="#order">Индивидуальный проект</a>
            </li>
            <li>
              <a href="#faq">Частые вопросы</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Контакты</h4>
          <p>Email: studio@mail.com</p>
          <p>Телефон: +7 999 123 45 67</p>
          <p>Город: Москва</p>
        </div>

        <div className="footer-col">
          <h4>Социальные сети</h4>
          <div className="footer-socials">
            <span>Instagram</span>
            <span>Telegram</span>
            <span>Behance</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} ALYAZHE®. Все права защищены.
      </div>
    </footer>
  );
}

export default Footer;
