import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { INDUSTRIAS } from '../lib/industrias';

const raiz = process.cwd();
const fuente = readFileSync(join(raiz, 'components/Navbar.tsx'), 'utf8');

/** Entradas de primer nivel declaradas en el array NAV. */
function entradasDePrimerNivel(): { label: string; href: string }[] {
  const bloque = fuente.slice(fuente.indexOf('const NAV: Entrada[]'), fuente.indexOf('/** Todas las rutas'));
  // Solo el nivel superior: las entradas hijas viven dentro de `hijos: [...]`.
  const sinHijos = bloque.replace(/hijos:\s*\[[\s\S]*?\n\s{4}\],/g, 'hijos: [],').replace(/hijos:\s*INDUSTRIAS[^,]*,/g, 'hijos: [],');
  const salida: { label: string; href: string }[] = [];
  const re = /\{\s*tipo:\s*'(?:mega|grupo|enlace)',\s*href:\s*'([^']+)',\s*label:\s*'([^']+)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sinHijos))) salida.push({ href: m[1], label: m[2] });
  return salida;
}

/** ¿Existe la ruta en app/? Acepta segmentos dinámicos. */
function rutaExiste(href: string): boolean {
  const limpio = href.split('?')[0].replace(/^\//, '');
  if (limpio === '') return true;
  const directo = join(raiz, 'app', limpio, 'page.tsx');
  return existsSync(directo);
}

describe('navegación principal', () => {
  const primerNivel = entradasDePrimerNivel();

  it('declara exactamente las entradas de primer nivel esperadas', () => {
    expect(primerNivel.map((e) => e.label)).toEqual([
      'Productos', 'Industrias', 'Soluciones', 'Servicios', 'Recursos', 'Nosotros',
    ]);
  });

  /**
   * El límite no es estético. Con once entradas la barra se recortaba en todos
   * los anchos entre 1024 y 1920 px —el CTA «Solicitar Cotización» terminaba
   * fuera de pantalla en Full HD—. Seis caben con holhura; por encima de siete
   * conviene agrupar antes que confiar en que «Más» lo recoja todo.
   */
  it('no crece más allá de siete entradas de primer nivel', () => {
    expect(primerNivel.length).toBeLessThanOrEqual(7);
  });

  it('todas las rutas del menú existen en app/', () => {
    const rotas = primerNivel.filter((e) => !rutaExiste(e.href));
    expect(rotas.map((e) => e.href), 'entradas del menú sin página').toEqual([]);
  });

  it('no repite destinos en el primer nivel', () => {
    const hrefs = primerNivel.map((e) => e.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('los sectores del menú se derivan de lib/industrias.ts, no de una copia', () => {
    // Si alguien pega una lista fija de sectores, este menú se desincroniza el
    // día que se añada un sector. Debe leerse de la fuente única.
    expect(fuente).toMatch(/hijos:\s*INDUSTRIAS\.map/);
    expect(INDUSTRIAS.length).toBeGreaterThanOrEqual(5);
  });

  it('los paneles se ocultan con display:none, no con visibility', () => {
    // `invisible` mantiene la caja en el layout: un panel cerrado de 320px
    // anclado cerca del borde derecho empujaba el ancho de scroll del
    // documento y creaba desplazamiento horizontal en toda la página.
    expect(fuente).not.toMatch(/invisible opacity-0/);
    expect(fuente).toMatch(/\? 'block' : 'hidden'/);
  });

  it('la zona de navegación puede encogerse (min-w-0)', () => {
    // Sin min-w-0 un hijo con whitespace-nowrap fija el ancho del padre y el
    // contenido se sale de la pantalla en lugar de replegarse.
    expect(fuente).toMatch(/ref=\{zonaNav\}[^>]*min-w-0/);
  });

  it('mide el ancho real en vez de confiar en un breakpoint', () => {
    expect(fuente).toMatch(/ResizeObserver/);
    expect(fuente).toMatch(/useEntradasQueCaben/);
  });

  it('el encabezado respeta el área segura de pantallas con recorte', () => {
    expect(fuente).toMatch(/env\(safe-area-inset-left\)/);
    expect(fuente).toMatch(/env\(safe-area-inset-right\)/);
  });

  it('el menú móvil se acota con dvh, no con vh', () => {
    // En iOS la barra del navegador cambia de alto al desplazarse; vh conserva
    // la medida grande y el final del menú queda bajo la interfaz del sistema.
    expect(fuente).toMatch(/100dvh/);
    expect(fuente).not.toMatch(/max-h-\[calc\(100vh/);
  });
});

describe('viewport del documento', () => {
  const layout = readFileSync(join(raiz, 'app/layout.tsx'), 'utf8');

  it('declara viewportFit cover para habilitar env(safe-area-inset-*)', () => {
    expect(layout).toMatch(/viewportFit:\s*'cover'/);
  });

  it('no bloquea el zoom del usuario', () => {
    // Fijar maximumScale o userScalable:false incumple WCAG 1.4.4 y hace
    // ilegible una ficha técnica en un teléfono.
    expect(layout).not.toMatch(/userScalable:\s*false/);
    expect(layout).not.toMatch(/maximumScale:\s*1\b/);
  });
});
