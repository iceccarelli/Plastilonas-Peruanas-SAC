import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { totalCriteria } from '@/lib/framework';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasProceso } from '@/lib/imagenes';

/**
 * La evaluación es un client component (estado del formulario) y no puede
 * exportar `metadata`. Este layout aporta title, description, canonical y el
 * nodo WebPage enlazado al grafo de entidad.
 */

const URL = `${SITE.url}/marco/evaluacion`;
const TITLE = '¿Su proyecto está listo para cotizar?';
const DESCRIPTION = `Responda ${totalCriteria()} criterios técnicos y obtenga un brief de especificación descargable con lo que falta definir. Sin registro y sin enviar datos: el PDF se genera en su navegador.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/marco/evaluacion' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function EvaluacionLayout({ children }: { children: React.ReactNode }) {
  // Los ejes de comparación, sobre la herramienta. La página es un componente
  // de cliente y no puede mirar el disco; este layout, que es de servidor, sí.
  const esquema = ranurasProceso().find((r) => r.id === 'proceso:marco-evaluacion');

  return (
    <>
      <TrackView kind="framework" slug="evaluacion" />
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Marco de Especificación', url: `${SITE.url}/marco` },
              { name: 'Evaluación', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
        ]}
      />
      {esquema && (
        <div className="mx-auto max-w-3xl px-6 pt-14">
          <ImagenContenido ranura={esquema} prioridad sizes="(min-width: 768px) 720px, 100vw" />
        </div>
      )}
      {children}
    </>
  );
}
