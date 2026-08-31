import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * REGRESIONES DE INTERFAZ — lo que encontró la auditoría de navegador y no
 * puede volver a colarse.
 *
 * POR QUÉ ESTE ARCHIVO EXISTE. Las otras 747 pruebas leen archivos y llaman
 * funciones: ninguna abre un navegador. Por eso convivieron durante trece
 * etapas, con el repositorio en verde, un enlace del catálogo que llevaba a un
 * 404, un formulario cuyos errores no existían para un lector de pantalla, una
 * calculadora ilegible en modo oscuro y una barra flotante que tapaba los
 * avisos legales en once páginas.
 *
 * El arné que los encontró vive en scripts/diagnostico/ y necesita el sitio
 * levantado, así que no puede correr en `npm test`. Lo que SÍ puede correr
 * aquí es el invariante de código que cada arreglo dejó. Eso es lo que hay
 * debajo: una aserción por defecto real, con el defecto escrito al lado para
 * que quien la rompa sepa qué está deshaciendo.
 */

const raiz = process.cwd();
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

describe('enlaces que existen', () => {
  it('el botón «Comparar» de una familia usa el mismo predicado que genera la ruta', () => {
    // DEFECTO: /productos/familia/seguridad-industrial pintaba «Comparar las 4»
    // y esa ruta no existe — `comparableFamilies()` exige además al menos una
    // fila comparable. Cuatro fichas, ninguna especificación compartida, 404.
    const src = leer('app/(es)/productos/familia/[slug]/page.tsx');
    expect(src).toContain('comparableFamilies');
    expect(src).toContain('const comparable = comparableFamilies()');
    expect(src).toContain('{comparable && (');
    expect(src, 'volvió el predicado suelto').not.toContain('{items.length >= 2 && (');
  });
});

describe('lo que flota no tapa lo que se toca', () => {
  it('la barra móvil de contacto reserva su propio alto al final del documento', () => {
    // DEFECTO: `position: fixed` no ocupa sitio. Al fondo de la página la barra
    // se comía «Política de Privacidad» y «Términos y Condiciones» en 11 de 13
    // rutas medidas. Son avisos legales: tienen que ser alcanzables.
    const src = leer('components/BarraMovilContacto.tsx');
    expect(src).toContain('aria-hidden="true"');
    expect(src).toContain('env(safe-area-inset-bottom)');
    expect(src, 'el espaciador desapareció').toMatch(/height: 'calc\(48px \+ env\(safe-area-inset-bottom\)\)'/);
  });

  it('los avisos legales no se alinean bajo el botón flotante del asistente', () => {
    // El lanzador del chat vive en `fixed bottom-20 right-6` (64×64). Con la
    // fila legal centrada, «Términos y Condiciones» caía justo debajo.
    expect(leer('components/Footer.tsx')).toContain('items-start md:items-center');
  });
});

describe('los controles tienen nombre', () => {
  it('el catálogo etiqueta su ordenador y sus dos vistas', () => {
    // DEFECTO: un <select> sin label/aria-label/name y dos botones de icono sin
    // texto. Para un lector de pantalla, tres controles anónimos en la página
    // de catálogo.
    const src = leer('components/CatalogoFiltrado.tsx');
    expect(src).toContain('htmlFor="orden-catalogo"');
    expect(src).toContain('id="orden-catalogo"');
    expect(src).toContain('aria-label="Ver en cuadrícula"');
    expect(src).toContain('aria-label="Ver en lista"');
    expect(src).toContain('aria-label="Forma de ver el catálogo"');
  });

  it('la cabecera es un landmark de banner con nombre', () => {
    // DEFECTO: la raíz de Navbar era un <div>, así que la barra utilitaria
    // superior quedaba fuera de toda región y no había atajo a la cabecera.
    const src = leer('components/Navbar.tsx');
    expect(src).toContain('<header');
    expect(src).toContain('aria-label="Navegación principal"');
  });
});

describe('las pestañas de la portada son pestañas', () => {
  it('declaran tablist/tab/tabpanel y no un interruptor', () => {
    // DEFECTO: se declaraban con `aria-pressed`, que se anuncia como
    // «pulsado / no pulsado», no como «pestaña 2 de 4». En el MISMO
    // repositorio, MachineryGallery ya lo hacía bien.
    const src = leer('components/ServiceTabs.tsx');
    expect(src).toContain('role="tablist"');
    expect(src).toContain('role="tab"');
    expect(src).toContain('role="tabpanel"');
    expect(src).toContain('aria-selected={on}');
    expect(src).toContain('aria-controls="panel-servicio"');
    expect(src).toContain('tabIndex={on ? 0 : -1}');
  });

  it('el avance automático se puede detener con el dedo (WCAG 2.2.2)', () => {
    // DEFECTO: rotaba cada 5 s y la única pausa era `hover`, que en un
    // teléfono no existe: el contenido cambiaba mientras alguien lo leía.
    const src = leer('components/ServiceTabs.tsx');
    expect(src).toContain('const [pausado, setPausado] = useState(false)');
    expect(src).toContain('if (hover || pausado) return;');
    expect(src).toContain('Pausar el avance automático');
  });
});

