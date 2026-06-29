const BASE_PRICE_PER_M2 = 20;

export const calculateProjectPrice = (project) => {
  if (!project || !project.area) return 0;

  let totalPrice = project.area * BASE_PRICE_PER_M2;

  if (project.floors && project.floors > 1) {
    totalPrice *= 1 + (project.floors - 1) * 0.1;
  }

  if (project.bedrooms) {
    totalPrice += project.bedrooms * 200;
  }

  return Math.round(totalPrice);
};

export const calculateCustomProjectPrice = (form) => {
  const areaRanges = {
    "до 100 м²": 75,
    "до 150 м²": 125,
    "150–200 м²": 175,
    "200+ м²": 300,
  };

  const area = areaRanges[form.area_range] || 150;

  let totalPrice = area * BASE_PRICE_PER_M2;

  if (form.floors === "Двухэтажный") {
    totalPrice *= 1.1;
  }

  if (form.bedrooms && form.bedrooms !== "") {
    const bedroomCount = parseInt(form.bedrooms);
    totalPrice += bedroomCount * 200;
  }

  const materialBonuses = {
    Кирпич: 1.05, // ИЗМЕНЕНО: +5%
    Газобетон: 1.0, // базовая цена
    Дерево: 1.1, // ИЗМЕНЕНО: +10%
    Каркасный: 0.95, // ИЗМЕНЕНО: -5%
  };

  if (form.material && materialBonuses[form.material]) {
    totalPrice *= materialBonuses[form.material];
  }

  if (form.garage) totalPrice += 400;
  if (form.terrace) totalPrice += 300;
  if (form.mansard) totalPrice += 350;

  return Math.round(totalPrice);
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(price);
};
