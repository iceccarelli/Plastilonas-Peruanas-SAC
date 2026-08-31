import { cunas, type Cuna } from '@/lib/cunas';

/**
 * LAS TRES CUÑAS, EN INGLÉS.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO. Hasta la etapa 11 el camino inglés terminaba
 * en una síntesis (/en/sourcing-from-peru) que enlazaba las tres cuñas con la
 * coletilla «page in Spanish». Es decir: se captaba al comprador extranjero
 * con una promesa en su idioma y se le soltaba en una página que no puede
 * leer, justo en el momento en que iba a especificar. Un embudo que se rompe
 * en el último paso no es un embudo.
 *
 * Y es exactamente donde está el dinero de fuera del Perú: nadie en Houston,
 * Santiago o Bogotá busca «mangas de ventilación minera». Busca *mine
 * ventilation ducting Peru*. Esas tres consultas —truck tarpaulins, mine
 * ventilation ducting, FIBC bulk bags— son las únicas tres por las que un
 * fabricante limeño puede ser la respuesta por defecto en inglés.
 *
 * POR QUÉ ARCHIVO APARTE Y NO UN CAMPO EN `Cuna`. Porque así el par es
 * verificable: `test/etapas.test.ts` exige biyección —cada cuña española
 * tiene exactamente una gemela inglesa y al revés— y que la gemela no
 * contradiga a su original en lo que se puede comprobar (mismos productos,
 * misma foto, mismos indicadores). Un campo opcional dentro de `Cuna` se
 * habría quedado vacío el día que alguien añadiera la cuarta cuña.
 *
 * LO QUE NO ES. No es una traducción automática del catálogo. Las fichas de
 * producto, la biblioteca técnica y el glosario siguen en español —ahí está
 * el trabajo real y traducirlos a medias sería peor—, y cada enlace hacia
 * ellos lo dice antes del clic, no después.
 *
 * REGLA DE HONESTIDAD, idéntica a la española: `queHacemos` sale del
 * `sourcing` real del catálogo; `queNoAfirmamos` no se suaviza al traducir.
 * Si algo no se promete en español, tampoco se promete en inglés — que es
 * precisamente lo que un comprador extranjero no puede verificar por sí mismo
 * y por lo tanto lo que más vale que sea cierto.
 */
export interface CunaEn {
  /** Slug de la cuña española de la que ésta es gemela. */
  slugEs: string;
  /** Segmento inglés de la ruta: /en/<slug>. Tiene forma de consulta. */
  slug: string;
  h1: string;
  titulo: string;
  descripcion: string;
  intro: string[];
  /** Qué debe traer el RFQ. Mismo checklist, en el idioma del comprador. */
  checklist: { dato: string; detalle: string }[];
  queHacemos: string[];
  queNoAfirmamos: string[];
  faqs: { q: string; a: string }[];
  /** Mensaje de WhatsApp prellenado, en inglés. */
  whatsapp: string;
}

