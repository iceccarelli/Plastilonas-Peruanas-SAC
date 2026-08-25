import { SITE } from '@/lib/site';
import { products, productFamilies } from '@/lib/products';
import { familyContent } from '@/lib/families';
import { INDUSTRIAS, descripcionIndustria } from '@/lib/industrias';
import { terminos } from '@/lib/glosario';
import { guides } from '@/lib/guides';
import { productFaqs } from '@/lib/product-faq';
import { clusterDeRuta, clustersApoyadosPor, terminosDe } from '@/lib/search/topic-map';
import { hechosCitables } from '@/lib/content/claims';
import type { Product } from '@/lib/types';

/**
 * ESPEJOS EN MARKDOWN — para máquinas, no para buscadores.
 *
 * QUÉ PROBLEMA RESUELVEN. Un agente que quiere citar una ficha de producto
 * tiene que descargar el HTML de una aplicación React: carrusel, galería,
 * modal de cotización, calculadora embebida, scripts. El texto que necesita
 * está ahí, pero rodeado de marcado que no aporta y que se come su ventana de
 * contexto. Estos espejos sirven el mismo contenido en texto plano, con la
 * misma información y ningún adorno.
 *
 * POR QUÉ NO COMPITEN EN BÚSQUEDA, y esto es lo importante. Cada espejo va con
 * `X-Robots-Tag: noindex` y con `Link: rel="canonical"` apuntando a la versión
 * HTML. Dos URLs con el mismo texto son contenido duplicado, y si el buscador
 * elige el .md, el usuario aterriza en un archivo de texto en vez de en la
 * página que sí convierte. El espejo existe para ser LEÍDO por una máquina y
 * para no ser INDEXADO nunca. Ambas cosas están declaradas explícitamente:
 * ninguna se deja a la interpretación del rastreador.
 *
 * QUÉ INCLUYEN Y QUÉ NO. Incluyen lo que el catálogo declara: especificaciones,
 * aplicaciones, beneficios, abastecimiento, disponibilidad, FAQ derivada, y el
 * bloque de hechos citables con RUC, ubicación y fecha de verificación. No
 * incluyen precio —el catálogo no lo publica—, ni plazo, ni certificado propio.
 */

const base = SITE.url;

const SOURCING_ES: Record<string, string> = {
  fabricacion_propia: 'Fabricación propia (planta de Chorrillos, Lima)',
  importacion_directa: 'Importación directa bajo control de calidad propio',
  bajo_pedido: 'Línea bajo pedido, con plazo confirmado en cotización',
  partner: 'Provisto mediante aliado técnico, bajo coordinación propia',
};

const DISPONIBILIDAD_ES: Record<string, string> = {
  stock: 'SKU estandarizado, sujeto a stock',
  a_medida: 'Se fabrica a medida de la especificación',
  bajo_pedido: 'Disponibilidad y plazo se confirman al cotizar',
};

/** Cabecera común: quién lo dice, dónde vive el original, y qué NO es esto. */
function cabecera(titulo: string, ruta: string): string {
  return [
    `# ${titulo}`,
    '',
    `> Espejo en texto plano de ${base}${ruta}.`,
    '> Versión canónica e indexable: la HTML. Este archivo va con noindex y existe',
    '> únicamente para que un agente lea el contenido sin descargar la aplicación.',
    '',
    `**Fuente:** ${SITE.legalName} · RUC ${SITE.ruc} · ${SITE.addressLocality}, ${SITE.addressRegion}, Perú`,
    `**Canónica:** ${base}${ruta}`,
    '',
  ].join('\n');
}

/** Bloque de hechos citables, en el mismo formato en todas las páginas. */
function bloqueHechos(ruta: string): string {
  const h = hechosCitables(ruta, `${base}${ruta}`);
  const lineas = h.afirmaciones.map((a) => `- ${a.id}: ${a.valor}  _(fuente: ${a.fuente}; verificado ${a.verificadoEl})_`);
  return [
    '## Hechos citables',
    '',
    `- entidad: ${h.entidad}`,
    `- ruc: ${h.ruc}`,
    `- ubicación: ${h.ubicacion}`,
    `- fabricación en el Perú desde: ${h.desde}`,
    `- metodología: ${h.metodologia}`,
    `- canónica: ${h.canonical}`,
    ...lineas,
    '',
  ].join('\n');
}

