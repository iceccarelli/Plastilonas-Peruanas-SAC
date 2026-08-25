import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';

/**
 * NODO WebPage + BreadcrumbList PARA UNA PÁGINA DE PRIMER NIVEL.
 *
 * QUÉ ARREGLA. La auditoría de estado encontró veinte páginas sin ningún
 * bloque JSON-LD. Ocho son transaccionales, legales o están tras autenticación
 * y no lo necesitan. Las otras diez son las páginas a las que llega quien está
 * COMPROBANDO al proveedor —confianza, calidad, compras, proyectos,
 * distribuidores, socios, exportación, compradores— más los dos índices
 * editoriales, biblioteca y aplicaciones.
 *
 * Que esas diez no emitieran nada significaba que existían para el lector y
 * no para el grafo: un agente que resolvía la entidad «Plastilonas Peruanas
 * SAC» encontraba el nodo Organization en la portada y las fichas de producto
 * colgando de él, pero las páginas que sostienen la credibilidad de todo lo
 * demás quedaban sueltas, sin decir de qué sitio forman parte.
 *
 * Se emite lo mínimo verdadero: la página, su sitio, su posición en la
 * jerarquía y su referencia a la entidad. Ni FAQ sin respuestas, ni
 * AggregateRating, ni Product donde no hay producto.
 */

interface Props {
  /** Ruta sin dominio, empezando por barra. */
  ruta: string;
  nombre: string;
  descripcion: string;
  /** Migas intermedias entre Inicio y esta página, si las hay. */
  intermedias?: { name: string; url: string }[];
  /** Subtipo de WebPage cuando corresponde. El tipo sale de lib/schema.ts. */
  tipo?: Parameters<typeof webPageSchema>[0]['type'];
}

export default function EsquemaPagina({ ruta, nombre, descripcion, intermedias = [], tipo }: Props) {
  const url = `${SITE.url}${ruta}`;
  return (
    <JsonLd
      data={[
        webPageSchema({
          url,
          name: nombre,
          description: descripcion,
          ...(tipo ? { type: tipo } : {}),
          breadcrumbId: `${url}#breadcrumb`,
        }),
        breadcrumbSchema(
          [{ name: 'Inicio', url: `${SITE.url}/` }, ...intermedias, { name: nombre, url }],
          `${url}#breadcrumb`,
        ),
      ]}
    />
  );
}
