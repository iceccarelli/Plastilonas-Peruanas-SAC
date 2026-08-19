import { SITE } from './site';
import { novedades, tipoLabels, novedadUrl } from './novedades';

/**
 * Feeds del registro fechado: RSS 2.0 y JSON Feed 1.1.
 *
 * Por qué dos formatos y no uno. RSS lo consumen lectores, agregadores del
 * rubro y Bing; JSON Feed lo consumen agentes y scripts sin necesitar un
 * parser de XML. Un feed es la única forma de que un tercero se suscriba a la
 * referencia en lugar de tener que volver a mirar si algo cambió.
 *
 * Vive en lib/ y no en el route handler porque los handlers de Next solo
 * pueden exportar métodos HTTP y configuración: cualquier export extra rompe
 * la compilación. Además así los tests pueden ejercitar el XML directamente.
 */

/** Escapa los cinco caracteres que rompen un documento XML. */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Fecha ISO corta → RFC 822, obligatorio en RSS 2.0.
 * Se fija a mediodía UTC: con 00:00 un lector en zona negativa (Lima es UTC-5)
 * muestra la entrada un día antes de la fecha publicada.
 */
export function toRfc822(fecha: string): string {
  return new Date(`${fecha}T12:00:00Z`).toUTCString();
}

export function buildRss(): string {
  const base = SITE.url;
  const items = novedades
    .map((n) => {
      const url = novedadUrl(n.slug);
      return `    <item>
      <title>${escapeXml(n.titulo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRfc822(n.fecha)}</pubDate>
      <category>${escapeXml(tipoLabels[n.tipo])}</category>
      <description>${escapeXml(n.resumen)}</description>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Novedades — ${escapeXml(SITE.name)}</title>
    <link>${base}/novedades</link>
    <atom:link href="${base}/novedades/rss.xml" rel="self" type="application/rss+xml" />
    <description>Registro fechado de cambios publicados en el catálogo, las guías técnicas, el Marco de Especificación y las arquitecturas de referencia de ${escapeXml(SITE.name)}.</description>
    <language>${SITE.language}</language>
    <lastBuildDate>${toRfc822(novedades[0].fecha)}</lastBuildDate>
    <generator>${base}</generator>
${items}
  </channel>
</rss>
`;
}

export function buildJsonFeed(): string {
  const base = SITE.url;
  return `${JSON.stringify(
    {
      version: 'https://jsonfeed.org/version/1.1',
      title: `Novedades — ${SITE.name}`,
      home_page_url: `${base}/novedades`,
      feed_url: `${base}/novedades/feed.json`,
      description:
        'Registro fechado de cambios publicados en el catálogo, las guías técnicas, el Marco de Especificación y las arquitecturas de referencia.',
      language: SITE.language,
      authors: [{ name: SITE.legalName, url: base }],
      items: novedades.map((n) => ({
        id: novedadUrl(n.slug),
        url: novedadUrl(n.slug),
        title: n.titulo,
        summary: n.resumen,
        content_text: [n.queCambia, ...n.detalle].join('\n\n'),
        date_published: `${n.fecha}T12:00:00Z`,
        tags: [tipoLabels[n.tipo]],
      })),
    },
    null,
    2,
  )}\n`;
}
