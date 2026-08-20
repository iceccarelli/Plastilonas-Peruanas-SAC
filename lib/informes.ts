/**
 * INFORMES DEL SECTOR — la capa de evidencia.
 *
 * Qué es. Estudios publicados por la empresa que parten de estadística oficial
 * verificable y explican qué implica técnicamente para quien especifica.
 *
 * Por qué es la pieza más delicada de todo el sitio. Un informe con una cifra
 * inventada no es un error aislado: contamina todo lo demás. El glosario, el
 * marco y las guías valen porque nada de lo publicado es inventado; una sola
 * proyección de mercado sacada de la manga destruye esa propiedad entera y no
 * hay forma de recuperarla, porque un modelo que nos citó ya propagó el dato.
 *
 * LAS CINCO REGLAS, sin excepciones:
 *
 *  1. TODA cifra lleva `fuenteId` que resuelve a una fuente con organismo, URL,
 *     fecha de publicación y fecha en que la verificamos. Sin fuente no entra.
 *     Hay tests que lo comprueban en las dos direcciones.
 *
 *  2. NO estimamos el tamaño de nuestro propio mercado. No existe una cifra
 *     pública verificable del mercado peruano de textiles industriales y
 *     geosintéticos, y una estimación propia presentada como dato es
 *     exactamente el tipo de invención que este archivo existe para impedir.
 *     Publicamos los indicadores de los sectores que compran —minería,
 *     agroexportación— que sí son oficiales, y dejamos que el lector saque su
 *     conclusión.
 *
 *  3. Lo que es NUESTRA lectura va en `implicacion`, separado del dato y
 *     etiquetado como tal en la página. La cifra es de MINEM; la consecuencia
 *     técnica es nuestra, y el lector tiene derecho a distinguirlas.
 *
 *  4. `limitaciones` es obligatorio: qué NO afirma este informe. Un estudio que
 *     no declara sus límites es publicidad con formato de estudio, y los
 *     compradores técnicos lo detectan.
 *
 *  5. Una proyección se declara proyección, con quién la hizo. "MIDAGRI
 *     proyectó" no es lo mismo que "el mercado crecerá", y jamás firmamos una
 *     previsión propia como si fuera un hecho.
 */

export interface Fuente {
  /** Identificador corto para citar desde indicadores y gráficos. */
  id: string;
  /** Quién publica el dato. */
  organismo: string;
  titulo: string;
  url: string;
  /** Fecha de publicación de la fuente (ISO). */
  publicado: string;
  /** Fecha en que verificamos el dato contra la fuente (ISO). */
  consultado: string;
  /** Qué dato concreto respalda esta fuente. */
  respalda: string;
}

export interface Indicador {
  etiqueta: string;
  /** Valor ya formateado para lectura. */
  valor: string;
  unidad?: string;
  /** A qué periodo corresponde. Un indicador sin periodo no es un indicador. */
  periodo: string;
  /** Variación porcentual y contra qué base. */
  variacion?: { pct: number; base: string };
  fuenteId: string;
}

export type TipoGrafico = 'magnitud' | 'divergente';

export interface Grafico {
  titulo: string;
  /** Qué se está midiendo y en qué unidad. */
  unidad: string;
  tipo: TipoGrafico;
  fuenteId: string;
  /** Nota al pie del gráfico: alcance, criterio de orden, qué no muestra. */
  nota: string;
  datos: { etiqueta: string; valor: number }[];
}

export interface SeccionInforme {
  heading: string;
  cuerpo?: string[];
  indicadores?: Indicador[];
  grafico?: Grafico;
  /**
   * NUESTRA lectura técnica del dato anterior. Se renderiza separada y
   * etiquetada: el dato es del organismo, la consecuencia es nuestra.
   */
  implicacion?: string;
}

export interface Informe {
  slug: string;
  titulo: string;
  subtitulo: string;
  metaTitle: string;
  metaDescription: string;
  /** Fecha de publicación del informe (ISO). */
  fecha: string;
  version: string;
  /** Frases autosuficientes: la unidad citable del informe. */
  resumenEjecutivo: string[];
  secciones: SeccionInforme[];
  /** Qué NO afirma este informe. Obligatorio. */
  limitaciones: string[];
  fuentes: Fuente[];
}

