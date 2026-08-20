#!/usr/bin/env bash
# =============================================================================
#  P18 — Correcciones que encontró la propia vigilancia
#  Plastilonas Peruanas SAC
#
#  La primera corrida real de `npm run vigilancia` encontró tres cosas, y una
#  de ellas era mía, de la víspera. Eso es exactamente para lo que se construyó.
#
#  1. CITA ROTA, NUESTRA (404)
#     El informe citaba https://www.gob.pe/institucion/midagri — una URL
#     genérica de institución que no resuelve. La puse porque la nota concreta
#     de MIDAGRI rechaza clientes automatizados con 418, y una URL genérica que
#     además da 404 es precisamente la "cita decorativa" que los tests del
#     propio informe prohíben: da apariencia de rigor sin respaldar nada.
#
#     Corregido partiéndola en las DOS fuentes que de verdad sostienen cada
#     cifra, ambas comprobadas:
#       - Andina (agencia estatal), enero de 2026: el total de 2025 por encima
#         de 15 000 millones de dólares según MIDAGRI.
#       - Agraria.pe recogiendo al ministro, junio de 2025: la base 2024 de
#         12 798 millones, los 3 740 millones de enero-abril (+23,6 %) y el
#         valor por producto de ese cuatrimestre.
#     Los indicadores y el gráfico se reapuntaron a la fuente correcta de cada
#     uno, y la limitación sobre estacionalidad ahora dice también que el total
#     anual y el detalle por producto vienen de fuentes distintas.
#
#  2. FALSO POSITIVO DEL PROPIO VIGILANTE
#     Marcó revistaseguridadminera.com como caída por "fetch failed". La página
#     carga perfectamente desde otra red. Un DNS que no resuelve y un dominio
#     muerto producen EXACTAMENTE el mismo error: un fallo de red no prueba
#     nada sobre la cita.
#
#     La clasificación pasa de tres estados a cuatro, con un principio: solo se
#     declara rota una cita cuando la respuesta lo DEMUESTRA.
#       ok         2xx y 3xx
#       caida      404 y 410, y nada más. Lo único que hace fallar el proceso.
#       bloqueado  401, 403, 429 — un cortafuegos rechazó al cliente automático
#       revisar    5xx y fallos de red — no concluyente, se avisa sin fallar
#     Con esta regla, la corrida de ayer habría reportado UN fallo real: el 404
#     que era nuestro.
#
#  3. LÍNEAS DUPLICADAS
#     Dos guías que citan la misma norma aparecían dos veces y el reporte
#     aparentaba más incidencias de las que había. Ahora deduplica por URL y
#     muestra en qué documentos se usa cada una: 18 URLs distintas en 21 citas.
#
#  Uso:
#    ls aplicar*p18*
#    bash aplicarp18correcciones.sh
# =============================================================================
set -euo pipefail

if [ ! -f package.json ]; then
  echo "ERROR: ejecute este script desde la raíz del repositorio." >&2
  exit 1
fi

# -----------------------------------------------------------------------------
# lib/informes.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/informes.ts" <<'P18_EOF'
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
P18_EOF

# -----------------------------------------------------------------------------
# scripts/vigilancia-fuentes.mjs
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/vigilancia-fuentes.mjs" <<'P18_EOF'
#!/usr/bin/env node
/**
 * VIGILANCIA DE FUENTES — comprueba que la evidencia publicada sigue en pie.
 *
 * QUÉ HACE Y QUÉ NO HACE, porque la diferencia es todo:
 *
 *  HACE: recorre las fuentes que citan nuestros informes y guías, comprueba
 *  que siguen respondiendo, y avisa cuáles llevan demasiado tiempo sin
 *  verificarse. Emite un reporte para que una persona decida.
 *
 *  NO HACE: publicar nada. No trae titulares, no ingiere contenido ajeno, no
 *  actualiza cifras solo. Un feed que publica automáticamente contenido de
 *  terceros mete en nuestro grafo de entidad afirmaciones que no controlamos,
 *  genera contenido duplicado y convierte una referencia en una granja de
 *  contenido. Todo el sitio está construido sobre la propiedad contraria: nada
 *  se publica que no se pueda verificar. Este script protege esa propiedad; no
 *  la negocia.
 *
 * POR QUÉ ES UN MECANISMO. Una cita se pudre en silencio: el organismo
 * reorganiza su web, el enlace muere, y el informe sigue diciendo "según
 * MINEM" con un enlace roto durante meses. Nadie lo detecta revisando a mano,
 * porque revisar a mano es justamente lo que no se hace. Esto lo detecta.
 *
 * Uso:
 *   npm run vigilancia            # comprueba y reporta
 *   MAX_DIAS=120 npm run vigilancia
 *
 * Sale con código 1 SOLO si alguna cita devolvió 404 o 410, las dos únicas
 * respuestas en que el servidor AFIRMA que el recurso no existe. Todo lo demás
 * —cortafuegos, límites de tasa, errores de red— se informa sin hacer fallar
 * el proceso. Apto para una tarea programada.
 */

