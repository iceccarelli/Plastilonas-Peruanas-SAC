import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { whatsappHref } from '@/components/WhatsAppLink';

const ROOT = process.cwd();

/** Archivos donde `wa.me` SÍ puede aparecer: la fuente única y su documentación. */
const ALLOWED = new Set([
  'components/WhatsAppLink.tsx',
  'lib/whatsapp.ts',
  'lib/social.ts',
  'lib/analytics.ts',
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const SOURCE_FILES = ['app', 'components', 'lib'].flatMap((d) => walk(join(ROOT, d)));

describe('atribución de WhatsApp', () => {
  it('ningún enlace wa.me se escribe a mano fuera de la fuente única', () => {
    const offenders = SOURCE_FILES.filter((file) => {
      const rel = relative(ROOT, file).replace(/\\/g, '/');
      if (ALLOWED.has(rel)) return false;
      return readFileSync(file, 'utf8').includes('wa.me');
    }).map((f) => relative(ROOT, f));

    // Un <a href="https://wa.me/..."> a mano no dispara analítica: el lead
    // llega pero nadie sabe qué página lo produjo.
    expect(offenders, `Use <WhatsAppLink context="...">: ${offenders.join(', ')}`).toEqual([]);
  });

  it('el número de WhatsApp no está escrito a mano en ninguna parte', () => {
    const offenders = SOURCE_FILES.filter((file) => {
      const rel = relative(ROOT, file).replace(/\\/g, '/');
      if (rel === 'lib/whatsapp.ts') return false; // la fuente única
      return readFileSync(file, 'utf8').includes(`wa.me/${WHATSAPP_NUMBER}`);
    }).map((f) => relative(ROOT, f));

    expect(offenders, `Deriven el número de WHATSAPP_NUMBER: ${offenders.join(', ')}`).toEqual([]);
  });

  it('cada uso de WhatsAppLink declara un context de atribución', () => {
    const usages: string[] = [];
    for (const file of SOURCE_FILES) {
      const rel = relative(ROOT, file).replace(/\\/g, '/');
      if (rel === 'components/WhatsAppLink.tsx') continue;
      const src = readFileSync(file, 'utf8');
      for (const m of src.matchAll(/<WhatsAppLink([\s\S]{0,400}?)>/g)) {
        if (!/\bcontext=/.test(m[1])) usages.push(rel);
      }
    }
    expect(usages, `WhatsAppLink sin context en: ${usages.join(', ')}`).toEqual([]);
  });

  it('whatsappHref construye la URL con el número de la fuente única', () => {
    expect(whatsappHref()).toBe(`https://wa.me/${WHATSAPP_NUMBER}`);
    expect(whatsappHref('Hola')).toBe(`https://wa.me/${WHATSAPP_NUMBER}?text=Hola`);
    // El mensaje va codificado: un espacio o un acento sin codificar rompe el enlace.
    expect(whatsappHref('cotización de big bags')).toContain('cotizaci%C3%B3n%20de%20big%20bags');
  });
});

describe('cobertura de eventos de conversión', () => {
  const analytics = readFileSync(join(ROOT, 'lib/analytics.ts'), 'utf8');

  it('existen los eventos que gobiernan la inversión comercial', () => {
    for (const fn of [
      'trackQuoteStarted',
      'trackQuoteRequest',
      'trackWhatsAppClick',
      'trackChatbotEngaged',
      'trackDocumentDownload',
      'trackProductView',
      'trackFamilyView',
      'trackCityPageView',
      'trackArticleView',
    ]) {
      expect(analytics, `falta ${fn}`).toContain(`export function ${fn}`);
    }
  });

  it('las páginas que generan demanda emiten su evento de vista', () => {
    const pages: [string, string][] = [
      ['app/(es)/productos/[slug]/page.tsx', 'kind="product"'],
      ['app/(es)/productos/familia/[slug]/page.tsx', 'kind="family"'],
      ['app/(es)/local/[ciudad]/page.tsx', 'kind="city"'],
      ['app/(es)/recursos/[slug]/page.tsx', 'kind="article"'],
    ];
    for (const [file, marker] of pages) {
      const src = readFileSync(join(ROOT, file), 'utf8');
      expect(src, `${file} sin TrackView`).toContain('<TrackView');
      expect(src, `${file} sin ${marker}`).toContain(marker);
    }
  });

  it('el formulario mide apertura y envío por separado', () => {
    const form = readFileSync(join(ROOT, 'components/CotizacionForm.tsx'), 'utf8');
    expect(form).toContain('trackQuoteStarted');
    expect(form).toContain('trackQuoteRequest');
  });

  it('el chatbot mide el primer mensaje, no la apertura del widget', () => {
    const bot = readFileSync(join(ROOT, 'components/Chatbot.tsx'), 'utf8');
    expect(bot).toContain('trackChatbotEngaged');
    // La guarda evita duplicar el evento en cada mensaje siguiente.
    expect(bot).toContain('engaged.current');
  });
});
