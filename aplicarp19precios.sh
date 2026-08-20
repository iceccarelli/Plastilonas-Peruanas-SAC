#!/usr/bin/env bash
# =============================================================================
#  P19 — Por qué cambia el precio de una plastilona
#  Plastilonas Peruanas SAC
#
#  LA DECISIÓN, ANTES QUE EL CÓDIGO
#  --------------------------------
#  Se pidió publicar los precios y las cotizaciones que mueven este rubro. Este
#  parche NO publica un tablero de precios en vivo, por dos razones dirimentes:
#
#   1. Una serie de precios que se queda vieja es peor que ninguna. Un comprador
#      que cotiza contra un número desactualizado nuestro toma una mala decisión
#      y nos la atribuye, con razón.
#   2. Las series de precios de resina son producto comercial de agencias como
#      ICIS. Se pueden CITAR con atribución; redistribuirlas, no.
#
#  Lo que sí se publica —y no lo hace nadie más en este mercado— es la cadena de
#  formación del costo con el dato verificable de cada eslabón, y QUÉ INDICADOR
#  PÚBLICO puede mirar el comprador por su cuenta. Eso no caduca en dos semanas.
#
#  EL INFORME
#  ----------
#  Cuatro capas, cada una con su fuente:
#   - Nafta CFR Japón: 559 US$/t en feb 2026, 852 en mar (+52 % en un mes), 652
#     a mediados de junio  [ICIS, John Richardson, 23 jun 2026]
#   - PP grado rafia —el que se teje para big bags—: +290, +128 y +31 US$/t en
#     mar, abr y may; máximo 1 275, retroceso a 1 075  [ICIS]
#   - Flete: índice Drewry en 2 712 US$ por contenedor de 40 pies el 21 may 2026,
#     +6 % semanal  [Drewry WCI, publicación semanal de acceso libre]
#   - Tipo de cambio: 3,748 S//US$ en ene 2025 a 3,400 en jul 2026, cerca de un
#     9 % de apreciación del sol  [BCRP, serie PN01246PM]
#
#  Explica además el desfase por inventario —por qué la bajada del petróleo
#  tarda en llegar a una cotización, y por qué corre igual en los dos sentidos—
#  y cierra con una sección que responde de frente la pregunta más incómoda:
#  por qué no publicamos lista de precios.
#
#  GRÁFICO DE LÍNEA NUEVO
#  ----------------------
#  Una trayectoria de diecinueve meses en barras obliga a comparar alturas
#  contiguas; la línea muestra hacia dónde va. Renderizado en servidor, sin
#  JavaScript, con tabla desplegable. Especificaciones de la guía de marcas:
#  línea de 2 px, rejilla sólida y discreta, etiquetas sólo en los extremos,
#  marcadores con anillo del color de la superficie. El eje NO arranca en cero
#  —en una variable entre 3,3 y 3,8 el cero aplana la serie— y la nota al pie
#  lo declara, que es lo que separa truncar de engañar.
#
#  TRES DEFECTOS CORREGIDOS DE PASO
#  --------------------------------
#   1. Dos fuentes decían haberse verificado MAÑANA. El reporte de vigilancia lo
#      delató imprimiendo "verificada hace -1 días". Corregidas, y un test nuevo
#      prohíbe fechar una verificación en el futuro.
#   2. La lista blanca de rutas del test de novedades nunca incorporó
#      /privacidad ni /terminos cuando P13 las creó: un enlace legítimo a
#      /terminos hacía fallar la suite.
#   3. Un test usaba la bandera /s de expresión regular, no disponible con el
#      target de TypeScript del proyecto.
#
#  Uso:
#    ls aplicar*p19*
#    bash aplicarp19precios.sh
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
cat > "lib/informes.ts" <<'P19_EOF'
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

export type TipoGrafico = 'magnitud' | 'divergente' | 'serie-temporal';

