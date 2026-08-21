import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  informes, informeBySlug, fuenteDe, fuentesUsadas, INFORMES_UPDATED,
} from '@/lib/informes';
import { buildInformePdf } from '@/lib/doc-informe';
import { generateStaticParams } from '@/app/informes/[slug]/page';
import sitemap from '@/app/sitemap';
import { SITE } from '@/lib/site';

/**
 * El archivo más delicado del sitio. Una cifra sin fuente en un informe no es
 * un error aislado: contamina el glosario, el marco y las guías, porque todos
 * valen por la misma propiedad — nada de lo publicado es inventado. Y una vez
 * que un modelo citó el dato, ya se propagó.
 */

describe('informes: toda cifra tiene procedencia', () => {
  it('cada indicador y cada gráfico resuelven a una fuente declarada', () => {
    for (const i of informes) {
      for (const id of fuentesUsadas(i)) {
        expect(fuenteDe(i, id), `${i.slug} → ${id}`).toBeDefined();
      }
    }
  });

  it('no hay fuentes declaradas que nadie use', () => {
    // Una fuente sin uso es una cita decorativa: da apariencia de rigor sin
    // respaldar ninguna cifra concreta.
    for (const i of informes) {
      const usadas = new Set(fuentesUsadas(i));
      for (const f of i.fuentes) {
        expect(usadas.has(f.id), `${i.slug}: fuente ${f.id} declarada pero sin usar`).toBe(true);
      }
    }
  });

  it('cada fuente declara organismo, URL real, fechas y qué respalda', () => {
    for (const i of informes) {
      for (const f of i.fuentes) {
        expect(f.organismo.length, f.id).toBeGreaterThan(3);
        expect(f.url).toMatch(/^https:\/\//);
        expect(f.publicado).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(f.consultado).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        // Sin esto, "Fuente: MINEM" no dice qué número respalda.
        expect(f.respalda.length, f.id).toBeGreaterThan(40);
      }
    }
  });

  it('ninguna verificación está fechada en el futuro', () => {
    // Se coló: dos fuentes decían haberse verificado "mañana", y el reporte de
    // vigilancia lo delató imprimiendo "verificada hace -1 días". Afirmar una
    // comprobación que todavía no ocurrió es pequeño y es exactamente el tipo
    // de imprecisión que este archivo entero existe para impedir.
    const hoy = new Date().toISOString().slice(0, 10);
    for (const i of informes) {
      for (const f of i.fuentes) {
        expect(f.consultado <= hoy, `${f.id}: consultado ${f.consultado} > hoy ${hoy}`).toBe(true);
      }
      expect(i.fecha <= hoy, `${i.slug} fechado ${i.fecha}`).toBe(true);
    }
  });

  it('no se verifica una fuente antes de que exista', () => {
    for (const i of informes) {
      for (const f of i.fuentes) {
        expect(f.consultado >= f.publicado, `${f.id}: consultado ${f.consultado} < publicado ${f.publicado}`).toBe(true);
      }
    }
  });

  it('ningún indicador se publica sin periodo', () => {
    // Una cifra sin periodo no es una cifra: es una impresión.
    for (const i of informes) {
      for (const s of i.secciones) {
        for (const ind of s.indicadores ?? []) {
          expect(ind.periodo.length, `${i.slug}: ${ind.etiqueta}`).toBeGreaterThan(3);
          expect(ind.valor.length, `${i.slug}: ${ind.etiqueta}`).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('informes: honestidad declarada', () => {
  it('cada informe declara qué NO afirma', () => {
    for (const i of informes) {
      expect(i.limitaciones.length, i.slug).toBeGreaterThanOrEqual(3);
      for (const l of i.limitaciones) expect(l.length).toBeGreaterThan(40);
    }
  });

  it('declara explícitamente que no estima el tamaño de su propio mercado', () => {
    // Es la invención más tentadora de un informe de sector y la más dañina:
    // no existe estadística pública verificable de este mercado.
    for (const i of informes) {
      const texto = i.limitaciones.join(' ').toLowerCase();
      expect(texto, i.slug).toMatch(/no estima|no cuantifica/);
      expect(texto, i.slug).toContain('mercado');
    }
  });

  it('no se publica un precio como si fuera vigente ni una lista propia', () => {
    // Un precio publicado que se queda viejo es peor que ninguno: el comprador
    // cotiza contra él, se equivoca, y nos lo atribuye con razón.
    for (const i of informes) {
      const texto = i.limitaciones.join(' ').toLowerCase();
      const hablaDePrecios = [...i.resumenEjecutivo, ...i.secciones.map((x) => x.heading)]
        .join(' ')
        .toLowerCase()
        .includes('precio');
      if (hablaDePrecios) {
        expect(texto, `${i.slug}: debe declarar que no publica precios vigentes`).toMatch(
          /no publica precios|no las use para cotizar|no publica.*lista/,
        );
      }
    }
  });

  it('las series de terceros se citan, no se redistribuyen', () => {
    // Las series de precios de resina son producto comercial de agencias.
    const conIcis = informes.filter((i) => i.fuentes.some((f) => /ICIS/i.test(f.organismo)));
    for (const i of conIcis) {
      expect(i.limitaciones.join(' ').toLowerCase(), i.slug).toMatch(
        /no se redistribuyen|producto comercial/,
      );
    }
  });

  it('ningún informe firma una previsión propia como si fuera un hecho', () => {
    // "Proyectamos que el mercado crecerá" es exactamente lo que no hacemos.
    const prohibido = /\b(proyectamos|estimamos que el mercado|prevemos que|nuestra proyección)\b/i;
    for (const i of informes) {
      const texto = [
        ...i.resumenEjecutivo,
        ...i.secciones.flatMap((s) => [...(s.cuerpo ?? []), s.implicacion ?? '']),
      ].join(' ');
      expect(prohibido.test(texto), i.slug).toBe(false);
    }
  });

  it('el resumen ejecutivo son frases autosuficientes y citables', () => {
    for (const i of informes) {
      expect(i.resumenEjecutivo.length).toBeGreaterThanOrEqual(3);
      for (const r of i.resumenEjecutivo) {
        expect(r.length, `${i.slug}: "${r.slice(0, 40)}"`).toBeGreaterThan(60);
        expect(r.trim().endsWith('.'), r.slice(0, 40)).toBe(true);
      }
    }
  });

  it('la lectura propia va separada del dato', () => {
    // `implicacion` existe justamente para que el lector distinga lo que dice
    // el organismo de lo que decimos nosotros.
    const conImplicacion = informes.flatMap((i) =>
      i.secciones.filter((s) => s.implicacion),
    );
    expect(conImplicacion.length).toBeGreaterThan(0);
    for (const s of conImplicacion) expect(s.implicacion!.length).toBeGreaterThan(80);
  });
});

describe('informes: gráficos', () => {
  const graficos = informes.flatMap((i) => i.secciones.map((s) => s.grafico).filter(Boolean));

  it('cada gráfico declara unidad, fuente y nota de alcance', () => {
    expect(graficos.length).toBeGreaterThan(0);
    for (const g of graficos) {
      expect(g!.unidad.length).toBeGreaterThan(3);
      expect(g!.fuenteId.length).toBeGreaterThan(0);
      // La nota dice qué NO muestra el gráfico: sin ella, una barra de
      // variación porcentual se lee como si fuera volumen.
      expect(g!.nota.length).toBeGreaterThan(60);
      expect(g!.datos.length).toBeGreaterThan(1);
    }
  });

  it('la serie temporal usa el componente de línea, no barras', () => {
    // La forma la decide el trabajo del dato: una trayectoria en barras obliga
    // a comparar alturas contiguas en vez de leer hacia dónde va.
    const page = readFileSync(join(process.cwd(), 'app/informes/[slug]/page.tsx'), 'utf8');
    expect(page).toMatch(/tipo === 'serie-temporal'/);
    expect(page).toMatch(/LineChart/);
  });

  it('la serie temporal declara en su nota que el eje no arranca en cero', () => {
    // Truncar el eje es correcto en una trayectoria y engañoso si no se dice.
    for (const g of graficos.filter((x) => x!.tipo === 'serie-temporal')) {
      expect(g!.nota.toLowerCase(), g!.titulo).toMatch(/no arranca en cero|no empieza en cero/);
    }
  });

  it('el gráfico de línea se renderiza en el servidor y trae tabla', () => {
    const src = readFileSync(join(process.cwd(), 'components/LineChart.tsx'), 'utf8');
    expect(src).not.toMatch(/^'use client'/m);
    expect(src).toMatch(/<table/);
    // Etiquetas sólo en los extremos: un número por punto es una tabla mal hecha.
    expect(src).toMatch(/datos\.length - 1/);
  });

  it('los gráficos de magnitud no llevan valores negativos', () => {
    for (const g of graficos) {
      if (g!.tipo === 'magnitud') {
        for (const d of g!.datos) expect(d.valor, `${g!.titulo}: ${d.etiqueta}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('el gráfico se renderiza en el servidor y sin JavaScript de cliente', () => {
    const src = readFileSync(join(process.cwd(), 'components/BarChart.tsx'), 'utf8');
    expect(src).not.toMatch(/^'use client'/m);
    expect(src).not.toMatch(/useState|useEffect/);
    // Tabla de respaldo: lector de pantalla, impresión y alto contraste.
    expect(src).toMatch(/<table/);
  });

  it('el eje divergente no depende solo del color', () => {
    // Cada barra lleva su valor con signo: la identidad nunca es color-solo.
    const src = readFileSync(join(process.cwd(), 'components/BarChart.tsx'), 'utf8');
    expect(src).toMatch(/signo/);
    expect(src).toMatch(/viz-barra-neg/);
  });
});

describe('informes: rutas, documento y descubrimiento', () => {
  it('generateStaticParams cubre todos los informes', () => {
    expect(generateStaticParams().map((p) => p.slug).sort()).toEqual(
      informes.map((i) => i.slug).sort(),
    );
  });

  it('informeBySlug encuentra cada informe y rechaza los inexistentes', () => {
    for (const i of informes) expect(informeBySlug(i.slug)?.titulo).toBe(i.titulo);
    expect(informeBySlug('no-existe')).toBeUndefined();
  });

  it('genera un PDF válido de cada informe, de forma determinista', async () => {
    // La espera entre las dos generaciones es el test. Sin ella esto pasaba
    // por accidente —cuando ambas caían en el mismo segundo— y encubría que
    // pdf-lib estampaba la hora del sistema en los metadatos, de modo que
    // cada compilación producía bytes distintos con el mismo contenido.
    for (const i of informes) {
      const a = await buildInformePdf(i, '2026-08-20');
      await new Promise((r) => setTimeout(r, 1100));
      const b = await buildInformePdf(i, '2026-08-20');
      expect(Buffer.from(a).equals(Buffer.from(b)), i.slug).toBe(true);
      const doc = await PDFDocument.load(a);
      expect(doc.getPageCount(), i.slug).toBeGreaterThan(1);
    }
  }, 30000);

  it('el sitemap publica el índice y cada informe con su fecha real', () => {
    const urls = new Map(sitemap().map((e) => [e.url, e.lastModified]));
    expect(urls.has(`${SITE.url}/informes`)).toBe(true);
    for (const i of informes) {
      const lastMod = urls.get(`${SITE.url}/informes/${i.slug}`);
      expect(lastMod, i.slug).toBeDefined();
      expect(new Date(lastMod as Date).toISOString().slice(0, 10)).toBe(i.fecha);
    }
  });

  it('INFORMES_UPDATED es la fecha del informe más reciente', () => {
    expect(INFORMES_UPDATED).toBe([...informes.map((i) => i.fecha)].sort().reverse()[0]);
  });
});

describe('vigilancia de fuentes: informa, no publica', () => {
  const src = readFileSync(join(process.cwd(), 'scripts/vigilancia-fuentes.mjs'), 'utf8');

  it('no escribe en ningún archivo del sitio', () => {
    // La línea que separa un mecanismo de vigilancia de una granja de
    // contenido: este script no publica nada, nunca.
    expect(src).not.toMatch(/writeFileSync|appendFileSync|createWriteStream/);
  });

  it('clasifica en cuatro estados, no en dos', () => {
    // Corregido dos veces con datos reales. Un 403 es un cortafuegos y un
    // fallo de red es indistinguible de una red local rota: ninguno prueba
    // que la cita murió. Contarlos como fallo llena el reporte de falsos
    // positivos hasta que nadie lo lee, que es cuando el mecanismo deja de
    // existir.
    for (const estado of ['ok', 'caida', 'bloqueado', 'revisar']) {
      expect(src, estado).toMatch(new RegExp(`'${estado}'`));
    }
  });

  it('solo 404 y 410 cuentan como cita rota', () => {
    // Son las dos únicas respuestas en que el servidor AFIRMA que el recurso
    // no existe. Todo lo demás es una conjetura sobre el estado de la cita.
    const fn = src.slice(src.indexOf('function clasificar'), src.indexOf('async function comprobar'));
    expect(fn).toMatch(/estado === 404 \|\| estado === 410\) return 'caida'/);
    expect(fn).not.toMatch(/return 'caida';\s*\n\}/);
  });

  it('un fallo de red no se declara caída', () => {
    // Un DNS que no resuelve y un dominio muerto dan exactamente el mismo
    // error. Se descubrió con una fuente que falló desde una red y cargó
    // desde otra.
    const captura = src.slice(src.indexOf('} catch (e)'), src.indexOf('} finally'));
    expect(captura).toMatch(/clase: 'revisar'/);
    expect(captura).not.toMatch(/clase: 'caida'/);
  });

  it('deduplica por URL antes de comprobar', () => {
    // Dos guías que citan la misma norma no son dos problemas: son uno.
    expect(src).toMatch(/porUrl/);
    expect(src).toMatch(/unicas/);
  });

  it('envía cabecera de navegador', () => {
    // Sin User-Agent, casi cualquier portal con cortafuegos responde 403 y el
    // reporte entero se vuelve ruido.
    expect(src).toMatch(/'User-Agent'/);
  });

  it('solo falla el proceso por caídas reales', () => {
    expect(src).toMatch(/process\.exit\(caidas \? 1 : 0\)/);
  });

  it('está enlazado como npm run vigilancia', () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
    expect(pkg.scripts.vigilancia).toContain('vigilancia-fuentes.mjs');
  });
});