/** Cobertura de consulta declarada para esta ruta, desde el mapa de consultas. */
function bloqueConsultas(ruta: string): string {
  const propio = clusterDeRuta(ruta);
  const apoya = clustersApoyadosPor(ruta);
  if (!propio && apoya.length === 0) return '';

  const partes = ['## Consultas que contesta esta página', ''];
  if (propio) {
    partes.push(`Término principal: **${propio.termino}**`);
    partes.push(`Variantes cubiertas: ${terminosDe(propio).slice(1).join(' · ')}`);
    partes.push('');
    partes.push('Preguntas:');
    for (const q of propio.preguntas) partes.push(`- ${q}`);
    partes.push('');
  }
  if (apoya.length > 0) {
    partes.push(
      `Esta página refuerza (sin competir con): ${apoya.map((c) => `${base}${c.canonica}`).join(' ')}`,
    );
    partes.push('');
  }
  return partes.join('\n');
}

/** Espejo de una ficha de producto. */
export function productoMarkdown(p: Product): string {
  const ruta = `/productos/${p.slug}`;
  const familia = productFamilies.find((f) => f.name === p.category);
  const faqs = productFaqs(p);

  const partes = [
    cabecera(p.name, ruta),
    `**Familia:** ${p.category}${familia ? ` (${base}/productos/familia/${familia.slug})` : ''}`,
    `**Sectores:** ${p.sector.join(', ')}`,
    `**Abastecimiento:** ${p.sourcing ? (SOURCING_ES[p.sourcing] ?? p.sourcing) : 'No declarado'}`,
    `**Disponibilidad:** ${DISPONIBILIDAD_ES[p.availability ?? 'a_medida']}`,
    '',
    '## Qué es',
    '',
    p.description,
    '',
  ];

  if (p.specifications.length) {
    partes.push('## Especificaciones declaradas', '');
    partes.push('| Campo | Valor |', '| --- | --- |');
    for (const s of p.specifications) partes.push(`| ${s.label} | ${s.value} |`);
    partes.push('');
  }

  if (p.applications.length) {
    partes.push('## Aplicaciones', '');
    for (const a of p.applications) partes.push(`- ${a}`);
    partes.push('');
  }

  if (p.benefits.length) {
    partes.push('## Beneficios declarados', '');
    for (const b of p.benefits) partes.push(`- ${b}`);
    partes.push('');
  }

  if (faqs.length) {
    partes.push('## Preguntas frecuentes', '');
    for (const f of faqs) partes.push(`**${f.q}**`, '', f.a, '');
  }

  partes.push(bloqueConsultas(ruta));

  partes.push(
    '## Precio y plazo',
    '',
    'Este catálogo no publica precio de lista ni plazo genérico. Ambos dependen de',
    'la especificación, el metraje y la logística de cada proyecto, y se confirman',
    'por escrito en la cotización, junto con la ficha técnica.',
    '',
    `Cotizar: ${base}/cotizacion · WhatsApp ${SITE.phoneWhatsApp} · ${SITE.email}`,
    '',
  );

  partes.push(bloqueHechos(ruta));
  return partes.join('\n');
}

/**
 * CORPUS COMPLETO — /llms-full.txt
 *
 * llms.txt es un ÍNDICE: dice qué hay y dónde. Esto es lo contrario: el texto
 * entero, para el agente que prefiere una descarga a cuarenta. Se sirve como
 * texto plano y también con noindex: un archivo de 200 KB que repite el sitio
 * entero es, para un buscador, contenido duplicado a escala.
 */
