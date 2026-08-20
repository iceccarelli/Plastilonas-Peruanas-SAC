import { SITE } from './site';

/**
 * NOVEDADES — el registro fechado de lo que cambia en esta referencia.
 *
 * Qué es. Un feed cronológico de cada cambio publicado que altera lo que un
 * comprador puede especificar, comparar o descargar. Es el equivalente del
 * "What's New" de un proveedor de infraestructura: no es un blog, no opina,
 * no anuncia intenciones. Cada entrada apunta a algo que YA está en línea y
 * que el lector puede abrir en el mismo clic.
 *
 * Por qué existe. Una referencia sin fecha no se distingue de un folleto. El
 * comprador técnico que vuelve al sitio necesita responder en diez segundos
 * "¿qué hay acá que no estaba la última vez?", y los agentes y rastreadores
 * necesitan una señal de frescura que no sea un `lastmod` movido a mano en
 * cada deploy. Este archivo es esa señal, y es verificable: si una entrada
 * miente, el enlace la delata.
 *
 * Por qué es un MECANISMO y no una campaña. La regla es de proceso, no de
 * voluntad: todo cambio que agregue, modifique o retire una línea de producto,
 * una guía, un criterio del marco o una arquitectura de referencia entra acá
 * el mismo día, con su enlace. Nada más entra. Un feed que también publica
 * "felices fiestas" deja de ser consultable en tres meses.
 *
 * REGLAS DE HONESTIDAD — obligatorias al añadir una entrada:
 *  1. `fecha` es la fecha real de publicación del cambio. No se antedata para
 *     simular actividad ni se agrupa un mes de trabajo en un solo día.
 *  2. Toda entrada enlaza a la página que cambió. Sin enlace verificable no
 *     hay entrada (hay un test que valida cada href contra las rutas reales).
 *  3. No se anuncia lo que todavía no está desplegado. Nada de "próximamente".
 *  4. Las cifras históricas se congelan a propósito: "36 líneas" en una
 *     entrada de agosto describe el catálogo de ese día, no el de hoy. Por eso
 *     NO se derivan de lib/products.ts — un registro fechado que se reescribe
 *     solo deja de ser un registro.
 *  5. No se publican obras ejecutadas, clientes ni cifras de negocio. Este
 *     feed documenta la referencia pública, no la operación comercial.
 */

export type NovedadTipo = 'catalogo' | 'guia' | 'herramienta' | 'referencia';

export const tipoLabels: Record<NovedadTipo, string> = {
  catalogo: 'Catálogo',
  guia: 'Guía técnica',
  herramienta: 'Herramienta',
  referencia: 'Referencia del rubro',
};

/** Qué significa cada tipo, para que la etiqueta no dependa del contexto. */
export const tipoDescripciones: Record<NovedadTipo, string> = {
  catalogo: 'Cambios en las líneas de producto publicadas y en cómo se navegan.',
  guia: 'Guías de especificación e instalación nuevas o revisadas, con sus fuentes.',
  herramienta: 'Utilidades que producen un documento o una decisión: fichas, comparadores, autoevaluaciones.',
  referencia: 'Material que define criterios del rubro y es útil aunque el proyecto se compre a otro proveedor.',
};

export interface NovedadEnlace {
  label: string;
  href: string;
}

export interface Novedad {
  slug: string;
  /** Fecha real de publicación, ISO (YYYY-MM-DD). */
  fecha: string;
  tipo: NovedadTipo;
  titulo: string;
  /** Una frase. Alimenta la meta description, el RSS y el JSON Feed. */
  resumen: string;
  /** Qué cambia para quien especifica o compra. La razón para leer la entrada. */
  queCambia: string;
  detalle: string[];
  enlaces: NovedadEnlace[];
}

/**
 * Orden de escritura: cronológico ascendente (se agrega al final).
 * La exportación `novedades` lo invierte, de modo que agregar una entrada
 * nunca obliga a tocar las anteriores.
 */
