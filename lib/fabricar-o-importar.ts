/**
 * FABRICAR EN LIMA O IMPORTAR — la decisión real, publicada con sus dos caras.
 *
 * POR QUÉ EXISTE. Todo comprador de este rubro toma la misma decisión antes de
 * elegir proveedor, y no la toma leyendo un catálogo: ¿mando fabricar acá o
 * importo un contenedor? El sitio tenía 36 fichas, cinco guías y tres cuñas
 * para el DESPUÉS de esa decisión, y nada para el momento en que se toma. Es
 * decir: entrábamos a la conversación tarde.
 *
 * POR QUÉ SE PUBLICA CON LA CARA QUE NOS PERJUDICA. Porque es verdad y porque
 * funciona. A volumen alto, con medida estándar y 120 días de planificación,
 * una importación asiática gana en precio unitario y decirlo cuesta menos que
 * fingir lo contrario: el comprador ya lo sabe, y el proveedor que se lo
 * oculta pierde la credibilidad de todo lo demás que afirma. Lo que gana esta
 * página no es la venta de ese lote, es la de los otros cuatro casos —medida
 * fuera de estándar, lote corto, reposición en días, iteración de la
 * especificación— donde el mismo comprador vuelve.
 *
 * LO QUE NO PUBLICA, y es deliberado: NINGUNA tasa aplicada a una subpartida
 * concreta. Los componentes del costo se nombran con su rango oficial y su
 * fuente; cuál le toca a SU mercancía depende de su subpartida nacional de 10
 * dígitos, y eso lo confirma SUNAT o su agente de aduana, no nosotros. Un
 * porcentaje inventado en esta página sería exactamente el tipo de dato que
 * el resto del sitio se niega a publicar.
 *
 * FUENTES de los nombres y rangos de los tributos (verificadas 2026-08-31):
 *  · SUNAT, «Estructura del Arancel de Aduanas» y «Pagos a realizar»
 *    (subpartida nacional de 10 dígitos; ad valorem 0 %, 6 % y 11 %; IGV 16 %;
 *    IPM 2 %; ISC variable; percepción del IGV 3,5 %, 5 % o 10 %).
 *  · ADEX, «Principales tributos aduaneros en el Perú» (base de cálculo:
 *    ad valorem sobre CIF = FOB + flete + seguro).
 * Se publican los NOMBRES y los RANGOS, nunca la tasa de una partida.
 */

export interface FilaDecision {
  /** Dimensión de la decisión, tal como la vive el comprador. */
  criterio: string;
  criterioEn: string;
  importar: string;
  importarEn: string;
  fabricar: string;
  fabricarEn: string;
  /** Quién gana en esa fila. Se declara, no se insinúa. */
  gana: 'importar' | 'fabricar' | 'depende';
}

/**
 * La matriz. Diez filas, y tres de ellas las gana la importación: si fueran
 * cero, la tabla sería publicidad y nadie la citaría.
 */
