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

describe('la URL de la tarjeta la decide este repositorio', () => {
  it('la imagen NO es un archivo de metadatos de Next, en ninguna parte de app/', () => {
    /**
     * LA REGLA QUE ESCRIBÍ EN 0011 ERA LA EQUIVOCADA, Y EL ERROR SE VIO EN EL
     * BUILD SIGUIENTE.
     *
     * `app/opengraph-image.tsx` en la raíz de app/ lo heredaba TODA ruta del
     * árbol, incluida la /_not-found que Next genera sola: al no existir
     * app/layout.tsx, esa ruta corre bajo un layout por defecto sin
     * `metadataBase`, Next resolvía la imagen contra http://localhost:3000 y lo
     * avisaba en cada build. La entrega 0011 movió el archivo a app/(es)/ para
     * apagar el aviso —y lo apagó—, pero Next añade un sufijo de hash a la ruta
     * cuando algún segmento padre es un grupo (`getMetadataRouteSuffix`): la
     * ruta pasó a ser /opengraph-image-35z9gd y `OG_IMAGEN`, que apunta por
     * URL, quedó apuntando a un 404 en las 43 páginas que la piden.
     *
     * La lección no es «póngalo aquí y no allá»: es que la URL de un archivo de
     * convención no la decide este repositorio. Un manejador de ruta sí, y no
     * se hereda por el árbol. Por eso la regla prohíbe la convención ENTERA, no
     * una ubicación.
     */
    const convencion: string[] = [];
    const recorrer = (dir: string) => {
      for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
        const rel = `${dir}/${e.name}`;
        if (e.isDirectory()) { recorrer(rel); continue; }
        if (/^(opengraph|twitter)-image\d*\.(tsx?|jsx?|png|jpe?g|gif|svg)$/.test(e.name)) convencion.push(rel);
      }
    };
    recorrer('app');
    expect(
      convencion,
      'sírvala como manejador de ruta (app/og.png/route.tsx): su URL es su carpeta y nadie la hereda',
    ).toEqual([]);
  });

  it('la URL que declara OG_IMAGEN existe como ruta servible', () => {
    // Sin esto, cambiar la carpeta rompe en silencio las 43 páginas que piden
    // la tarjeta: el HTML sigue emitiendo og:image y lo que llega es un 404.
    const url = leer('lib/meta.ts').match(/url:\s*'([^']+)'/)?.[1];
    expect(url, 'OG_IMAGEN debe declarar su URL').toBeTruthy();
    expect(url!.startsWith('/'), 'relativa, para que metadataBase la resuelva').toBe(true);
    const carpeta = `app${url}`;
    const existe =
      existsSync(join(raiz, carpeta, 'route.ts')) || existsSync(join(raiz, carpeta, 'route.tsx'));
    expect(existe, `no hay manejador de ruta en ${carpeta}`).toBe(true);
  });

  it('el nombre viejo sigue redirigiendo a la tarjeta', () => {
    // WhatsApp, LinkedIn y Slack guardan la imagen por URL. Los enlaces
    // compartidos antes del cambio pierden su tarjeta sin este 301.
    const cfg = leer('next.config.ts');
    expect(cfg).toMatch(/source:\s*'\/opengraph-image',\s*destination:\s*'\/og\.png',\s*permanent:\s*true/);
  });

  it('la tarjeta se prerenderiza y no se calcula en cada petición', () => {
    // Es una imagen fija: generarla por petición gasta tiempo de función cada
    // vez que un rastreador social pasa, y pasan mucho.
    const src = leer('app/og.png/route.tsx');
    expect(src).toContain("export const dynamic = 'force-static'");
    expect(src).toContain("export const runtime = 'nodejs'");
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