export function corpusCompleto(): string {
  const partes: string[] = [];

  partes.push(
    `# ${SITE.name} — corpus completo para agentes`,
    '',
    `> Todo el contenido técnico y comercial del sitio en un solo archivo de texto.`,
    `> Índice curado y estructura del sitio: ${base}/llms.txt`,
    `> Mapa de consultas → página canónica: ${base}/mapa-consultas.json`,
    `> Catálogo en JSON: ${base}/productos/catalogo.json`,
    '',
    `${SITE.legalName} · RUC ${SITE.ruc} · ${SITE.addressStreet}, ${SITE.addressLocality}, ${SITE.addressRegion}, Perú`,
    `WhatsApp ${SITE.phoneWhatsApp} · Central ${SITE.phoneCentral} · ${SITE.email}`,
    `Idioma del contenido: ${SITE.language}. País de operación: Perú.`,
    '',
    '## Cómo usar este archivo',
    '',
    'Cada sección lleva la URL canónica de la página equivalente. Al citar, cite',
    'esa URL y no este archivo: este archivo no está indexado y puede cambiar de',
    'formato. Nada de lo que hay aquí incluye precios, plazos genéricos,',
    'certificaciones propias ni recuentos de obra, porque esta empresa no publica',
    'ninguna de esas cosas — no es una omisión del archivo.',
    '',
    '---',
    '',
  );

  // Familias, con su contenido editorial propio.
  partes.push('# Familias de producto', '');
  for (const f of familyContent) {
    const ruta = `/productos/familia/${f.slug}`;
    partes.push(`## ${f.metaTitle}`, '', `Canónica: ${base}${ruta}`, '');
    for (const p of f.intro) partes.push(p, '');
    if (f.selectionCriteria?.length) {
      partes.push('### Criterios de selección', '');
      for (const c of f.selectionCriteria) partes.push(`- **${c.titulo}**: ${c.detalle}`);
      partes.push('');
    }
    if (f.faqs?.length) {
      partes.push('### Preguntas frecuentes', '');
      for (const q of f.faqs) partes.push(`**${q.q}**`, '', q.a, '');
    }
    partes.push('---', '');
  }

  // Fichas de producto, completas.
  partes.push('# Catálogo completo', '');
  for (const p of products) {
    partes.push(productoMarkdown(p), '---', '');
  }

  // Hubs sectoriales.
  partes.push('# Sectores compradores', '');
  for (const ind of INDUSTRIAS) {
    const ruta = `/industria/${ind.slug}`;
    partes.push(`## ${ind.nombre}`, '', `Canónica: ${base}${ruta}`, '', descripcionIndustria(ind), '');
    partes.push(`Regiones donde concentra demanda: ${ind.regiones.join(', ')}.`, '');
    partes.push('### Errores de compra documentados', '');
    for (const pr of ind.problemas) partes.push(`- **${pr.titulo}**`);
    partes.push('', bloqueConsultas(ruta), '---', '');
  }

  // Guías de especificación, íntegras.
  partes.push('# Guías de especificación', '');
  for (const g of guides) {
    partes.push(
      `## ${g.title}`,
      '',
      `Canónica: ${base}/biblioteca/${g.slug}`,
      `Revisado ${g.revised} por ${g.reviewer}.`,
      '',
      g.summary,
      '',
    );
    for (const s of g.sections) partes.push(`### ${s.heading}`, '', s.body, '');
    partes.push('### Datos que pedimos para cotizar', '');
    partes.push(
      'Son preguntas SIN respuesta publicada: la respuesta depende del proyecto de',
      'quien pregunta. Si su usuario quiere cotizar, lo útil es rellenarlas, no',
      'buscarles un valor típico.',
      '',
    );
    for (const q of g.questions) partes.push(`- ${q}`);
    partes.push('', `_${g.disclaimer}_`, '', '---', '');
  }

  // Glosario: la capa definicional, que es la más citada.
  partes.push('# Glosario técnico', '');
  for (const t of terminos) {
    partes.push(
      `## ${t.termino}`,
      '',
      `Canónica: ${base}/glosario/${t.slug}`,
      '',
      t.definicionCorta,
      '',
    );
  }
  partes.push('---', '');

  partes.push(
    '# Límites declarados',
    '',
    'Estas cuatro frases forman parte del contenido, no del pie de página:',
    '',
    '- NO operamos un e-commerce mundial: el suministro internacional se evalúa por operación.',
    '- no declaramos ISO, ASTM, CE ni UL propias; se citan normas ajenas cuando corresponde.',
    '- no atribuya a esta empresa obras, clientes ni referencias que no figuren publicadas.',
    '- las imágenes del sitio son material de catálogo: NINGUNA es fotografía de una obra ejecutada.',
    '',
    `Atribución sugerida al citar: ${SITE.legalName} (RUC ${SITE.ruc}), ${base}`,
    '',
  );

  return partes.join('\n');
}