import { readFileSync } from 'node:fs';

const MAX_DIAS = Number(process.env.MAX_DIAS ?? 180);
const TIEMPO_ESPERA = Number(process.env.TIMEOUT_MS ?? 15000);

const verde = (t) => `\x1b[32m${t}\x1b[0m`;
const rojo = (t) => `\x1b[31m${t}\x1b[0m`;
const ambar = (t) => `\x1b[33m${t}\x1b[0m`;

/**
 * Extrae las fuentes declaradas en lib/informes.ts sin importar TypeScript:
 * el script debe poder correr en una tarea programada sin cadena de compilación.
 */
function leerFuentes(ruta, etiqueta) {
  let texto;
  try {
    texto = readFileSync(ruta, 'utf8');
  } catch {
    return [];
  }
  const fuentes = [];
  const bloques = texto.split(/\n\s*\{\s*\n/);
  for (const b of bloques) {
    const url = b.match(/url:\s*'([^']+)'/)?.[1];
    if (!url || !url.startsWith('http')) continue;
    fuentes.push({
      origen: etiqueta,
      url,
      organismo: b.match(/organismo:\s*'([^']+)'/)?.[1]
        ?? b.match(/label:\s*'([^']+)'/)?.[1]
        ?? '(sin organismo)',
      consultado: b.match(/consultado:\s*'([^']+)'/)?.[1] ?? null,
    });
  }
  return fuentes;
}

/**
 * Un rastreador sin cabecera de navegador recibe 403 de casi cualquier portal
 * con cortafuegos, y varios portales del Estado peruano están detrás de uno.
 */
const CABECERAS = {
  'User-Agent':
    'Mozilla/5.0 (compatible; PlastilonasSourceCheck/1.0; +https://plastilonas-peruanas-sac.vercel.app/informes)',
  Accept: 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-PE,es;q=0.9',
};

/**
 * Clasificación en CUATRO estados. Es la decisión que decide si este script
 * sirve para algo, y hubo que corregirla dos veces con datos reales.
 *
 * El principio: solo se declara ROTA una cita cuando la respuesta lo DEMUESTRA.
 * Un reporte que grita cuando no pasa nada se deja de leer a la tercera vez, y
 * ahí el mecanismo dejó de existir. Falso negativo caro, falso positivo fatal.
 *
 *  ok         2xx y 3xx. La cita responde.
 *
 *  caida      404 y 410, y NADA MÁS. Son las dos únicas respuestas en que el
 *             servidor afirma que el recurso no existe. Es lo único que hace
 *             fallar el proceso.
 *
 *  bloqueado  401, 403, 429. Un cortafuegos o un límite de tasa rechazó a un
 *             cliente automatizado; la página puede estar perfectamente viva
 *             en un navegador. Se comprobó: gob.pe responde 418 a un fetcher
 *             y 200 a un navegador.
 *
 *  revisar    5xx y fallos de red (DNS, TLS, conexión rechazada, tiempo
 *             agotado). NO prueban nada sobre la cita: un dominio muerto y una
 *             red que no llega producen exactamente el mismo error. Se
 *             descubrió con revistaseguridadminera.com, que falló desde una
 *             red y cargó perfectamente desde otra. Se avisa, no se falla.
 */
