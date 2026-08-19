import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SOCIAL_LINKS, readySocialLinks, pendingSocialLinks } from '@/lib/social';
import { privacidad, terminos, LEGAL_UPDATED } from '@/lib/legal';
import { SITE } from '@/lib/site';
import sitemap from '@/app/sitemap';

/**
 * Dos defectos que este archivo impide que vuelvan:
 *  1. Ocho perfiles sociales falsos renderizados en las 157 páginas.
 *  2. "Política de Privacidad" y "Términos y Condiciones" enlazando a /contacto.
 */

/** Portadas de plataforma: si un href es una de estas, no es un perfil. */
const PORTADAS = [
  'https://www.instagram.com/',
  'https://www.tiktok.com/',
  'https://www.youtube.com/',
  'https://www.linkedin.com/',
  'https://x.com/',
  'https://telegram.org/',
  'https://www.pinterest.com/',
  'https://www.snapchat.com/',
  'https://www.facebook.com/',
];

describe('perfiles sociales: ninguno falso a la vista', () => {
  it('ningún enlace renderizado apunta a la portada de la plataforma', () => {
    for (const l of readySocialLinks()) {
      expect(PORTADAS.includes(l.href), `${l.name} → ${l.href}`).toBe(false);
    }
  });

  it('todo enlace renderizado está marcado como perfil real', () => {
    for (const l of readySocialLinks()) expect(l.ready).toBe(true);
    expect(readySocialLinks().length).toBeGreaterThan(0);
  });

  it('los marcadores pendientes siguen existiendo como dato, sin renderizarse', () => {
    // Se conservan con su TODO para que activarlos sea cambiar una línea.
    const pendientes = pendingSocialLinks();
    expect(pendientes.length + readySocialLinks().length).toBe(SOCIAL_LINKS.length);
    for (const l of pendientes) expect(readySocialLinks()).not.toContain(l);
  });

  it('el componente consume readySocialLinks, nunca la lista completa', () => {
    const src = readFileSync(join(process.cwd(), 'components/SocialIcons.tsx'), 'utf8');
    expect(src).toMatch(/readySocialLinks/);
    expect(src).not.toMatch(/SOCIAL_LINKS\.map/);
  });

  it('cada perfil real aparece también en SITE.sameAs, salvo el enlace de WhatsApp', () => {
    // sameAs describe la entidad; un perfil visible que no está en el grafo es
    // una señal desperdiciada. wa.me es un canal de contacto, no un perfil.
    for (const l of readySocialLinks()) {
      if (l.href.startsWith('https://wa.me/')) continue;
      expect(SITE.sameAs, l.name).toContain(l.href);
    }
  });

  it('SITE.sameAs no contiene portadas de plataforma', () => {
    for (const u of SITE.sameAs) expect(PORTADAS.includes(u), u).toBe(false);
  });
});

describe('avisos legales: existen y describen el sitio real', () => {
  it('el pie enlaza a las páginas legales, no a /contacto', () => {
    const footer = readFileSync(join(process.cwd(), 'components/Footer.tsx'), 'utf8');
    expect(footer).toMatch(/href="\/privacidad"/);
    expect(footer).toMatch(/href="\/terminos"/);
    // El fallo original: ambos enlaces legales apuntaban al formulario.
    expect(footer).not.toMatch(/href="\/contacto"[^>]*>\s*Política de Privacidad/);
  });

  it('el ancla "Volver arriba" tiene destino real', () => {
    const footer = readFileSync(join(process.cwd(), 'components/Footer.tsx'), 'utf8');
    const layout = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8');
    if (footer.includes('href="#top"')) expect(layout).toMatch(/id="top"/);
  });

  it('ambos avisos tienen secciones con contenido', () => {
    for (const doc of [privacidad, terminos]) {
      expect(doc.length).toBeGreaterThan(3);
      for (const s of doc) {
        expect(s.heading.length).toBeGreaterThan(3);
        expect((s.body?.length ?? 0) + (s.list?.length ?? 0)).toBeGreaterThan(0);
      }
    }
  });

  it('la identidad declarada sale de lib/site.ts y no está escrita a mano', () => {
    const texto = [...privacidad, ...terminos]
      .flatMap((s) => [...(s.body ?? []), ...(s.list ?? [])])
      .join(' ');
    expect(texto).toContain(SITE.ruc);
    expect(texto).toContain(SITE.email);
    expect(texto).toContain(SITE.legalName);
  });

  it('no se prometen plazos, garantías ni certificaciones inventadas', () => {
    // La regla de la casa: la cotización manda. Un plazo publicado que nadie
    // puede cumplir es peor que no publicar ninguno.
    const texto = [...privacidad, ...terminos]
      .flatMap((s) => [...(s.body ?? []), ...(s.list ?? [])])
      .join(' ');
    expect(texto).not.toMatch(/\b\d+\s*(días|dias|meses|años|anios)\s+de\s+(garantía|garantia|devoluci)/i);
    expect(texto).not.toMatch(/certificad[oa]s?\s+(ISO|bajo la norma)/i);
    expect(texto).not.toMatch(/entrega en \d+ (días|dias|horas)/i);
  });

  it('la fecha del aviso es ISO y no se mueve en cada despliegue', () => {
    expect(LEGAL_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const legal = readFileSync(join(process.cwd(), 'lib/legal.ts'), 'utf8');
    expect(legal).not.toMatch(/new Date\(\)/);
  });

  it('el sitemap publica ambas páginas legales con la fecha del aviso', () => {
    const urls = new Map(sitemap().map((e) => [e.url, e.lastModified]));
    for (const path of ['/privacidad', '/terminos']) {
      const lastMod = urls.get(`${SITE.url}${path}`);
      expect(lastMod, path).toBeDefined();
      expect(new Date(lastMod as Date).toISOString().slice(0, 10)).toBe(LEGAL_UPDATED);
    }
  });
});