export const MATRIZ: FilaDecision[] = [
  {
    criterio: 'Precio unitario a volumen alto',
    criterioEn: 'Unit price at high volume',
    importar: 'Gana con lotes grandes de medida estándar. La escala de una planta asiática no se discute.',
    importarEn: 'Wins on large lots of standard sizes. The scale of an Asian plant is not up for debate.',
    fabricar: 'No competimos en el lote grande y estándar. Competimos en todo lo demás de esta tabla.',
    fabricarEn: 'We do not compete on the large standard lot. We compete on everything else in this table.',
    gana: 'importar',
  },
  {
    criterio: 'Disponibilidad inmediata de un formato estándar',
    criterioEn: 'Immediate availability of a standard format',
    importar: 'Un importador con almacén despacha mañana un formato estándar que ya tiene en stock.',
    importarEn: 'An importer with a warehouse ships a standard format tomorrow, straight off the shelf.',
    fabricar: 'Una pieza a medida se produce; no está esperando en un anaquel.',
    fabricarEn: 'A made-to-measure part is produced; it is not waiting on a shelf.',
    gana: 'importar',
  },
  {
    criterio: 'Variedad de configuraciones ya desarrolladas',
    criterioEn: 'Range of already-developed configurations',
    importar: 'Una planta de gran escala tiene cientos de configuraciones validadas y repetidas miles de veces.',
    importarEn: 'A large-scale plant carries hundreds of configurations, validated and repeated thousands of times.',
    fabricar: 'Nuestro catálogo es más corto. Lo que ofrecemos es que la configuración se haga para usted, no que ya exista.',
    fabricarEn: 'Our catalogue is shorter. What we offer is that the configuration is built for you, not that it already exists.',
    gana: 'importar',
  },
  {
    criterio: 'Certificación de producto emitida por el fabricante',
    criterioEn: 'Product certification issued by the manufacturer',
    importar: 'Hay fabricantes que emiten certificación propia de producto y ensayos de tercero por lote.',
    importarEn: 'Some manufacturers issue their own product certification and third-party lot testing.',
    fabricar: 'No emitimos certificación propia. Entregamos la documentación disponible del tejido y del lote, y lo decimos en cada ficha.',
    fabricarEn: 'We do not issue our own certification. We supply the available documentation for the fabric and the lot, and every product page says so.',
    gana: 'importar',
  },
  {
    criterio: 'Cantidad mínima (MOQ)',
    criterioEn: 'Minimum order quantity (MOQ)',
    importar: 'Un contenedor es la unidad de compra. Bajo esa cantidad el flete por pieza se dispara.',
    importarEn: 'A container is the unit of purchase. Below it, freight per piece climbs steeply.',
    fabricar: 'El lote lo define su operación, no el contenedor. Se corta lo que se necesita.',
    fabricarEn: 'Your operation defines the lot, not the container. We cut what is needed.',
    gana: 'fabricar',
  },
  {
    criterio: 'Plazo de reposición de una pieza',
    criterioEn: 'Lead time to replace one unit',
    importar: 'Semanas de tránsito marítimo más despacho. Una pieza rota espera al próximo embarque.',
    importarEn: 'Weeks of ocean transit plus customs clearance. One damaged unit waits for the next shipment.',
    fabricar: 'La planta está en Chorrillos y el plano de su lote queda registrado: se repite sin volver a medir.',
    fabricarEn: 'The plant is in Chorrillos and your drawing is on file: it is repeated without measuring again.',
    gana: 'fabricar',
  },
  {
    criterio: 'Medida fuera de estándar',
    criterioEn: 'Non-standard dimensions',
    importar: 'Posible, pero se paga como desarrollo y alarga el plazo del primer embarque.',
    importarEn: 'Possible, but it is priced as development and stretches the first shipment.',
    fabricar: 'Es el caso normal: se corta contra su medida, no contra un catálogo.',
    fabricarEn: 'It is the normal case: we cut against your dimension, not against a catalogue.',
    gana: 'fabricar',
  },
  {
    criterio: 'Iterar la especificación',
    criterioEn: 'Iterating the specification',
    importar: 'Cada corrección es un ciclo de muestra internacional.',
    importarEn: 'Every correction is another international sample cycle.',
    fabricar: 'La muestra sale de la misma planta que fabricará el lote, y se corrige en la misma semana.',
    fabricarEn: 'The sample comes from the same plant that will make the lot, and is corrected the same week.',
    gana: 'fabricar',
  },
  {
    criterio: 'Exposición al tipo de cambio',
    criterioEn: 'Exchange-rate exposure',
    importar: 'La factura es en dólares y el pago se ejecuta meses después de fijar el precio.',
    importarEn: 'The invoice is in dollars and payment happens months after the price was agreed.',
    fabricar: 'También compramos resina en dólares —y lo decimos—, pero el desfase entre precio y entrega es de semanas, no de meses.',
    fabricarEn: 'We also buy resin in dollars — and we say so — but the gap between price and delivery is weeks, not months.',
    gana: 'depende',
  },
  {
    criterio: 'Exposición al flete internacional',
    criterioEn: 'Ocean freight exposure',
    importar: 'El flete y los recargos se cotizan aparte y cambian entre la orden y el embarque.',
    importarEn: 'Freight and surcharges are quoted separately and move between order and sailing.',
    fabricar: 'Flete nacional, cotizado con la pieza y en soles.',
    fabricarEn: 'Domestic freight, quoted with the part.',
    gana: 'fabricar',
  },
  {
    criterio: 'Capital de trabajo inmovilizado',
    criterioEn: 'Working capital tied up',
    importar: 'Se paga antes de tener la mercancía y se almacena un lote entero.',
    importarEn: 'Paid before the goods exist in your warehouse, and a whole lot is stored.',
    fabricar: 'Lotes cortos y repetibles: se inmoviliza lo que se consume.',
    fabricarEn: 'Short, repeatable lots: you tie up what you consume.',
    gana: 'fabricar',
  },
  {
    criterio: 'Riesgo de clasificación arancelaria',
    criterioEn: 'Tariff-classification risk',
    importar: 'La subpartida nacional decide el ad valorem y puede activar derechos antidumping. Se confirma antes de comprar.',
    importarEn: 'The national tariff subheading decides the ad valorem duty and can trigger anti-dumping duties. Confirm it before buying.',
    fabricar: 'No hay importación de producto terminado, así que este riesgo no aparece. No es mérito nuestro: es aritmética.',
    fabricarEn: 'There is no import of finished goods, so this risk does not arise. That is not a merit of ours: it is arithmetic.',
    gana: 'fabricar',
  },
  {
    criterio: 'Recurso ante un defecto',
    criterioEn: 'Recourse when something is wrong',
    importar: 'El reclamo cruza una frontera, un idioma y una jurisdicción.',
    importarEn: 'The claim crosses a border, a language and a jurisdiction.',
    fabricar: 'Mismo país, mismo RUC, misma planta que se puede visitar.',
    fabricarEn: 'Same country, same tax ID, same plant — one you can visit.',
    gana: 'fabricar',
  },
];