const registro: Novedad[] = [
  {
    slug: 'silo-tecnico-recursos-primeras-guias',
    fecha: '2026-08-17',
    tipo: 'guia',
    titulo: 'Abre /recursos: guías de especificación con las fuentes a la vista',
    resumen:
      'Publicamos las primeras tres guías técnicas sobre big bags en minería, instalación de geomembranas HDPE y cálculo de caudal en mangas de ventilación.',
    queCambia:
      'Las decisiones que antes se resolvían por teléfono quedan escritas, con la norma o el método que las respalda citado y enlazado.',
    detalle: [
      'El catálogo respondía qué vendemos, no cómo se especifica. Las primeras tres guías cubren los tres puntos donde vimos fallar más proyectos: la estiba y el izaje de big bags en operación minera, el anclaje y la soldadura de geomembrana HDPE en pozas y canales, y el cálculo de caudal para dimensionar una manga de ventilación en labor subterránea.',
      'Cada cifra normativa lleva su fuente con URL. Donde no pudimos verificar el número de artículo de una norma vigente, la guía lo dice y remite al texto oficial en lugar de inventarlo. Los cálculos se publican como método reproducible de prediseño, no como memoria firmada.',
    ],
    enlaces: [
      { label: 'Guías técnicas', href: '/recursos' },
      {
        label: 'Big bags en minería: normativa y errores de estiba',
        href: '/recursos/big-bags-mineria-peru-normativa-errores-estiba',
      },
      {
        label: 'Instalación de geomembranas HDPE en pozas y canales',
        href: '/recursos/instalacion-geomembranas-hdpe-pozas-canales',
      },
    ],
  },
  {
    slug: 'paginas-de-familia-con-criterios',
    fecha: '2026-08-17',
    tipo: 'catalogo',
    titulo: 'Las once familias del catálogo pasan a tener página propia',
    resumen:
      'Cada familia de producto tiene ahora URL estable, criterios de especificación, sectores que la compran y sus guías relacionadas.',
    queCambia:
      'Se puede enviar el enlace de una familia completa —con lo que gobierna su elección— en vez de once fichas sueltas o un catálogo filtrado que no se puede compartir.',
    detalle: [
      'La navegación por familia se resolvía filtrando el catálogo en el navegador, de modo que once mercados con intención distinta compartían una sola dirección. Ahora cada familia tiene su página: qué resuelve, qué define su especificación, con qué sectores se usa, cómo la abastecemos y en qué estado está la oferta.',
      'El dato de abastecimiento y disponibilidad sale del catálogo, no de una redacción de marketing: si una línea es de fabricación propia, importación directa o bajo pedido, la página lo declara.',
    ],
    enlaces: [
      { label: 'Catálogo por familia', href: '/productos' },
      { label: 'Envases y embalaje', href: '/productos/familia/envases-embalaje' },
      { label: 'Lonas y cobertores', href: '/productos/familia/lonas-cobertores' },
    ],
  },
  {
    slug: 'siete-guias-nuevas-silo-a-diez',
    fecha: '2026-08-17',
    tipo: 'guia',
    titulo: 'Siete guías nuevas: el silo técnico llega a diez',
    resumen:
      'Ventilación impelente frente a aspirante, elección de geotextil, densidad de malla antiáfida, carga de viento en carpas, transporte de concentrado, tanques flexibles y cálculo de mulch.',
    queCambia:
      'Las siete decisiones que más veces nos llegan mal definidas quedan documentadas con su criterio y su fuente, disponibles antes de pedir cotización.',
    detalle: [
      'Cada guía nueva nació de un modo de falla real observado en obra, no de una lista de palabras clave: la manga aspirante sin refuerzo que colapsa, la malla cerrada que sube la temperatura del cultivo porque nadie recalculó la ventilación, la carpa dimensionada sin la carga de viento de la norma E.020.',
      'Ese mismo patrón es el que después se formalizó como Marco de Especificación: un modo de falla documentado se convierte en un criterio verificable.',
    ],
    enlaces: [
      { label: 'Guías técnicas', href: '/recursos' },
      {
        label: 'Ventilación impelente vs. aspirante en labores mineras',
        href: '/recursos/ventilacion-impelente-vs-aspirante-labores-mineras',
      },
      {
        label: 'Carpas industriales: carga de viento y norma E.020',
        href: '/recursos/carpas-industriales-carga-viento-norma-e020',
      },
    ],
  },
  {
    slug: 'fichas-tecnicas-pdf-descargables',
    fecha: '2026-08-19',
    tipo: 'herramienta',
    titulo: 'Ficha técnica en PDF descargable para las 36 líneas del catálogo',
    resumen:
      'Cada producto genera su ficha en PDF desde el mismo catálogo que alimenta la web: especificaciones, aplicaciones, sectores, abastecimiento y disponibilidad.',
    queCambia:
      'El expediente técnico se arma sin esperar respuesta comercial, y la ficha nunca contradice a la página porque ambas salen de la misma fuente.',
    detalle: [
      'En una compra industrial la ficha se adjunta a un expediente, se reenvía a un jefe de planta y se archiva. Pedirla por correo agrega un día al ciclo y produce versiones que se desactualizan solas.',
      'El PDF se genera desde lib/products.ts en tiempo de compilación, así que no existe una versión "de marketing" divergente. La ficha no declara certificaciones ni números de lote: esos documentos los emite el fabricante y se entregan con la cotización.',
    ],
    enlaces: [
      { label: 'Catálogo completo', href: '/productos' },
      {
        label: 'Ejemplo: ficha de big bags de polipropileno',
        href: '/productos/big-bags-bolsones-polipropileno',
      },
    ],
  },
  {
    slug: 'comparador-lado-a-lado-por-familia',
    fecha: '2026-08-19',
    tipo: 'herramienta',
    titulo: 'Comparador lado a lado dentro de cada familia',
    resumen:
      'Las familias con dos o más líneas tienen una tabla comparativa con las especificaciones enfrentadas y el criterio que decide entre ellas.',
    queCambia:
      'La comparación deja de hacerse abriendo pestañas en paralelo, y la cotización se arma con las alternativas ya seleccionadas.',
    detalle: [
      'Comparar era el paso que el sitio dejaba al cliente: abrir varias fichas, copiar especificaciones a una hoja y perder por el camino el criterio que realmente decide. La tabla enfrenta las líneas de una misma familia campo por campo.',
      'Desde la comparativa se pasa a la cotización con las alternativas ya cargadas, de modo que la consulta llega con la especificación puesta y no como "necesito lonas".',
    ],
    enlaces: [
      {
        label: 'Comparar lonas y cobertores',
        href: '/productos/familia/lonas-cobertores/comparar',
      },
      { label: 'Catálogo por familia', href: '/productos' },
    ],
  },
  {
    slug: 'marco-de-especificacion-v1',
    fecha: '2026-08-19',
    tipo: 'referencia',
    titulo: 'Publicamos el Marco de Especificación v1.0: 26 criterios en 6 pilares',
    resumen:
      'Un conjunto público de criterios para definir un proyecto textil industrial o geosintético antes de cotizarlo, con autoevaluación y brief descargable.',
    queCambia:
      'Existe un estándar escrito contra el cual medir cualquier propuesta —incluida la nuestra— y una autoevaluación que dice qué falta definir antes de pedir precios.',
    detalle: [
      'Los proyectos rara vez fallan por el material: fallan por lo que nadie definió. El marco convierte cada modo de falla documentado en nuestras guías en una pregunta verificable, agrupada en seis pilares: compatibilidad, cargas, exposición, ejecución, documentación y operación.',
      'La autoevaluación puntúa cuán definido está el proyecto del cliente, no a los proveedores: no es un ranking disfrazado. El brief se genera en el navegador y las respuestas no se envían a ningún servidor.',
      'Es útil aunque el proyecto termine comprándose a un competidor. Esa es exactamente la razón por la que un criterio publicado se convierte en referencia y una lista de ventajas propias no.',
    ],
    enlaces: [
      { label: 'Marco de Especificación', href: '/marco' },
      { label: 'Autoevaluación con brief descargable', href: '/marco/evaluacion' },
    ],
  },
  {
    slug: 'seis-arquitecturas-de-referencia',
    fecha: '2026-08-19',
    tipo: 'referencia',
    titulo: 'Seis arquitecturas de referencia: el conjunto armado, no la pieza suelta',
    resumen:
      'Poza revestida, frente de avance ventilado, despacho de concentrado a granel, protección de cultivo, almacenamiento de agua en operación remota y campamento con almacén temporal.',
    queCambia:
      'Quien necesita resolver un escenario completo ve la lista de materiales entera, el orden de ejecución y qué falla al comprar por piezas sueltas.',
    detalle: [
      'El catálogo vendía componentes y nunca mostraba el conjunto montado. Un jefe de proyecto que debe revestir una poza de proceso no busca "geomembrana HDPE 1.5 mm": busca la poza, y descubre tarde que faltaba el geotextil de protección o el detalle de anclaje.',
      'Cada arquitectura publica su escenario, la lista de materiales donde cada componente declara el criterio que lo gobierna, la secuencia de ejecución, los riesgos frecuentes y las guías que documentan cada paso.',
      'No son casos de estudio. No declaran obras ejecutadas, clientes ni cifras: describen configuraciones técnicas verificables contra el catálogo.',
    ],
    enlaces: [
      { label: 'Arquitecturas de referencia', href: '/soluciones' },
      {
        label: 'Poza de proceso revestida',
        href: '/soluciones/poza-revestida-impermeabilizacion',
      },
      { label: 'Frente de avance ventilado', href: '/soluciones/frente-avance-ventilado' },
    ],
  },
  {
    slug: 'glosario-tecnico-del-rubro',
    fecha: '2026-08-20',
    tipo: 'referencia',
    titulo: 'Publicamos el glosario técnico: 43 términos con URL propia',
    resumen:
      'Vocabulario del rubro definido con precisión —qué significa cada término, en qué unidad se mide y qué decide en obra— con versión legible por máquina.',
    queCambia:
      'Deja de hacer falta deducir el vocabulario del contexto: cada término tiene su definición canónica, su unidad de medida y el enlace a las guías y productos donde manda.',
    detalle: [
      'El sitio respondía qué vendemos, qué línea sirve, cómo se especifica, cómo se arma el conjunto y qué cambió. No respondía la pregunta anterior a todas: qué significa esta palabra. Es la que alguien escribe en un buscador antes de poder pedir nada.',
      'Cada término declara su definición en una sola frase autosuficiente, su desarrollo, la magnitud y unidad con que se expresa, qué decide en obra y el error frecuente que resuelve. Los términos se enlazan entre sí, con las guías que los desarrollan y con los productos donde gobiernan la especificación.',
      'Las definiciones describen el término en el rubro, no nuestros productos: son útiles aunque el proyecto se compre a otro proveedor. Ninguna incluye cifras normativas — para eso están las guías, que citan su fuente.',
      'Se publica además en formato de datos, con instrucción explícita de atribución, para que citarlo correctamente sea el camino de menor resistencia.',
    ],
    enlaces: [
      { label: 'Glosario técnico', href: '/glosario' },
      { label: 'Geotextil', href: '/glosario/geotextil' },
      { label: 'Tipos electrostáticos de FIBC', href: '/glosario/tipo-electrostatico-fibc' },
      { label: 'Ventilación impelente', href: '/glosario/ventilacion-impelente' },
    ],
  },
  {
    slug: 'centro-de-documentacion-y-datos-abiertos',
    fecha: '2026-08-20',
    tipo: 'herramienta',
    titulo: 'Centro de documentación: todo descargable en PDF y en datos abiertos',
    resumen:
      'Guías, arquitecturas, glosario y Marco de Especificación pasan a tener versión en PDF, y el catálogo completo se publica en formato de datos con instrucción de atribución.',
    queCambia:
      'El expediente técnico se arma sin pedir nada por correo, y cualquier integración o agente puede leer el catálogo entero sin rastrear página por página.',
    detalle: [
      'Hasta ahora solo las fichas de producto eran descargables. Un jefe de proyecto que arma un expediente necesita también la guía, la lista de materiales del conjunto y el criterio contra el que se evalúan las propuestas — y en obra, sin señal, el enlace no sirve: sirve el archivo.',
      'Todos los documentos se generan desde las mismas fuentes que alimentan las páginas, de modo que la versión descargada y la publicada nunca divergen. Ninguno declara precio, certificaciones ni ensayos que el catálogo no contenga.',
      'El catálogo completo se publica además en formato de datos, con especificaciones, modo de suministro, ficha en PDF, términos del glosario que gobiernan cada línea y arquitecturas donde encaja. Sin precios y sin existencias: la disponibilidad se declara como modo de suministro, que es un dato estable, y el precio se establece en cada cotización.',
      'Todo se descarga sin registro: si usted descarga algo, no nos enteramos de quién es.',
    ],
    enlaces: [
      { label: 'Centro de documentación', href: '/descargas' },
      { label: 'Marco de Especificación', href: '/marco' },
      { label: 'Glosario técnico', href: '/glosario' },
      { label: 'Catálogo completo', href: '/productos' },
    ],
  },
  {
    slug: 'informes-del-sector-con-fuente-oficial',
    fecha: '2026-08-20',
    tipo: 'referencia',
    titulo: 'Informes del sector: estadística oficial y qué implica al especificar',
    resumen:
      'Producción e inversión minera, agroexportaciones y radiación ultravioleta, con la cifra de cada organismo, su fecha de verificación y lo que el informe explícitamente no afirma.',
    queCambia:
      'Hay con qué sustentar ante un comité por qué una especificación cambia según el emplazamiento, sin depender de cifras de proveedor.',
    detalle: [
      'Los indicadores salen de MINEM, MIDAGRI y SENAMHI, con enlace, fecha de publicación y fecha en que los verificamos. Lo que es lectura técnica nuestra va separado y etiquetado: el dato es del organismo, la consecuencia es nuestra, y el lector tiene derecho a distinguirlas.',
      'El primer informe no estima el tamaño del mercado de textiles industriales, y lo dice en la primera sección. No existe una estadística pública verificable de ese mercado; publicar una estimación propia con aspecto de dato sería inventar el número más importante del documento. Cada informe declara además qué no afirma, con el mismo peso visual que los hallazgos.',
      'Los gráficos se dibujan en el servidor, sin JavaScript, y llevan su tabla de datos desplegable. El eje divergente usa azul y naranja en vez del verde de marca y el rojo: verde/rojo es el par que la deuteranopia confunde, y se midió antes de elegirlo.',
      'Se suma un mecanismo de vigilancia que comprueba periódicamente que las fuentes citadas siguen respondiendo. No publica nada: informa para que una persona decida.',
    ],
    enlaces: [
      { label: 'Informes del sector', href: '/informes' },
      {
        label: 'Qué mueve la demanda de textiles industriales en el Perú',
        href: '/informes/sectores-compradores-textiles-industriales-peru',
      },
      { label: 'Centro de documentación', href: '/descargas' },
    ],
  },
  {
    slug: 'por-que-cambia-el-precio-de-una-plastilona',
    fecha: '2026-08-20',
    tipo: 'referencia',
    titulo: 'Publicamos nuestra propia cadena de formación de precio',
    resumen:
      'Del petróleo a la lona terminada: nafta, resina, flete y tipo de cambio, con el dato verificable de cada eslabón y qué indicador público mirar para anticiparlo.',
    queCambia:
      'La pregunta "¿por qué me subió la cotización?" pasa a tener una respuesta con fuente, y el comprador puede seguir por su cuenta los indicadores que la mueven.',
    detalle: [
      'Una plastilona es, en su mayor parte, resina de polipropileno: su precio se forma tres eslabones más arriba. La nafta que la origina pasó de 559 a 852 dólares por tonelada entre febrero y marzo de 2026, un 52 % en un mes, y volvió a 652 en junio. El polipropileno grado rafia —el que se teje para big bags— acumuló 449 dólares por tonelada de alza en tres meses y luego cedió.',
      'El informe explica también por qué la bajada del petróleo tarda en llegar a una cotización: el material que se fabrica hoy se compró hace semanas. Ese desfase corre en los dos sentidos y con la misma duración.',
      'Incluye la capa peruana que nadie publica: el sol se apreció cerca de un 9 % entre enero de 2025 y julio de 2026, según la serie del BCRP, lo que amortigua parte del alza en dólares.',
      'No publicamos precios de resina en vivo ni una lista propia, y el informe explica por qué: con una materia prima que se mueve la mitad de su valor en un mes, una lista publicada estaría equivocada la mayor parte del tiempo. En su lugar se indica qué indicador público y gratuito consultar en cada eslabón.',
    ],
    enlaces: [
      {
        label: 'Por qué cambia el precio de una plastilona',
        href: '/informes/formacion-de-precio-y-volatilidad-textiles-industriales',
      },
      { label: 'Informes del sector', href: '/informes' },
      { label: 'Términos y condiciones', href: '/terminos' },
    ],
  },
];