function clasificar(estado) {
  if (estado >= 200 && estado < 400) return 'ok';
  if (estado === 404 || estado === 410) return 'caida';
  if (estado === 401 || estado === 403 || estado === 429) return 'bloqueado';
  return 'revisar';
}

async function comprobar(fuente) {
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIEMPO_ESPERA);
  try {
    // HEAD primero: más barato y suficiente. Varios portales no lo admiten,
    // así que se reintenta con GET antes de sacar ninguna conclusión.
    let res = await fetch(fuente.url, {
      method: 'HEAD', headers: CABECERAS, signal: control.signal, redirect: 'follow',
    });
    if (!res.ok) {
      res = await fetch(fuente.url, {
        method: 'GET', headers: CABECERAS, signal: control.signal, redirect: 'follow',
      });
    }
    return { ...fuente, estado: res.status, clase: clasificar(res.status) };
  } catch (e) {
    return { ...fuente, estado: 0, clase: 'revisar', error: String(e?.message ?? e) };
  } finally {
    clearTimeout(temporizador);
  }
}

const diasDesde = (iso) =>
  Math.floor((Date.now() - new Date(`${iso}T12:00:00Z`).getTime()) / 86400000);

const fuentes = [
  ...leerFuentes('lib/informes.ts', 'informe'),
  ...leerFuentes('lib/articles.ts', 'guía'),
];

// Dos guías que citan la misma norma no son dos problemas: son uno. Sin esto
// el reporte repite la misma línea y aparenta más incidencias de las que hay.
const porUrl = new Map();
for (const f of fuentes) {
  const previa = porUrl.get(f.url);
  if (previa) previa.origenes.add(f.origen);
  else porUrl.set(f.url, { ...f, origenes: new Set([f.origen]) });
}
const unicas = [...porUrl.values()];

if (fuentes.length === 0) {
  console.error('No se encontró ninguna fuente. ¿Se ejecuta desde la raíz del repositorio?');
  process.exit(1);
}

console.log(
  `\nVigilancia de fuentes — ${unicas.length} URLs distintas en ${fuentes.length} citas\n`,
);

const resultados = [];
for (const f of unicas) resultados.push(await comprobar(f));

let caidas = 0;
let bloqueadas = 0;
let revisar = 0;
let vencidas = 0;

const MARCA = {
  ok: verde('✓'), bloqueado: ambar('~'), revisar: ambar('?'), caida: rojo('✗'),
};

for (const r of resultados) {
  const dias = r.consultado ? diasDesde(r.consultado) : null;
  const antigua = dias !== null && dias > MAX_DIAS;
  if (r.clase === 'caida') caidas++;
  if (r.clase === 'bloqueado') bloqueadas++;
  if (r.clase === 'revisar') revisar++;
  if (antigua) vencidas++;

  const edad =
    dias === null
      ? ''
      : antigua
        ? ambar(` · verificada hace ${dias} días`)
        : ` · verificada hace ${dias} días`;
  console.log(`  ${MARCA[r.clase]} [${[...r.origenes].join(', ')}] ${r.organismo} — ${r.estado || r.error}${edad}`);
  console.log(`      ${r.url}`);
}

console.log('');
if (caidas) {
  console.log(rojo(`${caidas} cita(s) devolvieron 404 o 410: el recurso ya no existe.`));
  console.log('  Una cita con enlace roto es una cita que ya no respalda nada.');
  console.log('  Busque la publicación vigente del organismo y actualice la URL.');
}
if (revisar) {
  console.log(ambar(`${revisar} cita(s) fallaron por red o error del servidor: no concluyente.`));
  console.log('  Un DNS que no resuelve y un dominio muerto dan el mismo error.');
  console.log('  Ábralas en un navegador; si cargan, no hay nada que corregir.');
}
if (vencidas) {
  console.log(ambar(`${vencidas} fuente(s) llevan más de ${MAX_DIAS} días sin verificarse.`));
  console.log('  Los organismos revisan sus series: reconfirme la cifra y actualice');
  console.log('  el campo `consultado`. NO se actualiza sola, y es deliberado.');
}
if (bloqueadas) {
  console.log(ambar(`${bloqueadas} fuente(s) devolvieron 401, 403 o 429: no concluyente.`));
  console.log('  Un cortafuegos o un límite de tasa rechazó al cliente automatizado.');
  console.log('  Ábralas en un navegador antes de tocar nada; NO cuentan como fallo.');
  console.log('  (Si TODAS salen así, el bloqueo está en su red, no en las fuentes.)');
}
if (!caidas && !bloqueadas && !revisar && !vencidas) {
  console.log(verde('Todas las fuentes responden y están dentro del plazo de verificación.'));
}

