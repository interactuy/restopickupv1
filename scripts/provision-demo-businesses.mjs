import fs from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

const DEMO_PASSWORD = "RestoDemo2026!";
const DEFAULT_TIMEZONE = "America/Montevideo";
const DEFAULT_CURRENCY = "UYU";
const DEFAULT_COORDS = {
  latitude: -34.9011,
  longitude: -56.1645,
};

function loadEnvFile(filename) {
  const envPath = path.join(process.cwd(), filename);

  if (!fs.existsSync(envPath)) {
    return;
  }

  const raw = fs.readFileSync(envPath, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta la variable ${name}.`);
  }

  return value;
}

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function placeholder(width, height, background, foreground, text) {
  return `https://placehold.co/${width}x${height}/${background}/${foreground}?text=${encodeURIComponent(text)}`;
}

function allDaysSchedule(openTime, closeTime) {
  return Array.from({ length: 7 }, (_, index) => ({
    day: index,
    is_closed: false,
    open_time: openTime,
    close_time: closeTime,
  }));
}

function createBusinessSeed(config) {
  return {
    ...config,
    email: `demo.${config.slug}@restopickup.test`,
    password: DEMO_PASSWORD,
    categories: config.categories.map((category, index) => ({
      ...category,
      slug: category.slug ?? slugify(category.name),
      position: category.position ?? index + 1,
    })),
    products: config.products.map((product, index) => ({
      ...product,
      slug: product.slug ?? slugify(product.name),
      position: product.position ?? index + 1,
      imageUrl:
        product.imageUrl ??
        placeholder(1200, 900, config.productImage.background, config.productImage.foreground, product.name),
      optionGroups:
        product.optionGroups?.map((group, groupIndex) => ({
          ...group,
          position: group.position ?? groupIndex,
          items: group.items.map((item, itemIndex) => ({
            ...item,
            position: item.position ?? itemIndex,
            isActive: item.isActive ?? true,
          })),
        })) ?? [],
    })),
    profileImageUrl:
      config.profileImageUrl ??
      placeholder(480, 480, config.brand.background, config.brand.foreground, config.brand.shortLabel),
    coverImageUrl:
      config.coverImageUrl ??
      placeholder(1600, 700, config.brand.coverBackground, config.brand.coverForeground, config.brand.coverLabel),
  };
}

const demoBusinesses = [
  createBusinessSeed({
    name: "Bruma Cafe",
    slug: "bruma-cafe-pocitos",
    area: "Pocitos",
    legalName: "Bruma Cafe SRL",
    description:
      "Cafe de especialidad, bakery del dia y sandwiches livianos para resolver desayunos, meriendas y almuerzos cortos en Pocitos.",
    phone: "+598 91 111 201",
    contactActionType: "whatsapp",
    pickupAddress: "Benito Blanco 1120, Pocitos, Montevideo",
    pickupInstructions: "Retira tu pedido por barra. Mostra el numero de pedido y tu nombre.",
    businessHoursText: "Lun a Dom de 08:00 a 20:30",
    businessHours: allDaysSchedule("08:00", "20:30"),
    prepTime: { min: 10, max: 18 },
    coords: { latitude: -34.9175, longitude: -56.1491 },
    brand: {
      background: "F2E7D8",
      foreground: "5A3A22",
      coverBackground: "D5B38A",
      coverForeground: "FFFDFC",
      shortLabel: "Bruma",
      coverLabel: "Bruma Cafe",
    },
    productImage: { background: "F2E7D8", foreground: "5A3A22" },
    categories: [
      { name: "Cafe", description: "Espresso, filtrados y bebidas con leche." },
      { name: "Bakery", description: "Medialunas, rolls y pasteleria del dia." },
      { name: "Brunch", description: "Tostadas, sandwiches y combos livianos." },
      { name: "Frio", description: "Jugos, limonadas y bebidas frias." },
    ],
    products: [
      {
        name: "Flat White",
        categorySlug: "cafe",
        description: "Doble espresso con leche texturizada. Balanceado y cremoso.",
        priceAmount: 165,
        optionGroups: [
          {
            name: "Tamano",
            selectionType: "single",
            isRequired: true,
            minSelect: 1,
            items: [
              { name: "Regular", priceDeltaAmount: 0 },
              { name: "Grande", priceDeltaAmount: 35 },
            ],
          },
          {
            name: "Leche",
            selectionType: "single",
            isRequired: true,
            minSelect: 1,
            items: [
              { name: "Entera", priceDeltaAmount: 0 },
              { name: "Deslactosada", priceDeltaAmount: 20 },
              { name: "Almendras", priceDeltaAmount: 30 },
            ],
          },
        ],
      },
      {
        name: "Cold Brew Citrus",
        categorySlug: "cafe",
        description: "Cafe en frio con almibar citrico y hielo.",
        priceAmount: 210,
        compareAtAmount: 250,
      },
      {
        name: "Roll de Canela",
        categorySlug: "bakery",
        description: "Roll tibio con glasé suave y canela especiada.",
        priceAmount: 190,
      },
      {
        name: "Cookie Box x 4",
        categorySlug: "bakery",
        description: "Mix de cookies de chocolate, avena y mani.",
        priceAmount: 280,
        compareAtAmount: 340,
      },
      {
        name: "Tostado Bruma",
        categorySlug: "brunch",
        description: "Pan de masa madre, jamon cocido, queso colonia y mostaza suave.",
        priceAmount: 325,
        optionGroups: [
          {
            name: "Extra",
            selectionType: "multiple",
            maxSelect: 3,
            items: [
              { name: "Tomate asado", priceDeltaAmount: 35 },
              { name: "Queso extra", priceDeltaAmount: 45 },
              { name: "Huevo revuelto", priceDeltaAmount: 55 },
            ],
          },
        ],
      },
      {
        name: "Yogur Bowl Granola",
        categorySlug: "brunch",
        description: "Yogur natural, granola casera, banana y frutos rojos.",
        priceAmount: 290,
      },
      {
        name: "Limonada Menta Jengibre",
        categorySlug: "frio",
        description: "Botella de 500 ml bien fria.",
        priceAmount: 160,
      },
    ],
  }),
  createBusinessSeed({
    name: "Patio Tostado",
    slug: "patio-tostado-punta-carretas",
    area: "Punta Carretas",
    legalName: "Patio Tostado SAS",
    description:
      "Cafe de barrio con foco en brunch, pasteleria y sandwiches calientes para retirar cerca de Punta Carretas Shopping.",
    phone: "+598 91 111 202",
    contactActionType: "call",
    pickupAddress: "Jose Ellauri 515, Punta Carretas, Montevideo",
    pickupInstructions: "El retiro es en caja lateral. Podes pasar con el numero y apellido.",
    businessHoursText: "Lun a Dom de 08:30 a 21:00",
    businessHours: allDaysSchedule("08:30", "21:00"),
    prepTime: { min: 12, max: 20 },
    coords: { latitude: -34.9264, longitude: -56.1587 },
    brand: {
      background: "E9DFC8",
      foreground: "4B2E1F",
      coverBackground: "9A7058",
      coverForeground: "FFFDFC",
      shortLabel: "Patio",
      coverLabel: "Patio Tostado",
    },
    productImage: { background: "E9DFC8", foreground: "4B2E1F" },
    categories: [
      { name: "Bebidas calientes", slug: "bebidas-calientes", description: "Cafe, chocolate y chai." },
      { name: "Laminados", description: "Croissants, pain au chocolat y rolls." },
      { name: "Sandwiches", description: "Opciones saladas para desayuno o almuerzo." },
      { name: "Postres", description: "Tortas y porciones dulces." },
    ],
    products: [
      {
        name: "Capuccino de la Casa",
        categorySlug: "bebidas-calientes",
        description: "Espresso doble, leche cremosa y cacao amargo.",
        priceAmount: 175,
        optionGroups: [
          {
            name: "Tamano",
            selectionType: "single",
            isRequired: true,
            minSelect: 1,
            items: [
              { name: "Mediano", priceDeltaAmount: 0 },
              { name: "Grande", priceDeltaAmount: 40 },
            ],
          },
        ],
      },
      {
        name: "Chai Latte Vainilla",
        categorySlug: "bebidas-calientes",
        description: "Blend especiado con leche y toque de vainilla.",
        priceAmount: 220,
      },
      {
        name: "Croissant de Almendras",
        categorySlug: "laminados",
        description: "Croissant hojaldrado relleno de crema de almendras.",
        priceAmount: 205,
        compareAtAmount: 245,
      },
      {
        name: "Pain au Chocolat",
        categorySlug: "laminados",
        description: "Laminado de manteca con chocolate semi amargo.",
        priceAmount: 195,
      },
      {
        name: "Sandwich Club de Pollo",
        categorySlug: "sandwiches",
        description: "Pollo braseado, panceta, queso, tomate y hojas verdes.",
        priceAmount: 390,
        optionGroups: [
          {
            name: "Acompanamiento",
            selectionType: "single",
            isRequired: true,
            minSelect: 1,
            items: [
              { name: "Sin acompanamiento", priceDeltaAmount: 0 },
              { name: "Papas chips", priceDeltaAmount: 70 },
              { name: "Mix de verdes", priceDeltaAmount: 60 },
            ],
          },
        ],
      },
      {
        name: "Bagel Veggie",
        categorySlug: "sandwiches",
        description: "Bagel tostado con hummus, palta, tomates secos y pepino.",
        priceAmount: 355,
      },
      {
        name: "Cheesecake Frutos Rojos",
        categorySlug: "postres",
        description: "Porcion individual con base crocante y salsa casera.",
        priceAmount: 245,
      },
    ],
  }),
  createBusinessSeed({
    name: "Fuego del Puerto",
    slug: "fuego-del-puerto-ciudad-vieja",
    area: "Ciudad Vieja",
    legalName: "Fuego del Puerto SAS",
    description:
      "Parrilla urbana con cortes seleccionados, sandwiches potentes y guarniciones para retirar en Ciudad Vieja.",
    phone: "+598 91 111 203",
    contactActionType: "whatsapp",
    pickupAddress: "Perez Castellano 1389, Ciudad Vieja, Montevideo",
    pickupInstructions: "Retiro por barra frontal. Si pediste carne a punto, revisamos el ticket antes de entregar.",
    businessHoursText: "Mar a Dom de 12:00 a 23:00",
    businessHours: [
      { day: 0, is_closed: false, open_time: "12:00", close_time: "23:00" },
      { day: 1, is_closed: true, open_time: "", close_time: "" },
      { day: 2, is_closed: false, open_time: "12:00", close_time: "23:00" },
      { day: 3, is_closed: false, open_time: "12:00", close_time: "23:00" },
      { day: 4, is_closed: false, open_time: "12:00", close_time: "23:00" },
      { day: 5, is_closed: false, open_time: "12:00", close_time: "23:30" },
      { day: 6, is_closed: false, open_time: "12:00", close_time: "23:30" },
    ],
    prepTime: { min: 22, max: 35 },
    coords: { latitude: -34.9063, longitude: -56.2098 },
    brand: {
      background: "E8D7C1",
      foreground: "4B2E1F",
      coverBackground: "512E22",
      coverForeground: "F5E3D1",
      shortLabel: "Fuego",
      coverLabel: "Fuego del Puerto",
    },
    productImage: { background: "E8D7C1", foreground: "4B2E1F" },
    categories: [
      { name: "Cortes", description: "Platos principales a la parrilla." },
      { name: "Sandwiches", description: "Sandwiches de carnes y brasas." },
      { name: "Guarniciones", description: "Papas, vegetales y ensaladas." },
      { name: "Postres", description: "Cierre dulce de la casa." },
    ],
    products: [
      {
        name: "Bife Ancho 350 g",
        categorySlug: "cortes",
        description: "Corte jugoso con sal de brasas y chimichurri aparte.",
        priceAmount: 890,
        optionGroups: [
          {
            name: "Punto de coccion",
            selectionType: "single",
            isRequired: true,
            minSelect: 1,
            items: [
              { name: "Jugoso", priceDeltaAmount: 0 },
              { name: "A punto", priceDeltaAmount: 0 },
              { name: "Cocido", priceDeltaAmount: 0 },
            ],
          },
          {
            name: "Guarnicion",
            selectionType: "single",
            isRequired: true,
            minSelect: 1,
            items: [
              { name: "Papas fritas", priceDeltaAmount: 0 },
              { name: "Pure rustico", priceDeltaAmount: 30 },
              { name: "Vegetales grillados", priceDeltaAmount: 40 },
            ],
          },
        ],
      },
      {
        name: "Entraña Fina",
        categorySlug: "cortes",
        description: "Entraña tierna con criolla fresca.",
        priceAmount: 940,
      },
      {
        name: "Chivito al Carbon",
        categorySlug: "sandwiches",
        description: "Lomo, queso, panceta, lechuga, tomate y mayonesa de ajo.",
        priceAmount: 620,
        compareAtAmount: 720,
        optionGroups: [
          {
            name: "Extra",
            selectionType: "multiple",
            maxSelect: 3,
            items: [
              { name: "Huevo", priceDeltaAmount: 35 },
              { name: "Muzzarella extra", priceDeltaAmount: 45 },
              { name: "Panceta extra", priceDeltaAmount: 55 },
            ],
          },
        ],
      },
      {
        name: "Sandwich de Bondiola",
        categorySlug: "sandwiches",
        description: "Bondiola braseada, coleslaw y pepinos encurtidos.",
        priceAmount: 540,
      },
      {
        name: "Papas a la Parrilla",
        categorySlug: "guarniciones",
        description: "Papas crocantes con manteca de hierbas.",
        priceAmount: 260,
      },
      {
        name: "Vegetales de Estacion",
        categorySlug: "guarniciones",
        description: "Mix de vegetales grillados con oliva y limon.",
        priceAmount: 245,
      },
      {
        name: "Flan Casero",
        categorySlug: "postres",
        description: "Flan de vainilla con dulce de leche y crema.",
        priceAmount: 210,
      },
    ],
  }),
  createBusinessSeed({
    name: "Nonna Rina",
    slug: "nonna-rina-pastas-prado",
    area: "Prado",
    legalName: "Nonna Rina SRL",
    description:
      "Pastas frescas, salsas caseras y platos de horno para retirar en Prado, con perfil familiar y porciones abundantes.",
    phone: "+598 91 111 204",
    contactActionType: "call",
    pickupAddress: "Av. Agraciada 3870, Prado, Montevideo",
    pickupInstructions: "Retira por la caja principal. Si llevas pasta fresca te la entregamos marcada por color.",
    businessHoursText: "Mar a Dom de 11:30 a 22:30",
    businessHours: [
      { day: 0, is_closed: false, open_time: "11:30", close_time: "22:30" },
      { day: 1, is_closed: true, open_time: "", close_time: "" },
      { day: 2, is_closed: false, open_time: "11:30", close_time: "22:30" },
      { day: 3, is_closed: false, open_time: "11:30", close_time: "22:30" },
      { day: 4, is_closed: false, open_time: "11:30", close_time: "22:30" },
      { day: 5, is_closed: false, open_time: "11:30", close_time: "23:00" },
      { day: 6, is_closed: false, open_time: "11:30", close_time: "23:00" },
    ],
    prepTime: { min: 18, max: 28 },
    coords: { latitude: -34.8678, longitude: -56.2081 },
    brand: {
      background: "F1E0D2",
      foreground: "6A3F2A",
      coverBackground: "A15B3A",
      coverForeground: "FFF7F1",
      shortLabel: "Nonna",
      coverLabel: "Nonna Rina",
    },
    productImage: { background: "F1E0D2", foreground: "6A3F2A" },
    categories: [
      { name: "Pastas frescas", slug: "pastas-frescas", description: "Rellenas y secas con varias salsas." },
      { name: "Platos al horno", slug: "platos-al-horno", description: "Lasagna, canelones y gratinados." },
      { name: "Entradas", description: "Focaccia, burrata y antipasti." },
      { name: "Postres", description: "Tiramisu y dulces italianos." },
    ],
    products: [
      {
        name: "Sorrentinos de Jamon y Queso",
        categorySlug: "pastas-frescas",
        description: "Docena de sorrentinos artesanales.",
        priceAmount: 480,
        optionGroups: [
          {
            name: "Salsa",
            selectionType: "single",
            isRequired: true,
            minSelect: 1,
            items: [
              { name: "Pomodoro", priceDeltaAmount: 0 },
              { name: "Fileto y albahaca", priceDeltaAmount: 20 },
              { name: "Cuatro quesos", priceDeltaAmount: 70 },
              { name: "Bolognesa", priceDeltaAmount: 90 },
            ],
          },
          {
            name: "Extra",
            selectionType: "multiple",
            maxSelect: 2,
            items: [
              { name: "Parmesano", priceDeltaAmount: 30 },
              { name: "Burrata", priceDeltaAmount: 95 },
            ],
          },
        ],
      },
      {
        name: "Tagliatelle al Huevo",
        categorySlug: "pastas-frescas",
        description: "Pasta larga fresca, ideal para salsas untuosas.",
        priceAmount: 410,
      },
      {
        name: "Ravioles de Calabaza",
        categorySlug: "pastas-frescas",
        description: "Rellenos de calabaza asada y queso suave.",
        priceAmount: 465,
        compareAtAmount: 540,
      },
      {
        name: "Lasagna Bolognesa",
        categorySlug: "platos-al-horno",
        description: "Porcion abundante con salsa bolognesa, bechamel y parmesano.",
        priceAmount: 590,
      },
      {
        name: "Canelones de Verdura",
        categorySlug: "platos-al-horno",
        description: "Canelones gratinados con salsa blanca y pomodoro.",
        priceAmount: 520,
      },
      {
        name: "Focaccia Romana",
        categorySlug: "entradas",
        description: "Focaccia de oliva y romero para compartir.",
        priceAmount: 250,
      },
      {
        name: "Tiramisu de la Casa",
        categorySlug: "postres",
        description: "Porcion individual, crema mascarpone y cafe.",
        priceAmount: 240,
      },
    ],
  }),
  createBusinessSeed({
    name: "Forno Malvin",
    slug: "forno-malvin-pizzeria",
    area: "Malvin",
    legalName: "Forno Malvin SAS",
    description:
      "Pizzeria de masa larga, focaccias y porciones al horno de piedra, con retiro agil en Malvin.",
    phone: "+598 91 111 205",
    contactActionType: "whatsapp",
    pickupAddress: "Orinoco 5112, Malvin, Montevideo",
    pickupInstructions: "Retiro por mostrador lateral. Si pediste pizza entera, te la entregamos cortada o sin cortar.",
    businessHoursText: "Lun a Dom de 18:00 a 23:45",
    businessHours: allDaysSchedule("18:00", "23:45"),
    prepTime: { min: 20, max: 32 },
    coords: { latitude: -34.8924, longitude: -56.0871 },
    brand: {
      background: "F2DFC7",
      foreground: "6F3B23",
      coverBackground: "C24F2B",
      coverForeground: "FFF7EE",
      shortLabel: "Forno",
      coverLabel: "Forno Malvin",
    },
    productImage: { background: "F2DFC7", foreground: "6F3B23" },
    categories: [
      { name: "Pizzas individuales", slug: "pizzas-individuales", description: "Para una persona." },
      { name: "Pizzas medianas", slug: "pizzas-medianas", description: "Para compartir." },
      { name: "Focaccias", description: "Entradas y panes al horno." },
      { name: "Bebidas", description: "Bebidas frias." },
    ],
    products: [
      {
        name: "Margarita Individual",
        categorySlug: "pizzas-individuales",
        description: "Tomate, muzzarella, albahaca fresca y oliva.",
        priceAmount: 390,
      },
      {
        name: "Pepperoni Picante",
        categorySlug: "pizzas-individuales",
        description: "Muzzarella, pepperoni y miel picante.",
        priceAmount: 450,
        compareAtAmount: 520,
      },
      {
        name: "Napolitana Mediana",
        categorySlug: "pizzas-medianas",
        description: "Tomate, muzzarella, ajo, albahaca y oregano.",
        priceAmount: 690,
        optionGroups: [
          {
            name: "Extra",
            selectionType: "multiple",
            maxSelect: 4,
            items: [
              { name: "Muzzarella extra", priceDeltaAmount: 70 },
              { name: "Aceitunas", priceDeltaAmount: 45 },
              { name: "Hongos", priceDeltaAmount: 65 },
              { name: "Borde relleno", priceDeltaAmount: 95 },
            ],
          },
        ],
      },
      {
        name: "Fugazzeta Rellena",
        categorySlug: "pizzas-medianas",
        description: "Cebolla dulce, muzzarella extra y masa aireada.",
        priceAmount: 760,
      },
      {
        name: "Focaccia de Romero",
        categorySlug: "focaccias",
        description: "Focaccia crocante con sal marina y romero.",
        priceAmount: 240,
      },
      {
        name: "Focaccia Burrata y Mortadela",
        categorySlug: "focaccias",
        description: "Mitad focaccia con burrata, mortadela y pistacho.",
        priceAmount: 480,
      },
      {
        name: "Limonata Italiana",
        categorySlug: "bebidas",
        description: "Bebida citrica de 500 ml.",
        priceAmount: 165,
      },
    ],
  }),
  createBusinessSeed({
    name: "Buceo Burger Club",
    slug: "buceo-burger-club",
    area: "Buceo",
    legalName: "Buceo Burger Club SRL",
    description:
      "Smash burgers, combos y papas con extras para resolver almuerzos y cenas cerca del Puerto del Buceo.",
    phone: "+598 91 111 206",
    contactActionType: "whatsapp",
    pickupAddress: "Luis Alberto de Herrera 1248, Buceo, Montevideo",
    pickupInstructions: "Retiro por caja. Podes mostrar el pedido desde el celular.",
    businessHoursText: "Lun a Dom de 12:00 a 00:00",
    businessHours: allDaysSchedule("12:00", "00:00"),
    prepTime: { min: 15, max: 25 },
    coords: { latitude: -34.9018, longitude: -56.1367 },
    brand: {
      background: "E8D7C4",
      foreground: "40261B",
      coverBackground: "B12D1F",
      coverForeground: "FFF6EF",
      shortLabel: "BBC",
      coverLabel: "Buceo Burger Club",
    },
    productImage: { background: "E8D7C4", foreground: "40261B" },
    categories: [
      { name: "Smash burgers", slug: "smash-burgers", description: "Burgers simples y dobles." },
      { name: "Chicken", description: "Pollo crispy y sandwiches." },
      { name: "Sides", description: "Papas, aros y salsas." },
      { name: "Combos", description: "Burger + side + bebida." },
    ],
    products: [
      {
        name: "Smash Classic",
        categorySlug: "smash-burgers",
        description: "Doble smash, cheddar, pepinillos y salsa club.",
        priceAmount: 430,
        optionGroups: [
          {
            name: "Extras",
            selectionType: "multiple",
            maxSelect: 4,
            items: [
              { name: "Bacon", priceDeltaAmount: 55 },
              { name: "Cheddar extra", priceDeltaAmount: 40 },
              { name: "Huevo", priceDeltaAmount: 35 },
              { name: "Cebolla caramelizada", priceDeltaAmount: 30 },
            ],
          },
        ],
      },
      {
        name: "Smash Truffle",
        categorySlug: "smash-burgers",
        description: "Doble carne, provolone, mayo trufada y hongos.",
        priceAmount: 520,
        compareAtAmount: 610,
      },
      {
        name: "Chicken Honey Mustard",
        categorySlug: "chicken",
        description: "Pollo crispy, coleslaw y honey mustard.",
        priceAmount: 410,
      },
      {
        name: "Papas Club",
        categorySlug: "sides",
        description: "Papas fritas con cheddar, panceta y cebolla verdeo.",
        priceAmount: 295,
      },
      {
        name: "Aros de Cebolla",
        categorySlug: "sides",
        description: "Aros crocantes con dip ahumado.",
        priceAmount: 240,
      },
      {
        name: "Combo Classic",
        categorySlug: "combos",
        description: "Smash Classic + papas simples + bebida 500 ml.",
        priceAmount: 620,
        optionGroups: [
          {
            name: "Bebida",
            selectionType: "single",
            isRequired: true,
            minSelect: 1,
            items: [
              { name: "Cola zero", priceDeltaAmount: 0 },
              { name: "Cola regular", priceDeltaAmount: 0 },
              { name: "Limonada", priceDeltaAmount: 30 },
            ],
          },
        ],
      },
    ],
  }),
  createBusinessSeed({
    name: "Dulce Nube",
    slug: "dulce-nube-carrasco",
    area: "Carrasco",
    legalName: "Dulce Nube SAS",
    description:
      "Tienda dulce con cookies, brownies, candy boxes y postres para regalo o capricho propio en Carrasco.",
    phone: "+598 91 111 207",
    contactActionType: "call",
    pickupAddress: "Arocena 1647, Carrasco, Montevideo",
    pickupInstructions: "Retiro por mostrador. Si es regalo, te lo entregamos ya embolsado.",
    businessHoursText: "Lun a Dom de 10:00 a 21:30",
    businessHours: allDaysSchedule("10:00", "21:30"),
    prepTime: { min: 8, max: 16 },
    coords: { latitude: -34.8834, longitude: -56.0591 },
    brand: {
      background: "F6E6EA",
      foreground: "7A4056",
      coverBackground: "E899A7",
      coverForeground: "FFF7FA",
      shortLabel: "Dulce",
      coverLabel: "Dulce Nube",
    },
    productImage: { background: "F6E6EA", foreground: "7A4056" },
    categories: [
      { name: "Cookies", description: "Cookies grandes y rellenas." },
      { name: "Brownies", description: "Porciones y boxes." },
      { name: "Candy boxes", slug: "candy-boxes", description: "Mix dulces para regalo." },
      { name: "Bebidas frias", slug: "bebidas-frias", description: "Milkshakes y refrescos." },
    ],
    products: [
      {
        name: "Cookie Choco Avellana",
        categorySlug: "cookies",
        description: "Cookie XL rellena de crema de avellanas.",
        priceAmount: 190,
      },
      {
        name: "Cookie Red Velvet",
        categorySlug: "cookies",
        description: "Cookie roja con chips blancos y centro cremoso.",
        priceAmount: 195,
      },
      {
        name: "Brownie con Dulce de Leche",
        categorySlug: "brownies",
        description: "Brownie húmedo con topping abundante.",
        priceAmount: 220,
        compareAtAmount: 270,
      },
      {
        name: "Box Mini Brownies x 9",
        categorySlug: "brownies",
        description: "Caja surtida para compartir.",
        priceAmount: 540,
      },
      {
        name: "Candy Box Arcoiris",
        categorySlug: "candy-boxes",
        description: "Mix de gomitas, marshmallows y chocolates.",
        priceAmount: 610,
        optionGroups: [
          {
            name: "Personalizacion",
            selectionType: "multiple",
            maxSelect: 3,
            items: [
              { name: "Mas chocolates", priceDeltaAmount: 70 },
              { name: "Mas gomitas", priceDeltaAmount: 50 },
              { name: "Tarjeta regalo", priceDeltaAmount: 35 },
            ],
          },
        ],
      },
      {
        name: "Milkshake Oreo",
        categorySlug: "bebidas-frias",
        description: "Milkshake espeso con crema y galleta triturada.",
        priceAmount: 260,
      },
      {
        name: "Frutillas con Chocolate",
        categorySlug: "candy-boxes",
        description: "Vaso frio con frutillas frescas y chocolate.",
        priceAmount: 280,
      },
    ],
  }),
];

async function findAuthUserByEmail(email) {
  let page = 1;

  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw new Error(`No se pudo consultar usuarios de Auth: ${error.message}`);
    }

    const user = data.users.find((item) => item.email?.toLowerCase() === email.toLowerCase());

    if (user) {
      return user;
    }

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return null;
}