export const CUNAS_EN: CunaEn[] = [
  {
    slugEs: 'lonas-camiones',
    slug: 'truck-tarpaulins-peru',
    h1: 'Custom truck tarpaulins, curtain siders and covers, made in Peru',
    titulo: 'Truck tarpaulins and curtain siders made in Peru',
    descripcion:
      'Truck tarpaulins, covers and curtain siders cut and sewn at our own plant in Chorrillos, Lima, and fitted by our own crew. Quoted against dimensions and delivery city.',
    intro: [
      'A truck tarpaulin is bought twice: once on price, and once more because it was bought on price. What decides service life is not the catalogue but the specification — the right fabric weight for the route, reinforced seams where the load rubs, and a tensioning system one driver can operate alone.',
      'We cut and sew covers, tarpaulins and curtain siders against the real dimensions of the body, and fit them with our own crew in Lima. For fleets the same drawing repeats on every unit: the part for truck 12 is identical to the part for truck 1.',
    ],
    checklist: [
      { dato: 'Body dimensions', detalle: 'length × width × usable height, or the drawing if you have one' },
      { dato: 'Type of cargo', detalle: 'bulk, palletised, mineral concentrate, agricultural' },
      { dato: 'System', detalle: 'flat cover, bowed tarpaulin, sliding curtain sider' },
      { dato: 'Number of units', detalle: 'a single truck or a fleet (the drawing repeats)' },
      { dato: 'Delivery or fitting city', detalle: 'own crew fits in Lima; nationwide dispatch in Peru' },
    ],
    queHacemos: [
      'Cut and sewn at our own plant in Chorrillos, Lima: covers, tarpaulins, curtain siders and coated fabric to measure.',
      'Fitting with our own crew in Lima, and dispatch coordination to the rest of Peru.',
      'Repeat orders from the drawing on file: your fleet specification is kept so it can be reproduced.',
    ],
    queNoAfirmamos: [
      'No published prices: every part depends on dimensions, fabric weight and confection.',
      'Fitting hardware (eyelets, tensioners, tubes) is directly imported, not manufactured by us, and each product page says so.',
      'We do not claim product certifications we cannot back with a document attached to the quotation.',
      'Fitting with our own crew is coordinated inside Peru; outside the country the scope is defined per project.',
    ],
    faqs: [
      {
        q: 'Do you manufacture the tarpaulin or resell it?',
        a: 'The confection is ours: we cut and weld coated fabric and woven polypropylene at the Chorrillos plant in Lima. The metal fitting hardware is directly imported, and each product page declares it.',
      },
      {
        q: 'Can you export truck tarpaulins outside Peru?',
        a: 'The fabricated part travels. Each international shipment is assessed by tariff heading, minimum volume, destination and Incoterm — we quote EXW, FCA and FOB from Lima and the Port of Callao. There is no automatic worldwide shipping and no published freight tariff.',
      },
      {
        q: 'What do you need to quote?',
        a: 'Body dimensions (length, width, usable height), the type of cargo, the system you want and the delivery city or port. With those four the first reply is a quotation with a datasheet.',
      },
      {
        q: 'Do you handle fleets?',
        a: 'Yes. The drawing for the first unit is kept on file, and fleet replacement or expansion is fabricated identically, without measuring again.',
      },
    ],
    whatsapp:
      'Hello, I would like a quotation for truck tarpaulins / curtain siders. Body dimensions: ___. Number of units: ___. Delivery city or port: ___.',
  },
  {
    slugEs: 'ventilacion-minera',
    slug: 'mine-ventilation-ducting-peru',
    h1: 'Mine and tunnel ventilation ducting, manufactured to specification in Peru',
    titulo: 'Mine ventilation ducting made to specification in Peru',
    descripcion:
      'Flexible ventilation ducting for mines and tunnels, manufactured in Chorrillos, Lima: diameter and section length against specification. RFQ with a technical checklist.',
    intro: [
      'Diameter is the easy figure on a ventilation duct. What decides fan consumption for the whole life of the heading is the quality of the joints, the internal roughness and how much the installed run leaks.',
      'We manufacture ducting for mine and tunnel ventilation against specification — diameter, section length, forcing or exhausting duty — at the Chorrillos plant in Lima, together with the accessories that complete the run.',
    ],
    checklist: [
      { dato: 'Internal diameter', detalle: 'in mm; per section if it changes along the run' },
      { dato: 'Section length', detalle: 'and total metres required' },
      { dato: 'Duty', detalle: 'forcing (blowing) or exhausting (extraction)' },
      { dato: 'Environment', detalle: 'humidity, abrasion, antistatic requirement if the operation demands it' },
      { dato: 'Design airflow', detalle: 'attach the ventilation calculation if one exists' },
      { dato: 'Site and delivery city or port', detalle: 'for lead time and freight' },
    ],
    queHacemos: [
      'Own manufacturing of ventilation ducting in Chorrillos, Lima, against diameter and section length.',
      'System accessories (couplings, clamps, suspension rope) so the run arrives complete at the heading.',
      'Quotation with the technical datasheet of the material offered.',
    ],
    queNoAfirmamos: [
      'We do not issue ventilation calculations or mine-standard compliance certificates: that belongs to the ventilation department of the operation.',
      'We do not publish certified pressure-loss tables: the test belongs to the operation and to its own file.',
      'No price list: each run depends on diameter, length and duty.',
      'We do not claim compliance with a standard we have not been shown. Send yours with the RFQ and the quotation answers against it.',
    ],
    faqs: [
      {
        q: 'What does an RFQ for ventilation ducting need to contain?',
        a: 'Internal diameter, the length of each section, whether the duty is forcing or exhausting, and the environment (humidity, abrasion, antistatic requirement). Without those four, any price is invented.',
      },
      {
        q: 'Does the ducting comply with the standard used at my mine?',
        a: 'Your internal standard governs. Attach it to the RFQ and the quotation answers against it. We do not claim generic compliance without a document.',
      },
      {
        q: 'Do you sell only the duct, or the complete system?',
        a: 'A usable run is a system: ducting, couplings and suspension accessories. We quote the set so that nothing is missing 4,000 metres underground.',
      },
      {
        q: 'Is it manufactured in Peru?',
        a: 'Yes — cut and sewn at the Chorrillos plant in Lima. For an operation in Peru that shortens section replacement compared with importing; for a buyer outside Peru it means the manufacturer and the quotation are the same company.',
      },
    ],
    whatsapp:
      'Hello, I would like a quotation for mine ventilation ducting. Diameter and section length: ___. Total metres: ___. Delivery city or port: ___.',
  },
  {
    slugEs: 'big-bags',
    slug: 'fibc-big-bags-peru',
    h1: 'FIBC bulk bags of 1 and 2 tonnes, cut and sewn in Lima, Peru',
    titulo: 'FIBC big bags cut and sewn in Lima, Peru',
    descripcion:
      'FIBC bulk bags of 1 and 2 tonnes cut and sewn in Chorrillos, Lima: skirt top, discharge spout, polyethylene liner. Quoted against capacity, quantity and destination.',
    intro: [
      'An FIBC is specified by what it will hold and how it will be lifted, not by its photograph. Capacity (1 or 2 tonnes), safety factor, the type of top and discharge, and whether the cargo requires an inner liner: those four decisions define the correct bag.',
      'We cut and sew FIBC bulk bags at the Chorrillos plant in Lima in the configurations the operation asks for: skirt top, discharge spout, polyethylene liner. For bulk shipments, Polytarp sacks complete the line as a declared direct import.',
    ],
    checklist: [
      { dato: 'Capacity', detalle: '1 t or 2 t, and the bulk density of the material if you know it' },
      { dato: 'Dimensions', detalle: 'base × base × height (e.g. 90×90×90 cm) or the standard you already use' },
      { dato: 'Safety factor', detalle: '5:1 single trip · 6:1 multi trip, according to your operation' },
      { dato: 'Top and discharge', detalle: 'skirt, open top, discharge spout, inner liner' },
      { dato: 'Quantity and destination', detalle: 'lot size and delivery city or port, for lead time and freight' },
    ],
    queHacemos: [
      'Cutting and sewing of FIBC bulk bags at the Chorrillos plant in Lima, on woven polypropylene fabric.',
      'Configuration by use: skirt top, discharge spout, inner polyethylene liner.',
      'Repeatable lots: the specification of the first lot is kept on file for reordering.',
    ],
    queNoAfirmamos: [
      'We do not claim our own ISO 21898 certification: the available documentation for the fabric and the lot is supplied with the quotation.',
      'Polytarp shipping sacks are a direct import, not our own confection, and their product page declares it.',
      'No price list: capacity, fabric, liner and quantity define each lot.',
      'We do not certify UN packaging for dangerous goods, and we will not present a bag as approved for it.',
    ],
    faqs: [
      {
        q: 'What is the difference between a 5:1 and a 6:1 safety factor?',
        a: '5:1 corresponds to single-trip bags; 6:1 to reusable ones. The choice depends on whether your operation reuses the packaging and on what your lifting protocol requires.',
      },
      {
        q: 'Are they manufactured in Peru?',
        a: 'Yes: cutting and sewing take place at the Chorrillos plant in Lima. That allows non-standard dimensions and, for buyers in the region, a shorter lead time than importing from Asia.',
      },
      {
        q: 'What do I need to state in order to get a quotation?',
        a: 'Capacity (1 or 2 t), dimensions or the standard you use, type of top and discharge, whether you need a liner, the lot quantity, and the delivery city or port.',
      },
      {
        q: 'Do you provide a datasheet?',
        a: 'Every quotation is issued with the technical datasheet of the bag offered and the available documentation for the fabric and the lot.',
      },
      {
        q: 'Under which Incoterms do you quote for export?',
        a: 'EXW, FCA and FOB from Lima and the Port of Callao. The Incoterm decides where responsibility for the cargo changes hands, so it is agreed before the price, not after.',
      },
    ],
    whatsapp:
      'Hello, I would like a quotation for FIBC bulk bags. Capacity and dimensions: ___. Quantity: ___. Delivery city or port: ___.',
  },
];

export function cunaEnPorSlug(slug: string): CunaEn | undefined {
  return CUNAS_EN.find((c) => c.slug === slug);
}

/** La gemela inglesa de una cuña española, si existe. */
export function cunaEnDeSlugEs(slugEs: string): CunaEn | undefined {
  return CUNAS_EN.find((c) => c.slugEs === slugEs);
}

/** La cuña española de la que una gemela inglesa hereda productos y foto. */
export function cunaEsDeEn(en: CunaEn): Cuna {
  const es = cunas.find((c) => c.slug === en.slugEs);
  // Si esto ocurre, el par se rompió en tiempo de compilación y no en
  // producción: mejor un fallo ruidoso que una página inglesa sin productos.
  if (!es) throw new Error(`cunas-en: no existe la cuña española «${en.slugEs}»`);
  return es;
}

/** Enlaces de las tres cuñas inglesas, para el marco y los hubs en inglés. */
export const ENLACES_CUNAS_EN = CUNAS_EN.map((c) => ({
  href: `/en/${c.slug}`,
  label: c.titulo,
}));