describe('el formulario que trae el dinero se puede usar sin ver', () => {
  it('cada campo declara si es obligatorio y si está inválido', () => {
    // DEFECTO: `noValidate` + react-hook-form pintaba el error como un <p>
    // rojo y nada más. Sin aria-invalid, sin aria-describedby y sin
    // role="alert": quien usa lector de pantalla pulsaba «Enviar» y no oía
    // absolutamente nada.
    const src = leer('components/CotizacionForm.tsx');
    expect(src).toContain("const aria = (nombre: string, obligatorio = false)");
    expect(src).toContain("'aria-invalid'");
    expect(src).toContain("'aria-describedby'");
    expect(src).toContain("'aria-required'");
    expect(src).toContain('role="alert"');
    // Los seis obligatorios reales del RFQ.
    for (const c of ['nombre', 'empresa', 'email', 'telefono', 'ciudadEntrega', 'mensaje']) {
      expect(src, `${c} dejó de declararse obligatorio`).toContain(`aria('${c}', true)`);
    }
  });

  it('cada mensaje de error tiene el id al que apunta su campo', () => {
    const src = leer('components/CotizacionForm.tsx');
    for (const c of ['nombre', 'empresa', 'email', 'telefono', 'ciudadEntrega', 'mensaje']) {
      expect(src, `falta el id del error de ${c}`).toContain(`id="${c}-error"`);
    }
  });
});

describe('modo oscuro: lo que se lee, se lee', () => {
  const css = leer('app/globals.css');

  it('los controles de formulario siguen al tema', () => {
    // DEFECTO: la capa oscura remapeaba la TINTA de `.text-gray-900` pero no
    // el FONDO de `input.bg-white` (los inputs no estaban en la lista de
    // elementos). Resultado: fondo blanco + tinta clara = 1.16:1, texto
    // invisible, en las cinco calculadoras y en el ordenador del catálogo.
    expect(css).toContain('.dark main :is(input, select, textarea).bg-white');
    expect(css).toContain('.dark main :is(input, textarea)::placeholder');
  });

  it('los tintes con modificador de opacidad también se remapean', () => {
    // DEFECTO: la capa selecciona `.bg-emerald-50`; Tailwind genera OTRA clase
    // cuando se le pone opacidad —`bg-emerald-50/60`— y el verde translúcido
    // se mezclaba con la superficie oscura hasta dar un gris sucio con tinta
    // clara encima (3.1:1). Afectaba a los bloques «Qué no afirmamos», que son
    // los que más se leen.
    expect(css).toContain('[class*="bg-emerald-50/"]');
    expect(css).toContain('[class*="bg-amber-50/"]');
    expect(css).toContain('[class*="bg-gray-50/"]');
    // Y NO al botón blanco del CTA: `hover:bg-white/90` casaba con
    // [class*="bg-white/"] y lo pintaba oscuro con tinta #0A2540 → 1.09:1.
    expect(css, 'volvió la regla que rompía el CTA blanco').not.toContain('[class*="bg-white/"]');
  });

  it('el bloque de respuesta directa tiene tratamiento propio', () => {
    expect(css).toContain('.dark .respuesta-directa');
  });

  it('el verde de acción se aclara también fuera de <main>', () => {
    // La cabecera, el pie y la barra móvil viven sobre --surface-nav, donde
    // #047857 da 2.56:1. Incluye el botón «WhatsApp» de la barra inferior.
    expect(css).toContain('.dark :is(header, footer, nav) :is(.text-\\[\\#047857\\], .text-\\[\\#059669\\])');
  });
});

describe('las tablas anchas se recorren con el teclado', () => {
  it('cada contenedor con scroll horizontal es enfocable y tiene nombre', () => {
    // WCAG 2.1.1: sin tabIndex, quien no usa ratón ni dedo no llega a las
    // columnas de la derecha.
    for (const f of [
      'components/CunaHub.tsx',
      'components/CunaHubEn.tsx',
      'components/FabricarOImportar.tsx',
      'app/(es)/productos/[slug]/page.tsx',
      'app/(es)/productos/familia/[slug]/comparar/page.tsx',
      'app/(en)/en/sourcing-from-peru/page.tsx',
    ]) {
      const src = leer(f);
      expect(src, `${f}: contenedor con scroll sin tabIndex`).toMatch(
        /overflow-x-auto[^"]*"\s+tabIndex=\{0\}\s+role="region"/,
      );
    }
  });
});

describe('el arné de diagnóstico sigue en su sitio', () => {
  it('los cinco diagnósticos y su índice de rutas existen', () => {
    for (const f of [
      'scripts/diagnostico/rutas.mjs',
      'scripts/diagnostico/01-maquetacion.mjs',
      'scripts/diagnostico/02-interaccion.mjs',
      'scripts/diagnostico/03-arquitectura.mjs',
      'scripts/diagnostico/04-accesibilidad.mjs',
      'scripts/diagnostico/07-solapamiento.mjs',
    ]) {
      expect(() => leer(f), f).not.toThrow();
    }
  });

  it('se puede lanzar con un comando y su salida está ignorada', () => {
    const pkg = JSON.parse(leer('package.json'));
    expect(pkg.scripts.diagnostico).toContain('scripts/diagnostico/');
    expect(pkg.devDependencies['axe-core'], 'axe-core es la fuente del veredicto').toBeTruthy();
    expect(leer('.gitignore')).toContain('/.diagnostico/');
  });
});