async function ensureAuthUser(business) {
  const existingUser = await findAuthUserByEmail(business.email);

  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: business.password,
      email_confirm: true,
      user_metadata: {
        contact_name: business.name,
        business_name: business.name,
        seed_type: "demo-business",
      },
    });

    if (error || !data.user) {
      throw new Error(`No se pudo actualizar el usuario ${business.email}: ${error?.message ?? "sin detalle"}`);
    }

    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: business.email,
    password: business.password,
    email_confirm: true,
    user_metadata: {
      contact_name: business.name,
      business_name: business.name,
      seed_type: "demo-business",
    },
  });

  if (error || !data.user) {
    throw new Error(`No se pudo crear el usuario ${business.email}: ${error?.message ?? "sin detalle"}`);
  }

  return data.user;
}

async function getBusinessBySlug(slug) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, slug, name")
    .ilike("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo consultar el negocio ${slug}: ${error.message}`);
  }

  return data;
}

async function ensureBusiness(business) {
  const existingBusiness = await getBusinessBySlug(business.slug);
  const payload = {
    name: business.name,
    slug: business.slug,
    description: business.description,
    legal_name: business.legalName,
    contact_email: business.email,
    contact_phone: business.phone,
    contact_action_type: business.contactActionType,
    business_hours_text: business.businessHoursText,
    is_open_now: true,
    business_hours: business.businessHours,
    is_temporarily_closed: false,
    pickup_address: business.pickupAddress,
    pickup_instructions: business.pickupInstructions,
    latitude: business.coords?.latitude ?? DEFAULT_COORDS.latitude,
    longitude: business.coords?.longitude ?? DEFAULT_COORDS.longitude,
    timezone: DEFAULT_TIMEZONE,
    currency_code: DEFAULT_CURRENCY,
    prep_time_min_minutes: business.prepTime.min,
    prep_time_max_minutes: business.prepTime.max,
    is_active: true,
    onboarding_completed_at: new Date().toISOString(),
    profile_image_path: `seed/${business.slug}/branding/profile.png`,
    profile_image_url: business.profileImageUrl,
    cover_image_path: `seed/${business.slug}/branding/cover.png`,
    cover_image_url: business.coverImageUrl,
  };

  if (existingBusiness) {
    const { data, error } = await supabase
      .from("businesses")
      .update(payload)
      .eq("id", existingBusiness.id)
      .select("id, slug, name")
      .single();

    if (error || !data) {
      throw new Error(`No se pudo actualizar el negocio ${business.name}: ${error?.message ?? "sin detalle"}`);
    }

    return data;
  }

  const { data, error } = await supabase
    .from("businesses")
    .insert(payload)
    .select("id, slug, name")
    .single();

  if (error || !data) {
    throw new Error(`No se pudo crear el negocio ${business.name}: ${error?.message ?? "sin detalle"}`);
  }

  return data;
}

