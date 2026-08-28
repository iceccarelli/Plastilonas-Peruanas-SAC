import { SITE } from './site';

/**
 * LOS 15 MENSAJES DEL HERO — el texto vivo de la portada.
 *
 * Quince formas de decir lo mismo con los mismos hechos: fabricante e
 * instalador propio, planta en Chorrillos, cotización con ficha técnica,
 * despacho nacional. El hero rota el bloque completo y "teclea" SOLO el H1
 * (components/HeroMensaje.tsx); el resto del bloque aparece de una vez,
 * porque teclear párrafos enteros es un truco de banner, no una portada.
 *
 * REGLAS DE HONESTIDAD (las del resto del sitio):
 *  - Ningún mensaje afirma cifras de catálogo, precios, plazos, clientes ni
 *    certificaciones. Por eso ninguno las necesita tener escritas a mano.
 *  - El año de fundación y el RUC se interpolan de SITE: si un día se
 *    corrigen en lib/site.ts, estos textos cambian solos. Escribirlos aquí
 *    sería crear una segunda fuente de verdad que caduca en silencio.
 *  - «Sin intermediarios» habla del canal de venta (se compra a quien
 *    fabrica o importa directamente), el mismo uso que ya hace la sección
 *    «Por qué elegirnos» de la portada.
 *
 * El primer bloque es el que se sirve en SSR: es el H1 que ven los
 * rastreadores sin JavaScript, así que debe ser el mensaje canónico.
 */

export interface MensajeHero {
  eyebrow: string;
  h1: string;
  sub: string;
  productos: string;
}

export const HERO_MENSAJES: MensajeHero[] = [
  {
    eyebrow: 'Fabricante e instalador · Chorrillos, Lima — Perú',
    h1: 'Textil técnico a medida, con instalación propia.',
    sub: 'Un solo proveedor para cubrir, contener y ventilar.',
    productos: 'Big bags, lonas, geomembranas, mallas y ventilación minera. Cotización con ficha técnica y despacho a todo el país.',
  },
  {
    eyebrow: 'Planta en Chorrillos · Lima, Perú',
    h1: 'Confeccionamos e instalamos el textil que su obra exige.',
    sub: 'Cubrir, contener y ventilar, sin intermediarios.',
    productos: 'Lonas, big bags, geomembranas, mallas y mangas mineras. Ficha técnica en cada cotización.',
  },
  {
    eyebrow: `Desde ${SITE.foundingYear} · Fabricación e instalación propias`,
    h1: 'Un taller. Un equipo. Todo el país.',
    sub: 'Textil industrial a medida para minería, agro, transporte e industria.',
    productos: 'Big bags, cobertores, geosintéticos y ventilación. Despacho nacional.',
  },
  {
    eyebrow: 'Chorrillos, Lima — fabricante e instalador',
    h1: 'A medida, en planta, con gente propia en obra.',
    sub: 'Un solo RUC para cubrir carga, contener granel y ventilar mina.',
    productos: 'Cotización con ficha técnica. Entrega a todo el Perú.',
  },
  {
    eyebrow: 'Textil técnico industrial · Perú',
    h1: 'De la planta a la obra, sin pasar por terceros.',
    sub: 'Fabricación a medida e instalación propia desde Chorrillos.',
    productos: 'Big bags, lonas, geomembranas, mallas y ventilación minera.',
  },
  {
    eyebrow: 'Fabricante peruano · Instalación con equipo propio',
    h1: 'Lo cortamos, lo soldamos, lo instalamos.',
    sub: 'Proveedor único de textil técnico a la medida.',
    productos: 'Lonas y cobertores, FIBC, geomembranas, mallas y mangas de ventilación.',
  },
  {
    eyebrow: 'Chorrillos, Lima — Perú',
    h1: 'Textil técnico que se fabrica aquí y se instala allá.',
    sub: 'Cubrir. Contener. Ventilar. Un solo proveedor.',
    productos: 'Big bags, lonas, geomembranas y ventilación minera. Despacho a todo el país.',
  },
  {
    eyebrow: 'Fabricación a medida · Instalación propia',
    h1: 'El proveedor que cotiza con ficha, no con promesas.',
    sub: 'Soluciones textiles industriales para obra, flota, campo y mina.',
    productos: 'Lonas, bolsones, geosintéticos, mallas y ventilación.',
  },
  {
    eyebrow: 'Planta y taller en Chorrillos',
    h1: 'Medida exacta. Responsabilidad única.',
    sub: 'Un solo equipo para fabricar e instalar textil técnico.',
    productos: 'Big bags, lonas, geomembranas, mallas y mangas mineras.',
  },
  {
    eyebrow: 'Lima, Perú · Despacho nacional',
    h1: 'Cubra, contenga o ventile con quien lo confecciona.',
    sub: 'Fabricante e instalador de textil industrial a medida.',
    productos: 'Cotización técnica. Entrega a todo el país.',
  },
  {
    eyebrow: 'Fabricante e instalador desde Chorrillos',
    h1: 'Ingeniería de taller, no catálogo genérico.',
    sub: 'Un proveedor para big bags, lonas, geomembranas y ventilación.',
    productos: 'Ficha técnica en cada cotización. Instalación propia cuando el proyecto lo pide.',
  },
  {
    eyebrow: 'Textil técnico · Confección e instalación',
    h1: 'Lo que su proyecto necesita, cortado a su medida.',
    sub: 'Cubrir acopio y flota. Contener granel. Ventilar túnel.',
    productos: 'Big bags, lonas, mallas, geomembranas y ventilación minera.',
  },
  {
    eyebrow: 'Chorrillos, Lima — fabricación propia',
    h1: 'Un solo proveedor. Una sola responsabilidad.',
    sub: 'Textil industrial a medida, instalado por nuestro equipo.',
    productos: 'Lonas, FIBC, geosintéticos, mallas y mangas de ventilación.',
  },
  {
    eyebrow: 'Proveedor de textil técnico en el Perú',
    h1: 'Planta en Lima. Obra en todo el país.',
    sub: 'Fabricamos e instalamos para cubrir, contener y ventilar.',
    productos: 'Big bags, lonas, geomembranas y ventilación minera. Cotización con ficha.',
  },
  {
    eyebrow: `Fabricante e instalador · RUC ${SITE.ruc}`,
    h1: 'Textil técnico con nombre, planta y RUC.',
    sub: 'De Chorrillos al resto del Perú, sin intermediarios.',
    productos: 'Big bags, lonas, geomembranas, mallas y ventilación. Despacho nacional.',
  },
];
