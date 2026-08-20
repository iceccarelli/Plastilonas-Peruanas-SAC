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