async function ensureOrderCounter(businessId) {
  const { error } = await supabase
    .from("business_order_counters")
    .upsert(
      {
        business_id: businessId,
        last_order_number: 0,
      },
      {
        onConflict: "business_id",
        ignoreDuplicates: false,
      },
    );

  if (error) {
    throw new Error(`No se pudo inicializar el contador de pedidos: ${error.message}`);
  }
}

async function ensureBusinessMembership(businessId, userId) {
  const { error } = await supabase
    .from("business_users")
    .upsert(
      {
        business_id: businessId,
        user_id: userId,
        role: "owner",
      },
      {
        onConflict: "business_id,user_id",
        ignoreDuplicates: false,
      },
    );

  if (error) {
    throw new Error(`No se pudo vincular el usuario al negocio: ${error.message}`);
  }
}

async function getExistingCategories(businessId) {
  const { data, error } = await supabase
    .from("product_categories")
    .select("id, slug")
    .eq("business_id", businessId);

  if (error) {
    throw new Error(`No se pudieron consultar las categorias: ${error.message}`);
  }

  return new Map((data ?? []).map((item) => [item.slug.toLowerCase(), item]));
}

async function ensureCategories(businessRecord, business) {
  const categoryMap = await getExistingCategories(businessRecord.id);
  const result = new Map();

  for (const category of business.categories) {
    const key = category.slug.toLowerCase();
    const payload = {
      business_id: businessRecord.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      position: category.position,
      is_active: true,
    };

    const existing = categoryMap.get(key);

    if (existing) {
      const { data, error } = await supabase
        .from("product_categories")
        .update(payload)
        .eq("id", existing.id)
        .select("id, slug")
        .single();

      if (error || !data) {
        throw new Error(`No se pudo actualizar la categoria ${category.name}: ${error?.message ?? "sin detalle"}`);
      }

      result.set(key, data.id);
      continue;
    }

    const { data, error } = await supabase
      .from("product_categories")
      .insert(payload)
      .select("id, slug")
      .single();

    if (error || !data) {
      throw new Error(`No se pudo crear la categoria ${category.name}: ${error?.message ?? "sin detalle"}`);
    }

    result.set(key, data.id);
  }

  return result;
}