console.log('');
console.log('Este script NO publica nada. Solo informa para que una persona decida.');

process.exit(caidas ? 1 : 0);
P18_EOF

# -----------------------------------------------------------------------------
# test/informes.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/informes.test.ts" <<'P18_EOF'
import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  informes, informeBySlug, fuenteDe, fuentesUsadas, INFORMES_UPDATED,
} from '@/lib/informes';
import { buildInformePdf } from '@/lib/doc-informe';
import { generateStaticParams } from '@/app/informes/[slug]/page';
import sitemap from '@/app/sitemap';
import { SITE } from '@/lib/site';

/**
 * El archivo más delicado del sitio. Una cifra sin fuente en un informe no es
 * un error aislado: contamina el glosario, el marco y las guías, porque todos
 * valen por la misma propiedad — nada de lo publicado es inventado. Y una vez
 * que un modelo citó el dato, ya se propagó.
 */

describe('informes: toda cifra tiene procedencia', () => {
  it('cada indicador y cada gráfico resuelven a una fuente declarada', () => {
    for (const i of informes) {
      for (const id of fuentesUsadas(i)) {
        expect(fuenteDe(i, id), `${i.slug} → ${id}`).toBeDefined();
      }
    }
  });

  it('no hay fuentes declaradas que nadie use', () => {
    // Una fuente sin uso es una cita decorativa: da apariencia de rigor sin
    // respaldar ninguna cifra concreta.
    for (const i of informes) {
      const usadas = new Set(fuentesUsadas(i));
      for (const f of i.fuentes) {
        expect(usadas.has(f.id), `${i.slug}: fuente ${f.id} declarada pero sin usar`).toBe(true);
      }
    }
  });

  it('cada fuente declara organismo, URL real, fechas y qué respalda', () => {
    for (const i of informes) {
      for (const f of i.fuentes) {
        expect(f.organismo.length, f.id).toBeGreaterThan(3);
        expect(f.url).toMatch(/^https:\/\//);
        expect(f.publicado).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(f.consultado).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        // Sin esto, "Fuente: MINEM" no dice qué número respalda.
        expect(f.respalda.length, f.id).toBeGreaterThan(40);
      }
    }
  });

  it('no se verifica una fuente antes de que exista', () => {
    for (const i of informes) {
      for (const f of i.fuentes) {
        expect(f.consultado >= f.publicado, `${f.id}: consultado ${f.consultado} < publicado ${f.publicado}`).toBe(true);
      }
    }
  });

  it('ningún indicador se publica sin periodo', () => {
    // Una cifra sin periodo no es una cifra: es una impresión.
    for (const i of informes) {
      for (const s of i.secciones) {
        for (const ind of s.indicadores ?? []) {
          expect(ind.periodo.length, `${i.slug}: ${ind.etiqueta}`).toBeGreaterThan(3);
          expect(ind.valor.length, `${i.slug}: ${ind.etiqueta}`).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('informes: honestidad declarada', () => {
  it('cada informe declara qué NO afirma', () => {
    for (const i of informes) {
      expect(i.limitaciones.length, i.slug).toBeGreaterThanOrEqual(3);
      for (const l of i.limitaciones) expect(l.length).toBeGreaterThan(40);
    }
  });

  it('declara explícitamente que no estima el tamaño de su propio mercado', () => {
    // Es la invención más tentadora de un informe de sector y la más dañina:
    // no existe estadística pública verificable de este mercado.
    for (const i of informes) {
      const texto = i.limitaciones.join(' ').toLowerCase();
      expect(texto, i.slug).toMatch(/no estima|no cuantifica/);
      expect(texto, i.slug).toContain('mercado');
    }
  });

  it('ningún informe firma una previsión propia como si fuera un hecho', () => {
    // "Proyectamos que el mercado crecerá" es exactamente lo que no hacemos.
    const prohibido = /\b(proyectamos|estimamos que el mercado|prevemos que|nuestra proyección)\b/i;
    for (const i of informes) {
      const texto = [
        ...i.resumenEjecutivo,
        ...i.secciones.flatMap((s) => [...(s.cuerpo ?? []), s.implicacion ?? '']),
      ].join(' ');
      expect(prohibido.test(texto), i.slug).toBe(false);
    }
  });

  it('el resumen ejecutivo son frases autosuficientes y citables', () => {
    for (const i of informes) {
      expect(i.resumenEjecutivo.length).toBeGreaterThanOrEqual(3);
      for (const r of i.resumenEjecutivo) {
        expect(r.length, `${i.slug}: "${r.slice(0, 40)}"`).toBeGreaterThan(60);
        expect(r.trim().endsWith('.'), r.slice(0, 40)).toBe(true);
      }
    }
  });

  it('la lectura propia va separada del dato', () => {
    // `implicacion` existe justamente para que el lector distinga lo que dice
    // el organismo de lo que decimos nosotros.
    const conImplicacion = informes.flatMap((i) =>
      i.secciones.filter((s) => s.implicacion),
    );
    expect(conImplicacion.length).toBeGreaterThan(0);
    for (const s of conImplicacion) expect(s.implicacion!.length).toBeGreaterThan(80);
  });
});

describe('informes: gráficos', () => {
  const graficos = informes.flatMap((i) => i.secciones.map((s) => s.grafico).filter(Boolean));

  it('cada gráfico declara unidad, fuente y nota de alcance', () => {
    expect(graficos.length).toBeGreaterThan(0);
    for (const g of graficos) {
      expect(g!.unidad.length).toBeGreaterThan(3);
      expect(g!.fuenteId.length).toBeGreaterThan(0);
      // La nota dice qué NO muestra el gráfico: sin ella, una barra de
      // variación porcentual se lee como si fuera volumen.
      expect(g!.nota.length).toBeGreaterThan(60);
      expect(g!.datos.length).toBeGreaterThan(1);
    }
  });

  it('los gráficos de magnitud no llevan valores negativos', () => {
    for (const g of graficos) {
      if (g!.tipo === 'magnitud') {
        for (const d of g!.datos) expect(d.valor, `${g!.titulo}: ${d.etiqueta}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('el gráfico se renderiza en el servidor y sin JavaScript de cliente', () => {
    const src = readFileSync(join(process.cwd(), 'components/BarChart.tsx'), 'utf8');
    expect(src).not.toMatch(/^'use client'/m);
    expect(src).not.toMatch(/useState|useEffect/);
    // Tabla de respaldo: lector de pantalla, impresión y alto contraste.
    expect(src).toMatch(/<table/);
  });

  it('el eje divergente no depende solo del color', () => {
    // Cada barra lleva su valor con signo: la identidad nunca es color-solo.
    const src = readFileSync(join(process.cwd(), 'components/BarChart.tsx'), 'utf8');
    expect(src).toMatch(/signo/);
    expect(src).toMatch(/viz-barra-neg/);
  });
});

describe('informes: rutas, documento y descubrimiento', () => {
  it('generateStaticParams cubre todos los informes', () => {
    expect(generateStaticParams().map((p) => p.slug).sort()).toEqual(
      informes.map((i) => i.slug).sort(),
    );
  });

  it('informeBySlug encuentra cada informe y rechaza los inexistentes', () => {
    for (const i of informes) expect(informeBySlug(i.slug)?.titulo).toBe(i.titulo);
    expect(informeBySlug('no-existe')).toBeUndefined();
  });

  it('genera un PDF válido de cada informe, de forma determinista', async () => {
    for (const i of informes) {
      const a = await buildInformePdf(i, '2026-08-20');
      const b = await buildInformePdf(i, '2026-08-20');
      expect(Buffer.from(a).equals(Buffer.from(b)), i.slug).toBe(true);
      const doc = await PDFDocument.load(a);
      expect(doc.getPageCount(), i.slug).toBeGreaterThan(1);
    }
  }, 30000);

  it('el sitemap publica el índice y cada informe con su fecha real', () => {
    const urls = new Map(sitemap().map((e) => [e.url, e.lastModified]));
    expect(urls.has(`${SITE.url}/informes`)).toBe(true);
    for (const i of informes) {
      const lastMod = urls.get(`${SITE.url}/informes/${i.slug}`);
      expect(lastMod, i.slug).toBeDefined();
      expect(new Date(lastMod as Date).toISOString().slice(0, 10)).toBe(i.fecha);
    }
  });

  it('INFORMES_UPDATED es la fecha del informe más reciente', () => {
    expect(INFORMES_UPDATED).toBe([...informes.map((i) => i.fecha)].sort().reverse()[0]);
  });
});

describe('vigilancia de fuentes: informa, no publica', () => {
  const src = readFileSync(join(process.cwd(), 'scripts/vigilancia-fuentes.mjs'), 'utf8');

  it('no escribe en ningún archivo del sitio', () => {
    // La línea que separa un mecanismo de vigilancia de una granja de
    // contenido: este script no publica nada, nunca.
    expect(src).not.toMatch(/writeFileSync|appendFileSync|createWriteStream/);
  });

  it('clasifica en cuatro estados, no en dos', () => {
    // Corregido dos veces con datos reales. Un 403 es un cortafuegos y un
    // fallo de red es indistinguible de una red local rota: ninguno prueba
    // que la cita murió. Contarlos como fallo llena el reporte de falsos
    // positivos hasta que nadie lo lee, que es cuando el mecanismo deja de
    // existir.
    for (const estado of ['ok', 'caida', 'bloqueado', 'revisar']) {
      expect(src, estado).toMatch(new RegExp(`'${estado}'`));
    }
  });

  it('solo 404 y 410 cuentan como cita rota', () => {
    // Son las dos únicas respuestas en que el servidor AFIRMA que el recurso
    // no existe. Todo lo demás es una conjetura sobre el estado de la cita.
    const fn = src.slice(src.indexOf('function clasificar'), src.indexOf('async function comprobar'));
    expect(fn).toMatch(/estado === 404 \|\| estado === 410\) return 'caida'/);
    expect(fn).not.toMatch(/return 'caida';\s*\n\}/);
  });

  it('un fallo de red no se declara caída', () => {
    // Un DNS que no resuelve y un dominio muerto dan exactamente el mismo
    // error. Se descubrió con una fuente que falló desde una red y cargó
    // desde otra.
    const captura = src.slice(src.indexOf('} catch (e)'), src.indexOf('} finally'));
    expect(captura).toMatch(/clase: 'revisar'/);
    expect(captura).not.toMatch(/clase: 'caida'/);
  });

  it('deduplica por URL antes de comprobar', () => {
    // Dos guías que citan la misma norma no son dos problemas: son uno.
    expect(src).toMatch(/porUrl/);
    expect(src).toMatch(/unicas/);
  });

  it('envía cabecera de navegador', () => {
    // Sin User-Agent, casi cualquier portal con cortafuegos responde 403 y el
    // reporte entero se vuelve ruido.
    expect(src).toMatch(/'User-Agent'/);
  });

  it('solo falla el proceso por caídas reales', () => {
    expect(src).toMatch(/process\.exit\(caidas \? 1 : 0\)/);
  });

  it('está enlazado como npm run vigilancia', () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
    expect(pkg.scripts.vigilancia).toContain('vigilancia-fuentes.mjs');
  });
});
P18_EOF

chmod +x scripts/vigilancia-fuentes.mjs
# -----------------------------------------------------------------------------
echo ""
echo "P18 aplicado."
echo "  modificados lib/informes.ts (cita MIDAGRI partida en dos, ambas vivas)"
echo "              scripts/vigilancia-fuentes.mjs (4 estados + deduplicacion)"
echo "              test/informes.test.ts (5 tests nuevos)"
echo ""
echo "Siguiente paso:"
echo "  npx tsc --noEmit && npx next lint && npm test && npm run build"
echo "  (esperado: 295 tests en 20 archivos, 231 paginas)"
echo ""
echo "Despues del push:"
echo "  npm run verify:deploy      (esperado: 54 correctas, 0 fallos)"
echo "  npm run vigilancia         (esperado: 0 caidas)"