/**
 * Componentes del costo de una importación. Se nombran con su rango oficial
 * y NUNCA con la tasa de una subpartida concreta: cuál aplica depende de los
 * 10 dígitos de SU mercancía, y eso lo confirma SUNAT o su agente de aduana.
 */
export interface ComponenteCosto {
  nombre: string;
  nombreEn: string;
  detalle: string;
  detalleEn: string;
}

export const COSTO_IMPORTACION: ComponenteCosto[] = [
  {
    nombre: 'Valor FOB',
    nombreEn: 'FOB value',
    detalle: 'El precio que cotiza el proveedor. Es el número con el que se compara, y es el único de esta lista que aparece en su correo.',
    detalleEn: 'The price the supplier quotes. It is the number people compare, and the only line on this list that appears in your email.',
  },
  {
    nombre: 'Flete y seguro internacional',
    nombreEn: 'International freight and insurance',
    detalle: 'Se suman al FOB para formar el valor CIF, que es la base sobre la que se calcula el arancel.',
    detalleEn: 'Added to FOB to form the CIF value, which is the base the duty is calculated on.',
  },
  {
    nombre: 'Derecho de aduana ad valorem',
    nombreEn: 'Ad valorem customs duty',
    detalle: 'Porcentaje sobre el CIF. SUNAT publica tasas de 0 %, 6 % y 11 % según la subpartida nacional de 10 dígitos: confirme la suya, no la suponga.',
    detalleEn: 'A percentage of CIF. SUNAT publishes rates of 0%, 6% and 11% depending on the 10-digit national subheading: confirm yours, do not assume it.',
  },
  {
    nombre: 'Derechos antidumping o compensatorios',
    nombreEn: 'Anti-dumping or countervailing duties',
    detalle: 'No son un impuesto sino una medida: dependen del producto y del país de origen, y pueden cambiar la aritmética entera de una compra.',
    detalleEn: 'Not a tax but a measure: they depend on the product and the country of origin, and can change the arithmetic of a purchase entirely.',
  },
  {
    nombre: 'IGV e IPM',
    nombreEn: 'IGV and IPM',
    detalle: 'IGV 16 % más IPM 2 % —el 18 % que se cita junto— sobre la base imponible de la importación.',
    detalleEn: 'IGV at 16% plus IPM at 2% — the 18% usually quoted together — on the taxable base of the import.',
  },
  {
    nombre: 'Percepción del IGV',
    nombreEn: 'IGV advance perception',
    detalle: 'Adelanto de 3,5 %, 5 % o 10 % según la condición del importador. Es recuperable, pero sale de la caja el día del despacho.',
    detalleEn: 'An advance of 3.5%, 5% or 10% depending on the importer’s status. It is recoverable, but it leaves your account on clearance day.',
  },
  {
    nombre: 'Despacho, almacenaje y transporte interno',
    nombreEn: 'Clearance, storage and inland transport',
    detalle: 'Agente de aduana, terminal, días de almacén y el flete desde el puerto hasta su operación.',
    detalleEn: 'Customs broker, terminal, warehouse days and the haul from the port to your operation.',
  },
  {
    nombre: 'Días de financiamiento',
    nombreEn: 'Days of financing',
    detalle: 'El dinero sale semanas o meses antes de que la mercancía se use. Ese costo no aparece en ninguna factura y decide más compras de las que se admite.',
    detalleEn: 'The money leaves weeks or months before the goods are used. That cost appears on no invoice and decides more purchases than anyone admits.',
  },
];