async function getExistingProducts(businessId) {
  const { data, error } = await supabase
    .from("products")
    .select("id, slug")
    .eq("business_id", businessId);

  if (error) {
    throw new Error(`No se pudieron consultar los productos: ${error.message}`);
  }

  return new Map((data ?? []).map((item) => [item.slug.toLowerCase(), item]));
}

async function ensurePrimaryProductImage(productId, businessSlug, product) {
  const { data: existingImage, error: imageLookupError } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", productId)
    .eq("is_primary", true)
    .maybeSingle();

  if (imageLookupError) {
    throw new Error(`No se pudo consultar la imagen principal de ${product.name}: ${imageLookupError.message}`);
  }

  const payload = {
    product_id: productId,
    storage_path: `seed/${businessSlug}/products/${product.slug}.jpg`,
    public_url: product.imageUrl,
    alt_text: `${product.name} de ${businessSlug}`,
    position: 1,
    is_primary: true,
  };

  if (existingImage) {
    const { error } = await supabase
      .from("product_images")
      .update(payload)
      .eq("id", existingImage.id);

    if (error) {
      throw new Error(`No se pudo actualizar la imagen de ${product.name}: ${error.message}`);
    }

    return;
  }

  const { error } = await supabase.from("product_images").insert(payload);

  if (error) {
    throw new Error(`No se pudo crear la imagen de ${product.name}: ${error.message}`);
  }
}

