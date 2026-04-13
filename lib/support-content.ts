export type SupportArticleSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type SupportArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  sections: SupportArticleSection[];
};

export type SupportCategory = {
  slug: string;
  title: string;
  description: string;
};

export const supportCategories: SupportCategory[] = [
  {
    slug: "primeros-pasos",
    title: "Primeros pasos",
    description: "Configuración inicial, onboarding y puesta a punto del local.",
  },
  {
    slug: "pedidos",
    title: "Pedidos",
    description: "Cómo recibir, preparar, marcar y resolver pedidos en el dashboard.",
  },
  {
    slug: "menu-y-catalogo",
    title: "Menú y catálogo",
    description: "Categorías, productos, opciones, precios e imágenes del menú.",
  },
  {
    slug: "configuracion",
    title: "Configuración del local",
    description: "Horarios, branding, retiro, contacto y cierres especiales.",
  },
  {
    slug: "pagos",
    title: "Pagos",
    description: "Conexión con Mercado Pago y dudas operativas sobre cobros.",
  },
  {
    slug: "admin-y-seguridad",
    title: "Admin y seguridad",
    description: "Modo admin, PIN y uso del panel en equipos compartidos.",
  },
];

export const supportArticles: SupportArticle[] = [
  {
    slug: "configuracion-inicial-del-local",
    title: "Cómo completar la configuración inicial del local",
    description:
      "El orden recomendado para dejar el local listo antes de empezar a recibir pedidos.",
    category: "primeros-pasos",
    readTime: "4 min",
    sections: [
      {
        title: "Qué conviene completar primero",
        paragraphs: [
          "Cuando entrás por primera vez al dashboard, lo más útil es pensar la puesta a punto en este orden: información del local, horarios, categorías, productos y pagos.",
          "Ese orden evita cargar productos antes de tener bien resuelto cómo se ve el menú, cuándo está abierto el negocio y cómo va a cobrar.",
        ],
        bullets: [
          "Revisá nombre, descripción, dirección de retiro e imágenes.",
          "Definí horarios por día y el tiempo estimado de preparación.",
          "Creá categorías para ordenar el menú.",
          "Cargá los productos con precio e imagen.",
          "Conectá Mercado Pago si querés cobrar con tu cuenta.",
        ],
      },
      {
        title: "Cuándo marcar el onboarding como listo",
        paragraphs: [
          "Podés marcar el onboarding como listo cuando el menú ya se entiende, hay al menos una categoría visible y el local puede operar sin tener que volver atrás a corregir cosas básicas.",
          "No hace falta tener el catálogo perfecto. La idea es que el local quede publicable y operativo.",
        ],
      },
    ],
  },
  {
    slug: "como-funcionan-los-pedidos",
    title: "Cómo funcionan los pedidos en el dashboard",
    description:
      "Qué significa cada pestaña y cómo leer la operación diaria del local.",
    category: "pedidos",
    readTime: "3 min",
    sections: [
      {
        title: "Las tres etapas del flujo",
        paragraphs: [
          "Los pedidos se organizan en Por hacer, En preparación y Entregados. Esa división ayuda a separar qué acaba de entrar, qué todavía está en cocina y qué ya se resolvió.",
        ],
        bullets: [
          "Por hacer: pedidos nuevos que todavía no empezaste.",
          "En preparación: pedidos confirmados, en curso o listos para retirar.",
          "Entregados: pedidos terminados o cancelados guardados por un período corto.",
        ],
      },
      {
        title: "Qué mirar primero en cada pedido",
        paragraphs: [
          "La card de cada pedido está pensada para leer rápido número de pedido, estado, cliente, hora, total y resumen de lo que se pidió.",
          "Cuando necesitás más detalle, podés desplegarla y ver productos, opciones, notas y acciones.",
        ],
      },
    ],
  },
  {
    slug: "como-cambiar-el-estado-de-un-pedido",
    title: "Cómo cambiar el estado de un pedido",
    description:
      "Qué estados usar y cómo mover un pedido sin perder el hilo operativo.",
    category: "pedidos",
    readTime: "3 min",
    sections: [
      {
        title: "Estados recomendados",
        paragraphs: [
          "No todos los locales trabajan igual, pero en general conviene mantener un flujo simple y consistente para el equipo.",
        ],
        bullets: [
          "Pendiente o confirmado cuando el pedido entra.",
          "En preparación cuando el equipo ya empezó a trabajar.",
          "Listo para retirar cuando el cliente puede pasar a buscarlo.",
          "Entregado cuando el pedido ya fue retirado.",
          "Cancelado solo si el pedido no se va a completar.",
        ],
      },
      {
        title: "Buenas prácticas",
        paragraphs: [
          "Cambiar el estado rápido ayuda tanto al equipo del local como al cliente, porque la pantalla del pedido y el dashboard se mantienen alineados.",
        ],
        bullets: [
          "Definí el tiempo estimado apenas tomás el pedido.",
          "Marcá listo para retirar apenas esté realmente pronto.",
          "Usá cancelado solo cuando no haya forma de entregar el pedido.",
        ],
      },
    ],
  },
  {
    slug: "como-cargar-categorias",
    title: "Cómo cargar categorías para organizar el menú",
    description:
      "Cómo estructurar el menú para que el cliente lo entienda y pueda navegar mejor.",
    category: "menu-y-catalogo",
    readTime: "4 min",
    sections: [
      {
        title: "Para qué sirven las categorías",
        paragraphs: [
          "Las categorías ordenan el menú público y también ayudan al local a mantener el catálogo más claro a medida que crece.",
        ],
        bullets: [
          "Separan tipos de producto como burgers, pizzas, wraps o bebidas.",
          "Permiten que el cliente navegue por anclas o pills dentro del menú.",
          "Ayudan a que el orden del catálogo tenga sentido.",
        ],
      },
      {
        title: "Cómo pensarlas",
        paragraphs: [
          "Conviene usar pocas categorías claras en lugar de muchas categorías confusas. Si tenés dudas, agrupá por tipo de producto y no por detalle interno de cocina.",
        ],
      },
    ],
  },
  {
    slug: "como-crear-un-producto",
    title: "Cómo crear un producto paso a paso",
    description:
      "Qué datos conviene completar y cómo dejar un producto listo para vender.",
    category: "menu-y-catalogo",
    readTime: "5 min",
    sections: [
      {
        title: "Campos básicos",
        paragraphs: [
          "Un producto bien cargado no necesita demasiadas cosas, pero sí necesita consistencia. Nombre claro, descripción breve, precio correcto, categoría e imagen.",
        ],
        bullets: [
          "Usá nombres fáciles de entender para el cliente.",
          "Agregá una descripción corta si el producto necesita contexto.",
          "Cargá el precio final actual.",
          "Usá precio anterior solo si querés mostrar oferta.",
          "Asignalo a una categoría visible.",
        ],
      },
      {
        title: "Disponibilidad e imagen",
        paragraphs: [
          "Si un producto no se puede pedir, conviene dejarlo no disponible en lugar de borrarlo. Así mantenés historial y podés reactivarlo después.",
          "Una buena imagen ayuda mucho, pero no es obligatoria para publicar el producto.",
        ],
      },
    ],
  },
  {
    slug: "como-agregar-opciones-a-un-producto",
    title: "Cómo agregar opciones a un producto",
    description:
      "Extras, aderezos, puntos de cocción y otras variantes dentro del menú.",
    category: "menu-y-catalogo",
    readTime: "4 min",
    sections: [
      {
        title: "Qué tipo de opciones podés crear",
        paragraphs: [
          "Las opciones sirven para que el cliente personalice un producto sin necesidad de aclararlo manualmente en notas.",
        ],
        bullets: [
          "Selección simple, como punto de cocción o tipo de pan.",
          "Selección múltiple, como extras o aderezos.",
          "Opciones obligatorias si el producto no puede pedirse sin elegir.",
          "Opciones con costo adicional si cambian el precio final.",
        ],
      },
      {
        title: "Cuándo usar notas del cliente",
        paragraphs: [
          "Las notas del cliente siguen siendo útiles para aclaraciones puntuales, pero no conviene usarlas para reemplazar opciones repetidas como extras o salsas.",
        ],
      },
    ],
  },
  {
    slug: "como-configurar-horarios",
    title: "Cómo configurar horarios del local",
    description:
      "Cómo definir apertura por día y qué efecto tiene eso en el menú público.",
    category: "configuracion",
    readTime: "4 min",
    sections: [
      {
        title: "Horarios por día",
        paragraphs: [
          "En configuración podés definir si cada día está abierto o cerrado, y en qué franja horaria opera el local. La app usa esos datos para decidir si el negocio aparece abierto o cerrado.",
        ],
        bullets: [
          "Cada día abierto debe tener apertura y cierre.",
          "Los días cerrados se guardan sin horario.",
          "El horario se evalúa en la zona horaria del negocio.",
        ],
      },
      {
        title: "Cierre especial",
        paragraphs: [
          "Además del horario semanal, podés activar un cierre temporal para ocasiones especiales. Ese cierre prioriza sobre el horario normal y oculta la posibilidad de pedir.",
        ],
      },
    ],
  },
  {
    slug: "como-cerrar-temporalmente-el-local",
    title: "Cómo cerrar temporalmente el local",
    description:
      "Qué hace el toggle Abierto / Cerrado y cuándo conviene usarlo.",
    category: "configuracion",
    readTime: "2 min",
    sections: [
      {
        title: "Para qué sirve",
        paragraphs: [
          "El toggle rápido de Abierto o Cerrado está pensado para situaciones puntuales: falta de stock, problema operativo, corte de luz, feriado o cualquier caso en el que el local no pueda tomar pedidos por un rato.",
        ],
      },
      {
        title: "Qué pasa cuando lo activás",
        bullets: [
          "El menú del local deja de aceptar pedidos.",
          "El estado del negocio pasa a verse como cerrado.",
          "No hace falta cambiar todos los horarios manualmente.",
          "Cuando desactivás el cierre especial, el local vuelve a respetar su horario habitual.",
        ],
      },
    ],
  },
  {
    slug: "como-conectar-mercado-pago",
    title: "Cómo conectar Mercado Pago al local",
    description:
      "Cómo vincular la cuenta propia del negocio para cobrar desde el dashboard.",
    category: "pagos",
    readTime: "4 min",
    sections: [
      {
        title: "Qué necesitás antes de empezar",
        paragraphs: [
          "Para conectar Mercado Pago, el local necesita una cuenta activa y acceso para autorizar la conexión desde el dashboard.",
        ],
        bullets: [
          "Entrar al dashboard en modo admin.",
          "Abrir la sección Pagos.",
          "Autorizar la cuenta en el flujo de Mercado Pago.",
        ],
      },
      {
        title: "Cómo verificar que quedó bien",
        paragraphs: [
          "Después de volver al dashboard, la sección de pagos debería mostrar el estado como conectado y dejar visible el identificador de la cuenta enlazada.",
        ],
      },
    ],
  },
  {
    slug: "modo-admin-y-modo-colaborador",
    title: "Cómo funcionan el modo admin y el modo colaborador",
    description:
      "Qué puede ver cada modo y por qué existe esa separación dentro del panel.",
    category: "admin-y-seguridad",
    readTime: "3 min",
    sections: [
      {
        title: "Modo colaborador",
        paragraphs: [
          "Está pensado para el uso operativo del día a día. Desde ahí el equipo puede entrar a pedidos, productos y categorías sin tocar configuraciones sensibles.",
        ],
      },
      {
        title: "Modo admin",
        paragraphs: [
          "Desbloquea estadísticas, pagos, configuración general y acciones sensibles. Sirve especialmente cuando el dispositivo se comparte dentro del local.",
        ],
        bullets: [
          "Se activa con PIN.",
          "Protege ajustes sensibles.",
          "Permite separar operación de administración.",
        ],
      },
    ],
  },
  {
    slug: "como-restablecer-el-pin-admin",
    title: "Cómo restablecer el PIN admin",
    description:
      "Qué hacer si olvidaste el PIN o necesitás cambiarlo desde configuración.",
    category: "admin-y-seguridad",
    readTime: "3 min",
    sections: [
      {
        title: "Si todavía conocés el PIN",
        paragraphs: [
          "Podés cambiarlo desde Configuración, dentro del bloque de seguridad admin, completando PIN actual, nuevo PIN y confirmación.",
        ],
      },
      {
        title: "Si lo olvidaste",
        paragraphs: [
          "Desde la misma sección podés pedir un reset. El sistema envía un enlace al email del usuario o al contacto principal disponible para definir un PIN nuevo.",
        ],
      },
    ],
  },
];

export function getSupportArticleBySlug(slug: string) {
  return supportArticles.find((article) => article.slug === slug) ?? null;
}

export function getArticlesByCategory(slug: string) {
  return supportArticles.filter((article) => article.category === slug);
}