/**
 * CUÁNDO NO NOS COMPRE. El bloque que ningún competidor del rubro publica y
 * el que hace creíble todo lo demás.
 */
export const NO_NOS_COMPRE = [
  'Si necesita decenas de miles de piezas idénticas, de medida estándar, con cuatro meses de planificación y sin cambios de especificación: a ese volumen la importación gana en precio unitario y no vamos a decirle lo contrario.',
  'Si su compra ya está calzada con un contrato marco de importación vigente, romperlo por un lote no le conviene.',
  'Si lo que busca es una certificación de producto emitida por el fabricante, revise antes qué certifica cada proveedor: nosotros entregamos la documentación disponible del tejido y del lote, y no emitimos certificación propia.',
];

/** Cuándo sí, dicho con la misma franqueza. */
export const CUANDO_SI = [
  'Medida fuera de estándar, o una medida que todavía va a cambiar.',
  'Lote corto, o reposición de piezas sueltas de un lote anterior.',
  'Plazo medido en semanas y no en meses, incluida la pieza que se rompió ayer.',
  'Instalación incluida —lonas, toldos y siders— con equipo propio en Lima.',
  'Un proveedor con RUC peruano, planta visitable y recurso en la misma jurisdicción.',
];

export const NO_NOS_COMPRE_EN = [
  'If you need tens of thousands of identical, standard-size units with four months of planning and no specification changes: at that volume importing wins on unit price, and we are not going to tell you otherwise.',
  'If your purchase is already covered by a running framework import contract, breaking it for one lot does not help you.',
  'If what you need is a product certification issued by the manufacturer, check first what each supplier actually certifies: we supply the available documentation for the fabric and the lot, and we do not issue our own certification.',
];

export const CUANDO_SI_EN = [
  'Non-standard dimensions, or dimensions that are still going to change.',
  'A short lot, or replacement of individual units from an earlier lot.',
  'A deadline measured in weeks rather than months — including the unit that tore yesterday.',
  'Installation included — tarpaulins, covers and curtain siders — with our own crew in Lima.',
  'A supplier with a Peruvian tax ID, a plant you can visit and recourse in the same jurisdiction.',
];