async function ensureOptionGroups(productId, product) {
  if (!product.optionGroups.length) {
    return;
  }

  const { data: existingGroups, error: groupsError } = await supabase
    .from("product_option_groups")
    .select("id, name")
    .eq("product_id", productId);

  if (groupsError) {
    throw new Error(`No se pudieron consultar las opciones de ${product.name}: ${groupsError.message}`);
  }

  const groupMap = new Map((existingGroups ?? []).map((group) => [group.name.toLowerCase(), group]));

  for (const group of product.optionGroups) {
    const existingGroup = groupMap.get(group.name.toLowerCase());
    const groupPayload = {
      product_id: productId,
      name: group.name,
      description: group.description ?? null,
      selection_type: group.selectionType,
      is_required: group.isRequired ?? false,
      min_select: group.minSelect ?? 0,
      max_select: group.maxSelect ?? null,
      position: group.position ?? 0,
    };

    let groupId = existingGroup?.id;

    if (groupId) {
      const { error } = await supabase
        .from("product_option_groups")
        .update(groupPayload)
        .eq("id", groupId);

      if (error) {
        throw new Error(`No se pudo actualizar el grupo ${group.name}: ${error.message}`);
      }
    } else {
      const { data, error } = await supabase
        .from("product_option_groups")
        .insert(groupPayload)
        .select("id")
        .single();

      if (error || !data) {
        throw new Error(`No se pudo crear el grupo ${group.name}: ${error?.message ?? "sin detalle"}`);
      }

      groupId = data.id;
    }

    const { data: existingItems, error: itemsLookupError } = await supabase
      .from("product_option_items")
      .select("id, name")
      .eq("group_id", groupId);

    if (itemsLookupError) {
      throw new Error(`No se pudieron consultar las opciones de ${group.name}: ${itemsLookupError.message}`);
    }

    const itemMap = new Map((existingItems ?? []).map((item) => [item.name.toLowerCase(), item]));

    for (const item of group.items) {
      const existingItem = itemMap.get(item.name.toLowerCase());
      const itemPayload = {
        group_id: groupId,
        name: item.name,
        price_delta_amount: item.priceDeltaAmount,
        is_active: item.isActive,
        position: item.position,
      };

      if (existingItem) {
        const { error } = await supabase
          .from("product_option_items")
          .update(itemPayload)
          .eq("id", existingItem.id);

        if (error) {
          throw new Error(`No se pudo actualizar la opcion ${item.name}: ${error.message}`);
        }

        continue;
      }

      const { error } = await supabase
        .from("product_option_items")
        .insert(itemPayload);

      if (error) {
        throw new Error(`No se pudo crear la opcion ${item.name}: ${error.message}`);
      }
    }
  }
}

