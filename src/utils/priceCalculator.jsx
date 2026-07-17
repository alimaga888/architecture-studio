// ============= БАЗОВЫЕ ЦЕНЫ =============

const BASE_PRICES = {
  "до 100 м²": 80000,
  "до 150 м²": 120000,
  "150–200 м²": 180000,
  "200+ м²": 250000,
};

const FLOOR_MULTIPLIERS = {
  1: 1.0, // без доплаты
  2: 1.15, // +15%
  3: 1.25, // +25%
  "4+": 1.35, // +35%
};

const MATERIAL_MULTIPLIERS = {
  Кирпич: 1.05, // +5%
  Газобетон: 1.0, // базовая цена
  Дерево: 1.1, // +10%
  Каркасный: 0.95, // -5%
};

const ADDITIONAL_FEATURES = {
  garage: 15000, // гараж
  terrace: 10000, // терраса
  mansard: 12000, // мансарда
};

// ============= РАСЧЁТ ЦЕНЫ ГОТОВОГО ПРОЕКТА =============

export const calculateProjectPrice = (project) => {
  if (!project || !project.area) return 0;

  // Определяем базовую цену по площади
  let basePrice = 40000;

  if (project.area <= 100) {
    basePrice = 80000;
  } else if (project.area <= 150) {
    basePrice = 120000;
  } else if (project.area <= 200) {
    basePrice = 180000;
  } else {
    basePrice = 250000;
  }

  let totalPrice = basePrice;

  // Умножаем на этажность
  if (project.floors && project.floors > 1) {
    const floorKey = project.floors > 3 ? "4+" : project.floors.toString();
    totalPrice *= FLOOR_MULTIPLIERS[floorKey] || 1.0;
  }

  return Math.round(totalPrice);
};

// ============= РАСЧЁТ ИНДИВИДУАЛЬНОГО ПРОЕКТА =============

export const calculateCustomProjectPrice = (form) => {
  // Базовая цена по площади
  let totalPrice = BASE_PRICES[form.area_range] || 40000;

  // Умножаем на этажность
  if (form.floors) {
    totalPrice *= FLOOR_MULTIPLIERS[form.floors] || 1.0;
  }

  // Умножаем на материал
  if (form.material && MATERIAL_MULTIPLIERS[form.material]) {
    totalPrice *= MATERIAL_MULTIPLIERS[form.material];
  }

  // Добавляем доп. опции
  if (form.garage) totalPrice += ADDITIONAL_FEATURES.garage;
  if (form.terrace) totalPrice += ADDITIONAL_FEATURES.terrace;
  if (form.mansard) totalPrice += ADDITIONAL_FEATURES.mansard;

  // Доплата за спальни (опционально, если нужно)
  if (form.bedrooms && form.bedrooms !== "") {
    const bedroomCount = parseInt(form.bedrooms);
    if (bedroomCount > 3) {
      totalPrice += (bedroomCount - 3) * 5000; // +5000₽ за каждую доп. спальню
    }
  }

  return Math.round(totalPrice);
};

// ============= ФОРМАТИРОВАНИЕ ЦЕНЫ =============

export const formatPrice = (price) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(price);
};
