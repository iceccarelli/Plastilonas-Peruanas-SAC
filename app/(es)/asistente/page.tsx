import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { OG_IMAGEN } from '@/lib/meta';
import { buildPageContext, PAGE_TYPES, type PageType } from '@/lib/ai/context';
import AsistenteWorkspace from '@/components/ai/AsistenteWorkspace';

/**
 * /asistente — "Plastilonas AI", el espacio de trabajo del asistente.
 *
 * Convive con el widget flotante (components/Chatbot.tsx): mismo endpoint
 * (`/api/chat`), mismas reglas de honestidad del `SYSTEM_PROMPT`, misma
 * fuente de catálogo. Esta página no es una segunda IA — es una superficie
 * más grande para la misma conversación, pensada para quien ya sabe que
 * quiere revisar varias líneas o armar una cotización con calma.
 *
 * `?producto=` y `?calculadora=` precargan el `PageContext` (lib/ai/context.ts)
 * cuando se llega desde una ficha de producto o una calculadora — el mismo
 * patrón de "origen" que ya usa /cotizacion.
 *
 * `?pageType=` y `?origen=` (Sprint A — entradas contextuales) extienden el
 * mismo patrón para las superficies que no son ni producto ni calculadora:
 * familia, aplicación, industria, guía o el configurador de lona. `pageType`
 * es uno de los valores reales de `PageType` (se valida contra `PAGE_TYPES`;
 * uno inválido cae a `other`, nunca se inventa un tipo de página nuevo).
 * `origen` es texto libre y corto (p.ej. "configurador-lona") que solo entra
 * en la frase de `currentPage` para que el prompt sepa de qué flujo viene,
 * sin que el asistente lo trate como slug de producto ni de calculadora.
 */

const URL_ASISTENTE = `${SITE.url}/asistente`;
const TITLE = 'Plastilonas AI — Asistente comercial';
const DESCRIPTION =
  'Converse con el asistente de Plastilonas Peruanas: catálogo real, sin precios ni certificaciones inventadas, con calculadoras de predimensionamiento y camino directo a cotizar.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/asistente' },
  openGraph: {
    images: OG_IMAGEN,
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL_ASISTENTE,
    locale: SITE.locale,
    type: 'website',
  },
};

export default async function AsistentePage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string; calculadora?: string; pageType?: string; origen?: string }>;
}) {
  const params = await searchParams;

  // `pageType` gana sobre el 'other' de siempre, pero solo si es uno de los
  // valores reales de PAGE_TYPES: un query param es texto de cualquiera, no
  // un tipo validado por TypeScript.
  const pageType: PageType = (PAGE_TYPES as string[]).includes(params.pageType ?? '')
    ? (params.pageType as PageType)
    : 'other';

  const pageContext = buildPageContext({
    pageType,
    productSlug: params.producto,
    calculatorId: params.calculadora,
    language: 'es',
  });

  // Cadena de contexto que recibe app/api/chat/route.ts en `currentPage`,
  // igual contrato que ya usa components/Chatbot.tsx (una ruta/consulta en
  // texto libre, no un objeto). Si viene de una ficha, una calculadora, u
  // otra superficie con `pageType`/`origen`, se lo decimos explícito para
  // que el prompt lo use sin adivinar.
  const detalles = [
    params.producto ? `producto: ${params.producto}` : null,
    params.calculadora ? `calculadora: ${params.calculadora}` : null,
    pageType !== 'other' ? `tipo: ${pageType}` : null,
    params.origen ? `origen: ${params.origen}` : null,
  ].filter((d): d is string => Boolean(d));
  const currentPage = detalles.length > 0 ? `/asistente (${detalles.join(', ')})` : '/asistente';

  return (
    <>
      <JsonLd
        data={[
          webPageSchema({
            url: URL_ASISTENTE,
            name: TITLE,
            description: DESCRIPTION,
          }),
          breadcrumbSchema([
            { name: 'Inicio', url: SITE.url },
            { name: 'Plastilonas AI', url: URL_ASISTENTE },
          ]),
        ]}
      />
      <AsistenteWorkspace pageContext={pageContext} currentPage={currentPage} />
    </>
  );
}