export const FAQS_FABRICAR = [
  {
    q: '¿Es más barato importar big bags de Asia que mandarlos fabricar en Lima?',
    a: 'A volumen alto y medida estándar, normalmente sí en precio unitario, y no tenemos interés en negarlo. La comparación honesta no es FOB contra precio de planta: es el costo puesto en su operación —flete, seguro, ad valorem sobre CIF, IGV más IPM, percepción, despacho, almacenaje y días de financiamiento— contra un lote fabricado a su medida sin ninguno de esos pasos. En lotes cortos, medidas fuera de estándar o reposición, la aritmética se invierte.',
  },
  {
    q: '¿Cuánto arancel paga un big bag importado en el Perú?',
    a: 'Depende de la subpartida nacional de 10 dígitos de la mercancía concreta, y por eso no publicamos un porcentaje: sería el dato que este sitio se niega a inventar. SUNAT publica tasas ad valorem de 0 %, 6 % y 11 % según subpartida, y además pueden aplicar derechos antidumping según el origen. Confírmelo con SUNAT o con su agente de aduana antes de cerrar la compra.',
  },
  {
    q: '¿Qué plazo de reposición dan si se rompe una pieza?',
    a: 'La planta está en Chorrillos y el plano de su lote queda registrado, así que la reposición no vuelve a empezar por la medición. El plazo concreto se confirma en la cotización contra la carga de planta del momento; no publicamos un número fijo que no podríamos sostener todos los meses del año.',
  },
  {
    q: '¿Tienen cantidad mínima?',
    a: 'El lote lo define su operación, no un contenedor. En líneas a medida se cotiza contra la especificación y la cantidad que necesita; en líneas de importación directa la ficha del producto declara su condición.',
  },
  {
    q: '¿Por qué publican los casos en los que conviene importar?',
    a: 'Porque el comprador ya los conoce. Un proveedor que los oculta no gana ese lote: pierde la credibilidad de todo lo demás que afirma, incluida la parte donde tiene razón.',
  },
];

export const FAQS_FABRICAR_EN = [
  {
    q: 'Is it cheaper to import FIBC bulk bags from Asia than to have them made in Lima?',
    a: 'At high volume and standard sizes, usually yes on unit price, and we have no interest in denying it. The honest comparison is not FOB against ex-works price: it is the cost delivered into your operation — freight, insurance, ad valorem duty on CIF, IGV plus IPM, the IGV advance perception, clearance, storage and days of financing — against a lot made to your dimensions with none of those steps. On short lots, non-standard sizes or replacements, the arithmetic flips.',
  },
  {
    q: 'What import duty does a bulk bag pay in Peru?',
    a: 'It depends on the 10-digit national subheading of the specific goods, which is why we publish no percentage: it would be exactly the kind of figure this site refuses to invent. SUNAT publishes ad valorem rates of 0%, 6% and 11% by subheading, and anti-dumping duties may also apply depending on origin. Confirm it with SUNAT or your customs broker before closing the purchase.',
  },
  {
    q: 'How fast can you replace a damaged unit?',
    a: 'The plant is in Chorrillos and your lot drawing is on file, so a replacement does not start again from measuring. The specific lead time is confirmed in the quotation against the plant load at the time; we do not publish a fixed number we could not hold every month of the year.',
  },
  {
    q: 'Do you have a minimum order quantity?',
    a: 'Your operation defines the lot, not a container. Made-to-measure lines are quoted against the specification and the quantity you need; directly imported lines declare their condition on their own product page.',
  },
  {
    q: 'Why publish the cases where importing is the better choice?',
    a: 'Because the buyer already knows them. A supplier who hides them does not win that lot — they lose the credibility of everything else they claim, including the part where they are right.',
  },
];

/** Fecha de la última revisión editorial de esta página (YYYY-MM-DD). */
export const FABRICAR_ACTUALIZADO = '2026-08-31';

/** Las dos rutas del par, en un solo sitio: sitemap, hreflang y enlaces. */
export const RUTA_ES = '/fabricar-o-importar';
export const RUTA_EN = '/en/manufacture-in-peru-or-import';
