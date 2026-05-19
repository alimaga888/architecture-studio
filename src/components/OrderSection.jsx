import { useEffect, useState } from "react";
import OrderForm from "./OrderForm";
import "./OrderSection.css";

function OrderSection() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [open]);
  return (
    <section id="order" className="order-section">
      <h2>Не нашли подходящий проект?</h2>

      <p>
        Мы разработает индивидуальный архитектрный проект полностью под ваши
        требования
      </p>

      <button className="order-project-btn" onClick={() => setOpen(true)}>
        Заказать индивидуальный проект
      </button>

      {open && <OrderForm close={() => setOpen(false)} />}
    </section>
  );
}

export default OrderSection;
