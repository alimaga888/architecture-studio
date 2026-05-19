import "./FAQ.css";
import { useState } from "react";

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faq = [
    {
      question: "Сколько стоит индивидуальный проект?",
      answer:
        "Стоимость зависит от площади дома, сложности архитектуры и требований клиента. После отправки заявки мы связываемся с вами и рассчитываем стоимость.",
    },
    {
      question: "Сколько времени занимает разработка проекта?",
      answer:
        "В среднем разработка индивидуального проекта занимает от 2 до 6 недель в зависимости от сложности.",
    },
    {
      question: "Можно ли изменить готовый проект?",
      answer:
        "Да, большинство готовых проектов можно адаптировать под ваши требования: изменить планировку, фасад или площадь.",
    },
    {
      question: "Вы работаете с другими городами?",
      answer:
        "Да, мы работаем дистанционно и можем разработать проект для любого региона.",
    },
  ];

  const toggle = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section id="faq" className="faq-section">
      <h2>Частые вопросы</h2>

      <div className="faq-list">
        {faq.map((item, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? "active" : ""}`}
          >
            <div className="faq-question" onClick={() => toggle(index)}>
              <span>{item.question}</span>
              <span className="faq-arrow">⌄</span>
            </div>

            {openIndex === index && (
              <div className="faq-answer">{item.answer}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default FAQ;