async function ensureProducts(businessRecord, business, categoryIds) {
  const productMap = await getExistingProducts(businessRecord.id);

  for (const product of business.products) {
    const categoryId = categoryIds.get(product.categorySlug.toLowerCase());

    if (!categoryId) {
      throw new Error(`No se encontro la categoria ${product.categorySlug} para ${product.name}.`);
    }

    const payload = {
      business_id: businessRecord.id,
      category_id: categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price_amount: product.priceAmount,
      compare_at_amount: product.compareAtAmount ?? null,
      currency_code: DEFAULT_CURRENCY,
      is_available: true,
      position: product.position,
    };

    const existingProduct = productMap.get(product.slug.toLowerCase());
    let productId = existingProduct?.id;

    if (productId) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", productId);

      if (error) {
        throw new Error(`No se pudo actualizar el producto ${product.name}: ${error.message}`);
      }
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(payload)
        .select("id")
        .single();

      if (error || !data) {
        throw new Error(`No se pudo crear el producto ${product.name}: ${error?.message ?? "sin detalle"}`);
      }

      productId = data.id;
    }

    await ensurePrimaryProductImage(productId, business.slug, product);
    await ensureOptionGroups(productId, product);
  }
}

async function ensureDemoBusiness(business) {
  const user = await ensureAuthUser(business);
  const businessRecord = await ensureBusiness(business);

  await ensureOrderCounter(businessRecord.id);
  await ensureBusinessMembership(businessRecord.id, user.id);

  const categoryIds = await ensureCategories(businessRecord, business);
  await ensureProducts(businessRecord, business, categoryIds);

  return {
    name: business.name,
    slug: business.slug,
    area: business.area,
    email: business.email,
    password: business.password,
  };
}

async function main() {
  console.log("");
  console.log("Provisionando locales demo de Restopickup...");
  console.log("");

  const results = [];

  for (const business of demoBusinesses) {
    console.log(`- ${business.name} (${business.area})`);
    const result = await ensureDemoBusiness(business);
    results.push(result);
  }

  console.log("");
  console.log("Listo. Credenciales demo:");
  console.log("");

  for (const result of results) {
    console.log(`${result.name} [${result.area}]`);
    console.log(`  menu: /locales/${result.slug}`);
    console.log(`  login: ${result.email}`);
    console.log(`  password: ${result.password}`);
    console.log("");
  }
}

main().catch((error) => {
  console.error("");
  console.error("No se pudo provisionar los locales demo.");
  console.error(error instanceof Error ? error.message : error);
  console.error("");
  process.exitCode = 1;
});