/** Novedades de la más reciente a la más antigua. */
export const novedades: Novedad[] = [...registro].sort((a, b) =>
  a.fecha === b.fecha ? registro.indexOf(b) - registro.indexOf(a) : b.fecha.localeCompare(a.fecha),
);

export const novedadBySlug = (slug: string): Novedad | undefined =>
  novedades.find((n) => n.slug === slug);

/** Fecha de la última novedad: señal de frescura para sitemap y feeds. */
export const NOVEDADES_UPDATED: string = novedades[0]?.fecha ?? '';

/** Tipos presentes, en el orden en que se declaran las etiquetas. */
export const tiposPresentes = (): NovedadTipo[] =>
  (Object.keys(tipoLabels) as NovedadTipo[]).filter((t) => novedades.some((n) => n.tipo === t));

export const novedadesPorTipo = (tipo: NovedadTipo): Novedad[] =>
  novedades.filter((n) => n.tipo === tipo);

/** Agrupa por mes para el índice, conservando el orden descendente. */
export function novedadesPorMes(): { mes: string; etiqueta: string; items: Novedad[] }[] {
  const meses = new Map<string, Novedad[]>();
  for (const n of novedades) {
    const mes = n.fecha.slice(0, 7);
    const acc = meses.get(mes);
    if (acc) acc.push(n);
    else meses.set(mes, [n]);
  }
  return [...meses.entries()].map(([mes, items]) => ({
    mes,
    etiqueta: etiquetaDeMes(mes),
    items,
  }));
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre',
];

/** "2026-08" → "agosto de 2026". Setiembre con "t": uso peruano. */
export function etiquetaDeMes(mes: string): string {
  const [anio, m] = mes.split('-');
  return `${MESES[Number(m) - 1]} de ${anio}`;
}

/** "2026-08-19" → "19 de agosto de 2026". Sin Intl: la salida debe ser estable. */
export function fechaLarga(fecha: string): string {
  const [anio, m, d] = fecha.split('-');
  return `${Number(d)} de ${MESES[Number(m) - 1]} de ${anio}`;
}

export const novedadUrl = (slug: string): string => `${SITE.url}/novedades/${slug}`;
