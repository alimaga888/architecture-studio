const BASE_PRICE_PER_M2 = 50000;

export const calculateProjectPrice = (project) => {
  if (!project || !project.area) return 0;

  let totalPrice = project.area * BASE_PRICE_PER_M2;

  if (project.floors && project.floors > 1) {
    totalPrice *= 1 + (project.floors - 1) * 0.1;
  }

  if (project.bedrooms) {
    totalPrice += project.bedrooms * 50000;
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
    totalPrice *= 1.15;
  }

  if (form.bedrooms && form.bedrooms !== "") {
    const bedroomCount = parseInt(form.bedrooms);
    totalPrice += bedroomCount * 50000;
  }

  const materialBonuses = {
    Кирпич: 1.1, // +10%
    Газобетон: 1.0, // базовая цена
    Дерево: 1.2, // +20%
    Каркасный: 0.9, // -10%
  };

  if (form.garage) totalPrice += 200000;
  if (form.terrace) totalPrice += 150000;
  if (form.mansard) totalPrice += 180000;

  return Math.round(totalPrice);
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(price);
};
