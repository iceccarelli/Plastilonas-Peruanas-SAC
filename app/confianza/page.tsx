import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { COUNT_STATEMENT, YEARS_STATEMENT } from '@/lib/facts';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasProceso } from '@/lib/imagenes';

export const metadata: Metadata = {
  title: 'Centro de confianza',
  description: `Identidad verificable de ${SITE.legalName}: RUC, dirección, catálogo y lo que deliberadamente no afirmamos.`,
  alternates: { canonical: '/confianza' },
};

export default function ConfianzaPage() {
  const esquema = ranurasProceso().find((r) => r.id === 'proceso:confianza-identidad');
  /**
   * El host se deriva de SITE.url y no se escribe: antes esta página imprimía
   * «Dominio canónico: plastilonas.com» mientras robots.txt declaraba el host
   * de Vercel. Un agente que leyera ambos veía dos orígenes para el mismo RUC
   * — exactamente la ambigüedad que este centro de confianza existe para
   * eliminar. El día de la mudanza, CANONICAL_ORIGIN mueve SITE.url y esta
   * página cambia sola, sin editarla.
   */
  const hostVigente = new URL(SITE.url).host;
  const migrado = hostVigente.replace(/^www\./, '') === SITE.brandHost;
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">TRUST CENTER</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Centro de confianza</h1>
      {/* Diagrama del registro. `ImagenContenido` degrada solo: mientras el
          archivo no exista no se pinta nada roto, y en cuanto se publique
          aparece aquí sin tocar esta página. */}
      {esquema && <ImagenContenido ranura={esquema} prioridad className="mt-8" sizes="(min-width: 768px) 720px, 100vw" />}
      <dl className="mt-10 space-y-4 text-sm">
        {[
          ['Razón social', SITE.legalName],
          ['RUC', SITE.ruc],
          ['Planta', `${SITE.addressStreet}, ${SITE.addressLocality}, ${SITE.addressRegion}, Perú`],
          ['Antigüedad', YEARS_STATEMENT],
          ['Catálogo', COUNT_STATEMENT],
          ['Email', SITE.email],
          ['Central', SITE.phoneCentral],
          ['WhatsApp', SITE.phoneWhatsApp],
          ['Origen canónico vigente', hostVigente],
          ['Dominio de marca', SITE.brandHost],
        ].map(([k, v]) => (
          <div key={k} className="border-b border-gray-100 pb-3">
            <dt className="text-xs uppercase tracking-widest text-gray-400">{k}</dt>
            <dd className="mt-1">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-gray-600">
        {migrado
          ? `El origen canónico de este sitio es ${hostVigente}; el host de despliegue redirige aquí con 308.`
          : `La URL vigente de este sitio es ${hostVigente}. El dominio de marca ${SITE.brandHost} pertenece a la empresa y recibe su correo, pero hoy aloja un sitio comercial anterior; la migración está planificada y no se declara como hecha. Hasta entonces, la fuente actualizada es ${hostVigente}.`}
      </p>
      <h2 className="mt-10 font-semibold text-[#0A2540]">Lo que no publicamos</h2>
      <ul className="mt-3 list-disc pl-5 text-sm text-gray-600 space-y-1">
        <li>ISO / ASTM / CE / UL / food-grade sin documento</li>
        <li>Envío mundial o instalación continental</li>
        <li>Rankings autofabricados</li>
        <li>Precios de lista en líneas a medida</li>
        <li>Clientes nominados sin permiso</li>
      </ul>
    </div>
  );
}
