import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * LA TARJETA QUE SE COMPARTE.
 *
 * El canal comercial de esta empresa es WhatsApp: un enlace reenviado a un jefe
 * de compras es, muchas veces, el primer contacto. Sin tarjeta —imagen, título
 * y descripción— ese enlace es una línea de texto azul. Con tarjeta es una
 * pieza con el logo y el nombre de la página.
 *
 * `test/regresiones-ui.test.ts` ya vigila que ningún `openGraph` declarado se
 * quede sin `images`. Aquí se vigila lo que aquella prueba no puede ver: que
 * toda página tenga un `openGraph` en su cadena, que la imagen se resuelva
 * contra el host canónico y no contra localhost, y que el título de la tarjeta
 * sea el de la página y no el de la portada.
 */

const raiz = process.cwd();
const leer = (rel: string) => readFileSync(join(raiz, rel), 'utf8');

/** Los layouts raíz: uno por grupo de idioma. No hay app/layout.tsx —cada
 *  grupo sirve su propio <html lang> y ésa es toda su razón de existir. */
const LAYOUTS_RAIZ = readdirSync(join(raiz, 'app'), { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name.startsWith('('))
  .map((e) => `app/${e.name}/layout.tsx`)
  .filter((rel) => existsSync(join(raiz, rel)));

describe('toda página tiene tarjeta en su cadena', () => {
  it('hay un layout raíz por grupo de idioma y ninguno más', () => {
    expect(LAYOUTS_RAIZ.length).toBeGreaterThanOrEqual(3);
    expect(existsSync(join(raiz, 'app/layout.tsx')), 'un app/layout.tsx chocaría con los <html> de cada grupo').toBe(false);
  });

  for (const rel of LAYOUTS_RAIZ) {
    it(`${rel} declara metadataBase y una imagen de tarjeta`, () => {
      const src = leer(rel);
      // Sin metadataBase, Next resuelve la imagen contra http://localhost:3000
      // y la tarjeta llega rota a quien recibe el enlace.
      expect(src).toContain('metadataBase: new URL(SITE.url)');
      // Con imagen declarada aquí, ninguna página del grupo puede quedarse sin
      // ella: la hereda salvo que declare su propio openGraph, y en ese caso
      // regresiones-ui.test.ts exige que también declare images.
      expect(src).toMatch(/openGraph:\s*\{[\s\S]*?images:\s*OG_IMAGEN/);
    });

    it(`${rel} no fija el título ni la descripción de la tarjeta`, () => {
      /**
       * DEFECTO CORREGIDO. El layout de (es) traía `openGraph.title` y
       * `openGraph.description` con el texto de la portada. Toda página en
       * español que no declara su propio `openGraph` —/aplicaciones,
       * /biblioteca, /exportacion, /confianza y una veintena más— los heredaba
       * tal cual: compartir cualquiera de ellas mostraba el título de la
       * portada, no el suyo. Al no declararlos, Next rellena og:title y
       * og:description con los YA resueltos de cada página.
       */
      const src = leer(rel);
      const i = src.indexOf('openGraph: {');
      expect(i, 'este layout debería declarar openGraph').toBeGreaterThan(-1);
      const bloque = src.slice(i, src.indexOf('\n  },', i));
      expect(bloque, 'el título de la tarjeta lo pone cada página').not.toMatch(/^\s*title:/m);
      expect(bloque, 'la descripción de la tarjeta la pone cada página').not.toMatch(/^\s*description:/m);
    });
  }
});

describe('la imagen de la tarjeta se resuelve contra el host canónico', () => {
  it('ningún archivo de metadatos sociales cuelga de la raíz de app/', () => {
    /**
     * POR QUÉ ESTA REGLA, QUE PARECE UNA MANÍA.
     *
     * `app/opengraph-image.tsx` servía la imagen en /opengraph-image y, por la
     * convención de ficheros de Next, la heredaba TODA ruta del árbol. Entre
     * ellas la /_not-found que Next genera por su cuenta: al no existir
     * app/layout.tsx, esa ruta corre bajo un layout por defecto que no declara
     * `metadataBase`, y Next resolvía la imagen contra http://localhost:3000 y
     * lo avisaba en cada build («metadataBase property in metadata export is
     * not set…»). Un aviso permanente en el build es un aviso que se deja de
     * leer, y debajo se esconde el siguiente.
     *
     * Dentro de un grupo de idioma la URL pública es la misma —los grupos de
     * ruta no aparecen en la dirección— y la hereda un layout que sí declara
     * metadataBase.
     */
    const intrusos = readdirSync(join(raiz, 'app'), { withFileTypes: true })
      .filter((e) => e.isFile() && /^(opengraph|twitter)-image\b/.test(e.name))
      .map((e) => `app/${e.name}`);
    expect(intrusos, 'muévalo dentro de un grupo de idioma: la URL no cambia').toEqual([]);
  });

  it('la URL que declara OG_IMAGEN existe como ruta, una sola vez', () => {
    // Si el archivo desaparece o se duplica, OG_IMAGEN apunta a un 404 —o Next
    // falla por conflicto de ruta— y las 43 páginas que la piden se quedan sin
    // imagen sin que nada más lo note.
    expect(leer('lib/meta.ts')).toContain("url: '/opengraph-image'");
    const hallados: string[] = [];
    const recorrer = (dir: string) => {
      for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
        if (e.isDirectory()) recorrer(`${dir}/${e.name}`);
        else if (/^opengraph-image\.(tsx?|jsx?|png|jpe?g|gif)$/.test(e.name)) hallados.push(`${dir}/${e.name}`);
      }
    };
    recorrer('app');
    expect(hallados.length, `rutas /opengraph-image encontradas: ${hallados.join(', ')}`).toBe(1);
  });
});

describe('og:locale se declara como lo espera quien lee la tarjeta', () => {
  it('siempre en formato idioma_TERRITORIO', () => {
    // Open Graph define og:locale como language_TERRITORY. Las páginas en
    // inglés declaraban `en` a secas: los lectores que no lo toleran caen a su
    // valor por defecto, que es precisamente en_US, pero el que sí lo toma al
    // pie de la letra lo descarta. Cuesta un guión bajo.
    const malos: string[] = [];
    const recorrer = (dir: string) => {
      for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
        const rel = `${dir}/${e.name}`;
        if (e.isDirectory()) { recorrer(rel); continue; }
        if (!/\.tsx?$/.test(e.name)) continue;
        for (const m of leer(rel).matchAll(/\blocale:\s*'([^']+)'/g)) {
          if (!/^[a-z]{2}_[A-Z]{2}$/.test(m[1])) malos.push(`${rel} → ${m[1]}`);
        }
      }
    };
    recorrer('app');
    expect(malos).toEqual([]);
  });
});
