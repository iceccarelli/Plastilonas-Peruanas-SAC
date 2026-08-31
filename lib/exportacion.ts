import { INCOTERMS_SALIDA } from './entidad-feed';

export { INCOTERMS_SALIDA };

/**
 * ALCANCE INTERNACIONAL — una sola declaración, dos idiomas.
 *
 * Esta tabla vivía dentro de app/(es)/exportacion/page.tsx. Al publicar el hub
 * en inglés hacía falta la misma información, y copiarla habría creado el peor
 * defecto posible en una empresa exportadora: que la página en español y la
 * página en inglés afirmen COBERTURAS DISTINTAS. Un comprador que compara los
 * dos idiomas —y un comprador extranjero serio los compara— encontraría al
 * sitio contradiciéndose sobre el único dato que le importa.
 *
 * LO QUE NO SE HACE, y está documentado en la página original: no se declara
 * `areaServed` con estos siete países. /confianza enumera «Envío mundial o
 * instalación continental» entre las cosas que esta empresa NO afirma, y de
 * estos mercados sólo Colombia tiene evidencia pública de comercio. Lo que se
 * declara es el MECANISMO —de dónde sale la carga, bajo qué Incoterm y qué
 * hay que definir— que además es más útil que una lista de banderas.
 */
export interface Mercado {
  pais: string;
  paisEn: string;
  moneda: string;
  nota: string;
  notaEn: string;
}

export const MERCADOS: Mercado[] = [
  {
    pais: 'Perú',
    paisEn: 'Peru',
    moneda: 'PEN',
    nota: 'Despacho nacional. Fabricación e instalación propias.',
    notaEn: 'Domestic dispatch. In-house manufacturing and installation.',
  },
  {
    pais: 'Chile',
    paisEn: 'Chile',
    moneda: 'CLP',
    nota: 'Callao o terrestre. Ventilación, lonas, FIBC por RFQ.',
    notaEn: 'Via Callao or overland. Ducting, tarpaulins and FIBCs by RFQ.',
  },
  {
    pais: 'Colombia',
    paisEn: 'Colombia',
    moneda: 'COP',
    nota: 'Señal pública de comercio exterior. Cada operación se evalúa.',
    notaEn: 'Public record of foreign trade. Each shipment is assessed on its own.',
  },
  {
    pais: 'Ecuador',
    paisEn: 'Ecuador',
    moneda: 'USD',
    nota: 'Marítimo o terrestre según volumen.',
    notaEn: 'Sea or overland depending on volume.',
  },
  {
    pais: 'Bolivia',
    paisEn: 'Bolivia',
    moneda: 'BOB',
    nota: 'Terrestre. Coberturas y geosintéticos por proyecto.',
    notaEn: 'Overland. Covers and geosynthetics on a per-project basis.',
  },
  {
    pais: 'Brasil',
    paisEn: 'Brazil',
    moneda: 'BRL',
    nota: 'Marítimo. Sin lista de precios en BRL.',
    notaEn: 'Sea freight. No price list in BRL.',
  },
  {
    pais: 'México',
    paisEn: 'Mexico',
    moneda: 'MXN',
    nota: 'Solo pedidos calificados por volumen.',
    notaEn: 'Volume-qualified orders only.',
  },
];

/**
 * Lo que esta empresa NO afirma, en inglés. Es la traducción literal de la
 * lista de /confianza: si el hub en inglés omitiera estos límites, sería una
 * página más optimista que la española sobre exactamente los puntos donde un
 * comprador extranjero se juega el dinero.
 */
export const NO_AFIRMAMOS_EN = [
  'ISO, ASTM, CE, UL or food-grade certifications without a document to back them.',
  'Worldwide shipping or continent-wide installation.',
  'Self-published rankings or awards.',
  'List prices on made-to-measure lines.',
  'Named clients or executed works without written authorisation.',
];
