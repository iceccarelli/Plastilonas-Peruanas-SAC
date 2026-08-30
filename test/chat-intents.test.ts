import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  INICIOS,
  SEGUIMIENTOS,
  SEGUIMIENTO_DEFECTO,
  seguimientosPara,
} from '@/lib/chat/intents';

/**
 * EL ASISTENTE GUIADO SE VIGILA COMO DATO, NO COMO PANTALLA.
 *
 * Los botones del chat son datos en lib/chat/intents.ts precisamente para que
 * estas pruebas puedan validarlos sin montar React: que cada intención tenga
 * texto real, que ningún mensaje prometa lo que el sitio tiene prohibido
 * afirmar (precios, plazos, certificaciones, disponibilidad fuera del horario)
 * y que la conversación nunca quede sin paso siguiente.
 */

const raiz = process.cwd();
const leer = (rel: string) => readFileSync(join(raiz, rel), 'utf8');

const TODOS_LOS_CHIPS = [
  ...INICIOS,
  ...SEGUIMIENTOS.flatMap((s) => s.chips),
  ...SEGUIMIENTO_DEFECTO,
];

describe('intenciones del asistente: forma y honestidad', () => {
  it('el estado vacío ofrece entre 4 y 6 caminos, únicos y con texto real', () => {
    expect(INICIOS.length).toBeGreaterThanOrEqual(4);
    expect(INICIOS.length).toBeLessThanOrEqual(6);
    const etiquetas = INICIOS.map((i) => i.etiqueta);
    expect(new Set(etiquetas).size).toBe(etiquetas.length);
    for (const i of INICIOS) {
      expect(i.etiqueta.trim().length).toBeGreaterThan(3);
      expect(i.mensaje.trim().length).toBeGreaterThan(10);
      expect(i.mensaje.length).toBeLessThanOrEqual(160);
    }
  });

  it('cada seguimiento ofrece 2 o 3 chips con mensaje enviable', () => {
    for (const s of SEGUIMIENTOS) {
      expect(s.chips.length).toBeGreaterThanOrEqual(2);
      expect(s.chips.length).toBeLessThanOrEqual(3);
      for (const c of s.chips) {
        expect(c.etiqueta.trim().length).toBeGreaterThan(3);
        expect(c.mensaje.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it('ninguna intención afirma precio, plazo ni certificación propia', () => {
    // El chip PREGUNTA (¿…?) o pide cotizar; nunca afirma un dato que la
    // empresa no publica. Un botón que dijera «entrega en 7 días» sería una
    // promesa impresa que ningún comercial hizo.
    const prohibido = /S\/\s*\d|US?\$\s*\d|\bd[oó]lares\b|entrega en \d|garantizad|certificad[oa]s?\s+(iso|astm|ce\b|ul\b)/i;
    for (const c of TODOS_LOS_CHIPS) {
      expect(prohibido.test(c.mensaje), `${c.etiqueta}: ${c.mensaje}`).toBe(false);
    }
  });

  it('la conversación nunca queda sin paso siguiente', () => {
    // Texto que no calza con ninguna intención → chips por defecto.
    expect(seguimientosPara('zzz sin relación alguna').length).toBeGreaterThanOrEqual(2);
    // Cada intención declarada devuelve sus propios chips.
    expect(seguimientosPara('necesito big bags de una tonelada')[0].etiqueta).toContain('1 tonelada');
    expect(seguimientosPara('quiero una lona para mi camión').map((c) => c.etiqueta)).toContain('Toldos para camión');
    expect(seguimientosPara('¿cuánto cuesta el metro?').map((c) => c.etiqueta)).toContain('Cotizar con ficha técnica');
  });

  it('lo específico gana a lo general: big bags antes que lonas', () => {
    // «cubrir» aparece en la consulta pero el tema es big bags: la regla de
    // big bags está declarada antes y debe capturar el intercambio.
    const chips = seguimientosPara('necesito big bags para cubrir la demanda de granel');
    expect(chips.map((c) => c.etiqueta)).toContain('Norma ISO 21898');
  });
});

describe('el widget y la portada usan las intenciones de verdad', () => {
  const chatbot = leer('components/Chatbot.tsx');
  const portada = leer('app/(es)/page.tsx');
  const heroImagen = leer('components/HeroImagen.tsx');
  const rutaApi = leer('app/api/chat/route.ts');

  it('el widget consume INICIOS y seguimientosPara desde lib/chat/intents', () => {
    expect(chatbot).toContain("from '@/lib/chat/intents'");
    expect(chatbot).toContain('INICIOS');
    expect(chatbot).toContain('seguimientosPara');
  });

  it('el widget mantiene visibles los dos cierres: cotización y WhatsApp', () => {
    expect(chatbot).toContain('/cotizacion?origen=chat');
    expect(chatbot).toContain('whatsappUrl(');
  });

  it('el prompt del asistente enlaza rutas reales con su modo de suministro', () => {
    expect(rutaApi).toContain('ETIQUETA_SOURCING');
    expect(rutaApi).toContain('/productos/${p.slug}');
    // La afirmación «100% a medida» la desmentía el propio catálogo: 16 de
    // las 36 líneas son importación directa. No vuelve.
    expect(rutaApi).not.toMatch(/100\s*%\s*a\s*medida/i);
  });

  it('la portada no superpone texto a fotografía en movimiento', () => {
    // El hero muestra UNA foto quieta: sin carrusel (setInterval) ni zoom
    // Ken Burns. El texto vive en su propio panel sólido.
    expect(portada).not.toContain('HeroCarousel');
    expect(portada).toContain('HeroImagen');
    expect(heroImagen).not.toContain('setInterval');
    expect(heroImagen).not.toMatch(/kenburns/i);
    expect(heroImagen).toContain('priority');
  });

  it('la acción primaria del hero es cotizar, no navegar', () => {
    const cotizar = portada.indexOf('Cotizar proyecto');
    const catalogo = portada.indexOf('Ver catálogo');
    expect(cotizar).toBeGreaterThan(-1);
    expect(catalogo).toBeGreaterThan(cotizar);
  });
});
