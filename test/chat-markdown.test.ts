import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import ChatMarkdown, { urlSegura } from '@/components/ChatMarkdown';

/**
 * EL CHATBOT RENDERIZABA MARKDOWN COMO TEXTO LITERAL.
 *
 * `Chatbot.tsx` pintaba `message.content` a pelo: el visitante veía
 * `**Mallas Antiáfidas**` y `[Ver producto](https://...)` en lugar de
 * negrita y un enlace clicable. `<ChatMarkdown>` parsea el subconjunto que el
 * prompt del asistente puede producir (negrita, enlaces, párrafos, listas)
 * SIN `dangerouslySetInnerHTML`, y valida el esquema de cada URL antes de
 * convertirla en un `<a>` o un `<Link>` real.
 */

const html = (content: string) => renderToStaticMarkup(React.createElement(ChatMarkdown, { content }));

describe('urlSegura: lista blanca de esquemas', () => {
  it('acepta https, http, mailto, tel y rutas internas', () => {
    expect(urlSegura('https://plastilonas.com/x')).toBe('https://plastilonas.com/x');
    expect(urlSegura('http://plastilonas.com/x')).toBe('http://plastilonas.com/x');
    expect(urlSegura('mailto:ventas@plastilonas.com')).toBe('mailto:ventas@plastilonas.com');
    expect(urlSegura('tel:+51924875632')).toBe('tel:+51924875632');
    expect(urlSegura('/productos/mallas-antiafidas')).toBe('/productos/mallas-antiafidas');
  });

  it('rechaza esquemas ejecutables y protocolo-relativo', () => {
    expect(urlSegura('javascript:alert(1)')).toBeNull();
    expect(urlSegura('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(urlSegura('//evil.example.com/phish')).toBeNull();
    expect(urlSegura('vbscript:msgbox(1)')).toBeNull();
  });
});

describe('ChatMarkdown: negrita y párrafos', () => {
  it('convierte **texto** en <strong>', () => {
    const salida = html('Recomiendo **Mallas Antiáfidas** para su cultivo.');
    expect(salida).toContain('<strong>Mallas Antiáfidas</strong>');
    expect(salida).not.toContain('**');
  });

  it('separa párrafos en bloques <p> distintos', () => {
    const salida = html('Primer párrafo.\n\nSegundo párrafo.');
    expect(salida.match(/<p/g)?.length).toBe(2);
  });
});

describe('ChatMarkdown: enlaces', () => {
  it('convierte [texto](url) en un <a> real para https', () => {
    const salida = html('[Ver producto](https://plastilonas-peruanas-sac.vercel.app/productos/mallas-antiafidas)');
    expect(salida).toContain('<a ');
    expect(salida).toContain('href="https://plastilonas-peruanas-sac.vercel.app/productos/mallas-antiafidas"');
    expect(salida).toContain('target="_blank"');
    expect(salida).not.toContain('[Ver producto]');
  });

  it('convierte una ruta interna en un enlace navegable sin target=_blank', () => {
    const salida = html('[Ver producto](/productos/mallas-antiafidas)');
    expect(salida).toContain('href="/productos/mallas-antiafidas"');
    expect(salida).not.toContain('target="_blank"');
  });

  it('el correo de ventas se renderiza como mailto: clicable', () => {
    const salida = html('Ventas: [ventas@plastilonas.com](mailto:ventas@plastilonas.com)');
    expect(salida).toContain('href="mailto:ventas@plastilonas.com"');
    expect(salida).toContain('>ventas@plastilonas.com<');
  });

  it('el WhatsApp comercial se renderiza como enlace externo clicable', () => {
    const salida = html('[+51 924 875 632](https://wa.me/51924875632?text=Hola)');
    expect(salida).toContain('href="https://wa.me/51924875632?text=Hola"');
  });

  it('un esquema no permitido se degrada a texto plano, sin perder el contenido', () => {
    const salida = html('[haga clic](javascript:alert(1))');
    expect(salida).not.toContain('<a ');
    expect(salida).toContain('haga clic');
  });
});

describe('ChatMarkdown: listas', () => {
  it('convierte líneas "- item" en <ul><li>', () => {
    const salida = html('Opciones:\n- Mantas cobertoras\n- Mallas antiáfidas');
    expect(salida).toContain('<ul');
    expect((salida.match(/<li/g) ?? []).length).toBe(2);
    expect(salida).toContain('Mantas cobertoras');
  });

  it('convierte listas numeradas "1. item"', () => {
    const salida = html('1. Primero\n2. Segundo');
    expect((salida.match(/<li/g) ?? []).length).toBe(2);
  });
});
