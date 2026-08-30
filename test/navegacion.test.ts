import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { INDUSTRIAS } from '../lib/industrias';

const raiz = process.cwd();
const fuente = readFileSync(join(raiz, 'components/Navbar.tsx'), 'utf8');

/**
 * El mismo archivo sin comentarios. Hace falta porque estas pruebas afirman
 * cosas sobre lo que el componente HACE, y un comentario que EXPLICA por qué
 * algo no está —«no lleva role="menu", y este es el motivo»— contiene la
 * cadena que se está prohibiendo. La primera versión de la prueba se cazó a sí
 * misma: falló señalando el párrafo que documenta el arreglo.
 */
const codigo = fuente
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^\s*\/\/.*$/gm, '');

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
  return (
    existsSync(join(raiz, 'app', limpio, 'page.tsx')) ||
    existsSync(join(raiz, 'app', '(es)', limpio, 'page.tsx'))
  );
}

describe('navegación principal', () => {
  const primerNivel = entradasDePrimerNivel();

  it('declara exactamente las entradas de primer nivel esperadas', () => {
    // Etapa 2: cuatro entradas + CTA «Cotizar». Soluciones y Nosotros viven
    // bajo Recursos; el CTA es un enlace fijo a /cotizacion, no una entrada.
    expect(primerNivel.map((e) => e.label)).toEqual([
      'Productos', 'Industrias', 'Servicios', 'Recursos',
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

  /**
   * EL TRAYECTO DEL PUNTERO.
   *
   * Lo que estas cuatro pruebas defienden no se ve en una captura ni lo mide
   * ninguna prueba de maquetación: el panel se dibujaba bien, en su sitio y con
   * todo dentro. Lo que fallaba era llegar hasta él. Entre el borde del botón y
   * el borde del panel había doce píxeles que no pertenecían a ningún elemento,
   * y el manejador que cierra vive en el contenedor, cuya caja termina en el
   * botón —un hijo `absolute` no agranda a su padre—. El puntero que bajaba
   * cruzaba esa franja, salía del contenedor y el panel se ocultaba antes de
   * que llegara. `npm run auditar:navegacion` lo midió: 48 de 48 paneles, los
   * cuatro grupos en los cuatro anchos.
   *
   * Son pruebas de código fuente y no de comportamiento, a propósito: el
   * auditor de Chromium ya comprueba el comportamiento, pero tarda cuatro
   * minutos y corre al final. Estas tardan milisegundos y rompen en cuanto
   * alguien quita la pieza, que es cuando conviene enterarse.
   */
  it('el panel extiende su zona sensible hasta el botón', () => {
    // Sin este puente, la franja de `mt-3` vuelve a ser tierra de nadie.
    /**
     * El puente es un ELEMENTO, no un pseudoelemento del panel. Con `before:`
     * no funcionaba: el panel lleva `overflow-y-auto` y eso recorta cuanto
     * sobresalga de su caja, incluido algo colocado 12px por encima. Existía
     * en las clases y no en pantalla.
     */
    // Dos formas de puente: el de grupo y el de «Más» abarcan su zona
    // (left-0/right-0); el del mega abarca EL PANEL (inset-x-0 mx-auto con el
    // mismo ancho que el panel), porque el panel ya no hereda el ancho de la
    // zona de navegación.
    const puentesZona = [...codigo.matchAll(/absolute top-full (left-0 right-0|left-0|right-0) h-5/g)];
    const puentesPanel = [...codigo.matchAll(/absolute top-full inset-x-0 mx-auto h-5/g)];
    expect(
      puentesZona.length + puentesPanel.length,
      'cada desplegable necesita su puente: el de grupo, el de «Más» y el mega',
    ).toBeGreaterThanOrEqual(3);
    expect(puentesPanel.length, 'el mega lleva puente del ancho del panel').toBeGreaterThanOrEqual(1);
    expect(codigo, 'el puente no puede vivir dentro del panel: overflow lo recorta')
      .not.toMatch(/before:-top-3/);
  });

  it('el cierre es diferido, no inmediato', () => {
    // Cerrar al instante castiga cualquier temblor de la mano en el trayecto.
    expect(codigo).toMatch(/setTimeout\(\(\) => setAbierto\(null\), \d+\)/);
  });

  it('el cierre lo maneja la zona entera, no cada grupo por separado', () => {
    /**
     * Con `onMouseLeave` en cada grupo, pasar por encima del vecino camino de
     * tu propio panel programaba un cierre, y el resultado dependía del orden
     * de los eventos y de la velocidad de la mano: el fallo salía en una
     * ejecución y no en la siguiente. En `zonaNav` —que contiene la fila y los
     * paneles— sólo se dispara al abandonar toda la navegación.
     */
    expect(codigo).toMatch(/manejadoresZona/);
    // Y el cambio entre grupos sigue siendo diferido: hacen falta las dos.
    expect(codigo).toMatch(/cambioPendiente/);
    expect(codigo).toMatch(/const manejadoresZona = \{[\s\S]*?onMouseLeave: cerrarConRetardo/);
    // Y cualquier movimiento dentro de la zona cancela un cierre pendiente.
    expect(codigo).toMatch(/onMouseMove: cancelarCierre/);
    // Y ningún grupo puede volver a llevar el suyo.
    expect(codigo).not.toMatch(/const manejadores = \(clave: string\) => \(\{[^}]*onMouseLeave/);
  });

  it('los desplegables se abren también con el teclado', () => {
    // Sin onFocus/onBlur el menú sólo existe para quien usa ratón, y con él
    // desaparecen del recorrido tanto una persona con teclado como un agente
    // que navega por el árbol de accesibilidad.
    expect(codigo).toMatch(/onFocus:/);
    expect(codigo).toMatch(/onBlur:/);
  });

  it('los paneles de navegación no se declaran como menú de aplicación', () => {
    /**
     * `role="menu"` es para menús de aplicación, no para listas de enlaces.
     * Puesto sobre estos paneles, un lector de pantalla deja de anunciar los
     * enlaces como enlaces y pasa a esperar navegación por flechas que nadie
     * implementó. El patrón correcto —y el que un agente lee sin ambigüedad—
     * es el de divulgación: botón con aria-expanded y aria-controls.
     */
    expect(codigo).not.toMatch(/role="menu"/);
    expect(codigo).toMatch(/aria-controls=/);
    expect(codigo).not.toMatch(/aria-haspopup/);
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
  const layout = readFileSync(join(raiz, 'app/(es)/layout.tsx'), 'utf8');

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

describe('el mega-menú no hereda el ancho de la zona de navegación', () => {
  /**
   * EL FALLO QUE MOTIVA ESTE BLOQUE. El panel del catálogo medía `w-full` de
   * zonaNav, y zonaNav es lo que SOBRA tras logo, buscador y CTA dentro de un
   * contenedor que se detiene en 1280px. En pantallas anchas la derecha
   * revelaba más piezas, zonaNav se encogía a ~350px y el catálogo entero se
   * servía palabra por palabra en columnas de 100px — con todas las
   * auditorías en verde, porque ninguna medía la forma. La regla queda
   * escrita: el ancho del panel se declara contra el contenedor de la
   * cabecera, nunca contra el hueco sobrante.
   */
  const codigo = readFileSync(join(process.cwd(), 'components/Navbar.tsx'), 'utf8');

  it('el panel declara su ancho propio, no w-full de zonaNav', () => {
    expect(codigo).toContain('w-[min(860px,calc(100%-2rem))]');
    expect(codigo, 'w-full ataría el panel al ancho sobrante de la zona')
      .not.toMatch(/mega-menu absolute[^`]*w-full/);
  });

  it('el contenedor de la cabecera es el ancla posicional del panel', () => {
    expect(codigo).toMatch(/relative max-w-7xl mx-auto/);
  });

  it('el buscador no crece con el viewport a costa de la navegación', () => {
    // El rótulo «Buscar productos ⌘K» en 2xl robaba ~190px a zonaNav dentro
    // de un contenedor fijo: más pantalla no puede significar menos menú.
    expect(codigo).not.toMatch(/2xl:inline[^<]*Buscar productos/);
    expect(codigo).not.toMatch(/hidden 2xl:block[^<]*⌘K/);
  });

  it('el auditor de navegación mide la forma, no solo la pulsabilidad', () => {
    const auditor = readFileSync(join(process.cwd(), 'scripts/auditar-navegacion.mjs'), 'utf8');
    expect(auditor).toContain('panel-estrecho');
    expect(auditor).toContain('texto-estrujado');
    expect(auditor, 'el panel se resuelve por aria-controls, no por posición')
      .toContain("getAttribute('aria-controls')");
  });
});