export interface Grafico {
  titulo: string;
  /** Qué se está midiendo y en qué unidad. */
  unidad: string;
  tipo: TipoGrafico;
  fuenteId: string;
  /** Nota al pie del gráfico: alcance, criterio de orden, qué no muestra. */
  nota: string;
  datos: { etiqueta: string; valor: number }[];
  /**
   * Serie temporal: número de decimales a mostrar y cada cuántos puntos se
   * rotula el eje. Una serie mensual larga con todas las etiquetas es ilegible.
   */
  decimales?: number;
  cadaN?: number;
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
      consultado: '2026-08-20',
      respalda:
        'Agroexportaciones peruanas de 2025 por encima de 15 000 millones de dólares, según MIDAGRI.',
    },
    {
      id: 'midagri-cuatrimestre-2025',
      organismo: 'Ministerio de Desarrollo Agrario y Riego (MIDAGRI), declaraciones del ministro recogidas por Agraria.pe',
      titulo: 'Agroexportaciones peruanas: primer cuatrimestre de 2025 y base 2024',
      url: 'https://agraria.pe/noticias/agroexportaciones-peruanas-alcanzarian-los-us-15-000-millone-39842',
      publicado: '2025-06-20',
      consultado: '2026-08-20',
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


/**
 * Informe 2 — Formación de precio y volatilidad.
 *
 * DECISIÓN EDITORIAL, porque es la que sostiene todo lo demás: este informe NO
 * publica precios en vivo ni un índice propio. Dos razones, ambas dirimentes.
 *
 * Primera: una serie de precios que se queda vieja es peor que ninguna. Un
 * comprador que cotiza contra un número desactualizado nuestro toma una mala
 * decisión y nos la atribuye, con razón.
 *
 * Segunda: las series de precios de resina son producto comercial de agencias
 * como ICIS. Se pueden CITAR con atribución; redistribuirlas como si fueran
 * nuestras no.
 *
 * Lo que sí se publica, y no lo hace nadie más en este mercado, es la cadena de
 * formación del costo explicada con datos verificables, y QUÉ INDICADOR PÚBLICO
 * puede mirar el comprador por su cuenta para anticipar hacia dónde va. Eso es
 * útil de forma indefinida, no caduca en dos semanas y convierte una pregunta
 * incómoda —"¿por qué me subió la cotización?"— en una explicación con fuente.
 */
const formacionDePrecio: Informe = {
  slug: 'formacion-de-precio-y-volatilidad-textiles-industriales',
  titulo: 'Por qué cambia el precio de una plastilona',
  subtitulo:
    'La cadena que va del petróleo a la lona terminada, con el dato público de cada eslabón y qué indicador mirar para anticiparlo.',
  metaTitle: 'Por qué sube y baja el precio de plastilonas, big bags y geomembranas en el Perú',
  metaDescription:
    'La cadena de formación de costo de los textiles industriales y geosintéticos: nafta, resina PP y PE, flete marítimo y tipo de cambio. Con las cifras de ICIS, Drewry y el BCRP, y los indicadores públicos que cualquier comprador puede consultar.',
  fecha: '2026-08-20',
  version: '1.0',
  resumenEjecutivo: [
    'Una plastilona, un big bag y una geomembrana son, en su mayor parte, resina de polipropileno o polietileno: su precio se forma tres eslabones más arriba, en el petróleo y el gas.',
    'La nafta CFR Japón —principal materia prima de la resina en Asia— pasó de 559 a 852 dólares por tonelada entre febrero y marzo de 2026, una variación del 52 % en un mes, y retrocedió a 652 dólares hacia mediados de junio, según ICIS.',
    'El polipropileno grado rafia, que es el que se teje para big bags y sacos, acumuló alzas de 290, 128 y 31 dólares por tonelada en marzo, abril y mayo de 2026, y luego cedió desde 1 275 a 1 075 dólares por tonelada.',
    'Para las líneas importadas se suma el flete: el índice compuesto de Drewry se situó en 2 712 dólares por contenedor de cuarenta pies el 21 de mayo de 2026, un 6 % por encima de la semana anterior.',
    'La cuarta capa es cambiaria y juega a favor del comprador peruano: el sol pasó de 3,748 por dólar en enero de 2025 a 3,400 en julio de 2026, una apreciación cercana al 9 % que amortigua parte del alza en dólares.',
    'Los cuatro eslabones se mueven en plazos distintos, y esa asincronía —no la mala fe de nadie— es la razón por la que una cotización de hace seis semanas ya no vale.',
    'Este informe no publica precios de resina en vivo ni un índice propio: indica qué indicador público consultar en cada eslabón.',
  ],
  secciones: [
    {
      heading: 'La cadena, eslabón por eslabón',
      cuerpo: [
        'Casi todo lo que fabricamos empieza siendo un hidrocarburo. El petróleo y el gas natural se transforman en nafta o etano; la nafta se craquea para obtener etileno y propileno; esos monómeros se polimerizan en polietileno y polipropileno; la resina se extruye en hilo o en lámina; el hilo se teje y la tela se recubre. Recién ahí aparece algo que un comprador reconoce como una lona, un bolsón o una geomembrana.',
        'Cada paso añade costo de transformación, pero ninguno de esos costos se mueve como se mueve el primero. La mano de obra, la energía de planta y la amortización cambian de año en año; la materia prima cambia de semana en semana. Por eso el precio final se explica, casi siempre, mirando el primer eslabón.',
        'A esa cadena de materia se le suman dos capas que no son físicas y pesan igual: el flete internacional, en las líneas que se importan, y el tipo de cambio, porque la resina se compra en dólares y la venta se factura en soles.',
      ],
      implicacion:
        'La consecuencia práctica es que quien cotiza una plastilona no está fijando el precio de una tela: está trasladando el precio de una resina que él tampoco controla. Entender eso cambia la conversación de compra: la pregunta útil no es "¿por qué está más caro?", sino "¿en qué momento del ciclo estamos y cuánto dura esta ventana?".',
    },
    {
      heading: 'El primer eslabón: la nafta se movió 52 % en un mes',
      cuerpo: [
        'ICIS, la agencia de referencia en precios de químicos, documentó que la nafta CFR Japón pasó de 559 dólares por tonelada en febrero de 2026 a 852 en marzo, y retrocedió a 652 hacia mediados de junio.',
        'Un salto del 52 % en cuatro semanas no es una anomalía del mercado de plásticos: es su comportamiento normal. Lo llamativo no es la magnitud, sino la velocidad, y esa velocidad es la que ningún fabricante puede absorber en su margen indefinidamente.',
      ],
      indicadores: [
        {
          etiqueta: 'Nafta CFR Japón',
          valor: '559',
          unidad: 'US$ por tonelada',
          periodo: 'Febrero de 2026',
          fuenteId: 'icis-nafta-2026',
        },
        {
          etiqueta: 'Nafta CFR Japón',
          valor: '852',
          unidad: 'US$ por tonelada',
          periodo: 'Marzo de 2026',
          variacion: { pct: 52.4, base: 'febrero de 2026' },
          fuenteId: 'icis-nafta-2026',
        },
        {
          etiqueta: 'Nafta CFR Japón',
          valor: '652',
          unidad: 'US$ por tonelada',
          periodo: 'Mediados de junio de 2026',
          fuenteId: 'icis-nafta-2026',
        },
      ],
      grafico: {
        titulo: 'Nafta CFR Japón en tres momentos de 2026',
        unidad: 'US$ por tonelada',
        tipo: 'magnitud',
        fuenteId: 'icis-nafta-2026',
        nota: 'Tres observaciones puntuales documentadas por ICIS, no una serie continua: entre marzo y junio hubo movimientos intermedios que estas tres barras no muestran. Sirven para dimensionar la amplitud del ciclo, no para interpolar un valor de una fecha concreta.',
        datos: [
          { etiqueta: 'Febrero', valor: 559 },
          { etiqueta: 'Marzo', valor: 852 },
          { etiqueta: 'Junio (mediados)', valor: 652 },
        ],
      },
      implicacion:
        'Para un comprador esto significa que el plazo de validez de una cotización es una condición técnica, no un ardid comercial. Cuando la materia prima puede moverse la mitad de su valor en un mes, sostener un precio noventa días exige inmovilizar inventario o cubrirse, y ambas cosas cuestan. Una cotización con validez corta y precio ajustado y otra con validez larga y precio con colchón no son la misma oferta a distinto precio: son dos formas distintas de repartir el mismo riesgo.',
    },
    {
      heading: 'El segundo eslabón: la resina que efectivamente se teje',
      cuerpo: [
        'El grado que importa para envases y sacos es el polipropileno rafia, que es literalmente el que se extruye en cintas y se teje. Según ICIS, acumuló alzas de 290, 128 y 31 dólares por tonelada en marzo, abril y mayo de 2026, y después cedió desde un máximo de 1 275 a 1 075 dólares por tonelada hacia mediados de junio.',
        'El polietileno de alta densidad grado inyección se movió en paralelo pero con menor amplitud: 188, 129 y 5 dólares en los mismos tres meses, con un máximo de 1 105 y un retroceso a 1 010 dólares por tonelada.',
        'Que la resina suba menos que la nafta en el primer mes y siga subiendo cuando la nafta ya cayó no es una incoherencia: es el efecto del inventario. El productor que compró materia prima barata en febrero todavía la está transformando en marzo, y el que la compró cara en marzo la traslada en abril y mayo.',
      ],
      grafico: {
        titulo: 'Alza mensual acumulada del polipropileno grado rafia, 2026',
        unidad: 'US$ por tonelada de incremento sobre el mes anterior',
        tipo: 'magnitud',
        fuenteId: 'icis-nafta-2026',
        nota: 'Incrementos mensuales sucesivos, no niveles de precio: las tres barras suman 449 dólares por tonelada de alza acumulada entre marzo y mayo. El nivel absoluto alcanzó un máximo de 1 275 dólares por tonelada y retrocedió después a 1 075.',
        datos: [
          { etiqueta: 'Marzo', valor: 290 },
          { etiqueta: 'Abril', valor: 128 },
          { etiqueta: 'Mayo', valor: 31 },
        ],
      },
      implicacion:
        'El desfase por inventario explica la queja más frecuente que recibimos: "el petróleo bajó, ¿por qué mi cotización no?". La respuesta honesta es que el material que se está fabricando hoy se compró hace semanas. El desfase corre en los dos sentidos y con la misma duración: quien reclama que la bajada tarda en llegar también recibió, meses antes, un precio que todavía no reflejaba la subida.',
    },
    {
      heading: 'La tercera capa: el flete de las líneas importadas',
      cuerpo: [
        'Parte del catálogo se fabrica en el Perú y parte se importa. Para lo segundo, el flete marítimo es una capa de costo propia, con su propio ciclo, que no guarda relación con el precio de la resina.',
        'El índice compuesto de Drewry, referencia pública semanal del transporte en contenedor, se situó en 2 712 dólares por contenedor de cuarenta pies el 21 de mayo de 2026, un 6 % por encima de la semana anterior, impulsado sobre todo por las rutas de Asia a Europa.',
      ],
      indicadores: [
        {
          etiqueta: 'Índice compuesto Drewry (WCI)',
          valor: '2 712',
          unidad: 'US$ por contenedor de 40 pies',
          periodo: '21 de mayo de 2026',
          variacion: { pct: 6, base: 'la semana anterior' },
          fuenteId: 'drewry-wci-2026',
        },
      ],
      implicacion:
        'Esta capa es la que hace que dos cotizaciones del mismo producto puedan diferir sin que ninguna esté mal. Una línea de fabricación propia y una de importación directa no comparten estructura de costo ni de plazo, y por eso cada ficha de nuestro catálogo declara cómo se abastece. No es un dato administrativo: es la mitad de la explicación de su precio y de su tiempo de entrega.',
    },
    {
      heading: 'La cuarta capa: el tipo de cambio, que esta vez juega a favor',
      cuerpo: [
        'La resina se compra en dólares y la venta se factura en soles, de modo que el tipo de cambio es un componente del precio final tan real como la materia prima.',
        'Según la serie del Banco Central de Reserva del Perú, el tipo de cambio nominal promedio pasó de 3,748 soles por dólar en enero de 2025 a 3,400 en julio de 2026: una apreciación del sol cercana al 9 %.',
        'En el mismo periodo en que la resina en dólares subió, el dólar se abarató en soles. Las dos fuerzas se compensan parcialmente, y por eso el precio en soles de un producto importado no se mueve en la misma proporción que su insumo en dólares.',
      ],
      grafico: {
        titulo: 'Tipo de cambio nominal promedio, enero de 2025 a julio de 2026',
        unidad: 'soles por dólar',
        tipo: 'serie-temporal',
        fuenteId: 'bcrp-tipo-cambio',
        decimales: 3,
        cadaN: 3,
        nota: 'Serie PN01246PM del BCRP, promedio mensual. El eje vertical no arranca en cero: en una variable que se mueve entre 3,3 y 3,8 el cero aplanaría la serie hasta volverla ilegible. Un promedio mensual tampoco muestra la variación dentro del mes, que es la que enfrenta quien paga una factura en una fecha concreta.',
        datos: [
          { etiqueta: 'Ene 25', valor: 3.748 },
          { etiqueta: 'Feb 25', valor: 3.698 },
          { etiqueta: 'Mar 25', valor: 3.653 },
          { etiqueta: 'Abr 25', valor: 3.7 },
          { etiqueta: 'May 25', valor: 3.66 },
          { etiqueta: 'Jun 25', valor: 3.604 },
          { etiqueta: 'Jul 25', valor: 3.556 },
          { etiqueta: 'Ago 25', valor: 3.543 },
          { etiqueta: 'Set 25', valor: 3.503 },
          { etiqueta: 'Oct 25', valor: 3.414 },
          { etiqueta: 'Nov 25', valor: 3.373 },
          { etiqueta: 'Dic 25', valor: 3.367 },
          { etiqueta: 'Ene 26', valor: 3.357 },
          { etiqueta: 'Feb 26', valor: 3.357 },
          { etiqueta: 'Mar 26', valor: 3.447 },
          { etiqueta: 'Abr 26', valor: 3.443 },
          { etiqueta: 'May 26', valor: 3.435 },
          { etiqueta: 'Jun 26', valor: 3.405 },
          { etiqueta: 'Jul 26', valor: 3.4 },
        ],
      },
      implicacion:
        'Para una compra grande con entrega diferida, el tipo de cambio deja de ser un detalle contable. Conviene acordar por escrito en qué moneda se pacta y con qué referencia se convierte, porque si eso no está definido, la diferencia aparece en la facturación y se discute cuando el material ya está en obra. Es exactamente el tipo de dato que el pilar de documentación de nuestro Marco de Especificación pide cerrar antes de cotizar.',
    },
    {
      heading: 'Qué indicador mirar usted mismo',
      cuerpo: [
        'No hace falta contratar un servicio de información de precios para anticipar la dirección. Con cuatro indicadores públicos y gratuitos se cubre toda la cadena, y ninguno depende de que nosotros se lo contemos.',
      ],
      indicadores: [
        {
          etiqueta: 'Tipo de cambio, serie oficial',
          valor: 'BCRP',
          unidad: 'serie PN01246PM, mensual y diaria',
          periodo: 'Actualización continua',
          fuenteId: 'bcrp-tipo-cambio',
        },
        {
          etiqueta: 'Flete en contenedor',
          valor: 'Drewry WCI',
          unidad: 'índice compuesto semanal, acceso libre',
          periodo: 'Actualización semanal',
          fuenteId: 'drewry-wci-2026',
        },
      ],
      implicacion:
        'La regla práctica: el tipo de cambio y el flete los puede seguir usted en fuentes abiertas y gratuitas. El precio de la resina requiere un servicio de pago —ICIS, entre otros— porque es un producto comercial, pero su dirección se anticipa razonablemente bien mirando el crudo y la nafta, que sí son públicos. Y el desfase por inventario significa que lo que ve hoy en el crudo llega a su cotización con semanas de retraso, lo que le da una ventana para decidir si compra ahora o espera.',
    },
    {
      heading: 'Por qué no publicamos lista de precios',
      cuerpo: [
        'Es la pregunta que más veces nos hacen y merece una respuesta directa, no una evasiva comercial.',
        'La primera razón es la de este informe: con una materia prima que puede moverse la mitad de su valor en un mes, una lista publicada estaría equivocada la mayor parte del tiempo. Estaría alta cuando el mercado bajó, y sería insostenible cuando el mercado subió.',
        'La segunda es que la mayor parte del catálogo es fabricación a medida. No hay un precio por metro cuadrado independiente del ancho de rollo, del gramaje, de la cantidad, del acabado y de la ciudad de entrega; publicar uno obligaría a poner el número más alto de todos los escenarios posibles para no quedar corto.',
        'La tercera es de honestidad elemental: un precio publicado que después no se sostiene en la cotización es peor que no publicar ninguno.',
      ],
      implicacion:
        'Lo que sí puede exigirnos, y debería exigirle a cualquier proveedor: que la cotización declare su plazo de validez, en qué moneda está pactada y qué incluye exactamente en materia de especificación, documentación y entrega. Eso es verificable y comparable. Un número suelto sin esas cuatro cosas no se puede comparar con nada.',
    },
  ],
  limitaciones: [
    'Este informe NO publica precios de resina en vivo ni un índice propio. Las cifras citadas son observaciones fechadas de 2026 tomadas de sus fuentes, no una serie continua ni una referencia vigente: no las use para cotizar.',
    'Las series de precios de resina son producto comercial de agencias especializadas. Acá se citan con atribución para explicar un mecanismo; no se redistribuyen ni se ofrecen como servicio de información de precios.',
    'Los precios de nafta y resina citados son referencias asiáticas (CFR Japón y el mercado del sudeste asiático). El Perú se abastece por varias rutas y el precio de reposición local puede diferir en nivel, aunque la dirección del ciclo suele ser común.',
    'No se publica la estructura de costo de ningún producto nuestro ni la participación porcentual de la resina en el precio final. Varía por línea y por lote, y una cifra promedio presentada como regla induciría a error.',
    'El desfase entre el movimiento del insumo y el del producto terminado se describe cualitativamente. No cuantificamos su duración porque depende del inventario de cada fabricante, que no es un dato público.',
    'Ninguna sección constituye una recomendación de compra, de cobertura cambiaria ni una previsión de precios propia. Las trayectorias mencionadas por terceros se identifican como suyas.',
  ],
  fuentes: [
    {
      id: 'icis-nafta-2026',
      organismo: 'ICIS (Independent Commodity Intelligence Services)',
      titulo: 'HDPE, PP and naphtha pricing in 2026 underline why timing is everything, por John Richardson',
      url: 'https://www.icis.com/asian-chemical-connections/2026/06/hdpe-pp-and-naphtha-pricing-in-2026-underline-why-timing-is-everything/',
      publicado: '2026-06-23',
      consultado: '2026-08-20',
      respalda:
        'Nafta CFR Japón de 559 US$/t en febrero de 2026, 852 en marzo y 652 hacia mediados de junio; alzas de PP rafia de 290, 128 y 31 US$/t en marzo, abril y mayo, con máximo de 1 275 y retroceso a 1 075; y de HDPE inyección de 188, 129 y 5 US$/t, con máximo de 1 105 y retroceso a 1 010.',
    },
    {
      id: 'drewry-wci-2026',
      organismo: 'Drewry Supply Chain Advisors',
      titulo: 'World Container Index',
      url: 'https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry',
      publicado: '2026-05-21',
      consultado: '2026-08-20',
      respalda:
        'Índice compuesto de 2 712 dólares por contenedor de cuarenta pies el 21 de mayo de 2026, con alza semanal del 6 % impulsada por las rutas de Asia a Europa, y carácter de publicación semanal de acceso libre.',
    },
    {
      id: 'bcrp-tipo-cambio',
      organismo: 'Banco Central de Reserva del Perú (BCRP)',
      titulo: 'Tipo de cambio nominal promedio, serie PN01246PM',
      url: 'https://estadisticas.bcrp.gob.pe/estadisticas/series/mensuales/resultados/PN01246PM/html',
      publicado: '2026-08-01',
      consultado: '2026-08-20',
      respalda:
        'Serie mensual del tipo de cambio nominal promedio en soles por dólar entre enero de 2025 y julio de 2026, de 3,748 a 3,400.',
    },
  ],
};

export const informes: Informe[] = [sectoresCompradores, formacionDePrecio];

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
P19_EOF

# -----------------------------------------------------------------------------
# components/LineChart.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/LineChart.tsx" <<'P19_EOF'
import type { Grafico } from '@/lib/informes';
import { numeroPE } from '@/lib/format';

/**
 * Serie temporal en SVG, renderizada en el servidor.
 *
 * Cuándo esta forma y no barras: cuando lo que hay que leer es la TRAYECTORIA.
 * Una serie de diecinueve meses en barras obliga a comparar alturas contiguas;
 * la línea muestra de un vistazo hacia dónde va, que es la pregunta real
 * cuando se habla de volatilidad.
 *
 * Especificaciones tomadas de la guía de marcas, no improvisadas:
 *  - línea de 2 px, uniones y extremos redondeados;
 *  - rejilla de un paso respecto de la superficie, sólida y discreta — nunca
 *    punteada, que compite con el dato;
 *  - una sola serie: sin leyenda, el título la nombra;
 *  - se rotulan el primer y el último punto, no todos: un número sobre cada
 *    punto convierte el gráfico en una tabla mal maquetada;
 *  - los marcadores llevan anillo del color de la superficie para seguir
 *    legibles donde cruzan la línea;
 *  - el texto nunca lleva el color de la serie: el color lo porta la línea.
 *
 * El eje NO arranca en cero, y es deliberado: en un tipo de cambio que se
 * mueve entre 3,3 y 3,8 forzar el cero aplana la serie hasta volverla inútil.
 * La regla del cero obligatorio vale para magnitudes que se comparan por
 * área o longitud, no para una trayectoria. La nota al pie lo declara.
 */

const ANCHO = 720;
const ALTO = 260;
const M = { arriba: 24, derecha: 58, abajo: 34, izquierda: 52 };

export default function LineChart({ grafico }: { grafico: Grafico }) {
  const { datos, decimales = 2, cadaN = 3 } = grafico;
  const valores = datos.map((d) => d.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  // Margen del 8 % arriba y abajo para que la línea no toque los bordes.
  const holgura = (max - min) * 0.08 || 0.1;
  const lo = min - holgura;
  const hi = max + holgura;

  const anchoTrazado = ANCHO - M.izquierda - M.derecha;
  const altoTrazado = ALTO - M.arriba - M.abajo;
  const x = (i: number) => M.izquierda + (i / Math.max(datos.length - 1, 1)) * anchoTrazado;
  const y = (v: number) => M.arriba + (1 - (v - lo) / (hi - lo)) * altoTrazado;

  const linea = datos.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.valor)}`).join(' ');
  const primero = datos[0];
  const ultimo = datos[datos.length - 1];
  // Tres líneas de rejilla: suficientes para situar, pocas para no competir.
  const rejilla = [lo + (hi - lo) * 0.15, lo + (hi - lo) * 0.5, lo + (hi - lo) * 0.85];

  return (
    <figure className="viz-root my-8">
      <figcaption className="mb-1 font-semibold tracking-tight text-[#0A2540]">
        {grafico.titulo}
      </figcaption>
      <p className="mb-4 text-sm text-gray-500">{grafico.unidad}</p>

      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        width="100%"
        role="img"
        aria-label={`${grafico.titulo}. ${grafico.unidad}. Desde ${primero.etiqueta} (${numeroPE(primero.valor, decimales)}) hasta ${ultimo.etiqueta} (${numeroPE(ultimo.valor, decimales)}). Los valores están en la tabla de datos que acompaña al gráfico.`}
        className="max-w-full"
      >
        {rejilla.map((v) => (
          <g key={v}>
            <line
              x1={M.izquierda} y1={y(v)} x2={ANCHO - M.derecha} y2={y(v)}
              className="viz-eje" strokeWidth={1}
            />
            <text
              x={M.izquierda - 8} y={y(v)} textAnchor="end" dominantBaseline="central"
              className="viz-valor" fontSize={11}
            >
              {numeroPE(v, decimales)}
            </text>
          </g>
        ))}

        <path d={linea} fill="none" className="viz-linea" strokeWidth={2}
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Extremos: los dos puntos que cuentan la historia. */}
        {[{ i: 0, d: primero }, { i: datos.length - 1, d: ultimo }].map(({ i, d }) => (
          <g key={d.etiqueta}>
            <circle cx={x(i)} cy={y(d.valor)} r={5} className="viz-punto" strokeWidth={2} />
            <text
              x={i === 0 ? x(i) + 10 : x(i) - 10}
              y={y(d.valor) - 12}
              textAnchor={i === 0 ? 'start' : 'end'}
              className="viz-etiqueta" fontSize={12} fontWeight={600}
            >
              {numeroPE(d.valor, decimales)}
            </text>
          </g>
        ))}

        {/* Eje temporal: una etiqueta cada N, más la última siempre. */}
        {datos.map((d, i) =>
          i % cadaN === 0 || i === datos.length - 1 ? (
            <text
              key={d.etiqueta} x={x(i)} y={ALTO - 10}
              textAnchor={i === datos.length - 1 ? 'end' : i === 0 ? 'start' : 'middle'}
              className="viz-valor" fontSize={11}
            >
              {d.etiqueta}
            </text>
          ) : null,
        )}
      </svg>

      <p className="mt-3 text-sm text-gray-500">{grafico.nota}</p>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-[#059669] hover:underline">
          Ver los datos en tabla
        </summary>
        <table className="mt-3 w-full border-collapse text-sm">
          <caption className="sr-only">{grafico.titulo}</caption>
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th scope="col" className="py-2 pr-4 font-semibold text-[#0A2540]">Periodo</th>
              <th scope="col" className="py-2 font-semibold text-[#0A2540]">{grafico.unidad}</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((d) => (
              <tr key={d.etiqueta} className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-700">{d.etiqueta}</td>
                <td className="py-2 font-mono text-gray-700">{numeroPE(d.valor, decimales)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
P19_EOF

# -----------------------------------------------------------------------------
# app/informes/[slug]/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/informes/[slug]"
cat > "app/informes/[slug]/page.tsx" <<'P19_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { informes, informeBySlug, fuenteDe } from '@/lib/informes';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import BarChart from '@/components/BarChart';
import LineChart from '@/components/LineChart';
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

          {/* La forma la decide el trabajo del dato: trayectoria en el tiempo
              pide línea; comparación de magnitudes pide barras. */}
          {s.grafico &&
            (s.grafico.tipo === 'serie-temporal' ? (
              <LineChart grafico={s.grafico} />
            ) : (
              <BarChart grafico={s.grafico} />
            ))}

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
P19_EOF

# -----------------------------------------------------------------------------
# app/globals.css
# -----------------------------------------------------------------------------
mkdir -p "app"
cat > "app/globals.css" <<'P19_EOF'
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
.viz-linea { stroke: var(--viz-serie); }
/* Anillo del color de la superficie: el marcador sigue legible donde cruza
   la línea o se solapa con otro. */
.viz-punto { fill: var(--viz-serie); stroke: var(--surface); }
.viz-barra-pos { fill: var(--viz-pos); }
.viz-barra-neg { fill: var(--viz-neg); }
.viz-eje { stroke: var(--viz-eje); }
/* La tinta de los textos es tinta, nunca el color de la serie: el color lo
   lleva la barra, que es quien porta la identidad. */
.viz-etiqueta { fill: var(--viz-etiqueta); font-weight: 500; }
.viz-valor { fill: var(--viz-valor); font-variant-numeric: tabular-nums; }
P19_EOF

# -----------------------------------------------------------------------------
# lib/novedades.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/novedades.ts" <<'P19_EOF'
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
P19_EOF

# -----------------------------------------------------------------------------
# test/informes.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/informes.test.ts" <<'P19_EOF'
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

  it('ninguna verificación está fechada en el futuro', () => {
    // Se coló: dos fuentes decían haberse verificado "mañana", y el reporte de
    // vigilancia lo delató imprimiendo "verificada hace -1 días". Afirmar una
    // comprobación que todavía no ocurrió es pequeño y es exactamente el tipo
    // de imprecisión que este archivo entero existe para impedir.
    const hoy = new Date().toISOString().slice(0, 10);
    for (const i of informes) {
      for (const f of i.fuentes) {
        expect(f.consultado <= hoy, `${f.id}: consultado ${f.consultado} > hoy ${hoy}`).toBe(true);
      }
      expect(i.fecha <= hoy, `${i.slug} fechado ${i.fecha}`).toBe(true);
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

  it('no se publica un precio como si fuera vigente ni una lista propia', () => {
    // Un precio publicado que se queda viejo es peor que ninguno: el comprador
    // cotiza contra él, se equivoca, y nos lo atribuye con razón.
    for (const i of informes) {
      const texto = i.limitaciones.join(' ').toLowerCase();
      const hablaDePrecios = [...i.resumenEjecutivo, ...i.secciones.map((x) => x.heading)]
        .join(' ')
        .toLowerCase()
        .includes('precio');
      if (hablaDePrecios) {
        expect(texto, `${i.slug}: debe declarar que no publica precios vigentes`).toMatch(
          /no publica precios|no las use para cotizar|no publica.*lista/,
        );
      }
    }
  });

  it('las series de terceros se citan, no se redistribuyen', () => {
    // Las series de precios de resina son producto comercial de agencias.
    const conIcis = informes.filter((i) => i.fuentes.some((f) => /ICIS/i.test(f.organismo)));
    for (const i of conIcis) {
      expect(i.limitaciones.join(' ').toLowerCase(), i.slug).toMatch(
        /no se redistribuyen|producto comercial/,
      );
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

  it('la serie temporal usa el componente de línea, no barras', () => {
    // La forma la decide el trabajo del dato: una trayectoria en barras obliga
    // a comparar alturas contiguas en vez de leer hacia dónde va.
    const page = readFileSync(join(process.cwd(), 'app/informes/[slug]/page.tsx'), 'utf8');
    expect(page).toMatch(/tipo === 'serie-temporal'/);
    expect(page).toMatch(/LineChart/);
  });

  it('la serie temporal declara en su nota que el eje no arranca en cero', () => {
    // Truncar el eje es correcto en una trayectoria y engañoso si no se dice.
    for (const g of graficos.filter((x) => x!.tipo === 'serie-temporal')) {
      expect(g!.nota.toLowerCase(), g!.titulo).toMatch(/no arranca en cero|no empieza en cero/);
    }
  });

  it('el gráfico de línea se renderiza en el servidor y trae tabla', () => {
    const src = readFileSync(join(process.cwd(), 'components/LineChart.tsx'), 'utf8');
    expect(src).not.toMatch(/^'use client'/m);
    expect(src).toMatch(/<table/);
    // Etiquetas sólo en los extremos: un número por punto es una tabla mal hecha.
    expect(src).toMatch(/datos\.length - 1/);
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
P19_EOF

# -----------------------------------------------------------------------------
# test/novedades.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/novedades.test.ts" <<'P19_EOF'
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
  '/privacidad',
  '/terminos',
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
P19_EOF

# -----------------------------------------------------------------------------
# scripts/audit-ui.mjs
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/audit-ui.mjs" <<'P19_EOF'
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
  ['informe-precio', '/informes/formacion-de-precio-y-volatilidad-textiles-industriales'],
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
P19_EOF

# -----------------------------------------------------------------------------
# scripts/verificar-despliegue.sh
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/verificar-despliegue.sh" <<'P19_EOF'
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
contiene "/informes/formacion-de-precio-y-volatilidad-textiles-industriales" 'no publicamos lista de precios' "el informe de precios explica por qué no hay lista"
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
P19_EOF

chmod +x scripts/verificar-despliegue.sh
# -----------------------------------------------------------------------------
echo ""
echo "P19 aplicado."
echo "  nuevos      components/LineChart.tsx"
echo "  modificados lib/informes.ts (informe 2: formacion de precio)"
echo "              app/informes/[slug]/page.tsx, app/globals.css,"
echo "              lib/novedades.ts, audit-ui, verificar-despliegue,"
echo "              test/informes.test.ts, test/novedades.test.ts"
echo ""
echo "Siguiente paso:"
echo "  npx tsc --noEmit && npx next lint && npm test && npm run build"
echo "  (esperado: 301 tests en 20 archivos, 234 paginas)"
echo ""
echo "Despues del push:"
echo "  npm run verify:deploy      (esperado: 55 correctas, 0 fallos)"
echo "  npm run vigilancia         (esperado: 0 caidas, sin fechas negativas)"
