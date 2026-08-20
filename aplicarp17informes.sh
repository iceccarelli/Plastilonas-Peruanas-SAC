#!/usr/bin/env bash
# =============================================================================
#  P17 — Informes del sector: evidencia con fuente, y un mecanismo que la vigila
#  Plastilonas Peruanas SAC
#
#  UNA ACLARACIÓN QUE VALE MÁS QUE EL CÓDIGO
#  -----------------------------------------
#  Este parche NO trae noticias ni contenido de terceros al sitio, y es
#  deliberado. Un feed automático de contenido ajeno mete en nuestro grafo de
#  entidad afirmaciones que no controlamos, genera contenido duplicado, se
#  rompe en silencio cuando la fuente cambia y convierte una referencia en una
#  granja de contenido. Todo lo construido hasta acá descansa en la propiedad
#  contraria: nada se publica que no se pueda verificar.
#
#  Lo que sí entra es estadística oficial peruana, verificada una por una
#  contra su organismo.
#
#  QUÉ TRAE
#  --------
#  /informes — estudios que parten de cifras oficiales de MINEM, MIDAGRI y
#  SENAMHI y explican qué implica cada indicador para quien especifica.
#
#  El primer informe publica: producción minera 2025 por metal (cobre récord en
#  2 769 794 TMF, zinc +18,6 %, oro −0,7 %), cartera de inversión minera 2025
#  (67 proyectos, US$ 64 071 millones, 19 regiones), agroexportaciones (más de
#  US$ 15 000 millones en 2025 frente a US$ 12 798 millones en 2024) e índice
#  ultravioleta en la sierra sur (8 a 12).
#
#  Y declara en su PRIMERA sección que NO estima el tamaño del mercado de
#  textiles industriales: no existe estadística pública verificable de ese
#  mercado, y publicar una estimación propia con aspecto de dato sería inventar
#  el número más importante del documento. Cada informe lleva una sección "Qué
#  NO afirma" con el mismo peso visual que los hallazgos.
#
#  GRÁFICOS. SVG renderizado en el servidor: cero JavaScript de cliente, visible
#  en el primer pintado, con tabla de datos desplegable para lector de pantalla
#  e impresión. El eje divergente usa AZUL/NARANJA y no el verde de marca con
#  rojo: verde/rojo es el par que la deuteranopia confunde — medido, ΔE 5-6
#  frente al umbral de 8; azul/naranja mide ΔE 25-28. Toda la paleta se validó
#  contra las dos superficies reales del sitio antes de escribirla.
#
#  VIGILANCIA. `npm run vigilancia` comprueba que las fuentes citadas siguen
#  respondiendo y avisa cuáles llevan demasiado sin verificarse. No publica
#  nada: informa para que una persona decida.
#
#  DOS DEFECTOS ENCONTRADOS AL EJECUTAR LO QUE ESCRIBÍ
#  --------------------------------------------------
#  1. La vigilancia contaba los 403 como enlaces muertos. Un 403 es un
#     cortafuegos rechazando a un cliente automatizado, no una cita rota;
#     contarlo como fallo llena el reporte de falsos positivos hasta que nadie
#     lo lee, que es cuando el mecanismo deja de existir. Ahora clasifica en
#     tres estados y solo falla por caídas reales.
#  2. `toLocaleString('es-PE')` devolvía "-0.7" en vez de "−0,7" con datos ICU
#     reducidos: el separador decimal dependía del contenedor que compiló. Se
#     detectó mirando la captura del gráfico. Sustituido por formato explícito.
#
#  Uso:
#    ls aplicar*p17*
#    bash aplicarp17informes.sh
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
cat > "lib/informes.ts" <<'P17_EOF'
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
          fuenteId: 'midagri-agroexport-2025',
        },
        {
          etiqueta: 'Enero–abril 2025',
          valor: '3 740',
          unidad: 'millones de US$',
          periodo: 'Ene–abr 2025',
          variacion: { pct: 23.6, base: 'ene–abr 2024' },
          fuenteId: 'midagri-agroexport-2025',
        },
      ],
      grafico: {
        titulo: 'Principales productos agroexportados, enero–abril de 2025',
        unidad: 'millones de US$',
        tipo: 'magnitud',
        fuenteId: 'midagri-agroexport-2025',
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
    'Las cifras de agroexportación por producto corresponden al primer cuatrimestre de 2025, no al cierre del año. La estacionalidad de cada cultivo cambia el orden según el periodo que se observe.',
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
      organismo: 'Ministerio de Desarrollo Agrario y Riego (MIDAGRI)',
      titulo: 'Agroexportaciones peruanas 2025',
      url: 'https://www.gob.pe/institucion/midagri',
      publicado: '2025-06-20',
      consultado: '2026-08-20',
      respalda:
        'Agroexportaciones 2025 por encima de 15 000 millones de dólares, base 2024 de 12 798 millones, 3 740 millones en enero–abril de 2025 (+23,6 %) y valores por producto del mismo cuatrimestre.',
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
P17_EOF

# -----------------------------------------------------------------------------
# lib/doc-informe.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/doc-informe.ts" <<'P17_EOF'
import type { Informe } from './informes';
import { fuenteDe } from './informes';
import { SITE } from './site';
import {
  bullets, callout, finishDoc, heading, note, paragraph, specTable, startDoc,
  subheading, type Ctx,
} from './pdf-kit';

/**
 * INFORME DEL SECTOR EN PDF.
 *
 * Es el documento que se adjunta a una presentación interna o a un comité de
 * inversión. Por eso el orden importa: resumen ejecutivo primero, límites
 * ANTES de las fuentes y no escondidos al final, y cada cifra con su organismo
 * y su fecha de verificación al lado.
 *
 * El gráfico no se dibuja en el PDF: se vuelca como tabla. Una barra sin ejes
 * legibles en A4 informa menos que la columna de números, y la tabla se puede
 * copiar a una hoja de cálculo, que es lo que hace quien recibe el documento.
 */

export async function buildInformePdf(i: Informe, generatedAt: string): Promise<Uint8Array> {
  const ctx: Ctx = await startDoc({
    title: `Informe - ${i.titulo}`,
    subject: i.metaDescription,
    keywords: ['informe', 'sector', 'minería', 'agroexportación', 'Perú', 'geosintéticos'],
    h1: i.titulo,
    kicker: `Informe v${i.version}  |  ${i.fecha}  |  ${i.fuentes.length} fuentes oficiales`,
  });

  paragraph(ctx, i.subtitulo, 10.5);

  callout(
    ctx,
    'Cómo leer este informe',
    'Toda cifra lleva el organismo que la publica y la fecha en que la verificamos. Lo marcado como lectura de Plastilonas Peruanas es interpretación técnica nuestra, no dato del organismo. Este informe NO estima el tamaño del mercado de textiles industriales: no existe estadística pública verificable de ese mercado.',
  );

  heading(ctx, 'Resumen ejecutivo');
  bullets(ctx, i.resumenEjecutivo);

  for (const s of i.secciones) {
    heading(ctx, s.heading);
    if (s.cuerpo) for (const p of s.cuerpo) paragraph(ctx, p);

    if (s.indicadores?.length) {
      subheading(ctx, 'Indicadores');
      specTable(
        ctx,
        s.indicadores.map((ind) => {
          const f = fuenteDe(i, ind.fuenteId);
          const variacion = ind.variacion
            ? `  (${ind.variacion.pct > 0 ? '+' : ''}${ind.variacion.pct} % vs ${ind.variacion.base})`
            : '';
          return {
            label: ind.etiqueta,
            value: `${ind.valor}${ind.unidad ? ` ${ind.unidad}` : ''}${variacion}  —  ${ind.periodo}. Fuente: ${f?.organismo ?? 'no declarada'}`,
          };
        }),
      );
    }

    if (s.grafico) {
      // Tabla y no barra: en A4 la columna de números informa más, y se puede
      // copiar a una hoja de cálculo, que es lo que hace quien recibe esto.
      subheading(ctx, s.grafico.titulo);
      note(ctx, `${s.grafico.unidad}. Fuente: ${fuenteDe(i, s.grafico.fuenteId)?.organismo ?? ''}`);
      ctx.y -= 4;
      specTable(
        ctx,
        s.grafico.datos.map((d) => ({
          label: d.etiqueta,
          value: `${d.valor > 0 && s.grafico!.tipo === 'divergente' ? '+' : ''}${d.valor}`,
        })),
      );
      note(ctx, s.grafico.nota);
    }

    if (s.implicacion) {
      callout(ctx, `Lo que implica · lectura de ${SITE.name}`, s.implicacion);
    }
  }

  heading(ctx, 'Qué NO afirma este informe');
  note(ctx, 'Un estudio que no declara sus límites es publicidad con formato de estudio.');
  ctx.y -= 4;
  bullets(ctx, i.limitaciones);

  heading(ctx, 'Fuentes');
  specTable(
    ctx,
    i.fuentes.map((f) => ({
      label: f.organismo,
      value: `${f.titulo}. ${f.respalda}  —  Publicado ${f.publicado}, verificado el ${f.consultado}. ${f.url}`,
    })),
  );

  heading(ctx, 'Cómo aplicarlo a un proyecto');
  paragraph(
    ctx,
    `Si quiere que llevemos estos criterios a un caso concreto, envíe emplazamiento, aplicación, dimensiones y plazo por WhatsApp al ${SITE.phoneWhatsApp}, en ${SITE.url}/cotizacion o a ${SITE.email}.`,
  );
  note(
    ctx,
    `Marco de Especificación: ${SITE.url}/marco  ·  Glosario técnico: ${SITE.url}/glosario  ·  Versión en línea de este informe, con gráficos: ${SITE.url}/informes/${i.slug}`,
  );

  return finishDoc(ctx, `${SITE.url}/informes/${i.slug}`, generatedAt);
}
P17_EOF

# -----------------------------------------------------------------------------
# components/BarChart.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/BarChart.tsx" <<'P17_EOF'
import type { Grafico } from '@/lib/informes';
import { numeroPE, numeroConSigno } from '@/lib/format';

/**
 * Gráfico de barras en SVG, renderizado en el servidor.
 *
 * Por qué SVG en servidor y no una librería de gráficos. Tres razones que se
 * refuerzan: no añade un solo kilobyte de JavaScript a la página, se ve en el
 * primer pintado (un gráfico que aparece medio segundo después es un salto de
 * maquetación), y funciona con JavaScript desactivado y en el modo lector.
 *
 * DECISIONES DE COLOR, tomadas con el validador y no a ojo:
 *
 *  - Serie única (magnitud): UN solo color. La longitud de la barra ya codifica
 *    la magnitud; pintar cada barra de un color distinto sugiere que el color
 *    significa algo y no significa nada.
 *
 *  - Divergente (crecimiento y contracción): azul y naranja, NO verde y rojo.
 *    Verde/rojo es el par que la deuteranopia confunde: medido, se queda en
 *    ΔE 5–6 (el umbral es 8). Azul/naranja mide ΔE 25–28 en las tres formas de
 *    daltonismo. Además cada barra lleva su valor con signo, de modo que la
 *    identidad nunca depende solo del color.
 *
 *  - Los valores van en tinta de texto, nunca en el color de la serie: el color
 *    lo lleva la barra, que es quien porta la identidad.
 *
 * ACCESIBILIDAD: cada gráfico incluye su tabla de datos desplegable. Un
 * lorikeet de pantalla, una impresión en blanco y negro y el modo de alto
 * contraste leen la tabla; el SVG es la versión visual del mismo dato.
 */

const ALTO_BARRA = 30;
const SEPARACION = 12;
const ANCHO = 720;

export default function BarChart({ grafico }: { grafico: Grafico }) {
  const { datos, tipo } = grafico;
  const divergente = tipo === 'divergente';

  const maxAbs = Math.max(...datos.map((d) => Math.abs(d.valor)));
  const alto = datos.length * (ALTO_BARRA + SEPARACION);

  // Ancho reservado a la etiqueta de categoría y al valor. En divergente el
  // eje cero vive a la izquierda del área de trazado, no en el centro: con una
  // sola barra negativa, centrar el cero desperdicia la mitad del ancho.
  const ANCHO_ETIQUETA = 130;
  const ANCHO_VALOR = 74;
  const areaTrazado = ANCHO - ANCHO_ETIQUETA - ANCHO_VALOR;
  const negativos = datos.some((d) => d.valor < 0);
  const anchoNegativo = divergente && negativos ? areaTrazado * 0.16 : 0;
  const x0 = ANCHO_ETIQUETA + anchoNegativo;
  const escala = (areaTrazado - anchoNegativo) / maxAbs;

  return (
    <figure className="viz-root my-8">
      <figcaption className="mb-1 font-semibold tracking-tight text-[#0A2540]">
        {grafico.titulo}
      </figcaption>
      <p className="mb-4 text-sm text-gray-500">{grafico.unidad}</p>

      <svg
        viewBox={`0 0 ${ANCHO} ${alto}`}
        width="100%"
        role="img"
        aria-label={`${grafico.titulo}. ${grafico.unidad}. Los valores están en la tabla de datos que acompaña al gráfico.`}
        className="max-w-full"
      >
        {/* Línea base. En divergente marca el cero; en magnitud, el origen. */}
        <line
          x1={x0}
          y1={0}
          x2={x0}
          y2={alto - SEPARACION / 2}
          className="viz-eje"
          strokeWidth={1}
        />
        {datos.map((d, i) => {
          const y = i * (ALTO_BARRA + SEPARACION);
          const largo = Math.abs(d.valor) * escala;
          const negativo = d.valor < 0;
          const x = negativo ? x0 - largo : x0;
          // Formato explícito y no toLocaleString: el separador decimal no
          // puede depender de los datos ICU del contenedor que compiló.
          const texto = divergente ? numeroConSigno(d.valor) : numeroPE(d.valor);
          return (
            <g key={d.etiqueta}>
              <text
                x={ANCHO_ETIQUETA - 12}
                y={y + ALTO_BARRA / 2}
                textAnchor="end"
                dominantBaseline="central"
                className="viz-etiqueta"
                fontSize={13}
              >
                {d.etiqueta}
              </text>
              <rect
                x={x}
                y={y}
                width={Math.max(largo, 2)}
                height={ALTO_BARRA}
                rx={4}
                className={
                  divergente
                    ? negativo
                      ? 'viz-barra-neg'
                      : 'viz-barra-pos'
                    : 'viz-barra'
                }
              />
              {/* Etiqueta directa: la identidad del valor nunca depende del color. */}
              <text
                x={negativo ? x - 8 : x + largo + 8}
                y={y + ALTO_BARRA / 2}
                textAnchor={negativo ? 'end' : 'start'}
                dominantBaseline="central"
                className="viz-valor"
                fontSize={13}
              >
                {texto}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="mt-3 text-sm text-gray-500">{grafico.nota}</p>

      {/* La misma información en tabla: lector de pantalla, impresión en blanco
          y negro, alto contraste y quien simplemente prefiere el número. */}
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-[#059669] hover:underline">
          Ver los datos en tabla
        </summary>
        <table className="mt-3 w-full border-collapse text-sm">
          <caption className="sr-only">{grafico.titulo}</caption>
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th scope="col" className="py-2 pr-4 font-semibold text-[#0A2540]">
                Concepto
              </th>
              <th scope="col" className="py-2 font-semibold text-[#0A2540]">
                {grafico.unidad}
              </th>
            </tr>
          </thead>
          <tbody>
            {datos.map((d) => (
              <tr key={d.etiqueta} className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-700">{d.etiqueta}</td>
                <td className="py-2 font-mono text-gray-700">
                  {grafico.tipo === 'divergente' ? numeroConSigno(d.valor) : numeroPE(d.valor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
P17_EOF

# -----------------------------------------------------------------------------
# app/informes/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/informes"
cat > "app/informes/page.tsx" <<'P17_EOF'
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { informes } from '@/lib/informes';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';

/**
 * Índice de informes del sector.
 *
 * La página declara arriba lo que NO hace: no estima el tamaño del mercado de
 * textiles industriales. Decirlo en la portada del silo, y no escondido en una
 * nota al pie, es lo que distingue un estudio de un folleto con gráficos.
 */

const URL = `${SITE.url}/informes`;
const TITLE = 'Informes del sector: los datos oficiales y qué implican técnicamente';
const DESCRIPTION = `Estudios de ${SITE.name} sobre los indicadores que mueven la demanda de textiles industriales y geosintéticos en el Perú. Cada cifra con su fuente oficial, su fecha de consulta y lo que el informe NO afirma.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/informes' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function InformesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <TrackView kind="informe" slug="indice" />
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            type: 'CollectionPage',
            speakable: ['.speakable-intro'],
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Informes', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          itemListSchema({
            url: URL,
            name: 'Informes del sector',
            description: DESCRIPTION,
            items: informes.map((i) => ({
              name: i.titulo,
              url: `${SITE.url}/informes/${i.slug}`,
            })),
          }),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        / <span className="text-gray-700">Informes</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Informes del sector
      </h1>

      <p className="speakable-intro mb-6 max-w-3xl text-lg text-gray-700">
        Qué dicen los indicadores oficiales de los sectores que compran textiles
        industriales y geosintéticos en el Perú, y qué implica cada dato para quien
        tiene que redactar una especificación.
      </p>

      {/* Lo que NO hacemos, en la portada del silo y no en una nota al pie. */}
      <div className="mb-12 rounded-3xl border-l-4 border-[#059669] bg-gray-50 p-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Cómo se escriben estos informes
        </h2>
        <p className="mb-3 text-gray-800">
          Toda cifra lleva su fuente oficial, con organismo, enlace, fecha de
          publicación y fecha en que la verificamos. Lo que es lectura nuestra va
          separado y marcado como tal: el dato es del organismo, la consecuencia
          técnica es nuestra.
        </p>
        <p className="text-gray-800">
          <strong>No estimamos el tamaño de nuestro propio mercado.</strong> No existe
          una estadística pública verificable del mercado peruano de textiles
          industriales y geosintéticos, y una estimación propia presentada como dato
          sería inventar el número más importante del documento. Cada informe declara
          además, explícitamente, qué no afirma.
        </p>
      </div>

      <ul className="mb-16 space-y-5">
        {informes.map((i) => (
          <li key={i.slug}>
            <Link
              href={`/informes/${i.slug}`}
              className="group block rounded-3xl border border-gray-100 p-7 transition-colors hover:border-[#059669]/40"
            >
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <BarChart3 className="h-4 w-4 text-[#059669]" aria-hidden="true" />
                <time dateTime={i.fecha} className="font-mono text-sm text-gray-500">
                  {i.fecha}
                </time>
                <span className="font-mono text-xs text-gray-500">
                  v{i.version} · {i.fuentes.length} fuentes oficiales
                </span>
              </div>
              <span className="mb-2 block text-2xl font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                {i.titulo}
              </span>
              <span className="mb-4 block text-gray-600">{i.subtitulo}</span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[#059669]">
                Leer el informe <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Qué indicador le falta para decidir?
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Estos informes crecen con las preguntas que llegan de operación. Si necesita
          un dato del sector que no está acá y es verificable, dígalo y lo buscamos con
          su fuente.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Escribirnos
          </Link>
          <Link
            href="/marco"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Marco de Especificación <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
P17_EOF

# -----------------------------------------------------------------------------
# app/informes/[slug]/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/informes/[slug]"
cat > "app/informes/[slug]/page.tsx" <<'P17_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { informes, informeBySlug, fuenteDe } from '@/lib/informes';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import BarChart from '@/components/BarChart';
import { numeroConSigno } from '@/lib/format';
import { articleSchema, breadcrumbSchema, datasetSchema, webPageSchema } from '@/lib/schema';

/**
 * Página de informe.
 *
 * Tres separaciones visuales que son decisiones editoriales, no estéticas:
 *
 *  1. El indicador muestra SIEMPRE su periodo y su organismo junto al número.
 *     Una cifra sin periodo no es una cifra, es una impresión.
 *  2. La lectura técnica va en un bloque etiquetado "Lo que implica", separado
 *     del dato. El lector tiene derecho a distinguir lo que dice MINEM de lo
 *     que decimos nosotros.
 *  3. Las limitaciones tienen su propia sección, con el mismo peso visual que
 *     los hallazgos. Un estudio que esconde sus límites es publicidad.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return informes.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const i = informeBySlug(slug);
  if (!i) return {};
  const url = `${SITE.url}/informes/${slug}`;
  return {
    title: i.metaTitle,
    description: i.metaDescription,
    alternates: { canonical: `/informes/${slug}` },
    openGraph: {
      title: `${i.titulo} | ${SITE.name}`,
      description: i.metaDescription,
      url,
      locale: SITE.locale,
      type: 'article',
      publishedTime: i.fecha,
    },
  };
}

export default async function InformePage({ params }: Props) {
  const { slug } = await params;
  const i = informeBySlug(slug);
  if (!i) notFound();

  const url = `${SITE.url}/informes/${slug}`;

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <TrackView kind="informe" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: i.titulo,
            description: i.metaDescription,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          articleSchema({
            url,
            headline: i.titulo,
            description: i.metaDescription,
            datePublished: i.fecha,
            dateModified: i.fecha,
            section: 'Informes del sector',
            articleType: 'Article',
            citations: i.fuentes.map((f) => ({
              label: `${f.organismo} — ${f.titulo}`,
              url: f.url,
            })),
          }),
          // Dataset: declara que el informe publica datos con procedencia, no
          // solo prosa. Es lo que permite a un agente citar la cifra y su fuente.
          datasetSchema({
            url,
            name: i.titulo,
            description: i.metaDescription,
            fecha: i.fecha,
            version: i.version,
            fuentes: i.fuentes.map((f) => ({
              nombre: `${f.organismo} — ${f.titulo}`,
              url: f.url,
            })),
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Informes', url: `${SITE.url}/informes` },
              { name: i.titulo, url },
            ],
            `${url}#breadcrumb`,
          ),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        /{' '}
        <Link href="/informes" className="hover:text-[#059669]">
          Informes
        </Link>{' '}
        / <span className="text-gray-700">{i.fecha}</span>
      </nav>

      <p className="mb-3 font-mono text-sm text-gray-500">
        Informe v{i.version} · {i.fecha} · {i.fuentes.length} fuentes oficiales
      </p>

      <h1 className="mb-4 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        {i.titulo}
      </h1>

      <p className="mb-8 text-lg text-gray-700">{i.subtitulo}</p>

      <a
        href={`/informes/${slug}/informe.pdf`}
        className="mb-12 inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
      >
        Descargar el informe completo en PDF
      </a>

      {/* Resumen ejecutivo: frases autosuficientes. Es lo que se cita. */}
      <section className="speakable-intro mb-14 rounded-3xl border border-gray-100 p-7">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Resumen ejecutivo
        </h2>
        <ul className="space-y-3">
          {i.resumenEjecutivo.map((r) => (
            <li key={r} className="border-l-4 border-[#059669]/30 pl-5 text-gray-800">
              {r}
            </li>
          ))}
        </ul>
      </section>

      {i.secciones.map((s) => (
        <section key={s.heading} className="mb-14">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            {s.heading}
          </h2>

          {s.cuerpo?.map((p) => (
            <p key={p} className="mb-4 text-gray-700">
              {p}
            </p>
          ))}

          {s.indicadores && (
            <dl className="my-8 grid gap-4 sm:grid-cols-2">
              {s.indicadores.map((ind) => {
                const f = fuenteDe(i, ind.fuenteId);
                return (
                  <div
                    key={`${ind.etiqueta}-${ind.periodo}`}
                    className="rounded-2xl border border-gray-100 p-5"
                  >
                    <dt className="mb-2 text-sm text-gray-600">{ind.etiqueta}</dt>
                    <dd>
                      <span className="block font-mono text-3xl font-semibold tracking-tight text-[#0A2540]">
                        {ind.valor}
                      </span>
                      {ind.unidad && (
                        <span className="mt-1 block text-sm text-gray-500">{ind.unidad}</span>
                      )}
                      {ind.variacion && (
                        <span className="mt-2 block text-sm text-gray-700">
                          {numeroConSigno(ind.variacion.pct)} % frente a{' '}
                          {ind.variacion.base}
                        </span>
                      )}
                      {/* Periodo y organismo junto al número, siempre: una cifra
                          sin periodo no es una cifra, es una impresión. */}
                      <span className="mt-3 block border-t border-gray-100 pt-2 text-xs text-gray-500">
                        {ind.periodo} · {f?.organismo ?? 'fuente no declarada'}
                      </span>
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}

          {s.grafico && <BarChart grafico={s.grafico} />}

          {s.implicacion && (
            <div className="mt-8 rounded-3xl bg-gray-50 p-6">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#059669]">
                Lo que implica · lectura de {SITE.name}
              </h3>
              <p className="text-gray-800">{s.implicacion}</p>
            </div>
          )}
        </section>
      ))}

      {/* Mismo peso visual que los hallazgos. Deliberado. */}
      <section className="mb-14 border-t pt-10">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Qué NO afirma este informe
        </h2>
        <p className="mb-5 text-gray-600">
          Un estudio que no declara sus límites es publicidad con formato de estudio.
        </p>
        <ul className="space-y-4">
          {i.limitaciones.map((l) => (
            <li key={l} className="border-l-4 border-gray-300 pl-5 text-gray-700">
              {l}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-14 border-t pt-10">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">Fuentes</h2>
        <p className="mb-6 text-gray-600">
          Cada fuente indica qué dato concreto respalda y cuándo lo verificamos. Los
          organismos revisan sus series: antes de usar una cifra en un expediente,
          confírmela contra la publicación vigente.
        </p>
        <ol className="space-y-6">
          {i.fuentes.map((f) => (
            <li key={f.id}>
              <p className="font-semibold text-[#0A2540]">{f.organismo}</p>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-[#059669] hover:underline"
              >
                {f.titulo} <ExternalLink className="h-3 w-3" />
              </a>
              <p className="mt-1 text-sm text-gray-700">{f.respalda}</p>
              <p className="mt-1 font-mono text-xs text-gray-500">
                Publicado {f.publicado} · verificado por nosotros el {f.consultado}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Aplicamos esto a su operación?
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Envíenos el emplazamiento, la aplicación y el plazo, y le devolvemos la
          especificación técnica junto con la cotización.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/marco"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Marco de Especificación <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
P17_EOF

# -----------------------------------------------------------------------------
# app/informes/[slug]/informe.pdf/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/informes/[slug]/informe.pdf"
cat > "app/informes/[slug]/informe.pdf/route.ts" <<'P17_EOF'
import { informes } from '@/lib/informes';
import { buildInformePdf } from '@/lib/doc-informe';
import { SITE } from '@/lib/site';

/**
 * Informe del sector en PDF: /informes/{slug}/informe.pdf
 *
 * El formato en que un informe llega a un comité: adjunto, no enlace.
 */

export const dynamic = 'force-static';

export function generateStaticParams() {
  return informes.map((i) => ({ slug: i.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const informe = informes.find((i) => i.slug === slug);
  if (!informe) return new Response('Not found', { status: 404 });

  const generatedAt = new Date().toISOString().slice(0, 10);
  const pdf = await buildInformePdf(informe, generatedAt);
  const url = `${SITE.url}/informes/${informe.slug}`;

  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="informe-${informe.slug}.pdf"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      Link: `<${url}>; rel="canonical"`,
    },
  });
}
P17_EOF

# -----------------------------------------------------------------------------
# scripts/vigilancia-fuentes.mjs
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/vigilancia-fuentes.mjs" <<'P17_EOF'
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
 * Sale con código 1 SOLO si alguna fuente devolvió 404, 410, error de servidor
 * o fallo de red. Un 403 o un 429 no son fallo: son un cortafuegos rechazando a
 * un cliente automatizado, y contarlos como caídas llenaría el reporte de
 * falsos positivos hasta que nadie lo lea. Apto para una tarea programada.
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
 * Clasificación en TRES estados y no en dos. Es la decisión que decide si este
 * script sirve para algo.
 *
 * Un 403 o un 429 no significan "el enlace murió": significan que un
 * cortafuegos, un proxy corporativo o un límite de tasa rechazaron a un
 * cliente automatizado. La página puede estar perfectamente viva en un
 * navegador. Contarlos como fallo llena el reporte de falsos positivos, y un
 * reporte que grita cuando no pasa nada se deja de leer a la tercera vez —
 * momento en el que el mecanismo dejó de existir.
 *
 * Solo 404, 410, los errores del servidor y los fallos de red son fallos
 * reales: ahí la cita efectivamente dejó de respaldar nada.
 */
function clasificar(estado) {
  if (estado >= 200 && estado < 400) return 'ok';
  if (estado === 403 || estado === 401 || estado === 429) return 'bloqueado';
  return 'caida';
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
    return { ...fuente, estado: 0, clase: 'caida', error: String(e?.message ?? e) };
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

if (fuentes.length === 0) {
  console.error('No se encontró ninguna fuente. ¿Se ejecuta desde la raíz del repositorio?');
  process.exit(1);
}

console.log(`\nVigilancia de fuentes — ${fuentes.length} citas declaradas\n`);

const resultados = [];
for (const f of fuentes) resultados.push(await comprobar(f));

let caidas = 0;
let bloqueadas = 0;
let vencidas = 0;

const MARCA = { ok: verde('✓'), bloqueado: ambar('~'), caida: rojo('✗') };

for (const r of resultados) {
  const dias = r.consultado ? diasDesde(r.consultado) : null;
  const antigua = dias !== null && dias > MAX_DIAS;
  if (r.clase === 'caida') caidas++;
  if (r.clase === 'bloqueado') bloqueadas++;
  if (antigua) vencidas++;

  const edad =
    dias === null
      ? ''
      : antigua
        ? ambar(` · verificada hace ${dias} días`)
        : ` · verificada hace ${dias} días`;
  console.log(`  ${MARCA[r.clase]} [${r.origen}] ${r.organismo} — ${r.estado || r.error}${edad}`);
  console.log(`      ${r.url}`);
}

console.log('');
if (caidas) {
  console.log(rojo(`${caidas} fuente(s) no responden.`));
  console.log('  Una cita con enlace roto es una cita que ya no respalda nada.');
  console.log('  Busque la publicación vigente del organismo y actualice la URL.');
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
if (!caidas && !bloqueadas && !vencidas) {
  console.log(verde('Todas las fuentes responden y están dentro del plazo de verificación.'));
}

console.log('');
console.log('Este script NO publica nada. Solo informa para que una persona decida.');

process.exit(caidas ? 1 : 0);
P17_EOF

# -----------------------------------------------------------------------------
# test/informes.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/informes.test.ts" <<'P17_EOF'
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

  it('distingue caída real de bloqueo por cortafuegos', () => {
    // Un 403 no es un enlace muerto: es un WAF rechazando a un cliente
    // automatizado. Contarlo como fallo llena el reporte de falsos positivos
    // hasta que nadie lo lee, que es cuando el mecanismo deja de existir.
    expect(src).toMatch(/bloqueado/);
    expect(src).toMatch(/403/);
    expect(src).toMatch(/clasificar/);
  });

  it('solo falla el proceso por caídas reales', () => {
    expect(src).toMatch(/process\.exit\(caidas \? 1 : 0\)/);
  });

  it('está enlazado como npm run vigilancia', () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
    expect(pkg.scripts.vigilancia).toContain('vigilancia-fuentes.mjs');
  });
});
P17_EOF

# -----------------------------------------------------------------------------
# lib/format.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/format.ts" <<'P17_EOF'
/** Utilidades de formato monetario (PEN) y conversión a céntimos. */

export const IGV_RATE = 0.18; // IGV Perú 18%

const penFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

/** Formatea un monto en soles (número) a "S/ 1,234.00". */
export function formatPEN(amount: number): string {
  return penFormatter.format(amount);
}

/** Formatea un monto en céntimos a texto en soles. */
export function formatCents(cents: number): string {
  return penFormatter.format(cents / 100);
}

/** Convierte soles a céntimos enteros (evita errores de coma flotante). */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/** Desglosa un subtotal (en céntimos) en IGV y total. */
export function withIgv(subtotalCents: number): {
  subtotalCents: number;
  igvCents: number;
  totalCents: number;
} {
  const igvCents = Math.round(subtotalCents * IGV_RATE);
  return {
    subtotalCents,
    igvCents,
    totalCents: subtotalCents + igvCents,
  };
}

/**
 * Formato numérico peruano SIN depender de Intl en tiempo de ejecución.
 *
 * Por qué no `toLocaleString('es-PE')`. Depende de los datos ICU que traiga el
 * Node que ejecute el build. En un entorno con ICU reducido devuelve
 * silenciosamente el formato inglés: el mismo código produjo "-0.7" en un
 * contenedor y "−0,7" en otro. Se detectó mirando la captura de un gráfico, no
 * leyendo el código.
 *
 * En un sitio que publica cifras con fuente, que el separador decimal dependa
 * del contenedor que compiló es inaceptable: la coma y el punto significan
 * cosas distintas, y "1.200" se lee como mil doscientos o como uno coma dos
 * según de dónde sea el lector.
 *
 * Se usa además el signo menos tipográfico (U+2212) y no el guion: es lo
 * correcto en una cifra y se alinea con los dígitos.
 */
export function numeroPE(valor: number, decimales?: number): string {
  const negativo = valor < 0;
  const abs = Math.abs(valor);
  const dec = decimales ?? (Number.isInteger(abs) ? 0 : 1);
  const [entero, fraccion] = abs.toFixed(dec).split('.');
  // Separador de millares: espacio fino, recomendado por el SI y sin la
  // ambigüedad del punto frente a la coma decimal.
  const conMillares = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const cuerpo = fraccion ? `${conMillares},${fraccion}` : conMillares;
  return negativo ? `−${cuerpo}` : cuerpo;
}

/** Igual que numeroPE pero anteponiendo el signo cuando el valor es positivo. */
export function numeroConSigno(valor: number, decimales?: number): string {
  const base = numeroPE(valor, decimales);
  return valor > 0 ? `+${base}` : base;
}
P17_EOF

# -----------------------------------------------------------------------------
# test/format.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/format.test.ts" <<'P17_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  IGV_RATE, formatPEN, formatCents, toCents, withIgv, numeroPE, numeroConSigno,
} from '@/lib/format';

describe('format: IGV y conversión de céntimos', () => {
  it('el IGV del Perú es 18%', () => {
    expect(IGV_RATE).toBe(0.18);
  });

  it('toCents convierte soles a céntimos enteros sin errores de coma flotante', () => {
    expect(toCents(45)).toBe(4500);
    expect(toCents(8.5)).toBe(850);
    expect(toCents(25)).toBe(2500);
    expect(toCents(0.1 + 0.2)).toBe(30); // 0.30000000000000004 -> 30
  });

  it('withIgv desglosa subtotal en IGV(18%) y total', () => {
    expect(withIgv(10000)).toEqual({
      subtotalCents: 10000,
      igvCents: 1800,
      totalCents: 11800,
    });
  });

  it('withIgv redondea el IGV al céntimo', () => {
    // 4500 * 0.18 = 810 exacto
    expect(withIgv(4500).igvCents).toBe(810);
    // 850 * 0.18 = 153 exacto
    expect(withIgv(850).igvCents).toBe(153);
  });

  it('formatPEN produce moneda peruana', () => {
    const s = formatPEN(45);
    expect(s).toContain('45.00');
    expect(s).toMatch(/S\/|PEN/); // símbolo local del Perú
  });

  it('formatCents formatea desde céntimos', () => {
    expect(formatCents(11800)).toContain('118.00');
  });
});

describe('formato numérico peruano sin depender de Intl', () => {
  it('usa coma decimal y espacio fino inquebrantable de millares', () => {
    // U+202F y no un espacio normal: un espacio corriente permite que
    // "2 769 794" se parta al final de una línea y se lea como dos cifras.
    expect(numeroPE(2769794)).toBe('2\u202f769\u202f794');
    expect(numeroPE(18.6)).toBe('18,6');
    expect(numeroPE(64071)).toBe('64\u202f071');
  });

  it('usa el signo menos tipográfico, no el guion', () => {
    // U+2212. Es lo correcto en una cifra y se alinea con los dígitos.
    expect(numeroPE(-0.7)).toBe('\u22120,7');
    expect(numeroPE(-0.7).startsWith('-')).toBe(false);
  });

  it('numeroConSigno antepone + solo a los positivos', () => {
    expect(numeroConSigno(18.6)).toBe('+18,6');
    expect(numeroConSigno(-0.7)).toBe('\u22120,7');
    expect(numeroConSigno(0)).toBe('0');
  });

  it('no delega en toLocaleString', () => {
    // El fallo que motivó esta función: con datos ICU reducidos,
    // toLocaleString('es-PE') devuelve en silencio el formato inglés y el
    // mismo código produce "-0.7" en un contenedor y "−0,7" en otro.
    const src = readFileSync(join(process.cwd(), 'lib/format.ts'), 'utf8');
    const impl = src.slice(src.indexOf('export function numeroPE'));
    expect(impl).not.toMatch(/toLocaleString/);
  });
});
P17_EOF

# -----------------------------------------------------------------------------
# lib/schema.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/schema.ts" <<'P17_EOF'
/**
 * Constructores de JSON-LD. Solo se emiten campos respaldados por datos reales.
 * Nunca Review/AggregateRating sin reseñas genuinas almacenadas, nunca
 * certificaciones ni premios no verificables.
 *
 * GRAFO DE ENTIDAD — regla crítica:
 * El sitio emite UN solo nodo por entidad, identificado por @id estable, y todo
 * lo demás lo referencia. Dos nodos LocalBusiness con @id distintos describiendo
 * la misma empresa fragmentan la entidad y desperdician las señales.
 *
 *   ${SITE.url}/#organization  → Organization  (components/StructuredData.tsx)
 *   ${SITE.url}/#business      → LocalBusiness (components/StructuredData.tsx)
 *   ${SITE.url}/#website       → WebSite       (components/StructuredData.tsx)
 *
 * Las páginas internas NO redeclaran esos nodos: los referencian con
 * businessRef() / organizationRef() / websiteRef().
 */
import { SITE } from "./site";

type Dict = Record<string, unknown>;

export const ORGANIZATION_ID = `${SITE.url}/#organization`;
export const BUSINESS_ID = `${SITE.url}/#business`;
export const WEBSITE_ID = `${SITE.url}/#website`;

/** Referencia al nodo Organization global (no lo redeclara). */
export function organizationRef(): Dict {
  return { "@id": ORGANIZATION_ID };
}

/** Referencia al nodo LocalBusiness global (no lo redeclara). */
export function businessRef(): Dict {
  return { "@id": BUSINESS_ID };
}

/** Referencia al nodo WebSite global (no lo redeclara). */
export function websiteRef(): Dict {
  return { "@id": WEBSITE_ID };
}

/**
 * Nodo WebPage de la página actual, anclado al WebSite. Sustituye al antiguo
 * speakableSchema() suelto, que emitía un WebPage huérfano sin @id ni url —
 * un nodo sin identidad no se conecta al grafo y no aporta señal.
 */
export function webPageSchema(page: {
  url: string;
  name: string;
  description?: string;
  /** Selectores CSS del contenido apto para asistentes de voz. */
  speakable?: string[];
  /** Breadcrumb de la página, si aplica. */
  breadcrumbId?: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage" | "ItemPage";
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": page.type ?? "WebPage",
    "@id": `${page.url}#webpage`,
    url: page.url,
    name: page.name,
    ...(page.description ? { description: page.description } : {}),
    isPartOf: websiteRef(),
    about: businessRef(),
    inLanguage: SITE.language,
    ...(page.breadcrumbId ? { breadcrumb: { "@id": page.breadcrumbId } } : {}),
    ...(page.speakable
      ? {
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: page.speakable,
          },
        }
      : {}),
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[],
  id?: string,
): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    ...(id ? { "@id": id } : {}),
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function faqSchema(qas: { q: string; a: string }[], url?: string): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(url ? { "@id": `${url}#faq` } : {}),
    ...(url ? { url } : {}),
    inLanguage: SITE.language,
    mainEntity: qas.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a },
    })),
  };
}

/**
 * Servicio prestado en una ciudad concreta. Es la señal local correcta: en vez
 * de clonar el LocalBusiness (que vive en Chorrillos) en cada página de ciudad,
 * se declara el servicio con areaServed = la ciudad y provider = la empresa.
 */
export function serviceSchema(s: {
  name: string;
  description: string;
  url: string;
  cityName: string;
  regionName: string;
  serviceTypes?: string[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${s.url}#service`,
    name: s.name,
    description: s.description,
    url: s.url,
    provider: businessRef(),
    areaServed: {
      "@type": "City",
      name: s.cityName,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: s.regionName,
        containedInPlace: { "@type": "Country", name: "Perú" },
      },
    },
    ...(s.serviceTypes?.length ? { serviceType: s.serviceTypes } : {}),
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE.url}/cotizacion`,
      servicePhone: {
        "@type": "ContactPoint",
        telephone: SITE.phoneWhatsApp,
        contactType: "sales",
      },
    },
  };
}

/** Lista ordenada de URLs internas (catálogo, cobertura local, artículos). */
export function itemListSchema(list: {
  url: string;
  name: string;
  description?: string;
  items: { name: string; url: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${list.url}#itemlist`,
    name: list.name,
    ...(list.description ? { description: list.description } : {}),
    numberOfItems: list.items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: list.items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

/**
 * Artículo técnico del silo /recursos. Se ancla al WebPage de su propia URL y
 * declara autoría organizacional: la autoridad la sostiene la empresa, no una
 * firma personal inventada.
 */
export function articleSchema(a: {
  url: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  section: string;
  keywords?: string[];
  wordCount?: number;
  /** Fuentes externas que respaldan las cifras del artículo. */
  citations?: { label: string; url: string }[];
  /**
   * TechArticle es lo correcto para una guía de especificación. Un anuncio
   * fechado del registro de novedades NO es documentación técnica: declararlo
   * TechArticle degrada la señal de todo el silo /recursos.
   */
  articleType?: "TechArticle" | "Article";
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": a.articleType ?? "TechArticle",
    "@id": `${a.url}#article`,
    headline: a.headline,
    description: a.description,
    url: a.url,
    mainEntityOfPage: { "@id": `${a.url}#webpage` },
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    articleSection: a.section,
    inLanguage: SITE.language,
    author: organizationRef(),
    publisher: organizationRef(),
    ...(a.keywords?.length ? { keywords: a.keywords.join(", ") } : {}),
    ...(a.wordCount ? { wordCount: a.wordCount } : {}),
    ...(a.citations?.length
      ? {
          citation: a.citations.map((c) => ({
            "@type": "CreativeWork",
            name: c.label,
            url: c.url,
          })),
        }
      : {}),
  };
}

/** Procedimiento paso a paso. Solo para secuencias reales y verificables. */
export function howToSchema(h: {
  url: string;
  name: string;
  description: string;
  totalTime?: string;
  steps: { name: string; text: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${h.url}#howto`,
    name: h.name,
    description: h.description,
    inLanguage: SITE.language,
    ...(h.totalTime ? { totalTime: h.totalTime } : {}),
    step: h.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${h.url}#paso-${i + 1}`,
    })),
  };
}

/**
 * @deprecated Redeclaraba un LocalBusiness con @id propio, fragmentando la
 * entidad frente al nodo global de components/StructuredData.tsx. Usa
 * businessRef() dentro de about/provider, o webPageSchema() para la página.
 * Se mantiene devolviendo solo la referencia para no romper importaciones.
 */
export function localBusinessSchema(): Dict {
  return businessRef();
}

/** @deprecated Usa webPageSchema({ speakable }) — un WebPage suelto es huérfano. */
export function speakableSchema(cssSelectors: string[]): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: SITE.language,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
  };
}

export function organizationSchema(): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    email: SITE.email,
    foundingDate: SITE.foundingYear,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "RUC",
      value: SITE.ruc,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.addressStreet,
      addressLocality: SITE.addressLocality,
      addressRegion: SITE.addressRegion,
      addressCountry: SITE.addressCountry,
    },
    ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  };
}

export function productSchema(p: {
  name: string;
  description: string;
  url: string;
  image?: string;
  material?: string;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
}): Dict {
  const offers =
    p.priceMin != null
      ? {
          "@type": "AggregateOffer",
          priceCurrency: p.currency ?? "PEN",
          lowPrice: p.priceMin,
          ...(p.priceMax != null ? { highPrice: p.priceMax } : {}),
          availability: "https://schema.org/InStock",
          seller: businessRef(),
        }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    url: p.url,
    ...(p.image ? { image: p.image } : {}),
    ...(p.material ? { material: p.material } : {}),
    brand: { "@type": "Brand", name: SITE.name },
    ...(offers ? { offers } : {}),
  };
}

/**
 * Glosario como conjunto de términos definidos.
 *
 * DefinedTermSet + DefinedTerm es el tipo que schema.org previó exactamente
 * para esto y que casi nadie usa. Declara que el sitio publica un vocabulario
 * del rubro con una URL estable por concepto: es la forma legible por máquina
 * de decir "acá se define este término", que es justo lo que un agente
 * necesita resolver antes de poder citar a alguien.
 */
export function definedTermSetSchema(set: {
  url: string;
  name: string;
  description: string;
  terms: { slug: string; termino: string; definicionCorta: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${set.url}#glosario`,
    name: set.name,
    description: set.description,
    url: set.url,
    inLanguage: SITE.language,
    publisher: organizationRef(),
    hasDefinedTerm: set.terms.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${set.url}/${t.slug}#termino`,
      name: t.termino,
      description: t.definicionCorta,
      url: `${set.url}/${t.slug}`,
      termCode: t.slug,
      inDefinedTermSet: { "@id": `${set.url}#glosario` },
    })),
  };
}

/** Un término del glosario, citable por sí solo. */
export function definedTermSchema(t: {
  url: string;
  setUrl: string;
  termino: string;
  definicionCorta: string;
  termCode: string;
  /** Sigla y otras formas de nombrarlo: ayudan a resolver la desambiguación. */
  alternateNames?: string[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${t.url}#termino`,
    name: t.termino,
    description: t.definicionCorta,
    url: t.url,
    termCode: t.termCode,
    inLanguage: SITE.language,
    inDefinedTermSet: { "@id": `${t.setUrl}#glosario` },
    ...(t.alternateNames?.length ? { alternateName: t.alternateNames } : {}),
  };
}

/**
 * Centro de documentación como catálogo de datos.
 *
 * DataCatalog + DataDownload declara en lenguaje de máquina que este sitio
 * publica documentos y datos descargables, con su formato y su URL. Es la
 * diferencia entre que un agente encuentre los archivos rastreando enlaces y
 * que sepa de antemano qué hay disponible y en qué formato.
 */
export function dataCatalogSchema(cat: {
  url: string;
  name: string;
  description: string;
  downloads: { name: string; description: string; href: string; formato: string }[];
}): Dict {
  const mime: Record<string, string> = {
    pdf: "application/pdf",
    json: "application/json",
    rss: "application/rss+xml",
    txt: "text/plain",
    xml: "application/xml",
  };
  return {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    "@id": `${cat.url}#catalogo-documentos`,
    name: cat.name,
    description: cat.description,
    url: cat.url,
    inLanguage: SITE.language,
    publisher: organizationRef(),
    // isAccessibleForFree es el dato que decide si un agente se molesta en
    // intentar la descarga: sin muro de registro, se intenta.
    isAccessibleForFree: true,
    dataset: cat.downloads.map((d) => ({
      "@type": "Dataset",
      name: d.name,
      description: d.description,
      url: `${SITE.url}${d.href}`,
      isAccessibleForFree: true,
      creator: organizationRef(),
      distribution: {
        "@type": "DataDownload",
        contentUrl: `${SITE.url}${d.href}`,
        encodingFormat: mime[d.formato] ?? d.formato,
      },
    })),
  };
}

/**
 * Informe con procedencia de datos.
 *
 * Dataset declara que la página publica DATOS con fuente, no solo prosa. Es lo
 * que permite a un agente citar una cifra junto con el organismo que la
 * publica, en lugar de atribuírnosla a nosotros. `isBasedOn` es el campo que
 * hace ese trabajo: dice explícitamente de dónde salió cada número.
 */
export function datasetSchema(d: {
  url: string;
  name: string;
  description: string;
  fecha: string;
  version: string;
  fuentes: { nombre: string; url: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${d.url}#dataset`,
    name: d.name,
    description: d.description,
    url: d.url,
    version: d.version,
    datePublished: d.fecha,
    dateModified: d.fecha,
    inLanguage: SITE.language,
    creator: organizationRef(),
    publisher: organizationRef(),
    isAccessibleForFree: true,
    isBasedOn: d.fuentes.map((f) => ({
      "@type": "CreativeWork",
      name: f.nombre,
      url: f.url,
    })),
  };
}
P17_EOF

# -----------------------------------------------------------------------------
# lib/analytics.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/analytics.ts" <<'P17_EOF'
/**
 * Capa de analítica y conversiones (GA4 + Meta Pixel + GTM).
 *
 * `trackEvent` envía UN evento semántico a todos los proveedores cargados.
 * Nada se ejecuta si el proveedor no está presente (IDs ausentes o sin
 * consentimiento), de modo que llamar a estas funciones siempre es seguro.
 *
 * POR QUÉ IMPORTA: en el Perú B2B el canal de leads es WhatsApp. Si los clics a
 * WhatsApp no se miden, no se puede saber qué página, qué familia o qué ciudad
 * produce negocio — y toda inversión publicitaria se hace a ciegas. Por eso
 * TODO punto de salida a WhatsApp debe pasar por `components/WhatsAppLink.tsx`,
 * que dispara `whatsapp_click` con el contexto de origen. Hay un test que falla
 * si alguien vuelve a escribir un enlace `wa.me` a mano.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', name, params);
  window.fbq?.('trackCustom', name, params);
  window.dataLayer?.push({ event: name, ...params });
}

/* ------------------------------------------------------------------ */
/* Conversiones — miden intención de compra, no vanidad.               */
/* ------------------------------------------------------------------ */

/**
 * El formulario de cotización se ABRIÓ. Junto con `quote_request` da la tasa
 * de abandono del formulario, que es lo que dice si el formulario pide de más.
 */
export function trackQuoteStarted(context: string, producto?: string): void {
  trackEvent('quote_started', { context, producto: producto ?? 'general' });
}

/** Solicitud de cotización enviada — la conversión principal del negocio. */
export function trackQuoteRequest(producto?: string): void {
  const content = producto ?? 'general';
  trackEvent('quote_request', { producto: content });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Lead', { content_name: content });
  }
}

/**
 * Clic para contactar por WhatsApp — canal #1 de leads en Perú.
 * `context` identifica el punto de salida (footer, ficha de producto, ciudad…)
 * para poder atribuir el lead a la página que lo generó.
 */
export function trackWhatsAppClick(context?: string): void {
  trackEvent('whatsapp_click', { context: context ?? 'general' });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Contact');
  }
}

/** Primer mensaje enviado al asistente: intención real, no apertura del widget. */
export function trackChatbotEngaged(): void {
  trackEvent('chatbot_engaged');
}

/** Descarga de ficha técnica u otro documento. */
export function trackDocumentDownload(documento: string, producto?: string): void {
  trackEvent('document_download', { documento, producto: producto ?? 'general' });
}

/** Clic en un ícono de red social. */
export function trackSocialClick(network: string): void {
  trackEvent('social_click', { network });
}

/* ------------------------------------------------------------------ */
/* Vistas de contenido — qué silo produce demanda.                     */
/* ------------------------------------------------------------------ */

export function trackProductView(slug: string, categoria: string): void {
  trackEvent('product_view', { slug, categoria });
}

export function trackFamilyView(slug: string): void {
  trackEvent('family_view', { slug });
}

export function trackCityPageView(ciudad: string): void {
  trackEvent('city_page_view', { ciudad });
}

export function trackArticleView(slug: string, categoria: string): void {
  trackEvent('article_view', { slug, categoria });
}

/**
 * Vista de una tabla comparativa. Es la señal de intención más avanzada del
 * catálogo: quien compara especificación por especificación ya está eligiendo
 * proveedor, no explorando.
 */
export function trackComparisonView(familia: string): void {
  trackEvent('comparison_view', { familia });
}

/** Vista de una arquitectura de referencia: intención de proyecto completo. */
export function trackSolutionView(slug: string): void {
  trackEvent('solution_view', { slug });
}

/**
 * Vista del registro fechado. Mide lo que ninguna otra métrica del sitio mide:
 * si la frescura sostiene el retorno de un comprador que ya nos conoce.
 */
export function trackNovedadView(slug: string): void {
  trackEvent('novedad_view', { slug });
}

/**
 * Vista de un término del glosario. Es el evento que revela intención
 * temprana: quien busca qué significa "geotextil" está especificando, no
 * comparando precios todavía.
 */
export function trackGlosarioView(slug: string): void {
  trackEvent('glosario_view', { slug });
}

/** Vista del centro de documentación: intención de armar expediente técnico. */
export function trackDescargasView(slug: string): void {
  trackEvent('descargas_view', { slug });
}

/** Vista de un informe del sector: la señal de autoridad, no de compra. */
export function trackInformeView(slug: string): void {
  trackEvent('informe_view', { slug });
}

/* ------------------------------------------------------------------ */
/* Marco de Especificación — el embudo de mayor intención del sitio.   */
/* ------------------------------------------------------------------ */

/** Vista del marco publicado o de la autoevaluación. */
export function trackFrameworkView(seccion: string): void {
  trackEvent('framework_view', { seccion });
}

/** El usuario respondió el primer criterio: empezó de verdad. */
export function trackFrameworkStarted(): void {
  trackEvent('framework_started');
}

/**
 * Autoevaluación completada. El porcentaje es la señal comercial: un proyecto
 * "Definido" está listo para cotizar; uno "Exploratorio" necesita asesoría.
 */
export function trackFrameworkCompleted(porcentaje: number, nivel: string): void {
  trackEvent('framework_completed', { porcentaje, nivel });
}

/** Descarga del brief técnico generado por la autoevaluación. */
export function trackBriefDownload(nivel: string): void {
  trackEvent('brief_download', { nivel });
}
P17_EOF

# -----------------------------------------------------------------------------
# components/TrackView.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/TrackView.tsx" <<'P17_EOF'
'use client';

import { useEffect, useRef } from 'react';
import {
  trackArticleView,
  trackCityPageView,
  trackComparisonView,
  trackFamilyView,
  trackFrameworkView,
  trackSolutionView,
  trackNovedadView,
  trackGlosarioView,
  trackDescargasView,
  trackInformeView,
  trackProductView,
} from '@/lib/analytics';

/**
 * Emite un evento de vista de contenido una sola vez por montaje.
 *
 * Se renderiza desde páginas de servidor (fichas, familias, ciudades,
 * artículos) sin convertirlas en client components: solo este pequeño
 * componente se hidrata. Sin estos eventos no se puede responder a la pregunta
 * que decide dónde invertir: ¿qué silo produce cotizaciones?
 */

type Props =
  | { kind: 'product'; slug: string; categoria: string }
  | { kind: 'family'; slug: string }
  | { kind: 'city'; ciudad: string }
  | { kind: 'article'; slug: string; categoria: string }
  | { kind: 'comparison'; slug: string }
  | { kind: 'framework'; slug: string }
  | { kind: 'solution'; slug: string }
  | { kind: 'novedades'; slug: string }
  | { kind: 'glosario'; slug: string }
  | { kind: 'descargas'; slug: string }
  | { kind: 'informe'; slug: string };

export default function TrackView(props: Props) {
  const fired = useRef(false);

  useEffect(() => {
    // React 18 monta dos veces en desarrollo con StrictMode: sin esta guarda
    // el evento se duplicaría y las tasas de conversión saldrían a la mitad.
    if (fired.current) return;
    fired.current = true;

    switch (props.kind) {
      case 'product':
        trackProductView(props.slug, props.categoria);
        break;
      case 'family':
        trackFamilyView(props.slug);
        break;
      case 'city':
        trackCityPageView(props.ciudad);
        break;
      case 'article':
        trackArticleView(props.slug, props.categoria);
        break;
      case 'comparison':
        trackComparisonView(props.slug);
        break;
      case 'framework':
        trackFrameworkView(props.slug);
        break;
      case 'solution':
        trackSolutionView(props.slug);
        break;
      case 'novedades':
        trackNovedadView(props.slug);
        break;
      case 'glosario':
        trackGlosarioView(props.slug);
        break;
      case 'descargas':
        trackDescargasView(props.slug);
        break;
      case 'informe':
        trackInformeView(props.slug);
        break;
    }
  }, [props]);

  return null;
}
P17_EOF

# -----------------------------------------------------------------------------
# lib/descargas.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/descargas.ts" <<'P17_EOF'
import { SITE } from './site';
import { products } from './products';
import { articles } from './articles';
import { solutions } from './solutions';
import { terminos } from './glosario';
import { totalCriteria, pillars, FRAMEWORK_VERSION } from './framework';
import { informes } from './informes';

/**
 * CENTRO DE DOCUMENTACIÓN — el inventario de todo lo descargable.
 *
 * Por qué existe como página y no solo como enlaces sueltos. Los documentos
 * estaban repartidos: la ficha en cada producto, el brief dentro de la
 * autoevaluación, los feeds mencionados en llms.txt. Quien llega con la
 * intención "necesito documentación para armar el expediente" no tenía dónde
 * aterrizar, y un agente no tenía forma de saber que existían.
 *
 * Por qué se DERIVA de las fuentes. Un inventario escrito a mano miente en
 * cuanto se agrega un producto. Acá los conteos y las URLs salen del catálogo,
 * de las guías, de las arquitecturas y del glosario: si mañana hay 40 líneas,
 * la página dice 40 sin que nadie la toque.
 *
 * REGLA: solo entra lo que existe y responde. Un enlace de descarga roto en la
 * página de descargas es la forma más rápida de perder a un comprador técnico.
 */

export type FormatoDescarga = 'pdf' | 'json' | 'rss' | 'txt' | 'xml';

export interface Descarga {
  titulo: string;
  descripcion: string;
  /** Para quién es y en qué momento se usa. */
  paraQuien: string;
  href: string;
  formato: FormatoDescarga;
  /** "36 documentos", "43 términos": el volumen real, derivado. */
  volumen: string;
  /** Página de origen, para volver al contenido en línea. */
  origen?: string;
}

export interface GrupoDescargas {
  id: string;
  titulo: string;
  intro: string;
  items: Descarga[];
}

export const formatoLabels: Record<FormatoDescarga, string> = {
  pdf: 'PDF',
  json: 'JSON',
  rss: 'RSS',
  txt: 'Texto',
  xml: 'XML',
};

export function grupos(): GrupoDescargas[] {
  return [
    {
      id: 'documentos',
      titulo: 'Documentos técnicos en PDF',
      intro:
        'Se generan desde las mismas fuentes que alimentan el sitio, de modo que la versión descargada y la publicada nunca divergen. Ninguno declara precio, certificaciones ni ensayos que el catálogo no contenga.',
      items: [
        {
          titulo: 'Marco de Especificación completo',
          descripcion:
            'Los criterios públicos para definir un proyecto antes de cotizarlo, con qué decide cada uno y qué ocurre en obra si el dato no existe.',
          paraQuien:
            'Para adjuntar a un requerimiento de compra o evaluar varias propuestas con el mismo rasero.',
          href: '/marco/marco.pdf',
          formato: 'pdf',
          volumen: `${totalCriteria()} criterios · ${pillars.length} pilares · v${FRAMEWORK_VERSION}`,
          origen: '/marco',
        },
        {
          titulo: 'Informes del sector',
          descripcion:
            'Estadística oficial peruana de los sectores que compran estos productos, con la fuente de cada cifra y qué implica técnicamente para especificar.',
          paraQuien:
            'Para sustentar una decisión ante un comité o justificar por qué una especificación cambia según el emplazamiento.',
          href: '/informes',
          formato: 'pdf',
          volumen: `${informes.length} ${informes.length === 1 ? 'informe' : 'informes'}`,
          origen: '/informes',
        },
        {
          titulo: 'Glosario técnico completo',
          descripcion:
            'El vocabulario del rubro: qué significa cada término, en qué unidad se mide y qué decide en obra.',
          paraQuien:
            'Para repartir al equipo técnico o dejar impreso en la oficina de obra, donde no hay señal.',
          href: '/glosario/glosario.pdf',
          formato: 'pdf',
          volumen: `${terminos.length} términos`,
          origen: '/glosario',
        },
        {
          titulo: 'Fichas técnicas de producto',
          descripcion:
            'Una por línea de catálogo: especificaciones, aplicaciones, sectores, origen de suministro y disponibilidad.',
          paraQuien: 'Para el expediente técnico y para circular dentro de su empresa.',
          href: '/productos',
          formato: 'pdf',
          volumen: `${products.length} fichas`,
          origen: '/productos',
        },
        {
          titulo: 'Guías de especificación e instalación',
          descripcion:
            'Cada guía con su desarrollo completo, sus tablas, sus preguntas frecuentes y las fuentes citadas con URL.',
          paraQuien: 'Para llevar el criterio al frente de trabajo, donde el enlace no sirve.',
          href: '/recursos',
          formato: 'pdf',
          volumen: `${articles.length} guías`,
          origen: '/recursos',
        },
        {
          titulo: 'Arquitecturas de referencia',
          descripcion:
            'Lista de materiales completa con el criterio que gobierna cada componente, secuencia de ejecución y modos de falla.',
          paraQuien: 'Para pedir presupuesto interno de un conjunto, no de piezas sueltas.',
          href: '/soluciones',
          formato: 'pdf',
          volumen: `${solutions.length} configuraciones`,
          origen: '/soluciones',
        },
      ],
    },
    {
      id: 'datos',
      titulo: 'Datos abiertos para agentes e integraciones',
      intro:
        'Publicados en formatos estándar, con instrucción explícita de atribución dentro del propio archivo y acceso permitido desde otros orígenes. Ninguno contiene precios ni existencias: la disponibilidad se declara como modo de suministro, que es un dato estable, y el precio se establece en cada cotización.',
      items: [
        {
          titulo: 'Catálogo completo',
          descripcion:
            'Todas las líneas con sus especificaciones, aplicaciones, sectores, modo de suministro, ficha en PDF, términos del glosario que las gobiernan y arquitecturas donde encajan.',
          paraQuien: 'Para integraciones, comparadores y agentes que necesiten el catálogo entero.',
          href: '/productos/catalogo.json',
          formato: 'json',
          volumen: `${products.length} productos`,
          origen: '/productos',
        },
        {
          titulo: 'Glosario técnico',
          descripcion:
            'El vocabulario como conjunto de términos definidos, con URL canónica por concepto y cita sugerida.',
          paraQuien: 'Para resolver definiciones del rubro y atribuirlas correctamente.',
          href: '/glosario/terminos.json',
          formato: 'json',
          volumen: `${terminos.length} términos`,
          origen: '/glosario',
        },
        {
          titulo: 'Mapa del sitio para modelos de lenguaje',
          descripcion:
            'La entidad, el catálogo, la cobertura, el marco, las arquitecturas y el registro fechado en un solo documento legible de una lectura.',
          paraQuien: 'Para que un agente resuelva la empresa y su catálogo sin rastrear el sitio.',
          href: '/llms.txt',
          formato: 'txt',
          volumen: 'Documento único',
        },
        {
          titulo: 'Novedades — feed RSS',
          descripcion: 'Registro fechado de cada cambio publicado, con enlace a lo que cambió.',
          paraQuien: 'Para suscribirse a la referencia en lugar de tener que volver a mirar.',
          href: '/novedades/rss.xml',
          formato: 'rss',
          volumen: 'Actualizado por cambio',
          origen: '/novedades',
        },
        {
          titulo: 'Novedades — JSON Feed',
          descripcion: 'El mismo registro en formato de datos, sin necesitar un lector de XML.',
          paraQuien:
            'Para agentes y scripts que sigan los cambios sin necesitar un lector de XML.',
          href: '/novedades/feed.json',
          formato: 'json',
          volumen: 'Actualizado por cambio',
          origen: '/novedades',
        },
        {
          titulo: 'Mapa del sitio XML',
          descripcion: 'Todas las URLs indexables con su fecha de última modificación real.',
          paraQuien:
            'Para rastreadores y para comprobar qué URLs publica el sitio y cuándo cambió cada una.',
          href: '/sitemap.xml',
          formato: 'xml',
          volumen: 'Todas las rutas públicas',
        },
      ],
    },
  ];
}

/** Todas las descargas en una lista plana: para el sitemap y los tests. */
export const todasLasDescargas = (): Descarga[] => grupos().flatMap((g) => g.items);

/** URL absoluta de una descarga, heredada de SITE.url. */
export const descargaUrl = (d: Descarga): string => `${SITE.url}${d.href}`;
P17_EOF

# -----------------------------------------------------------------------------
# test/documentos.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/documentos.test.ts" <<'P17_EOF'
import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildGuiaPdf } from '@/lib/doc-guia';
import { buildArquitecturaPdf } from '@/lib/doc-arquitectura';
import { buildGlosarioPdf } from '@/lib/doc-glosario';
import { buildMarcoPdf } from '@/lib/doc-marco';
import { buildCatalogoJson, CATALOGO_VERSION } from '@/lib/catalogo-feed';
import { grupos, todasLasDescargas, formatoLabels } from '@/lib/descargas';
import { articles } from '@/lib/articles';
import { solutions } from '@/lib/solutions';
import { products } from '@/lib/products';
import { terminos } from '@/lib/glosario';
import { SITE } from '@/lib/site';
import sitemap from '@/app/sitemap';

/**
 * Un documento que no abre, o que promete algo que la fuente no dice, es peor
 * que no publicarlo: circula dentro de la empresa del cliente cuando nosotros
 * ya no estamos para corregirlo.
 */

const FECHA = '2026-08-20';

describe('documentos PDF: se generan y abren', () => {
  it('genera un PDF válido para CADA guía técnica', async () => {
    for (const a of articles) {
      const bytes = await buildGuiaPdf(a, FECHA);
      const doc = await PDFDocument.load(bytes);
      expect(doc.getPageCount(), a.slug).toBeGreaterThan(0);
      expect(doc.getTitle(), a.slug).toContain(SITE.name);
    }
  }, 30000);

  it('genera un PDF válido para CADA arquitectura de referencia', async () => {
    for (const s of solutions) {
      const bytes = await buildArquitecturaPdf(s, FECHA);
      const doc = await PDFDocument.load(bytes);
      expect(doc.getPageCount(), s.slug).toBeGreaterThan(0);
    }
  }, 30000);

  it('genera el glosario y el marco completos', async () => {
    const glosario = await PDFDocument.load(await buildGlosarioPdf(FECHA));
    const marco = await PDFDocument.load(await buildMarcoPdf(FECHA));
    // Documentos largos: si salieran de una página, algo se perdió por el camino.
    expect(glosario.getPageCount()).toBeGreaterThan(3);
    expect(marco.getPageCount()).toBeGreaterThan(3);
  }, 30000);

  it('la generación es determinista: misma entrada, mismos bytes', async () => {
    // La fecha se inyecta justamente para esto. Si el PDF cambiara en cada
    // build, las cachés y los hashes dejarían de servir para nada.
    const a = await buildGuiaPdf(articles[0], FECHA);
    const b = await buildGuiaPdf(articles[0], FECHA);
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true);
  }, 20000);

  it('el motor de PDF vive en un solo lugar', () => {
    // Cuatro maquetadores copiados divergen: cuatro cabeceras distintas y
    // cuatro sitios donde corregir el RUC.
    for (const f of ['lib/doc-guia.ts', 'lib/doc-arquitectura.ts', 'lib/doc-glosario.ts', 'lib/doc-marco.ts', 'lib/datasheet.ts']) {
      const src = readFileSync(join(process.cwd(), f), 'utf8');
      expect(src, f).toMatch(/from '\.\/pdf-kit'/);
      expect(src, f).not.toMatch(/from ['"]pdf-lib['"]/);
    }
  });

  it('ningún documento inventa precio ni certificación', () => {
    for (const f of ['lib/doc-guia.ts', 'lib/doc-arquitectura.ts', 'lib/doc-glosario.ts', 'lib/doc-marco.ts']) {
      const src = readFileSync(join(process.cwd(), f), 'utf8');
      expect(src, f).not.toMatch(/S\/\s*\d|USD\s*\d|precio de \d/i);
      expect(src, f).not.toMatch(/certificad[oa]s? (ISO|bajo la norma)/i);
    }
  });
});

describe('catálogo en formato de datos', () => {
  const feed = JSON.parse(buildCatalogoJson());

  it('publica todas las líneas del catálogo', () => {
    expect(feed['@type']).toBe('DataCatalog');
    expect(feed.version).toBe(CATALOGO_VERSION);
    expect(feed.dataset).toHaveLength(products.length);
    expect(feed.totalProductos).toBe(products.length);
  });

  it('cada producto trae URL canónica y ficha en PDF', () => {
    for (const [i, item] of feed.dataset.entries()) {
      expect(item.slug).toBe(products[i].slug);
      expect(item.url).toBe(`${SITE.url}/productos/${products[i].slug}`);
      expect(item.fichaTecnicaPdf).toBe(
        `${SITE.url}/productos/${products[i].slug}/ficha-tecnica.pdf`,
      );
    }
  });

  it('NO publica precios ni existencias', () => {
    // Un precio en datos abiertos que la cotización no sostiene es la forma
    // más rápida de perder credibilidad ante un comprador y ante un modelo.
    const texto = JSON.stringify(feed.dataset);
    expect(texto).not.toMatch(/"precio"|"price"|"offers"|"stock"|"existencias"/i);
    expect(feed.uso.sinPrecios).toBeTruthy();
  });

  it('declara cómo atribuir la cita y cómo cotizar', () => {
    expect(feed.uso.atribucionSugerida).toContain(SITE.ruc);
    expect(feed.uso.comoCotizar).toContain(SITE.phoneWhatsApp);
    expect(feed.uso.datosParaCotizar.length).toBeGreaterThan(3);
  });

  it('todas las URLs heredan de SITE.url', () => {
    const urls = (JSON.stringify(feed).match(/https?:\/\/[^"]+/g) ?? []).filter(
      (u) => !u.startsWith('https://schema.org'),
    );
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(u.startsWith(SITE.url), u).toBe(true);
  });
});

describe('centro de documentación', () => {
  const items = todasLasDescargas();

  it('cada descarga apunta a una ruta interna con formato declarado', () => {
    for (const d of items) {
      expect(d.href.startsWith('/'), d.titulo).toBe(true);
      expect(formatoLabels[d.formato], d.titulo).toBeTruthy();
      expect(d.volumen.length, d.titulo).toBeGreaterThan(0);
      expect(d.paraQuien.length, d.titulo).toBeGreaterThan(20);
    }
  });

  it('los volúmenes se derivan de las fuentes y no están escritos a mano', () => {
    // Un inventario a mano miente en cuanto se agrega un producto.
    const src = readFileSync(join(process.cwd(), 'lib/descargas.ts'), 'utf8');
    expect(src).toMatch(/\$\{products\.length\}/);
    expect(src).toMatch(/\$\{articles\.length\}/);
    expect(src).toMatch(/\$\{terminos\.length\}/);
    expect(src).toMatch(/\$\{solutions\.length\}/);
    expect(src).toMatch(/\$\{informes\.length\}/);
  });

  it('los conteos publicados coinciden con las fuentes reales', () => {
    const texto = items.map((d) => d.volumen).join(' ');
    expect(texto).toContain(`${products.length} fichas`);
    expect(texto).toContain(`${articles.length} guías`);
    expect(texto).toContain(`${terminos.length} términos`);
    expect(texto).toContain(`${solutions.length} configuraciones`);
  });

  it('no hay href duplicados entre grupos', () => {
    const hrefs = items.map((d) => d.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('declara los dos grupos: documentos y datos', () => {
    expect(grupos().map((g) => g.id)).toEqual(['documentos', 'datos']);
    for (const g of grupos()) expect(g.items.length).toBeGreaterThan(0);
  });

  it('el sitemap publica el centro de documentación', () => {
    const urls = new Set(sitemap().map((e) => e.url));
    expect(urls.has(`${SITE.url}/descargas`)).toBe(true);
  });
});

describe('404 útil', () => {
  const src = readFileSync(join(process.cwd(), 'app/not-found.tsx'), 'utf8');
  /**
   * Se asevera sobre el CÓDIGO, no sobre los comentarios: el comentario que
   * documenta el fallo original cita literalmente el texto que el test
   * prohíbe. Aseverar sobre prosa hace fallar al archivo por explicarse bien.
   */
  const codigo = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it('existe una página propia y no el 404 en inglés de Next', () => {
    expect(codigo).toMatch(/Esta página no existe/);
    expect(codigo).not.toMatch(/This page could not be found/);
  });

  it('no se indexa pero sí deja seguir los enlaces', () => {
    expect(src).toMatch(/index: false/);
    expect(src).toMatch(/follow: true/);
  });

  it('ofrece salidas con conteos reales, no un callejón sin salida', () => {
    for (const destino of ['/productos', '/glosario', '/recursos', '/soluciones', '/descargas']) {
      expect(codigo, destino).toContain(`'${destino}'`);
    }
    expect(codigo).toMatch(/products\.length|terminos\.length/);
  });
});
P17_EOF

# -----------------------------------------------------------------------------
# lib/novedades.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/novedades.ts" <<'P17_EOF'
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
P17_EOF

# -----------------------------------------------------------------------------
# test/novedades.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/novedades.test.ts" <<'P17_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  novedades,
  novedadBySlug,
  novedadesPorMes,
  novedadesPorTipo,
  tipoLabels,
  tipoDescripciones,
  tiposPresentes,
  fechaLarga,
  etiquetaDeMes,
  NOVEDADES_UPDATED,
} from '@/lib/novedades';
import { buildRss, buildJsonFeed, escapeXml, toRfc822 } from '@/lib/novedades-feed';
import { products } from '@/lib/products';
import { articles } from '@/lib/articles';
import { solutions } from '@/lib/solutions';
import { familyContent, comparableFamilies } from '@/lib/families';
import { terminos } from '@/lib/glosario';
import { informes } from '@/lib/informes';
import { generateStaticParams } from '@/app/novedades/[slug]/page';
import sitemap from '@/app/sitemap';
import { SITE } from '@/lib/site';

/**
 * El registro fechado sólo vale si no se puede mentir en él sin romper la
 * compilación. Estos tests son el mecanismo: validan que cada enlace resuelva
 * a una ruta real del sitio, que ninguna entrada esté fechada en el futuro y
 * que los feeds sean documentos válidos.
 */

/** Todas las rutas internas que el sitio realmente publica. */
const rutasValidas = new Set<string>([
  '/',
  '/productos',
  '/servicios',
  '/nosotros',
  '/contacto',
  '/cotizacion',
  '/local',
  '/recursos',
  '/marco',
  '/marco/evaluacion',
  '/soluciones',
  '/novedades',
  '/glosario',
  '/descargas',
  '/informes',
  ...products.map((p) => `/productos/${p.slug}`),
  ...articles.map((a) => `/recursos/${a.slug}`),
  ...solutions.map((s) => `/soluciones/${s.slug}`),
  ...familyContent.map((f) => `/productos/familia/${f.slug}`),
  ...comparableFamilies().map((f) => `/productos/familia/${f.slug}/comparar`),
  ...novedades.map((n) => `/novedades/${n.slug}`),
  ...terminos.map((t) => `/glosario/${t.slug}`),
  ...informes.map((i) => `/informes/${i.slug}`),
]);

describe('novedades: el registro no puede mentir', () => {
  it('cada enlace de cada entrada resuelve a una ruta que existe', () => {
    // Sin esto, una entrada puede anunciar algo que no se desplegó. El enlace
    // roto es exactamente la forma en que un registro fechado pierde su valor.
    for (const n of novedades) {
      expect(n.enlaces.length, `${n.slug} sin enlaces`).toBeGreaterThan(0);
      for (const e of n.enlaces) {
        expect(rutasValidas.has(e.href), `${n.slug} → ${e.href}`).toBe(true);
      }
    }
  });

  it('ninguna entrada está fechada en el futuro', () => {
    const hoy = new Date().toISOString().slice(0, 10);
    for (const n of novedades) {
      expect(n.fecha <= hoy, `${n.slug} fechada ${n.fecha}`).toBe(true);
    }
  });

  it('las fechas son ISO estrictas (YYYY-MM-DD) y parseables', () => {
    for (const n of novedades) {
      expect(n.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(`${n.fecha}T12:00:00Z`))).toBe(false);
    }
  });

  it('el orden es estrictamente descendente por fecha', () => {
    for (let i = 1; i < novedades.length; i++) {
      expect(novedades[i - 1].fecha >= novedades[i].fecha).toBe(true);
    }
  });

  it('los slugs son únicos y en kebab-case', () => {
    const vistos = new Set<string>();
    for (const n of novedades) {
      expect(n.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(vistos.has(n.slug), `slug duplicado: ${n.slug}`).toBe(false);
      vistos.add(n.slug);
    }
  });

  it('cada entrada declara qué cambia para quien especifica', () => {
    // Un registro que sólo dice "publicamos X" obliga al lector a deducir por
    // qué debería importarle. Ese campo es obligatorio por eso.
    for (const n of novedades) {
      expect(n.queCambia.length, n.slug).toBeGreaterThan(40);
      expect(n.detalle.length, n.slug).toBeGreaterThan(0);
    }
  });

  it('el resumen cabe como meta description', () => {
    for (const n of novedades) {
      expect(n.resumen.length, `${n.slug}: ${n.resumen.length}`).toBeLessThanOrEqual(200);
      expect(n.resumen.length).toBeGreaterThan(50);
    }
  });

  it('no se anuncia lo que todavía no está publicado', () => {
    // "Próximamente" convierte el registro en una lista de intenciones.
    const prohibido = /pr[óo]ximamente|muy pronto|estamos trabajando|en desarrollo|pr[óo]xima versi[óo]n/i;
    for (const n of novedades) {
      const texto = [n.titulo, n.resumen, n.queCambia, ...n.detalle].join(' ');
      expect(prohibido.test(texto), n.slug).toBe(false);
    }
  });

  it('no se declaran obras ejecutadas, clientes ni cifras de negocio', () => {
    const prohibido = /nuestro cliente|caso de éxito|caso de exito|facturaci[óo]n|ventas por|premio|certificad[oa]s? por/i;
    for (const n of novedades) {
      const texto = [n.titulo, n.resumen, n.queCambia, ...n.detalle].join(' ');
      expect(prohibido.test(texto), n.slug).toBe(false);
    }
  });

  it('cada tipo declarado tiene etiqueta y descripción', () => {
    for (const n of novedades) {
      expect(tipoLabels[n.tipo], n.slug).toBeTruthy();
      expect(tipoDescripciones[n.tipo], n.slug).toBeTruthy();
    }
    for (const t of tiposPresentes()) {
      expect(novedadesPorTipo(t).length).toBeGreaterThan(0);
    }
  });
});

describe('novedades: rutas y descubrimiento', () => {
  it('generateStaticParams cubre todas las entradas', () => {
    const params = generateStaticParams().map((p) => p.slug).sort();
    expect(params).toEqual(novedades.map((n) => n.slug).sort());
  });

  it('novedadBySlug encuentra cada entrada y rechaza las inexistentes', () => {
    for (const n of novedades) expect(novedadBySlug(n.slug)?.titulo).toBe(n.titulo);
    expect(novedadBySlug('no-existe')).toBeUndefined();
  });

  it('el sitemap incluye el índice y todas las entradas con su fecha real', () => {
    const urls = new Map(sitemap().map((e) => [e.url, e.lastModified]));
    expect(urls.has(`${SITE.url}/novedades`)).toBe(true);
    for (const n of novedades) {
      const lastMod = urls.get(`${SITE.url}/novedades/${n.slug}`);
      expect(lastMod, n.slug).toBeDefined();
      // La fecha del sitemap es la de publicación, no la del despliegue: un
      // lastmod movido en cada deploy le enseña a Google a ignorarlo.
      expect(new Date(lastMod as Date).toISOString().slice(0, 10)).toBe(n.fecha);
    }
  });

  it('el índice agrupa por mes sin perder ni duplicar entradas', () => {
    const agrupadas = novedadesPorMes().flatMap((m) => m.items);
    expect(agrupadas.map((n) => n.slug)).toEqual(novedades.map((n) => n.slug));
  });

  it('NOVEDADES_UPDATED es la fecha de la entrada más reciente', () => {
    expect(NOVEDADES_UPDATED).toBe(novedades[0].fecha);
  });

  it('las fechas se formatean en español peruano sin depender de Intl', () => {
    expect(fechaLarga('2026-08-19')).toBe('19 de agosto de 2026');
    expect(fechaLarga('2026-09-01')).toBe('1 de setiembre de 2026');
    expect(etiquetaDeMes('2026-08')).toBe('agosto de 2026');
  });
});

describe('novedades: descubrimiento del feed en todo el sitio', () => {
  const layout = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8');

  it('el <head> raíz declara el feed RSS en JSX, no en metadata.alternates', () => {
    // Cada página define su propio alternates.canonical y Next reemplaza el
    // objeto entero: puesto en metadata, el enlace del feed sólo sobrevivía en
    // /novedades. Se verificó midiendo el HTML renderizado, no leyendo la API.
    expect(layout).toMatch(/rel="alternate"/);
    expect(layout).toMatch(/type="application\/rss\+xml"/);
    expect(layout).toMatch(/novedades\/rss\.xml/);
  });

  it('la URL del feed se deriva de SITE.url y no está escrita a mano', () => {
    expect(layout).toMatch(/\$\{SITE\.url\}\/novedades\/rss\.xml/);
    expect(layout).not.toContain('https://plastilonas.com');
  });
});

describe('novedades: feeds', () => {
  const rss = buildRss();

  it('escapa los caracteres que rompen el XML', () => {
    expect(escapeXml('Lonas & "cobertores" <1.5 mm>')).toBe(
      'Lonas &amp; &quot;cobertores&quot; &lt;1.5 mm&gt;',
    );
  });

  it('el RSS declara cabecera, canal y un item por entrada', () => {
    expect(rss.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(rss).toContain('<rss version="2.0"');
    expect((rss.match(/<item>/g) ?? []).length).toBe(novedades.length);
    expect((rss.match(/<\/item>/g) ?? []).length).toBe(novedades.length);
  });

  it('el RSS no contiene ampersands sin escapar', () => {
    // Un solo & crudo invalida el documento entero para cualquier lector.
    expect(rss).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;|#)/);
  });

  it('todas las URLs del feed heredan de SITE.url', () => {
    // Nunca se codifica el dominio a mano: el día de la migración a
    // plastilonas.com debe bastar con cambiar lib/site.ts. Se exceptúan los
    // espacios de nombres XML, que son identificadores y no direcciones.
    const NAMESPACES = ['http://www.w3.org/'];
    for (const n of novedades) {
      expect(rss).toContain(`${SITE.url}/novedades/${n.slug}`);
    }
    const urls = (rss.match(/https?:\/\/[^\s"'<>]+/g) ?? []).filter(
      (u) => !NAMESPACES.some((ns) => u.startsWith(ns)),
    );
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(u.startsWith(SITE.url), u).toBe(true);
  });

  it('las fechas del RSS son RFC 822 y no se corren de día en Lima', () => {
    // Con 00:00Z un lector en UTC-5 muestra la entrada el día anterior.
    expect(toRfc822('2026-08-19')).toBe('Wed, 19 Aug 2026 12:00:00 GMT');
    for (const n of novedades) expect(rss).toContain(toRfc822(n.fecha));
  });

  it('el JSON Feed es válido y expone las mismas entradas', () => {
    const feed = JSON.parse(buildJsonFeed());
    expect(feed.version).toBe('https://jsonfeed.org/version/1.1');
    expect(feed.items).toHaveLength(novedades.length);
    expect(feed.feed_url).toBe(`${SITE.url}/novedades/feed.json`);
    for (const [i, item] of feed.items.entries()) {
      expect(item.id).toBe(`${SITE.url}/novedades/${novedades[i].slug}`);
      expect(item.date_published).toBe(`${novedades[i].fecha}T12:00:00Z`);
      expect(item.content_text.length).toBeGreaterThan(0);
    }
  });
});
P17_EOF

# -----------------------------------------------------------------------------
# app/globals.css
# -----------------------------------------------------------------------------
mkdir -p "app"
cat > "app/globals.css" <<'P17_EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-sans: var(--font-inter);
  --font-display: var(--font-playfair);
  
  /* Premium Color Palette - AWS Level + Industrial Warmth */
  --color-navy: #0A2540;
  --color-navy-light: #1A3A5C;
  --color-emerald: #059669;
  --color-emerald-dark: #047857;
  --color-amber: #F59E0B;
  --color-amber-dark: #D97706;
  --color-gray-50: #F8FAFC;
  --color-gray-100: #F1F5F9;
  --color-gray-200: #E2E8F0;
  --color-gray-600: #475569;
  --color-gray-700: #334155;
  --color-gray-800: #1E293B;

  /* Semantic surface tokens — light (default) */
  --surface: #FFFFFF;
  --surface-muted: var(--color-gray-50);
  --surface-raised: #FFFFFF;
  --border: var(--color-gray-200);
  --text: var(--color-navy);
  --text-muted: var(--color-gray-600);
  --brand: var(--color-emerald);
  --brand-hover: var(--color-emerald-dark);
}

/* Dark theme — token overrides only. Existing rules that consume the
   variables above (product-card, form-input, specs-table, focus-visible)
   invert automatically. No component markup changes required. */
.dark {
  --surface: #0B1220;
  --surface-muted: #111C2E;
  --surface-raised: #16233A;
  /* Escalera de elevacion, pasos medidos ~1.35:1 entre superficies
     adyacentes, igual que AWS. No usar gradientes: bandas solidas. */
  --surface-nav: #1C2C46;
  --surface-deep: #060D18;
  --border: #24354F;
  --text: #E8EEF6;
  --text-muted: #93A4BC;
  --brand: #10B981;
  --brand-hover: #34D399;

  --color-gray-50: #111C2E;
  --color-gray-100: #16233A;
  --color-gray-200: #24354F;
  --color-gray-600: #93A4BC;
}

html { color-scheme: light; }
html.dark { color-scheme: dark; }

body {
  background-color: var(--surface);
  color: var(--text);
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Respect OS-level motion preferences. Required for WCAG 2.1 AA (2.3.3). */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

body {
  font-feature-settings: "kern" "tnum" "liga" "kern";
}

/* Premium Typography */
h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-feature-settings: "kern" "tnum" "liga" "kern";
}

/* Smooth micro-interactions */
a, button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

a:hover, button:hover {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Premium Card Styles */
.product-card {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.2s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  border-color: var(--color-emerald);
}

/* Mega Menu Styles */
.mega-menu {
  animation: fadeInScale 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Command Palette */
.command-palette {
  animation: commandEnter 0.15s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes commandEnter {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Chatbot Styles */
.chatbot-window {
  animation: slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Form Styles - Premium */
.form-input {
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: var(--color-emerald);
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  outline: none;
}

/* Table Styles */
.specs-table tr {
  transition: background-color 0.1s ease;
}

.specs-table tr:hover {
  background-color: var(--color-gray-50);
}

/* Filter Active States */
.filter-active {
  background-color: var(--color-emerald);
  color: white;
  border-color: var(--color-emerald);
}

/* WhatsApp Floating Button */
.whatsapp-float {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.whatsapp-float:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 10px 15px -3px rgb(37 211 102 / 0.3);
}

/* Professional Badge */
.badge {
  font-size: 0.75rem;
  letter-spacing: 0.025em;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
}

/* Section Dividers */
.section-divider {
  background: linear-gradient(to right, transparent, var(--color-gray-200), transparent);
}

/* Responsive Typography */
@media (max-width: 768px) {
  h1 {
    font-size: 2.25rem !important;
    line-height: 2.5rem !important;
  }
}

/* Accessibility Focus */
:focus-visible {
  outline: 2px solid var(--color-emerald);
  outline-offset: 2px;
}

/* Loading States */
.skeleton {
  background: linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ─── Capa de compatibilidad de tema ────────────────────────────────────
   Los contenedores usan literales (.bg-white, .text-[#0A2540]). Al volver
   <body> dependiente de tokens, los <h3> sin clase de color heredaban
   --text (claro) sobre tarjetas blancas -> 1.17:1. Y los <h2> con
   text-[#0A2540] quedaban sobre la pagina oscura -> 1.21:1.

   Esta capa hace que los contenedores sigan al tema. Va limitada a <main>
   para no tocar Navbar ni Footer, que ya manejan su propio dark:.

   ES UN PARCHE. Lo correcto es migrar los literales de page.tsx,
   SectionHeading.tsx y ProductCard.tsx a los tokens directamente.  */

/* Superficies: la tarjeta sube un escalon respecto de la pagina.

   AMPLIADO: la lista original cubria solo contenedores de bloque. Las paginas
   de familia, comparativa, recursos y cobertura local introdujeron tablas
   (th/td), chips (span) y callouts (p) con las mismas utilidades. En oscuro
   esos elementos quedaban como bloques BLANCOS con tinta clara encima -> el
   encabezado y la primera columna de la tabla comparativa eran ilegibles.
   Ampliar el selector es aditivo y arregla tambien cualquier pagina futura. */
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label, a, button).bg-white {
  background-color: var(--surface-raised);
}
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label).bg-gray-50,
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label).bg-gray-100 {
  background-color: var(--surface-muted);
}

/* 1.4.11: tarjeta #16233A vs pagina #0B1220 = 1.19:1, por debajo de 3.0.
   box-shadow en vez de border: no desplaza el layout. */
.dark main :is(div, section, article).bg-white {
  box-shadow: 0 0 0 1px var(--border);
}

/* Tinta */
.dark main .text-\[\#0A2540\] { color: var(--text) !important; }
/* gray-800 es tinta principal, no secundaria: mapearla a --text-muted dejaba
   el bloque "En resumen" de cada guia casi ilegible sobre fondo oscuro. */
.dark main :is(.text-gray-800, .text-gray-900) { color: var(--text) !important; }
.dark main :is(.text-gray-500, .text-gray-600, .text-gray-700) { color: var(--text-muted) !important; }
/* gray-400 marca dato ausente ("No declarado"): debe seguir siendo tenue,
   pero legible. */
.dark main :is(.text-gray-400, .text-neutral-400) { color: var(--text-muted) !important; }
.dark main :is(.border-gray-100, .border-gray-200) { border-color: var(--border); }

/* La escala `neutral-*` de Tailwind no estaba cubierta. Las 12 paginas de
   ciudad la usan para todo su cuerpo de texto: en oscuro quedaban en 1.81:1,
   practicamente invisibles. Mismo remapeo que la escala `gray-*`. */
/* Fondos semanticos claros (avisos, notas, alertas). No estaban mapeados: los
   cuadros de riesgo de las arquitecturas de referencia se quedaban en ambar
   claro mientras su tinta pasaba a la paleta oscura -> 1.13:1. El acento se
   conserva en el borde y el icono, que si son legibles sobre superficie
   oscura. Lo detecto la auditoria visual automatica, no una revision a ojo. */
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label, a, button):is(.bg-amber-50, .bg-amber-100, .bg-red-50, .bg-red-100, .bg-green-50, .bg-green-100, .bg-emerald-50, .bg-emerald-100, .bg-blue-50, .bg-blue-100, .bg-yellow-50) {
  background-color: var(--surface-muted);
}

/* Si la superficie semantica se oscurece, su tinta debe aclararse en el mismo
   paso. Oscurecer solo el fondo dejaba las insignias ambar del catalogo en
   3.4:1: una correccion a medias es una regresion. */
.dark main :is(.text-amber-700, .text-amber-800) { color: #FCD34D !important; }
.dark main :is(.text-red-700, .text-red-800) { color: #FCA5A5 !important; }
.dark main :is(.text-green-700, .text-green-800, .text-emerald-700) { color: var(--brand-hover) !important; }
.dark main :is(.text-blue-700, .text-blue-800) { color: #93C5FD !important; }

.dark main :is(.text-neutral-800, .text-neutral-900) { color: var(--text) !important; }
.dark main :is(.text-neutral-500, .text-neutral-600, .text-neutral-700) { color: var(--text-muted) !important; }
.dark main :is(.border-neutral-100, .border-neutral-200, .border-neutral-300) { border-color: var(--border); }
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label):is(.bg-neutral-50, .bg-neutral-100) {
  background-color: var(--surface-muted);
}

/* `text-navy` es el token equivalente al literal #0A2540 y aparece en el
   modal de cotizacion. Sin mapear, el titulo del formulario quedaba en 1.01:1. */
.dark main .text-navy { color: var(--text) !important; }

/* Verde de marca: en claro se oscurece a #047857 para cumplir AA sobre blanco.
   En oscuro esa misma correccion lo hunde a 2.87:1 sobre la pagina. El verde
   claro del tema (--brand-hover, #34D399) da ~9:1 sobre #0B1220. */
.dark main :is(.text-\[\#059669\], .text-\[\#047857\], .text-brand, .text-\[\#25D366\]) {
  color: var(--brand-hover) !important;
}

/* Los CTA blancos del hero viven sobre imagen oscura: siguen blancos con
   tinta navy (15.54:1). Deben ir DESPUES de las reglas de arriba. */
/* ACOTADO con :has(). Antes cubria CUALQUIER enlace con fondo blanco, lo que
   incluia las TARJETAS del carrusel de familias y del catalogo: la tarjeta se
   quedaba blanca mientras su texto interior se remapeaba a la paleta oscura
   -> gris claro sobre blanco (2.54:1). Solo el CTA real —el que lleva tinta
   navy— debe seguir siendo blanco. */
.dark main :is(a, button).bg-white:is(.text-\[\#0A2540\], .text-navy) {
  background-color: #FFFFFF;
  box-shadow: none;
}
/* Con !important, porque la regla de tinta oscura de arriba tambien lo lleva:
   sin esto el CTA blanco recibia tinta clara sobre blanco (1.17:1). */
/* Solo cuando la tinta navy esta en el PROPIO enlace/boton. La variante por
   descendencia hacia que las tarjetas-enlace (ya convertidas en superficie
   oscura) forzaran su titulo a navy sobre fondo oscuro: 1.01:1. */
.dark main :is(a, button).bg-white.text-\[\#0A2540\],
.dark main :is(a, button).bg-white.text-navy { color: #0A2540 !important; }


/* ═══════════════════════════════════════════════════════════════════
   MOBILE POLISH LAYER  (≤640px)  — tightens spacing & sizing site-wide.
   Purely responsive: desktop is untouched. Mirrors AWS/Square density.
   ═══════════════════════════════════════════════════════════════════ */
@media (max-width: 640px) {
  /* 1. Kill any accidental horizontal scroll */
  html, body { max-width: 100%; overflow-x: hidden; }

  /* 2. Section vertical rhythm: 80px -> 48px. Reclaims dead space. */
  section.py-20, section.py-24 { padding-top: 3rem; padding-bottom: 3rem; }
  .mt-20 { margin-top: 3rem !important; }
  .mt-16 { margin-top: 2.5rem !important; }

  /* 3. Hero: shorter, tighter, not a full screen of navy */
  section.min-h-\[92vh\] { min-height: 78vh; }
  section.min-h-\[92vh\] h1 { font-size: 2.15rem !important; line-height: 1.12 !important; }
  section.min-h-\[92vh\] .mt-16 { margin-top: 2rem !important; }

  /* 4. Product visual placards: 224px -> 176px, lighter feel */
  .product-card .h-56 { height: 11rem; }

  /* 5. Badges/labels breathe less loudly on tiny screens */
  .badge { font-size: 0.7rem; padding: 0.2rem 0.6rem; }

  /* 6. Comfortable tap targets (Apple/Google min 44px) for pills & icons */
  a, button { -webkit-tap-highlight-color: transparent; }
}

/* ── Bright selected / active states (all breakpoints) ─────────────
   Tapped filter chips and cards get a clear brand highlight + lift. */
.chip-selected,
button[aria-pressed="true"] {
  background-color: var(--color-emerald) !important;
  color: #fff !important;
  border-color: var(--color-emerald) !important;
  box-shadow: 0 4px 14px -2px rgba(5, 150, 105, 0.45);
}
.product-card:active { transform: scale(0.985); }

/* Card image brightens on tap/hover (the "brighten when selected" ask) */
.product-card .h-56 { transition: filter 0.25s ease; }
.product-card:hover .h-56,
.product-card:active .h-56 { filter: brightness(1.12) saturate(1.08); }

/* ── Bright gradient selected/active state (AWS "North America" style) ── */
.chip-selected {
  background-image: linear-gradient(120deg, #047857, #065F46 70%, #0F766E) !important;
  background-color: #047857 !important;
  color: #fff !important;
  border-color: transparent !important;
  box-shadow: 0 4px 14px -2px rgba(5, 150, 105, 0.5);
}

/* Hide scrollbar on horizontal scroll rows but keep swipe */
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }

/* ═══════════ MOBILE SECTION POLISH (≤640px) ═══════════ */
@media (max-width: 640px) {
  /* 1+3. Content cards: less inner padding so they stop eating the screen.
     Targets the rounded-3xl p-8 cards in Servicios / Por qué / Family. */
  main .rounded-3xl.p-8 { padding: 1.35rem !important; }
  /* Tighten vertical gaps between stacked cards */
  main .gap-6 { gap: 0.85rem !important; }
  /* Service/why headings a touch smaller so cards shrink */
  main .rounded-3xl .text-xl { font-size: 1.05rem !important; line-height: 1.4 !important; }

  /* 5. Chat button: smaller + higher so it never sits over card text.
     Overrides the w-16 h-16 bottom-6 float. */
  .fixed.bottom-6.right-6 { bottom: 1rem !important; right: 1rem !important; }
  .fixed.bottom-6.right-6 > button { width: 3.25rem !important; height: 3.25rem !important; }
  /* Lift the open chat window origin to match */
  .fixed.bottom-24.right-6 { bottom: 4.75rem !important; }
}

/* ── 2. Sectores: peek-scroll row (one line, swipeable, next chip peeks) ── */
.sector-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.25rem;
  flex-wrap: nowrap;
}
.sector-scroll > * { scroll-snap-align: start; flex: 0 0 auto; }

/* ═══════════ MOBILE DENSITY (≤640px) — end the endless scroll ═══════════ */
@media (max-width: 640px) {
  /* Servicios + Por qué: 1-col -> 2-col so all items fit with minimal scroll */
  main section .grid.md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0,1fr)) !important; gap: 0.6rem !important; }
  /* Compact those cards so 2-up reads cleanly */
  main section .grid.md\:grid-cols-2 > div { padding: 1rem !important; border-radius: 1.25rem !important; }
  main section .grid.md\:grid-cols-2 .text-xl { font-size: 0.95rem !important; line-height: 1.3 !important; }
  main section .grid.md\:grid-cols-2 .text-lg { font-size: 0.95rem !important; }
  main section .grid.md\:grid-cols-2 p { font-size: 0.8rem !important; line-height: 1.35 !important; }
  main section .grid.md\:grid-cols-2 .w-10.h-10 { width: 2rem !important; height: 2rem !important; margin-bottom: 0.6rem !important; }

  /* Family catalog: vertical list -> horizontal peek-carousel (swipe, 2.2 cards) */
  .family-scroll { display: flex !important; gap: 0.7rem; overflow-x: auto; scroll-snap-type: x mandatory; grid-template-columns: none !important; }
  .family-scroll > a { flex: 0 0 82%; scroll-snap-align: start; }

  /* Kill stray off-canvas carousel arrow bleeding at screen edge */
  .hero-arrow-left, [class*="carousel"] button.absolute.left-0 { display: none !important; }
}

/* ── Ticker de sectores: flujo continuo derecha -> izquierda ── */
.ticker-wrap { overflow: hidden; position: relative; }
.ticker-track {
  display: flex;
  gap: 0.5rem;
  width: max-content;
  animation: ticker-scroll 38s linear infinite;
}
.ticker-wrap:hover .ticker-track,
.ticker-wrap:focus-within .ticker-track { animation-play-state: paused; }
@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .ticker-track { animation: none; flex-wrap: wrap; width: auto; }
}

/* ═══════════ CONTRASTE WCAG AA — verificado por medición ═══════════
   #059669 sobre blanco = 3.77 (FALLA AA 4.5) -> #047857 = 5.48 (PASA).
   #10B981 + texto blanco = 2.54 (FALLA) -> emerald-700 = 5.48 (PASA).
   gray-400 = 2.54 (FALLA) -> gray-500 = 4.83 (PASA).
   #10B981 sobre navy = 6.13 (PASA) -> se conserva.
   Razón comercial: se lee a pleno sol en mina, obra y campo. ══════ */
:root { --color-emerald-text: #047857; }
.text-\[\#059669\] { color: #047857 !important; }
.bg-\[\#059669\] { background-color: #047857 !important; }
.hover\:bg-\[\#059669\]:hover { background-color: #047857 !important; }
.hover\:text-\[\#059669\]:hover { color: #047857 !important; }
.text-gray-400 { color: #6B7280 !important; }
.bg-\[\#0A2540\] .text-\[\#10B981\],
section.bg-\[\#0A2540\] .text-\[\#10B981\] { color: #10B981 !important; }

/* Foco visible para teclado (AWS/Square: accesibilidad primero) */
a:focus-visible, button:focus-visible, input:focus-visible, [tabindex]:focus-visible {
  outline: 2px solid #047857;
  outline-offset: 2px;
  border-radius: 0.5rem;
}

/* ═══════════════════════════════════════════════════════════════
   SISTEMA DE DISEÑO — jerarquía de forma y tipografía
   Patrón AWS observado:
     · Monoespaciada = metadato técnico (specs, estados, conteos).
     · Radio PEQUEÑO = etiqueta informativa (no se toca).
     · Radio PÍLDORA = acción (se toca).
     · Panel/tarjeta = radio medio.
   Antes: badges y botones compartían forma píldora -> el usuario
   intentaba tocar etiquetas. La forma ahora codifica la función.
   ═══════════════════════════════════════════════════════════════ */

/* 1 · Metadatos técnicos en monoespaciada */
.badge,
.tech-meta,
.spec-label,
.tabular-nums {
  font-family: var(--font-mono), ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}

/* 2 · Jerarquía de radios */
.badge {
  border-radius: 0.375rem;      /* etiqueta: NO es un botón */
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  font-weight: 600;
  padding: 0.22rem 0.5rem;
  text-transform: uppercase;
}
/* Los estados de producto también son etiquetas, no acciones */
.product-card .absolute.top-4.left-4,
.product-card .absolute.top-4.right-4 {
  border-radius: 0.375rem !important;
  font-family: var(--font-mono), ui-monospace, monospace;
  letter-spacing: 0.04em;
}

/* 3 · Transición de sección con solape redondeado (patrón AWS) */
.section-lift {
  position: relative;
  z-index: 1;
  border-top-left-radius: 2rem;
  border-top-right-radius: 2rem;
  margin-top: -2rem;
}

/* 4 · Ritmo de lectura: cuerpo más cómodo, títulos más ceñidos */
main p { line-height: 1.6; }
main h1, main h2, main h3 { letter-spacing: -0.02em; }

/* ═══════════ KEN BURNS — fotos de producto "vivas" ═══════════
   Zoom + paneo lento e infinito en alternancia. Cada tarjeta arranca con
   un pequeño desfase para que no se muevan todas al unísono. Se detiene
   por completo si el usuario prefiere menos movimiento. */
.ken-burns {
  animation: kenburns 22s ease-in-out infinite alternate;
  transform-origin: center;
  will-change: transform;
}
.ken-burns-wrap:nth-of-type(3n) .ken-burns   { animation-duration: 26s; animation-delay: -6s; transform-origin: top left; }
.ken-burns-wrap:nth-of-type(3n+1) .ken-burns { animation-duration: 20s; animation-delay: -3s; transform-origin: bottom right; }
@keyframes kenburns {
  from { transform: scale(1.02) translate(0, 0); }
  to   { transform: scale(1.14) translate(-1.5%, 1.5%); }
}
/* En hover intensifica un pelín la sensación de vida */
.group:hover .ken-burns { animation-duration: 12s; }

@media (prefers-reduced-motion: reduce) {
  .ken-burns { animation: none !important; transform: scale(1.02); }
}

/* ═══════════════════════════════════════════════════════════════════
   TOKENS DE DISEÑO — fuente única de verdad para tipografía, botones,
   secciones y radios. Reemplaza los tamaños sueltos (t-body,
   px-9 py-4, etc.) por clases semánticas. Patrón AWS/Stripe/Siemens.
   ═══════════════════════════════════════════════════════════════════ */

/* ── Escala tipográfica (usar estas, no píxeles sueltos) ── */
.t-display { font-size: clamp(2.25rem, 5vw, 3.5rem); line-height: 1.05; letter-spacing: -0.03em; }
.t-h2      { font-size: clamp(1.75rem, 3.5vw, 2.5rem); line-height: 1.1; letter-spacing: -0.02em; }
.t-h3      { font-size: 1.25rem; line-height: 1.3; letter-spacing: -0.01em; }
.t-body    { font-size: 0.9375rem; line-height: 1.6; }   /* = 15px, ahora tokenizado */
.t-caption { font-size: 0.8125rem; line-height: 1.5; }   /* = 13px */
.t-micro   { font-size: 0.6875rem; line-height: 1.4; letter-spacing: 0.04em; } /* = 11px, badges/meta */

/* ── Sistema de botones: UNA definición, tres tamaños ── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  font-weight: 600; font-size: 0.875rem; line-height: 1;
  padding: 0.75rem 1.5rem;            /* alto uniforme = 44px táctil */
  border-radius: 9999px;
  transition: background-color .2s, color .2s, transform .1s;
  white-space: nowrap;
}
.btn:active { transform: scale(0.985); }
.btn-sm { padding: 0.5rem 1rem; font-size: 0.8125rem; }
.btn-lg { padding: 0.9rem 2rem; font-size: 0.95rem; }
.btn-primary   { background: #0A2540; color: #fff; }
.btn-primary:hover   { background: #047857; }
.btn-accent    { background: #047857; color: #fff; }
.btn-accent:hover    { background: #065F46; }
.btn-ghost     { background: #fff; color: #0A2540; border: 1px solid #E5E7EB; }
.btn-ghost:hover     { border-color: #047857; color: #047857; }

/* ── Ritmo de sección: 2 valores, no 6 ── */
.section-pad { padding-top: 5rem; padding-bottom: 5rem; }
@media (max-width: 640px) { .section-pad { padding-top: 3rem; padding-bottom: 3rem; } }

/* ---------------------------------------------------------------------------
   VISUALIZACIÓN DE DATOS

   Los valores de estas variables NO se eligieron a ojo: se midieron con el
   validador de paleta en las dos superficies reales del sitio (blanco en claro,
   #1C2C46 en oscuro) y se ajustaron hasta pasar los cinco controles: banda de
   luminosidad, piso de croma, separación bajo daltonismo, piso de visión normal
   y contraste contra la superficie.

   El eje divergente es AZUL/NARANJA y no verde/rojo aunque el verde sea el color
   de marca. Verde y rojo es el par que la deuteranopia confunde: medido se queda
   en ΔE 5-6 cuando el umbral es 8. Azul/naranja mide ΔE 25-28 en las tres formas
   de daltonismo. El color de marca no vale una lectura equivocada.
--------------------------------------------------------------------------- */
.viz-root {
  --viz-serie: #047857;      /* magnitud, serie única */
  --viz-pos: #1D4ED8;        /* divergente: crecimiento */
  --viz-neg: #B45309;        /* divergente: contracción */
  --viz-eje: #D1D5DB;
  --viz-etiqueta: #0A2540;
  --viz-valor: #4B5563;
}

.dark .viz-root {
  --viz-serie: #0EA97A;
  --viz-pos: #4A8FE0;
  --viz-neg: #C9800F;
  --viz-eje: #3A4A66;
  --viz-etiqueta: var(--text);
  --viz-valor: var(--text-muted);
}

.viz-barra { fill: var(--viz-serie); }
.viz-barra-pos { fill: var(--viz-pos); }
.viz-barra-neg { fill: var(--viz-neg); }
.viz-eje { stroke: var(--viz-eje); }
/* La tinta de los textos es tinta, nunca el color de la serie: el color lo
   lleva la barra, que es quien porta la identidad. */
.viz-etiqueta { fill: var(--viz-etiqueta); font-weight: 500; }
.viz-valor { fill: var(--viz-valor); font-variant-numeric: tabular-nums; }
P17_EOF

# -----------------------------------------------------------------------------
# test/dark-mode.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/dark-mode.test.ts" <<'P17_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

/**
 * El modo oscuro del sitio funciona con una capa de compatibilidad en
 * globals.css: los componentes escriben utilidades literales (bg-white,
 * text-gray-800…) y esa capa las remapea a los tokens del tema dentro de
 * <main>. Si la capa no cubre un tipo de elemento, ese elemento se queda
 * BLANCO sobre página oscura y su texto desaparece.
 *
 * Ocurrió de verdad: el encabezado y la primera columna de las tablas
 * comparativas (th) y el bloque "En resumen" de las guías (text-gray-800)
 * quedaban ilegibles. Estos tests fijan la cobertura.
 */
describe('modo oscuro: cobertura de la capa de compatibilidad', () => {
  const surfaceRule =
    css.match(/\.dark main :is\(([^)]*)\)\.bg-white \{/)?.[1] ?? '';

  it('la regla de superficie cubre tablas, celdas, chips y párrafos', () => {
    for (const tag of ['div', 'section', 'article', 'li', 'p', 'span', 'th', 'td', 'table', 'tr']) {
      expect(surfaceRule, `falta ${tag} en la capa oscura`).toContain(tag);
    }
  });

  it('bg-gray-50 y bg-gray-100 tienen la misma cobertura que bg-white', () => {
    const grayRule = css.match(/\.dark main :is\(([^)]*)\)\.bg-gray-50/)?.[1] ?? '';
    for (const tag of ['th', 'td', 'span', 'p']) {
      expect(grayRule, `falta ${tag} en bg-gray-50`).toContain(tag);
    }
  });

  it('text-gray-800 es tinta principal, no secundaria', () => {
    // Mapearla a --text-muted dejaba el resumen de cada guía casi ilegible.
    expect(css).toMatch(/\.dark main :is\(\.text-gray-800, \.text-gray-900\) \{ color: var\(--text\)/);
  });

  it('text-gray-400 sigue siendo tenue pero legible', () => {
    expect(css).toMatch(/\.dark main :is\(\.text-gray-400, \.text-neutral-400\)/);
  });

  it('la paleta de gráficos tiene su propio juego para el modo oscuro', () => {
    // Un color validado contra fondo blanco no sirve contra #1C2C46: el modo
    // oscuro se ELIGE, no se invierte.
    expect(css).toMatch(/\.dark \.viz-root/);
    for (const v of ['--viz-serie', '--viz-pos', '--viz-neg']) {
      const apariciones = css.split(v).length - 1;
      expect(apariciones, v).toBeGreaterThanOrEqual(2);
    }
  });

  it('el eje divergente no usa verde y rojo', () => {
    // Es el par que la deuteranopia confunde. Se midió: ΔE 5-6 frente al
    // umbral de 8. La regla vive en un test porque "usemos el verde de marca"
    // es exactamente la corrección que alguien va a proponer más adelante.
    const bloque = css.slice(css.indexOf('.viz-root'), css.indexOf('.viz-barra '));
    expect(bloque).not.toMatch(/--viz-pos:\s*#(0[0-9A-F]|1[0-9A-F])[0-9A-F]*9[0-9A-F]/i);
    expect(bloque).toMatch(/--viz-pos:\s*#1D4ED8/);
    expect(bloque).toMatch(/--viz-neg:\s*#B45309/);
  });

  it('los fondos semánticos de aviso también siguen al tema', () => {
    // Los cuadros de riesgo en ámbar quedaban claros con tinta clara encima.
    expect(css).toMatch(/\.bg-amber-50, \.bg-amber-100, \.bg-red-50/);
  });

  it('la escala neutral está cubierta igual que la gray', () => {
    // Las 12 páginas de ciudad usan neutral-*: sin esto, su cuerpo de texto
    // quedaba en 1.81:1 sobre fondo oscuro.
    expect(css).toMatch(/\.dark main :is\(\.text-neutral-500, \.text-neutral-600, \.text-neutral-700\)/);
    expect(css).toMatch(/\.dark main :is\(\.text-neutral-800, \.text-neutral-900\)/);
    expect(css).toContain('.border-neutral-300');
  });

  it('la capa oscura iguala la fuerza de la capa AA de modo claro', () => {
    // La capa AA de claro usa !important. Sin !important, las reglas oscuras
    // perdían y el texto conservaba el color pensado para fondo blanco.
    const oscuras = css.match(/\.dark main :is\(\.text-gray-500[^\n]*/)?.[0] ?? '';
    expect(oscuras).toContain('!important');
  });

  it('el verde de marca se aclara en oscuro en vez de oscurecerse', () => {
    // #047857 cumple AA sobre blanco y falla (2.87:1) sobre la página oscura.
    expect(css).toMatch(/\.dark main :is\(\.text-\\\[\\#059669\\\]/);
    expect(css).toContain('var(--brand-hover) !important');
  });

  it('la excepción del CTA blanco exige la tinta navy en el PROPIO elemento', () => {
    // Con selector por descendencia, las tarjetas-enlace forzaban su título a
    // navy sobre superficie oscura (1.01:1).
    expect(css).not.toMatch(/\.dark main :is\(a, button\)\.bg-white \.text-/);
  });

  it('los CTA blancos sobre bloques oscuros siguen siendo blancos', () => {
    // Esta excepción debe ir DESPUÉS de la regla general o el botón blanco
    // del hero y de los CTA se volvería una superficie oscura.
    const generic = css.indexOf('.dark main :is(div, section, article, aside, li, p, span');
    const exception = css.indexOf('.dark main :is(a, button).bg-white');
    expect(generic).toBeGreaterThan(-1);
    expect(exception).toBeGreaterThan(generic);
  });
});
P17_EOF

# -----------------------------------------------------------------------------
# app/sitemap.ts
# -----------------------------------------------------------------------------
mkdir -p "app"
cat > "app/sitemap.ts" <<'P17_EOF'
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { products } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { familyContent, comparableFamilies } from "@/lib/families";
import { FRAMEWORK_UPDATED } from "@/lib/framework";
import { solutions } from "@/lib/solutions";
import { novedades, NOVEDADES_UPDATED } from "@/lib/novedades";
import { LEGAL_UPDATED } from "@/lib/legal";
import { terminos } from "@/lib/glosario";
import { informes, INFORMES_UPDATED } from "@/lib/informes";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/productos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE.url}/cotizacion`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/local`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/recursos`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    // Centro de documentación: la puerta de "necesito papeles para el expediente".
    { url: `${SITE.url}/descargas`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // Avisos legales: prioridad baja pero indexables. Sin ellos, el pie
    // enlazaba las dos páginas legales a /contacto.
    { url: `${SITE.url}/privacidad`, lastModified: new Date(LEGAL_UPDATED),
      changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/terminos`, lastModified: new Date(LEGAL_UPDATED),
      changeFrequency: "yearly", priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE.url}/productos/${p.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.8,
  }));

  const localRoutes: MetadataRoute.Sitemap = (ciudades as { slug: string }[]).map((c) => ({
    url: `${SITE.url}/local/${c.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  // Los artículos declaran su propia fecha de modificación: un lastModified
  // honesto vale más que "hoy" en cada deploy, que enseña a Google a ignorarlo.
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE.url}/recursos/${a.slug}`,
    lastModified: new Date(a.dateModified), changeFrequency: "monthly", priority: 0.7,
  }));

  const familyRoutes: MetadataRoute.Sitemap = familyContent.map((f) => ({
    url: `${SITE.url}/productos/familia/${f.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.85,
  }));

  const compareRoutes: MetadataRoute.Sitemap = comparableFamilies().map((f) => ({
    url: `${SITE.url}/productos/familia/${f.slug}/comparar`,
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  // El marco es contenido de referencia: cambia poco pero pesa mucho.
  const marcoRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/marco`, lastModified: new Date(FRAMEWORK_UPDATED),
      changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/marco/evaluacion`, lastModified: new Date(FRAMEWORK_UPDATED),
      changeFrequency: "monthly", priority: 0.8 },
  ];

  // Arquitecturas de referencia: el peldaño "muéstrenme el conjunto armado".
  const solucionRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/soluciones`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    ...solutions.map((s) => ({
      url: `${SITE.url}/soluciones/${s.slug}`,
      lastModified: now, changeFrequency: "monthly" as const, priority: 0.8,
    })),
  ];

  // Registro fechado: es la única sección donde lastModified es un dato real
  // y no "hoy". Cada entrada declara su fecha de publicación.
  const novedadRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/novedades`, lastModified: new Date(NOVEDADES_UPDATED),
      changeFrequency: "weekly", priority: 0.8 },
    ...novedades.map((n) => ({
      url: `${SITE.url}/novedades/${n.slug}`,
      lastModified: new Date(n.fecha), changeFrequency: "yearly" as const, priority: 0.5,
    })),
  ];

  // Glosario: la capa definicional. Prioridad alta en el índice porque es la
  // puerta de entrada de las búsquedas de definición, y media en cada término.
  const glosarioRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/glosario`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    ...terminos.map((t) => ({
      url: `${SITE.url}/glosario/${t.slug}`,
      lastModified: now, changeFrequency: "yearly" as const, priority: 0.6,
    })),
  ];

  // Informes: evidencia con fuente. lastModified real, no "hoy".
  const informeRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/informes`, lastModified: new Date(INFORMES_UPDATED),
      changeFrequency: "monthly", priority: 0.85 },
    ...informes.map((i) => ({
      url: `${SITE.url}/informes/${i.slug}`,
      lastModified: new Date(i.fecha), changeFrequency: "yearly" as const, priority: 0.75,
    })),
  ];

  return [...staticRoutes, ...marcoRoutes, ...informeRoutes, ...glosarioRoutes, ...solucionRoutes, ...novedadRoutes, ...familyRoutes, ...compareRoutes, ...productRoutes,
    ...localRoutes, ...articleRoutes];
}
P17_EOF

# -----------------------------------------------------------------------------
# app/llms.txt/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/llms.txt"
cat > "app/llms.txt/route.ts" <<'P17_EOF'
import { SITE } from "@/lib/site";
import { products, productFamilies, sectors } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { pillars, totalCriteria, FRAMEWORK_VERSION } from "@/lib/framework";
import { solutions } from "@/lib/solutions";
import { novedades, tipoLabels, NOVEDADES_UPDATED } from "@/lib/novedades";
import { terminos, categoriaLabels, categoriasPresentes, terminosPorCategoria } from "@/lib/glosario";
import { informes } from "@/lib/informes";

/**
 * /llms.txt — mapa curado del sitio para LLMs y agentes (formato llmstxt.org).
 *
 * Objetivo: que cualquier agente (ChatGPT, Claude, Perplexity, Gemini, Grok)
 * resuelva la entidad "Plastilonas Peruanas SAC" y su catálogo en una sola
 * lectura, con URLs absolutas y datos verificables.
 *
 * Reglas: se genera desde las mismas fuentes de verdad que el sitio
 * (lib/site.ts, lib/products.ts, data/ciudades.json). Cero datos inventados:
 * sin precios, sin certificaciones no verificables, sin reseñas.
 */

export const dynamic = "force-static";

const MAX_DESC = 160;

function clamp(text: string, max = MAX_DESC): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export async function GET(): Promise<Response> {
  const base = SITE.url;

  // Catálogo agrupado por familia (mismo orden que el mega menú del sitio).
  const catalogo = productFamilies
    .map((familia) => {
      const items = products.filter((p) => p.category === familia.name);
      if (items.length === 0) return null;
      const lineas = items
        .map(
          (p) =>
            `- [${p.name}](${base}/productos/${p.slug}): ${clamp(p.shortDescription)}`,
        )
        .join("\n");
      return `### [${familia.name}](${base}/productos/familia/${familia.slug})\n_${familia.tagline}_\n\n${lineas}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const ciudadesLista = (ciudades as { slug: string; ciudad: string; departamento: string }[])
    .map((c) => `- [${c.ciudad}, ${c.departamento}](${base}/local/${c.slug})`)
    .join("\n");

  const sectoresLista = sectors.map((s) => `- ${s}`).join("\n");

  const recursosLista = articles
    .map(
      (a) =>
        `- [${a.title}](${base}/recursos/${a.slug}) — ${clamp(a.description, 200)} (actualizado ${a.dateModified})`,
    )
    .join("\n");

  const body = `# ${SITE.name}

> Fabricante e instalador peruano de soluciones textiles industriales y geosintéticos, con fabricación propia a medida desde ${SITE.foundingYear}. Big Bags / FIBC, lonas y cobertores, geomembranas y geotextiles, estructuras y arquitectura textil, mangas de ventilación para minería y túneles, mallas agrícolas y accesorios. RUC ${SITE.ruc}. Sede en ${SITE.addressLocality}, ${SITE.addressRegion}, Perú. Cobertura nacional.

## Identidad

- Razón social: ${SITE.legalName}
- RUC: ${SITE.ruc}
- Dirección: ${SITE.addressStreet}, ${SITE.addressLocality}, ${SITE.addressRegion}, Perú
- WhatsApp comercial: ${SITE.phoneWhatsApp}
- Central telefónica: ${SITE.phoneCentral}
- Email: ${SITE.email}
- Sitio web: ${base}
- Idioma del contenido: español peruano (${SITE.language})
- País de operación: Perú

## Modelo de negocio

- Fabricación propia y confección a medida, más importación directa y líneas bajo pedido.
- Servicio de instalación en obra a nivel nacional.
- Venta B2B por cotización: no se publican precios de lista; cada proyecto se cotiza según especificación, metraje y logística.
- Cada producto declara en su ficha cómo se abastece (fabricación propia, importación directa, bajo pedido o aliado técnico) y su estado de disponibilidad.

## Catálogo (${products.length} líneas de producto)

${catalogo}

## Sectores atendidos

${sectoresLista}

## Cobertura local

Páginas con contexto climático y de uso por ciudad:

${ciudadesLista}

## Arquitecturas de referencia

Configuraciones completas: qué componentes forman el conjunto, en qué orden se
ejecutan y qué falla al comprar por piezas sueltas. No son casos de estudio: no
declaran obras ejecutadas ni clientes.

${solutions.map((s) => `- [${s.titulo}](${base}/soluciones/${s.slug}) — ${s.componentes.length} componentes · ${s.sectores.join(", ")}`).join("\n")}

## Novedades (registro fechado)

Cambios publicados, con fecha real y enlace a lo que cambió. Última
actualización: ${NOVEDADES_UPDATED}. Feeds: ${base}/novedades/rss.xml (RSS 2.0)
y ${base}/novedades/feed.json (JSON Feed 1.1). Solo se registran cambios en el
catálogo, las guías, las herramientas y los criterios publicados: no hay
anuncios de intenciones ni contenido promocional.

${novedades
  .map((n) => `- ${n.fecha} · ${tipoLabels[n.tipo]} — [${n.titulo}](${base}/novedades/${n.slug}): ${clamp(n.resumen, 200)}`)
  .join("\n")}

## Informes del sector (evidencia con fuente)

Estudios que parten de estadística oficial peruana y explican qué implica cada
indicador para quien especifica. Reglas que los gobiernan, relevantes al citar:
toda cifra lleva organismo, enlace, fecha de publicación y fecha de
verificación; lo que es lectura nuestra va separado y etiquetado; y cada
informe declara explícitamente qué NO afirma.

NO estimamos el tamaño del mercado peruano de textiles industriales ni de
geosintéticos: no existe estadística pública verificable de ese mercado y no
publicamos estimaciones propias presentadas como datos. Cualquier cifra de
tamaño de mercado atribuida a esta empresa no es nuestra.

${informes
  .map((i) => `- [${i.titulo}](${base}/informes/${i.slug}) — ${clamp(i.subtitulo, 200)} (v${i.version}, ${i.fecha}, ${i.fuentes.length} fuentes oficiales; PDF en ${base}/informes/${i.slug}/informe.pdf)`)
  .join("\n")}

## Glosario técnico (vocabulario del rubro)

${terminos.length} términos con URL canónica por concepto: qué significa cada uno, en
qué unidad se mide y qué decide en obra. Las definiciones describen el término
en el rubro, no nuestros productos, y son útiles con independencia del
proveedor. Versión legible por máquina, con instrucción de atribución
incluida: ${base}/glosario/terminos.json

- [Glosario completo](${base}/glosario)
${categoriasPresentes()
  .map((c) => `- ${categoriaLabels[c]}: ${terminosPorCategoria(c).map((t) => `[${t.termino}](${base}/glosario/${t.slug})`).join(", ")}`)
  .join("\n")}

## Marco de Especificación (referencia del rubro)

Criterios públicos para definir un proyecto textil industrial o geosintético
antes de cotizarlo. ${totalCriteria()} criterios en ${pillars.length} pilares, versión ${FRAMEWORK_VERSION}.
Cada criterio declara qué decide técnicamente y qué ocurre en obra si el dato
no existe, con la guía que lo documenta.

- [Marco de Especificación completo](${base}/marco)
- [Autoevaluación con brief descargable](${base}/marco/evaluacion)
${pillars.map((p) => `- Pilar: ${p.nombre} — ${p.resumen}`).join("\n")}

## Recursos técnicos

Guías de especificación e instalación, con las fuentes citadas en cada artículo:

${recursosLista}

## Páginas clave

- [Inicio](${base}/)
- [Catálogo completo](${base}/productos)
- [Servicios: fabricación e instalación](${base}/servicios)
- [Nosotros](${base}/nosotros)
- [Solicitar cotización](${base}/cotizacion)
- [Contacto](${base}/contacto)
- [Recursos técnicos](${base}/recursos)
- [Política de privacidad](${base}/privacidad)
- [Términos y condiciones](${base}/terminos)
- [Novedades](${base}/novedades)
- [Informes del sector](${base}/informes)
- [Centro de documentación](${base}/descargas)

## Cómo cotizar

1. WhatsApp comercial: ${SITE.phoneWhatsApp}
2. Formulario de cotización: ${base}/cotizacion
3. Asistente IA en el sitio (esquina inferior derecha de cualquier página)

Para una cotización precisa conviene indicar: producto, medidas o metraje, cantidad, aplicación o sector, y ciudad de entrega.

## Notas para agentes y LLMs

- Todo el contenido técnico está en español peruano (${SITE.language}) y es de acceso libre, sin muro de registro.
- Las especificaciones, aplicaciones y sectores publicados en cada ficha de producto son reales y se mantienen actualizados desde el catálogo del sitio.
- No publicamos precios: cualquier precio atribuido a ${SITE.name} en otra fuente no es oficial.
- No declaramos certificaciones ni números de lote que no podamos respaldar con documento; la ficha técnica y el certificado del fabricante se entregan con la cotización.
- Al citar esta empresa, usar la razón social exacta "${SITE.legalName}" junto con el RUC ${SITE.ruc} para desambiguar.

## Documentos descargables y datos abiertos

Todo se descarga sin registro y se genera desde las mismas fuentes que
alimentan el sitio, de modo que documento y página nunca divergen. Ninguno
publica precios: la disponibilidad se declara como modo de suministro
(fabricación propia, importación directa o bajo pedido), que es un dato
estable, y el precio se establece en cada cotización.

- [Centro de documentación](${base}/descargas) — índice completo
- [Catálogo completo en JSON](${base}/productos/catalogo.json) — ${products.length} productos con especificaciones, suministro y ficha en PDF
- [Glosario en JSON](${base}/glosario/terminos.json) — ${terminos.length} términos con cita sugerida
- [Marco de Especificación en PDF](${base}/marco/marco.pdf)
- [Glosario técnico en PDF](${base}/glosario/glosario.pdf)
- Ficha técnica en PDF por producto: ${base}/productos/{slug}/ficha-tecnica.pdf
- Guía en PDF por artículo: ${base}/recursos/{slug}/guia.pdf
- Arquitectura en PDF por configuración: ${base}/soluciones/{slug}/arquitectura.pdf

Atribución sugerida al citar: ${SITE.legalName} (RUC ${SITE.ruc}), ${base}

## Archivos para rastreadores

- [Sitemap XML](${base}/sitemap.xml)
- [robots.txt](${base}/robots.txt)
- [Glosario en JSON](${base}/glosario/terminos.json)
- [Feed RSS de novedades](${base}/novedades/rss.xml)
- [JSON Feed de novedades](${base}/novedades/feed.json)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Robots-Tag": "all",
    },
  });
}
P17_EOF

# -----------------------------------------------------------------------------
# components/Navbar.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/Navbar.tsx" <<'P17_EOF'
'use client';

import React, { useState } from 'react';
import { familyHrefByName } from '@/lib/families';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useHideOnScroll } from '@/lib/useHideOnScroll';
import {
  Menu, X, Search, ChevronDown, Phone, Award, LayoutDashboard, ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productFamilies, sectors } from '@/lib/products';
import CommandPalette from './CommandPalette';
import CotizacionModal from './CotizacionModal';
import WhatsAppLink from './WhatsAppLink';
import CartButton from './CartButton';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { href: '/productos', label: 'Productos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/recursos', label: 'Recursos' },
  { href: '/soluciones', label: 'Soluciones' },
  { href: '/informes', label: 'Informes' },
  { href: '/glosario', label: 'Glosario' },
  { href: '/marco', label: 'Marco' },
  { href: '/novedades', label: 'Novedades' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

// Eje 1 (por categoría) y Eje 2 (por sector) se derivan del catálogo, de modo
// que agregar una familia o un sector en lib/products.ts actualiza el menú.
const familyHref = (name: string) =>
  familyHrefByName(name);
const sectorHref = (name: string) =>
  `/productos?sector=${encodeURIComponent(name)}`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [showCotizacion, setShowCotizacion] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const headerVisible = useHideOnScroll();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Encabezado fijo que se oculta al bajar y reaparece al subir.
          Usa transform, no cambia el flujo: la página nunca "salta". */}
      <div
        className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 ease-out ${
          headerVisible || isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Barra utilitaria superior (estilo AWS) */}
        <div className="hidden md:block bg-[#0A2540] dark:bg-[#060D18] text-white/80 text-xs border-b border-transparent dark:border-[#24354F]">
          <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-end gap-6">
            <a href="tel:+51998117065" className="hover:text-white transition-colors">
              +51 998 117 065
            </a>
            <WhatsAppLink
              context="navbar-topbar"
              message="Hola, quisiera información sobre sus productos."
              className="hover:text-white transition-colors"
            >
              WhatsApp
            </WhatsAppLink>
            <Link href="/contacto" className="hover:text-white transition-colors">
              Contáctenos
            </Link>
          </div>
        </div>

        <nav className="bg-white/95 dark:bg-[#1C2C46]/95 backdrop-blur-lg border-b border-gray-200 dark:border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between gap-4 h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-9 h-9 shrink-0 rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 transition-transform group-hover:scale-[1.04]">
                <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} priority className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <div className="font-semibold text-xl tracking-tight whitespace-nowrap text-[#0A2540] dark:text-[var(--text)]">Plastilonas Peruanas</div>
                <div className="t-micro whitespace-nowrap text-gray-500 dark:text-[var(--text-muted)] -mt-1 font-medium">SAC • DESDE 2009</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium shrink-0">
              {/* Mega Menu Productos (dos ejes: categoría + sector) */}
              <div
                className="relative"
                onMouseEnter={() => setShowMegaMenu(true)}
                onMouseLeave={() => setShowMegaMenu(false)}
              >
                <button
                  className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#059669] ${isActive('/productos') ? 'text-[#059669]' : 'text-[#0A2540] dark:text-[var(--text)]'}`}
                  onClick={() => setShowMegaMenu(!showMegaMenu)}
                  aria-expanded={showMegaMenu}
                  aria-haspopup="true"
                >
                  Productos
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showMegaMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                      className="mega-menu absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[860px] bg-white dark:bg-[var(--surface-raised)] rounded-2xl shadow-xl border border-gray-100 dark:border-[var(--border)] p-8"
                    >
                      <div className="grid grid-cols-3 gap-x-8">
                        {/* Eje 1: por categoría (2 columnas de familias) */}
                        <div className="col-span-2">
                          <div className="text-xs uppercase tracking-[0.15em] text-[#059669] font-semibold mb-4">
                            Por categoría
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                            {productFamilies.map((fam) => (
                              <Link
                                key={fam.slug}
                                href={familyHref(fam.name)}
                                className="group flex flex-col py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] transition-all"
                                onClick={() => setShowMegaMenu(false)}
                              >
                                <span className="font-medium text-[#0A2540] dark:text-[var(--text)] group-hover:text-[#059669] text-sm">
                                  {fam.name}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-[var(--text-muted)]">
                                  {fam.tagline}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Eje 2: por sector */}
                        <div className="border-l border-gray-100 dark:border-[var(--border)] pl-8">
                          <div className="text-xs uppercase tracking-[0.15em] text-[#059669] font-semibold mb-4">
                            Por sector
                          </div>
                          <div className="flex flex-col gap-1">
                            {sectors.map((sector) => (
                              <Link
                                key={sector}
                                href={sectorHref(sector)}
                                className="py-1.5 px-3 rounded-lg text-sm text-gray-600 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] hover:text-[#059669] transition-all"
                                onClick={() => setShowMegaMenu(false)}
                              >
                                {sector}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t dark:border-[var(--border)] flex items-center justify-between text-xs">
                        <Link
                          href="/productos"
                          onClick={() => setShowMegaMenu(false)}
                          className="text-[#059669] hover:underline font-medium"
                        >
                          Ver todo el catálogo →
                        </Link>
                        <button
                          onClick={() => {
                            setShowMegaMenu(false);
                            setShowCommand(true);
                          }}
                          className="flex items-center gap-2 text-[#059669] hover:underline font-medium"
                        >
                          <Search className="w-3.5 h-3.5" /> Buscar en catálogo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap transition-colors hover:text-[#059669] ${isActive(link.href) ? 'text-[#059669]' : 'text-[#0A2540] dark:text-[var(--text)]'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Búsqueda móvil: AWS coloca la lupa en el header del móvil.
                  Con 34 productos en 11 familias, buscar es la vía más rápida. */}
              <button
                onClick={() => setShowCommand(true)}
                aria-label="Buscar productos"
                className="md:hidden p-2.5 text-[#0A2540] dark:text-[var(--text)] hover:text-[#047857] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search Button */}
              <button
                onClick={() => setShowCommand(true)}
                aria-label="Buscar productos"
                className="hidden md:flex items-center gap-2 px-3 xl:px-4 py-2 text-sm text-gray-500 dark:text-[var(--text-muted)] hover:text-[#0A2540] dark:hover:text-[var(--text)] border border-gray-200 dark:border-[var(--border)] hover:border-gray-300 rounded-full transition-all active:scale-[0.985]"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">Buscar productos</span>
                <kbd className="hidden xl:block ml-1 px-1.5 py-0.5 t-micro font-mono bg-gray-100 dark:bg-[var(--surface-muted)] rounded">⌘K</kbd>
              </button>

              <ThemeToggle />

              {/* Login / Account */}
              {user ? (
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0A2540] hover:text-[#059669] border border-gray-200 hover:border-[#059669] rounded-full transition-all active:scale-[0.985]"
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <LayoutDashboard className="w-4 h-4" />
                  )}
                  {user.name?.split(' ')[0] ?? 'Mi Cuenta'}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669] transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}

              {/* Cotización Button - Primary CTA */}
              <button
                onClick={() => setShowCotizacion(true)}
                className="hidden md:flex items-center gap-2.5 whitespace-nowrap bg-[#0A2540] dark:bg-[#10B981] hover:bg-[#059669] dark:hover:bg-[#34D399] text-white dark:text-[#0A2540] px-5 xl:btn btn-sm btn-primary text-sm font-semibold transition-all active:scale-[0.985] shadow-sm"
              >
                <Award className="w-4 h-4" />
                Solicitar Cotización
              </button>

              <CartButton className="p-2.5 text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669]" />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 text-[#0A2540] dark:text-[var(--text)]"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t dark:border-[var(--border)] bg-white dark:bg-[var(--surface-raised)]"
            >
              <div className="px-6 py-8 flex flex-col gap-6 text-lg font-medium">
                {/* Productos con submenú desplegable de familias */}
                <div>
                  <button
                    onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                    className="w-full flex items-center justify-between"
                    aria-expanded={mobileProductsOpen}
                  >
                    <span className={isActive('/productos') ? 'text-[#059669]' : ''}>Productos</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${mobileProductsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {mobileProductsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pl-3 flex flex-col gap-2 text-base font-normal text-gray-600 dark:text-[var(--text-muted)]">
                          {productFamilies.map((fam) => (
                            <Link
                              key={fam.slug}
                              href={familyHref(fam.name)}
                              onClick={() => setIsOpen(false)}
                              className="py-1 hover:text-[#059669]"
                            >
                              {fam.name}
                            </Link>
                          ))}
                          <Link
                            href="/productos"
                            onClick={() => setIsOpen(false)}
                            className="py-1 text-[#059669] font-medium"
                          >
                            Ver todo el catálogo →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {navLinks.slice(1).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={isActive(link.href) ? 'text-[#059669]' : ''}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowCotizacion(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#0A2540] dark:bg-[#10B981] text-white dark:text-[#0A2540] py-3.5 rounded-2xl font-semibold"
                  >
                    Solicitar Cotización
                  </button>
                </div>
                <Link href="/carrito" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Mi carrito
                </Link>
                <Link
                  href={user ? '/dashboard' : '/login'}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {user ? 'Mi Cuenta' : 'Iniciar sesión'}
                </Link>
                <WhatsAppLink context="navbar-movil" message="Hola, quisiera información sobre sus productos." className="flex items-center gap-2 text-[#059669]">
                  <Phone className="w-4 h-4" /> WhatsApp: +51 946 085 270
                </WhatsAppLink>
                <div className="pt-2"><ThemeToggle /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </nav>
      </div>

      {/* Espaciador: reserva la altura del encabezado fijo para que el
          contenido no quede oculto debajo. md: incluye la barra utilitaria. */}
      <div className="h-20 md:h-[116px]" aria-hidden="true" />

      {/* Command Palette */}
      <CommandPalette open={showCommand} onOpenChange={setShowCommand} />

      {/* Cotizacion Modal */}
      <CotizacionModal open={showCotizacion} onOpenChange={setShowCotizacion} />
    </>
  );
}
P17_EOF

# -----------------------------------------------------------------------------
# components/Footer.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/Footer.tsx" <<'P17_EOF'
import Link from 'next/link';
import WhatsAppLink from './WhatsAppLink';
import { WHATSAPP_DISPLAY } from '@/lib/whatsapp';
import Image from 'next/image';
import { Phone, Mail, MapPin, Award, Users, ArrowUp } from 'lucide-react';
import SocialIcons from '@/components/SocialIcons';
import FooterAccordion, { type FSection } from '@/components/FooterAccordion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const sections: FSection[] = [
    { title: 'PRODUCTOS', links: [
      { label: 'Envases y Embalaje', href: '/productos/familia/envases-embalaje' },
      { label: 'Lonas y Cobertores', href: '/productos/familia/lonas-cobertores' },
      { label: 'Geosintéticos e Impermeabilización', href: '/productos/familia/geosinteticos' },
      { label: 'Estructuras y Arquitectura Textil', href: '/productos/familia/estructuras-arquitectura-textil' },
      { label: 'Ventilación Industrial', href: '/productos/familia/ventilacion-industrial' },
      { label: 'Ver catálogo completo →', href: '/productos' },
    ]},
    { title: 'EMPRESA', links: [
      { label: 'Recursos técnicos', href: '/recursos' },
      { label: 'Arquitecturas de referencia', href: '/soluciones' },
      { label: 'Informes del sector', href: '/informes' },
      { label: 'Glosario técnico', href: '/glosario' },
      { label: 'Centro de documentación', href: '/descargas' },
      { label: 'Marco de Especificación', href: '/marco' },
      { label: 'Novedades', href: '/novedades' },
      { label: 'Sobre Nosotros', href: '/nosotros' },
      { label: 'Nuestros Servicios', href: '/servicios' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Solicitar Cotización', href: '/cotizacion' },
    ]},
    { title: 'CONTACTO', links: [
      { label: '+51 998 117 065 · Central', href: 'tel:+51998117065', external: true },
      { label: 'ventas@plastilonas.com', href: 'mailto:ventas@plastilonas.com', external: true },
      { label: 'Chorrillos, Lima — Perú', href: '/contacto' },
    ]},
  ];

  return (
    <footer className="bg-[#0A2540] text-white/90 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* ── Mobile: marca compacta + CTA + acordeón (patrón AWS) ── */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-white/10">
              <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <div className="font-semibold text-lg tracking-tight text-white">Plastilonas Peruanas SAC</div>
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-5">Fabricación e instalación propias. +15 años entregando a todo el Perú.</p>
          <WhatsAppLink context="footer-cta" message="Hola, quisiera información sobre sus productos." className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-[#0A2540] font-semibold py-3.5 rounded-2xl mb-6 active:scale-[0.99] transition">
            <Phone className="w-4 h-4" /> WhatsApp 24/7 · {WHATSAPP_DISPLAY}
          </WhatsAppLink>
          <FooterAccordion sections={sections} />
          <div className="py-6">
            <div className="text-xs text-white/40 mb-3 tracking-wide">SÍGANOS</div>
            <SocialIcons variant="dark" />
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-white/10">
                <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <div className="font-semibold text-2xl tracking-tight text-white">Plastilonas Peruanas SAC</div>
            </div>
            <p className="text-white/70 max-w-md leading-relaxed t-body">
              Más de 15 años fabricando e instalando soluciones textiles industriales para los sectores más exigentes del Perú. Fabricación propia, importación directa y respaldo técnico en cada proyecto.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Award className="w-3.5 h-3.5" /> +15 años de experiencia
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5" /> Fabricación 100% a medida
              </div>
            </div>
            <div className="mt-7">
              <div className="text-xs text-white/50 mb-3 tracking-wide">SÍGANOS</div>
              <SocialIcons variant="dark" />
            </div>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">PRODUCTOS</div>
            <ul className="space-y-[13px] text-sm">
              <li><Link href="/productos/familia/envases-embalaje" className="hover:text-white transition-colors">Envases y Embalaje</Link></li>
              <li><Link href="/productos/familia/lonas-cobertores" className="hover:text-white transition-colors">Lonas y Cobertores</Link></li>
              <li><Link href="/productos/familia/geosinteticos" className="hover:text-white transition-colors">Geosintéticos e Impermeabilización</Link></li>
              <li><Link href="/productos/familia/estructuras-arquitectura-textil" className="hover:text-white transition-colors">Estructuras y Arquitectura Textil</Link></li>
              <li><Link href="/productos/familia/ventilacion-industrial" className="hover:text-white transition-colors">Ventilación Industrial</Link></li>
              <li><Link href="/productos" className="hover:text-white transition-colors text-white/60">Ver catálogo completo →</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">EMPRESA</div>
            <ul className="space-y-[13px] text-sm">
              <li><Link href="/recursos" className="hover:text-white transition-colors">Recursos técnicos</Link></li>
              <li><Link href="/soluciones" className="hover:text-white transition-colors">Arquitecturas de referencia</Link></li>
              <li><Link href="/informes" className="hover:text-white transition-colors">Informes del sector</Link></li>
              <li><Link href="/glosario" className="hover:text-white transition-colors">Glosario técnico</Link></li>
              <li><Link href="/descargas" className="hover:text-white transition-colors">Centro de documentación</Link></li>
              <li><Link href="/marco" className="hover:text-white transition-colors">Marco de Especificación</Link></li>
              <li><Link href="/novedades" className="hover:text-white transition-colors">Novedades</Link></li>
              <li><Link href="/nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/servicios" className="hover:text-white transition-colors">Nuestros Servicios</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link href="/local" className="hover:text-white transition-colors">Cobertura local</Link></li>
              <li><WhatsAppLink context="footer-enlaces" message="Hola, quisiera información sobre sus productos." className="hover:text-white transition-colors">WhatsApp Directo</WhatsAppLink></li>
              <li><Link href="/cotizacion" className="hover:text-white transition-colors">Solicitar Cotización</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">CONTACTO DIRECTO</div>
            <div className="space-y-4 text-sm">
              <a href="tel:+51998117065" className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>
                  <div>+51 998 117 065</div>
                  <div className="text-xs text-white/50">Central</div>
                </div>
              </a>
              <WhatsAppLink context="footer-contacto" message="Hola, quisiera información sobre sus productos." className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-[#25D366] group-hover:text-[#059669]" />
                <div>
                  <div className="text-[#25D366]">+51 946 085 270</div>
                  <div className="text-xs text-white/50">WhatsApp 24/7</div>
                </div>
              </WhatsAppLink>
              <a href="mailto:ventas@plastilonas.com" className="flex items-start gap-3 group">
                <Mail className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>ventas@plastilonas.com</div>
              </a>
              <div className="flex items-start gap-3 pt-1">
                <MapPin className="w-4 h-4 mt-0.5 text-white/50 flex-shrink-0" />
                <div className="text-xs leading-snug">
                  Calle Alameda del Remero Mz - V, Lt - 2<br />
                  Urb. Los Huertos de Villa, Chorrillos<br />
                  Lima, Perú
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex justify-center">
          <a href="#top" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">Volver arriba <ArrowUp className="w-4 h-4" /></a>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-y-4 text-xs text-white/50">
          <div>© {currentYear} Plastilonas Peruanas SAC. Todos los derechos reservados. RUC: 20523135385</div>
          <div className="flex items-center gap-x-6">
            <Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <span className="hidden md:inline">Hecho en Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
P17_EOF

# -----------------------------------------------------------------------------
# package.json
# -----------------------------------------------------------------------------
cat > "package.json" <<'P17_EOF'
{
  "name": "plastilonas-peruanas",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:smoke": "bash scripts/smoke.sh",
    "audit:ui": "node scripts/audit-ui.mjs",
    "verify:deploy": "bash scripts/verificar-despliegue.sh",
    "vigilancia": "node scripts/vigilancia-fuentes.mjs"
  },
  "dependencies": {
    "@ai-sdk/anthropic": "^1.2.12",
    "@ai-sdk/react": "^1.2.12",
    "@hookform/resolvers": "^3.9.1",
    "@supabase/supabase-js": "^2.45.4",
    "ai": "^4.3.16",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.4",
    "date-fns": "^4.1.0",
    "framer-motion": "^11.18.2",
    "lucide-react": "^0.469.0",
    "next": "^15.5.20",
    "next-auth": "^5.0.0-beta.31",
    "pdf-lib": "^1.17.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.54.2",
    "react-icons": "^5.7.0",
    "sonner": "^1.7.1",
    "stripe": "^17.5.0",
    "tailwind-merge": "^2.6.0",
    "zod": "^3.24.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.16",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.20",
    "eslint": "^9",
    "eslint-config-next": "15.3.3",
    "jsdom": "^25.0.1",
    "postcss": "^8",
    "sharp": "^0.35.3",
    "tailwindcss": "^3.4.17",
    "typescript": "^5",
    "vitest": "^2.1.8"
  }
}
P17_EOF

# -----------------------------------------------------------------------------
# scripts/audit-ui.mjs
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/audit-ui.mjs" <<'P17_EOF'
#!/usr/bin/env node
/**
 * AUDITORÍA VISUAL AUTOMÁTICA — contraste WCAG, desbordamiento y objetivos táctiles.
 *
 * Por qué existe: los fallos de interfaz no los detecta ni TypeScript ni el
 * linter ni los tests unitarios. Se detectan mirando. Este script mira por
 * nosotros: recorre las rutas representativas en claro y oscuro, en escritorio
 * y móvil, y mide el contraste real de cada nodo de texto contra su fondo
 * efectivo.
 *
 * Encontró de verdad: el cuerpo de texto de las 12 páginas de ciudad en 1.81:1
 * (invisible en modo oscuro), el título del formulario de cotización en 1.01:1,
 * y el CTA de ciudad en 3.3:1.
 *
 * Uso:
 *   npm run build && npm run start &     # o npx next start -p 3100
 *   node scripts/audit-ui.mjs            # BASE=http://localhost:3000 por defecto
 *   node scripts/audit-ui.mjs --update   # reescribe la línea base
 *
 * Falla (exit 1) si el número de clases con fallo SUPERA la línea base de
 * docs/ui-audit-baseline.json. Es un trinquete: la interfaz solo puede mejorar.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

/* Playwright es una dependencia OPCIONAL: pesa (descarga un navegador) y solo
   hace falta para esta auditoría. Si no está, se explica cómo instalarla en
   vez de reventar con un stack trace. */
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error(
    'Falta playwright. Instálelo solo cuando vaya a auditar:\n' +
      '  npm i -D playwright && npx playwright install chromium\n',
  );
  process.exit(1);
}

const BASE = process.env.BASE || 'http://localhost:3000';
const BASELINE = 'docs/ui-audit-baseline.json';
const UPDATE = process.argv.includes('--update');

const ROUTES = [
  ['home', '/'],
  ['catalogo', '/productos'],
  ['producto', '/productos/big-bags-bolsones-polipropileno'],
  ['familia', '/productos/familia/geosinteticos'],
  ['comparar', '/productos/familia/geosinteticos/comparar'],
  ['recursos', '/recursos'],
  ['articulo', '/recursos/calculo-caudal-mangas-ventilacion-mina-subterranea'],
  ['marco', '/marco'],
  ['marco-evaluacion', '/marco/evaluacion'],
  ['soluciones', '/soluciones'],
  ['informes', '/informes'],
  ['informe', '/informes/sectores-compradores-textiles-industriales-peru'],
  ['glosario', '/glosario'],
  ['descargas', '/descargas'],
  ['termino', '/glosario/geotextil'],
  ['novedades', '/novedades'],
  ['privacidad', '/privacidad'],
  ['terminos', '/terminos'],
  ['novedad', '/novedades/marco-de-especificacion-v1'],
  ['solucion', '/soluciones/poza-revestida-impermeabilizacion'],
  ['local-hub', '/local'],
  ['ciudad', '/local/arequipa'],
  ['servicios', '/servicios'],
  ['nosotros', '/nosotros'],
  ['contacto', '/contacto'],
  ['cotizacion', '/cotizacion'],
];
const VIEWPORTS = [['desktop', 1280, 900], ['movil', 390, 844]];

/** Se ejecuta DENTRO del navegador: sin dependencias externas. */
const AUDIT = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  };
  /** Texto sobre fotografía: el contraste no es medible desde CSS. Se omite. */
  const sobreImagen = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
      if (n.tagName !== 'MAIN' && n.querySelector && n.querySelector(':scope img')) return true;
      n = n.parentElement;
    }
    return false;
  };
  const fondoEfectivo = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0.85) return bg;
      n = n.parentElement;
    }
    return parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  };

  const out = { contrast: [], overflow: 0, smallTaps: [], missingAlt: 0 };
  out.overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;

  const vistos = new Set();
  for (const el of document.querySelectorAll('main *')) {
    const texto = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (!texto || texto.length < 3) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.15) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    if (cs.position === 'absolute' && sobreImagen(el)) continue;
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.5) continue;
    const r = ratio(fg, fondoEfectivo(el));
    const size = parseFloat(cs.fontSize);
    const grande = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
    const min = grande ? 3 : 4.5;
    if (r < min) {
      const clave = `${cs.color}|${el.className}`.slice(0, 120);
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      out.contrast.push({
        ratio: +r.toFixed(2), min, texto: texto.slice(0, 45),
        cls: String(el.className).slice(0, 70), color: cs.color,
      });
    }
  }

  for (const el of document.querySelectorAll('main a, main button')) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.height < 24 || r.width < 24) {
      out.smallTaps.push({ t: (el.textContent || '').trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) });
    }
  }
  out.missingAlt = document.querySelectorAll('main img:not([alt])').length;
  return out;
};

/* En entornos donde Playwright no descargó su navegador (CI, contenedores),
   se admite un Chromium del sistema vía PLAYWRIGHT_CHROMIUM_PATH. */
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : {},
);
const informe = [];
for (const [vp, w, h] of VIEWPORTS) {
  for (const theme of ['light', 'dark']) {
    for (const [route, path] of ROUTES) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      if (theme === 'dark') await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      try {
        await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(200);
        informe.push({ vp, theme, route, path, ...(await page.evaluate(AUDIT)) });
      } catch (e) {
        console.error(`  ! ${vp}/${theme}${path}: ${e.message.split('\n')[0]}`);
      }
      await ctx.close();
    }
  }
}
await browser.close();

const clases = { light: new Set(), dark: new Set() };
for (const p of informe) for (const c of p.contrast) clases[p.theme].add(c.cls.slice(0, 50) + '|' + c.color);
const overflow = informe.filter((p) => p.overflow > 1);
const alts = informe.reduce((n, p) => n + p.missingAlt, 0);

const actual = { contrasteClaro: clases.light.size, contrasteOscuro: clases.dark.size, desbordamiento: overflow.length, imagenesSinAlt: alts };

console.log(`\nVistas auditadas: ${informe.length}`);
console.log(`Contraste — clases con fallo:  claro ${actual.contrasteClaro}   oscuro ${actual.contrasteOscuro}`);
console.log(`Desbordamiento horizontal: ${actual.desbordamiento}    Imágenes sin alt: ${actual.imagenesSinAlt}`);

const peores = new Map();
for (const p of informe) for (const c of p.contrast) {
  const k = c.cls.slice(0, 50) + '|' + c.color;
  if (!peores.has(k)) peores.set(k, { ...c, theme: p.theme, rutas: new Set() });
  peores.get(k).rutas.add(p.route);
}
console.log('\nPeores casos:');
[...peores.values()].sort((a, b) => a.ratio - b.ratio).slice(0, 10)
  .forEach((c) => console.log(`  ${String(c.ratio).padStart(5)} (min ${c.min}) ${c.theme.padEnd(5)} [${c.cls.slice(0, 44)}] → ${[...c.rutas].slice(0, 3).join(',')}`));

if (UPDATE || !existsSync(BASELINE)) {
  writeFileSync(BASELINE, JSON.stringify(actual, null, 2) + '\n');
  console.log(`\nLínea base escrita en ${BASELINE}.`);
  process.exit(0);
}

const base = JSON.parse(readFileSync(BASELINE, 'utf8'));
const regresiones = Object.entries(actual).filter(([k, v]) => v > (base[k] ?? 0));
if (regresiones.length) {
  console.error('\nREGRESIÓN respecto de la línea base:');
  for (const [k, v] of regresiones) console.error(`  ${k}: ${base[k]} → ${v}`);
  console.error('\nCorrija, o justifique y actualice con --update.');
  process.exit(1);
}
console.log('\nSin regresiones respecto de la línea base.');
P17_EOF

# -----------------------------------------------------------------------------
# scripts/verificar-despliegue.sh
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/verificar-despliegue.sh" <<'P17_EOF'
#!/usr/bin/env bash
# =============================================================================
#  Verificación de despliegue — espera al commit correcto y luego comprueba.
#
#  El problema que resuelve: tras `git push`, Vercel tarda entre uno y tres
#  minutos en construir. Correr los curls de inmediato interroga al despliegue
#  ANTERIOR y devuelve 404 en rutas que sí existen. Eso parece un defecto del
#  código, no lo es, y enseña a desconfiar de la verificación.
#
#  Este script pregunta a /version.json qué commit está sirviendo el sitio y no
#  comprueba nada hasta que coincide con el que usted acaba de subir.
#
#  Uso:
#    npm run verify:deploy                 # verifica el HEAD local
#    COMMIT=22e3673 npm run verify:deploy  # verifica un commit concreto
#    BASE_URL=https://otro.vercel.app npm run verify:deploy
#
#  Salida: 0 si todo pasa, 1 si algo falla o si el despliegue no llegó a
#  tiempo. Apto para CI.
# =============================================================================
set -uo pipefail

# El origen sale de lib/site.ts, la única fuente de verdad del dominio: el día
# de la migración a plastilonas.com este script la sigue sin tocarse.
# Se ancla a principio de línea para no capturar la URL de ejemplo que vive
# dentro del comentario de migración a plastilonas.com.
SITE_URL=$(grep -oE '^[[:space:]]*url:[[:space:]]*"[^"]+"' lib/site.ts | head -1 | sed 's/.*"\(.*\)"/\1/')
BASE_URL="${BASE_URL:-$SITE_URL}"
ESPERA_MAX="${ESPERA_MAX:-300}"   # segundos
INTERVALO="${INTERVALO:-10}"

# El commit esperado: el que se pase por entorno, o el HEAD del repo local.
COMMIT="${COMMIT:-$(git rev-parse --short=7 HEAD 2>/dev/null || echo '')}"

pass=0; fail=0
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; pass=$((pass+1)); }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; fail=$((fail+1)); }

# --- 1. Esperar a que el despliegue sirva el commit esperado -----------------

echo "Verificando $BASE_URL"
if [ -z "$COMMIT" ]; then
  echo "  ! Sin commit esperado (¿fuera de un repo git?): se verifica lo que haya en línea."
else
  echo "  Esperando al commit $COMMIT (máximo ${ESPERA_MAX}s)…"
  transcurrido=0
  servido=""
  while [ "$transcurrido" -lt "$ESPERA_MAX" ]; do
    servido=$(curl -sf "$BASE_URL/version.json" 2>/dev/null \
      | grep -o '"commitShort": *"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
    if [ "$servido" = "$COMMIT" ]; then
      echo "  → desplegado tras ${transcurrido}s"
      break
    fi
    sleep "$INTERVALO"
    transcurrido=$((transcurrido + INTERVALO))
    printf '    …%ss (sirviendo %s)\n' "$transcurrido" "${servido:-desconocido}"
  done
  if [ "$servido" != "$COMMIT" ]; then
    echo ""
    # printf y no echo: echo no interpreta \033 y la advertencia salía con las
    # secuencias de color en crudo, justo en el mensaje que hay que leer bien.
    printf '  \033[31mEl despliegue no llegó en %ss.\033[0m\n' "$ESPERA_MAX"
    if [ -z "$servido" ]; then
      echo "  /version.json no responde: el despliegue en línea es anterior a P14,"
      echo "  o el build falló. Revíselo en el panel de Vercel antes de dar nada por roto."
    else
      echo "  Sirviendo todavía: $servido"
      echo "  Revise el build en el panel de Vercel antes de dar nada por roto."
    fi
    exit 1
  fi
fi

echo ""

# --- 2. Comprobaciones ------------------------------------------------------

estado() { curl -s -o /dev/null -w '%{http_code}' "$BASE_URL$1"; }
cuerpo() { curl -s "$BASE_URL$1"; }

ruta() { # <ruta> [status esperado]
  local got; got=$(estado "$1")
  [ "$got" = "${2:-200}" ] && ok "$1 → $got" || bad "$1 → $got (esperado ${2:-200})"
}

# Se usa here-string y NO tubería: con `set -o pipefail`, `grep -q` cierra la
# entrada al primer acierto, curl muere con SIGPIPE y el pipeline devuelve
# fallo aunque el patrón SÍ estuviera. Este script existe para dar respuestas
# fiables; un falso negativo suyo sería peor que no tenerlo.
contiene() { # <ruta> <patrón> <descripción>
  local b; b=$(cuerpo "$1")
  if grep -q "$2" <<< "$b"; then ok "$3"; else bad "$3"; fi
}

cuenta() { # <ruta> <patrón> <mínimo> <descripción>
  local b n; b=$(cuerpo "$1"); n=$(grep -c "$2" <<< "$b")
  if [ "$n" -ge "$3" ]; then ok "$4 ($n)"; else bad "$4 (obtuvo $n, mínimo $3)"; fi
}

echo "— Rutas —"
for r in / /productos /servicios /nosotros /contacto /cotizacion /recursos \
         /local /marco /marco/evaluacion /soluciones /novedades /glosario \
         /informes /descargas /privacidad /terminos; do
  ruta "$r"
done

echo "— Archivos para rastreadores —"
ruta /robots.txt
ruta /sitemap.xml
ruta /llms.txt
ruta /novedades/rss.xml
ruta /novedades/feed.json
ruta /glosario/terminos.json
ruta /productos/catalogo.json
ruta /version.json

echo "— Documentos descargables —"
# Un PDF que responde 200 pero devuelve HTML es un enlace roto que no lo parece.
pdf() { # <ruta>
  local ct; ct=$(curl -s -o /dev/null -w '%{content_type}' "$BASE_URL$1")
  case "$ct" in
    application/pdf*) ok "$1 → application/pdf" ;;
    *) bad "$1 → $ct (esperado application/pdf)" ;;
  esac
}
pdf /marco/marco.pdf
pdf /glosario/glosario.pdf
pdf /informes/sectores-compradores-textiles-industriales-peru/informe.pdf
pdf /productos/big-bags-bolsones-polipropileno/ficha-tecnica.pdf
pdf /recursos/instalacion-geomembranas-hdpe-pozas-canales/guia.pdf
pdf /soluciones/poza-revestida-impermeabilizacion/arquitectura.pdf

echo "— Entidad y datos estructurados —"
contiene "/" '"@id":"[^"]*#organization"' "grafo de entidad con @id estable"
contiene "/soluciones/poza-revestida-impermeabilizacion" '"@type":"HowTo"' "arquitecturas emiten HowTo"
contiene "/marco" '"@type":"FAQPage"' "el marco emite FAQPage"
# En expresión regular básica el + es literal: escribirlo como \+ lo convierte
# en cuantificador y el patrón pasa a buscar "application/rssxml".
contiene "/" 'application/rss+xml' "feed declarado en toda página"
contiene "/glosario" '"@type":"DefinedTermSet"' "el glosario emite DefinedTermSet"
contiene "/glosario/geotextil" '"@type":"DefinedTerm"' "cada término emite DefinedTerm"
contiene "/informes/sectores-compradores-textiles-industriales-peru" '"@type":"Dataset"' "el informe emite Dataset con procedencia"

echo "— Contenido esperado —"
# Los mínimos son cotas inferiores medidas, no cifras exactas: el sitemap
# crece con el catálogo y una igualdad estricta obligaría a editar este script
# en cada patch, que es justo como una verificación deja de correrse.
cuenta "/sitemap.xml" '<loc>'       100 "URLs en el sitemap"
cuenta "/sitemap.xml" 'soluciones'    7 "arquitecturas en el sitemap"
cuenta "/sitemap.xml" 'novedades'     8 "novedades en el sitemap"
cuenta "/novedades/rss.xml" '<item>'  7 "entradas en el feed RSS"
contiene "/llms.txt" 'Arquitecturas de referencia' "llms.txt declara arquitecturas"
contiene "/llms.txt" 'Novedades (registro fechado)' "llms.txt declara el registro"
contiene "/llms.txt" 'Glosario técnico' "llms.txt declara el glosario"
contiene "/glosario/terminos.json" 'atribucionSugerida' "el volcado declara cómo citarlo"
contiene "/descargas" '"@type":"DataCatalog"' "el centro de documentación emite DataCatalog"
contiene "/productos/catalogo.json" 'atribucionSugerida' "el catálogo declara cómo citarlo"
contiene "/llms.txt" 'Documentos descargables' "llms.txt declara los documentos"
contiene "/llms.txt" 'Informes del sector' "llms.txt declara los informes"

echo "— Ningún dato inventado a la vista —"
# El catálogo abierto no debe publicar precios: lo que no se sostiene en la
# cotización no se publica en datos.
if grep -qE '"(precio|price|offers|stock)"' <<< "$(cuerpo /productos/catalogo.json)"; then
  bad "el catálogo en JSON expone precios o existencias"
else
  ok "el catálogo en JSON no publica precios ni existencias"
fi

# El informe debe declarar sus límites en la página, no solo en el PDF.
contiene "/informes/sectores-compradores-textiles-industriales-peru" 'NO afirma' "el informe declara qué no afirma"
home=$(cuerpo "/")
n=$(grep -o 'data-social="[a-z]*"' <<< "$home" | sort -u | wc -l)
if [ "$n" -le 2 ]; then ok "sólo perfiles sociales reales ($n)"; else
  bad "hay $n perfiles sociales renderizados; sólo WhatsApp y Facebook son reales"; fi
if grep -q 'href="https://www.instagram.com/"' <<< "$home"; then
  bad "perfil marcador de Instagram visible"; else ok "sin perfiles marcadores"; fi

echo ""
printf 'Resultado: \033[32m%s correctas\033[0m, ' "$pass"
if [ "$fail" -eq 0 ]; then printf '\033[32m0 fallos\033[0m\n'; else printf '\033[31m%s fallos\033[0m\n' "$fail"; fi
[ "$fail" -eq 0 ] || exit 1
P17_EOF

chmod +x scripts/verificar-despliegue.sh scripts/vigilancia-fuentes.mjs
# -----------------------------------------------------------------------------
echo ""
echo "P17 aplicado."
echo "  nuevos      lib/informes.ts, lib/doc-informe.ts"
echo "              components/BarChart.tsx"
echo "              app/informes/page.tsx + [slug] + informe.pdf"
echo "              scripts/vigilancia-fuentes.mjs, test/informes.test.ts"
echo "  modificados lib/format.ts (numeroPE), lib/schema.ts (Dataset),"
echo "              globals.css (paleta de graficos validada), analytics,"
echo "              TrackView, descargas, novedades, sitemap, llms.txt,"
echo "              Navbar, Footer, package.json, audit-ui, verificar-despliegue"
echo ""
echo "Siguiente paso:"
echo "  npx tsc --noEmit && npx next lint && npm test && npm run build"
echo "  (esperado: 291 tests en 20 archivos, 231 paginas)"
echo ""
echo "Despues del push:"
echo "  npm run verify:deploy      (esperado: 54 correctas, 0 fallos)"
echo "  npm run vigilancia         (comprueba las fuentes citadas)"
