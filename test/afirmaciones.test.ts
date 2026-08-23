import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * NO SE AFIRMA LO QUE NO SE PUEDE SOSTENER.
 *
 * En /nosotros —la página que un comprador industrial abre precisamente para
 * verificar quién es el proveedor— se leía: «Únase a más de 500 empresas que
 * ya confían en Plastilonas Peruanas». Esa cifra no sale de ningún sistema de
 * esta empresa. No hay recuento de clientes publicable, ni autorización de
 * ninguno para contarlo, ni forma de que un tercero la compruebe.
 *
 * El daño no es el de una exageración publicitaria cualquiera. Todo el resto
 * del sitio está construido sobre lo contrario: /proyectos no publica ni una
 * ficha sin confirmación, /confianza enumera lo que NO se afirma, los informes
 * separan el dato oficial de la lectura propia, y /calidad describe el proceso
 * en vez de exhibir un certificado que no existe. Una cifra inventada en la
 * página «Nosotros» le da a quien homologa una razón para desconfiar de todo
 * lo demás, que sí es cierto.
 *
 * Esta prueba mira el texto que se sirve, no la intención de quien lo escribe.
 */

const raiz = process.cwd();
const MIRAR = ['app', 'components', 'lib', 'data'];

/**
 * Cada patrón es una forma concreta de afirmar algo que esta empresa no puede
 * respaldar con un documento. No se persiguen adjetivos: se persiguen hechos
 * comprobables que no lo son.
 */
const PROHIBIDO: { re: RegExp; porque: string }[] = [
  {
    re: /(más de|mas de|\+)\s*\d[\d.,]*\s*(empresas|clientes|obras|proyectos ejecutados|instalaciones)/i,
    porque: 'recuento de clientes u obras que no consta en ningún sistema publicable',
  },
  {
    re: /\b(líder|lider|l[ií]deres)\s+(del|en el)\s+(mercado|rubro|sector)/i,
    porque: 'liderazgo de mercado sin estudio que lo sostenga (y no existe estadística pública del rubro)',
  },
  {
    re: /\b(somos|estamos)\s+certificad\w*\s+(iso|astm|ce\b|ul\b)/i,
    porque: 'certificación propia: no la hay. Se cita la norma ajena, nunca un certificado propio',
  },
  {
    re: /\benv[ií]os?\s+a\s+todo\s+el\s+mundo\b(?![^.]{0,120}\bno\b)/i,
    porque: 'envío mundial: el suministro internacional se evalúa por operación',
  },
  {
    re: /\bgarant[ií]a\s+de\s+por\s+vida\b/i,
    porque: 'garantía sin plazo ni condiciones escritas',
  },
  {
    re: /\b(oficinas?|sedes?|filiales?|sucursales?)\s+en\s+(chile|colombia|ecuador|bolivia|brasil|m[eé]xico|todo el pa[ií]s)/i,
    porque: 'sedes que no existen: hay una planta, en Chorrillos',
  },
];

function fuentes(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`;
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    if (e.isDirectory()) fuentes(rel, out);
    else if (/\.(ts|tsx|json)$/.test(e.name) && statSync(join(raiz, rel)).size < 2_000_000) out.push(rel);
  }
  return out;
}

describe('el sitio no afirma lo que no puede sostener', () => {
  const archivos = MIRAR.flatMap((d) => fuentes(d));

  for (const { re, porque } of PROHIBIDO) {
    it(`no aparece: ${porque}`, () => {
      const hallazgos: string[] = [];
      for (const f of archivos) {
        for (const [n, linea] of readFileSync(join(raiz, f), 'utf8').split('\n').entries()) {
          // Una línea de comentario que EXPLICA por qué se retiró la frase no
          // es la frase. Documentar el error es parte de no repetirlo.
          const t = linea.trim();
          if (t.startsWith('*') || t.startsWith('//') || t.startsWith('{/*')) continue;
          if (re.test(linea)) hallazgos.push(`${f}:${n + 1}  ${t.slice(0, 120)}`);
        }
      }
      expect(hallazgos.join('\n'), porque).toBe('');
    });
  }
});