/**
 * Informe 1 — Los sectores que compran textiles industriales en el Perú.
 *
 * Todas las cifras se verificaron contra la fuente oficial el 2026-08-20.
 * Las fuentes son organismos del Estado peruano o medios que citan al
 * organismo de forma trazable; en cada caso `respalda` dice qué dato concreto
 * sostiene, para que la revisión sea posible sin releer el informe entero.
 */
const sectoresCompradores: Informe = {
  slug: 'sectores-compradores-textiles-industriales-peru',
  titulo: 'Qué mueve la demanda de textiles industriales y geosintéticos en el Perú',
  subtitulo:
    'Los indicadores oficiales de minería, agroexportación y radiación solar, y qué implican técnicamente para quien especifica.',
  metaTitle:
    'Informe: qué mueve la demanda de textiles industriales y geosintéticos en el Perú',
  metaDescription:
    'Producción e inversión minera, agroexportaciones y radiación ultravioleta en el Perú, con las cifras oficiales de MINEM, MIDAGRI y SENAMHI, y qué implica cada una para especificar geomembranas, mangas de ventilación, mallas y cobertores.',
  fecha: '2026-08-20',
  version: '1.0',
  resumenEjecutivo: [
    'La producción peruana de cobre cerró 2025 en 2 769 794 toneladas métricas finas, un récord y un 1,2 % por encima de 2024, según el Ministerio de Energía y Minas.',
    'El zinc creció 18,6 % en 2025 y el oro se contrajo 0,7 %: la demanda minera no se mueve en bloque, y eso cambia qué se especifica en cada operación.',
    'La cartera de proyectos de inversión minera 2025 reúne 67 proyectos por 64 071 millones de dólares en 19 regiones, un 17,4 % más que la cartera anterior.',
    'Las agroexportaciones peruanas superaron los 15 000 millones de dólares en 2025, frente a 12 798 millones en 2024.',
    'SENAMHI registró en julio de 2026 índices ultravioleta de entre 8 y 12 en la sierra sur, niveles que la escala internacional clasifica como muy altos y extremadamente altos.',
    'Ninguna cifra de este informe describe el mercado de textiles industriales: no existe una estadística pública verificable de ese mercado y no la estimamos.',
  ],
  secciones: [
    {
      heading: 'Por qué estos indicadores y no una cifra de mercado',
      cuerpo: [
        'Un informe de sector suele abrir con el tamaño del mercado. Este no lo hace, y conviene decir por qué antes que nada: no existe una estadística pública verificable del mercado peruano de textiles industriales y geosintéticos. Publicar una estimación propia con aspecto de dato sería inventar el número más importante del documento.',
        'Lo que sí existe, y es oficial, son los indicadores de los sectores que compran estos productos. La minería y la agroexportación explican la mayor parte de la demanda de geomembranas, mangas de ventilación, big bags, mallas y cobertores en el país. Sus cifras están publicadas por el Estado, son trazables y se pueden verificar contra la fuente.',
        'El lector saca su conclusión sobre el tamaño. Nosotros aportamos lo que sí podemos sostener: qué implica técnicamente cada indicador para quien tiene que redactar una especificación.',
      ],
    },
    {
      heading: 'Producción minera 2025: crecimiento desigual por metal',
      cuerpo: [
        'El Ministerio de Energía y Minas reportó que la producción de cobre cerró 2025 en 2 769 794 toneladas métricas finas, cifra récord y 1,2 % superior a 2024. El resto de los metales se movió en direcciones muy distintas.',
      ],
      indicadores: [
        {
          etiqueta: 'Producción de cobre',
          valor: '2 769 794',
          unidad: 'TMF',
          periodo: '2025 (año completo)',
          variacion: { pct: 1.2, base: '2024' },
          fuenteId: 'minem-produccion-2025',
        },
        {
          etiqueta: 'Producción de zinc',
          valor: '+18,6 %',
          periodo: '2025 (año completo)',
          variacion: { pct: 18.6, base: '2024' },
          fuenteId: 'minem-produccion-2025',
        },
        {
          etiqueta: 'Producción de oro',
          valor: '−0,7 %',
          periodo: '2025 (año completo)',
          variacion: { pct: -0.7, base: '2024' },
          fuenteId: 'minem-produccion-2025',
        },
      ],
      grafico: {
        titulo: 'Variación de la producción minera peruana en 2025 frente a 2024',
        unidad: 'variación porcentual',
        tipo: 'divergente',
        fuenteId: 'minem-produccion-2025',
        nota: 'Ordenado de mayor a menor variación. El oro es el único metal de la serie que se contrajo. Las barras muestran variación porcentual, no volumen: un punto porcentual de cobre y uno de estaño no representan el mismo tonelaje.',
        datos: [
          { etiqueta: 'Zinc', valor: 18.6 },
          { etiqueta: 'Plomo', valor: 7.2 },
          { etiqueta: 'Plata', valor: 7.1 },
          { etiqueta: 'Estaño', valor: 4.6 },
          { etiqueta: 'Cobre', valor: 1.2 },
          { etiqueta: 'Oro', valor: -0.7 },
        ],
      },
      implicacion:
        'Que la producción crezca de forma desigual importa porque cada metal arrastra una configuración distinta. El zinc y el plomo concentran operaciones subterráneas, donde lo que se demanda es ventilación: mangas dimensionadas por caudal y por configuración impelente o aspirante. El cobre concentra operación a tajo abierto y procesos hidrometalúrgicos, donde lo que se demanda es impermeabilización: geomembrana, geotextil de protección, detalle de anclaje y ensayo de uniones. Un proveedor que lee "creció la minería" y no distingue entre esas dos demandas termina ofreciendo el producto equivocado.',
    },
    {
      heading: 'Inversión minera: la demanda que todavía no se ejecutó',
      cuerpo: [
        'La producción describe lo que ya ocurre; la cartera de inversión describe lo que se va a construir. El MINEM reportó en abril de 2025 una cartera de 67 proyectos por 64 071 millones de dólares distribuidos en 19 regiones, frente a 51 proyectos por 54 556 millones en la cartera anterior.',
      ],
      indicadores: [
        {
          etiqueta: 'Cartera de proyectos de inversión minera',
          valor: '64 071',
          unidad: 'millones de US$',
          periodo: 'Cartera 2025',
          variacion: { pct: 17.4, base: 'cartera anterior' },
          fuenteId: 'minem-cartera-2025',
        },
        {
          etiqueta: 'Número de proyectos',
          valor: '67',
          unidad: 'proyectos en 19 regiones',
          periodo: 'Cartera 2025',
          fuenteId: 'minem-cartera-2025',
        },
      ],
      implicacion:
        'Una cartera repartida en 19 regiones es una advertencia de especificación, no solo una cifra de inversión. Un proyecto en la costa y otro por encima de los cuatro mil metros no admiten el mismo material aunque la aplicación sea idéntica: cambian la radiación ultravioleta, la amplitud térmica diaria y las condiciones de soldadura en obra. Quien estandariza una especificación para toda su cartera está aceptando que una parte envejezca antes de tiempo.',
    },
    {
      heading: 'Agroexportación: volumen creciente y protección de cultivo',
      cuerpo: [
        'El Ministerio de Desarrollo Agrario y Riego informó que las agroexportaciones peruanas superaron los 15 000 millones de dólares al cierre de 2025, frente a 12 798 millones en 2024. En el primer cuatrimestre de 2025 ya sumaban 3 740 millones, un 23,6 % más que el mismo periodo del año anterior.',
      ],
      indicadores: [
        {
          etiqueta: 'Agroexportaciones',
          valor: '> 15 000',
          unidad: 'millones de US$',
          periodo: '2025 (año completo)',
          fuenteId: 'midagri-agroexport-2025',
        },
        {
          etiqueta: 'Agroexportaciones',
          valor: '12 798',
          unidad: 'millones de US$',
          periodo: '2024 (año completo)',
          fuenteId: 'midagri-cuatrimestre-2025',
        },
        {
          etiqueta: 'Enero–abril 2025',
          valor: '3 740',
          unidad: 'millones de US$',
          periodo: 'Ene–abr 2025',
          variacion: { pct: 23.6, base: 'ene–abr 2024' },
          fuenteId: 'midagri-cuatrimestre-2025',
        },
      ],
      grafico: {
        titulo: 'Principales productos agroexportados, enero–abril de 2025',
        unidad: 'millones de US$',
        tipo: 'magnitud',
        fuenteId: 'midagri-cuatrimestre-2025',
        nota: 'Valor exportado en el primer cuatrimestre de 2025, ordenado de mayor a menor. Es un corte cuatrimestral, no el cierre del año: la estacionalidad de cada cultivo cambia el orden según el periodo que se mire.',
        datos: [
          { etiqueta: 'Uva fresca', valor: 742 },
          { etiqueta: 'Palta', valor: 388 },
          { etiqueta: 'Arándano fresco', valor: 241 },
          { etiqueta: 'Mango fresco', valor: 226 },
          { etiqueta: 'Cacao en grano', valor: 190 },
        ],
      },
      implicacion:
        'Los cultivos que encabezan la lista son los que más protección física exigen: uva, arándano y mango se defienden con malla antiáfida, malla de sombreo y cobertores, y en los tres casos la decisión técnica es la misma y se equivoca igual de seguido. Cerrar la trama para excluir un insecto reduce el paso de aire, y una malla elegida solo por su capacidad de exclusión sube la temperatura bajo cubierta. El criterio correcto no es la trama más cerrada disponible, sino la más cerrada que la ventilación del predio todavía tolera.',
    },
    {
      heading: 'Radiación ultravioleta: la variable de exposición que decide la vida útil',
      cuerpo: [
        'SENAMHI informó en julio de 2026 índices ultravioleta de entre 8 y 12 en Apurímac, Cusco, Arequipa, Moquegua y Puno, y atribuyó el episodio a condiciones atmosféricas que favorecen una disminución de la concentración de ozono sobre esa parte del país. En la escala internacional, los valores de 8 a 10 se clasifican como muy altos y los de 11 en adelante como extremadamente altos.',
      ],
      indicadores: [
        {
          etiqueta: 'Índice ultravioleta en la sierra sur',
          valor: '8 a 12',
          unidad: 'índice UV',
          periodo: 'Julio de 2026',
          fuenteId: 'senamhi-uv-2026',
        },
      ],
      implicacion:
        'La radiación ultravioleta rompe las cadenas del polímero: el material se vuelve quebradizo y termina fracturándose ante esfuerzos que antes toleraba. Los estabilizadores retrasan ese proceso, no lo detienen, y su vida útil depende de la intensidad de radiación del emplazamiento. Un material especificado para condiciones de costa e instalado en la sierra sur envejece bajo una radiación sustancialmente mayor. Por eso una especificación que declara el uso pero no el emplazamiento está incompleta, y por eso el emplazamiento es uno de los criterios del pilar de exposición de nuestro Marco de Especificación.',
    },
  ],
  limitaciones: [
    'Este informe NO estima el tamaño del mercado peruano de textiles industriales ni de geosintéticos. No existe una estadística pública verificable de ese mercado y no publicamos estimaciones propias presentadas como datos.',
    'No cuantifica qué proporción de la inversión minera o agroexportadora se traduce en compra de estos productos. La relación es real y técnicamente demostrable, pero su magnitud no está medida en ninguna fuente pública que podamos citar.',
    'Las cifras de agroexportación por producto corresponden al primer cuatrimestre de 2025 y no al cierre del año: proceden de una fuente distinta de la del total anual, y están declaradas por separado. La estacionalidad de cada cultivo cambia el orden según el periodo que se observe.',
    'El episodio de radiación ultravioleta reportado por SENAMHI corresponde a un pronóstico de días concretos de julio de 2026, no a un promedio anual. Sirve para ilustrar el orden de magnitud al que se expone un material en altura, no para dimensionar una vida útil.',
    'Las cifras se verificaron contra sus fuentes en la fecha de consulta indicada en cada una. Los organismos revisan sus series: antes de usar un número en un expediente técnico, confírmelo contra la publicación vigente.',
    'Ninguna sección de este informe constituye una recomendación de inversión ni una previsión de mercado propia.',
  ],
  fuentes: [
    {
      id: 'minem-produccion-2025',
      organismo: 'Ministerio de Energía y Minas (MINEM)',
      titulo: 'Producción minera al cierre de 2025',
      url: 'https://www.gob.pe/institucion/minem/colecciones/6-boletin-estadistico-minero',
      publicado: '2026-03-11',
      consultado: '2026-08-20',
      respalda:
        'Producción de cobre 2025 (2 769 794 TMF, +1,2 %) y variación anual de zinc (+18,6 %), plomo (+7,2 %), plata (+7,1 %), estaño (+4,6 %) y oro (−0,7 %).',
    },
    {
      id: 'minem-cartera-2025',
      organismo: 'Ministerio de Energía y Minas (MINEM), vía Diario Oficial El Peruano',
      titulo: 'Cartera de Proyectos de Inversión Minera 2025',
      url: 'https://elperuano.pe/noticia/269289-minem-cartera-de-proyectos-de-inversion-minera-2025-esta-compuesta-por-67-proyectos',
      publicado: '2025-04-28',
      consultado: '2026-08-20',
      respalda:
        'Cartera 2025: 67 proyectos, 64 071 millones de dólares, 19 regiones, +17,4 % frente a 51 proyectos y 54 556 millones de la cartera anterior.',
    },
    {
      id: 'midagri-agroexport-2025',
      organismo: 'Ministerio de Desarrollo Agrario y Riego (MIDAGRI), vía Agencia Peruana de Noticias Andina',
      titulo: 'Agroexportaciones peruanas: cierre proyectado de 2025',
      url: 'https://andina.pe/agencia/noticia-midagri-agroexportaciones-superarian-los-15000-millones-2025-1058126.aspx',
      publicado: '2026-01-05',
      consultado: '2026-08-21',
      respalda:
        'Agroexportaciones peruanas de 2025 por encima de 15 000 millones de dólares, según MIDAGRI.',
    },
    {
      id: 'midagri-cuatrimestre-2025',
      organismo: 'Ministerio de Desarrollo Agrario y Riego (MIDAGRI), declaraciones del ministro recogidas por Agraria.pe',
      titulo: 'Agroexportaciones peruanas: primer cuatrimestre de 2025 y base 2024',
      url: 'https://agraria.pe/noticias/agroexportaciones-peruanas-alcanzarian-los-us-15-000-millone-39842',
      publicado: '2025-06-20',
      consultado: '2026-08-21',
      respalda:
        'Base 2024 de 12 798 millones de dólares, 3 740 millones en enero–abril de 2025 (+23,6 % frente al mismo periodo de 2024) y valor exportado por producto en ese cuatrimestre.',
    },
    {
      id: 'senamhi-uv-2026',
      organismo: 'Servicio Nacional de Meteorología e Hidrología del Perú (SENAMHI)',
      titulo: 'Aviso de radiación ultravioleta en la sierra sur',
      url: 'https://www.gob.pe/senamhi',
      publicado: '2026-07-04',
      consultado: '2026-08-20',
      respalda:
        'Índice ultravioleta de 8 a 12 previsto para Apurímac, Cusco, Arequipa, Moquegua y Puno, y clasificación de la escala internacional (8–10 muy alta, 11 o más extremadamente alta).',
    },
  ],
};

export const informes: Informe[] = [sectoresCompradores];

export const informeBySlug = (slug: string): Informe | undefined =>
  informes.find((i) => i.slug === slug);

/** Fecha del informe más reciente: señal de frescura para sitemap y feeds. */
export const INFORMES_UPDATED: string = informes
  .map((i) => i.fecha)
  .sort()
  .reverse()[0] ?? '';

/** Resuelve la fuente de un indicador o gráfico dentro de su informe. */
export const fuenteDe = (informe: Informe, fuenteId: string): Fuente | undefined =>
  informe.fuentes.find((f) => f.id === fuenteId);

/** Todos los identificadores de fuente que el informe usa realmente. */
export function fuentesUsadas(informe: Informe): string[] {
  const ids = new Set<string>();
  for (const s of informe.secciones) {
    for (const i of s.indicadores ?? []) ids.add(i.fuenteId);
    if (s.grafico) ids.add(s.grafico.fuenteId);
  }
  return [...ids];
}
