import type { Metadata } from 'next';
import Link from 'next/link';
import { projectsPublicados } from '@/lib/projects';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasProceso } from '@/lib/imagenes';

export const metadata: Metadata = {
  title: 'Proyectos',
  description:
    'Evidencia de suministro publicada solo con confirmación. Clientes no nominados sin permiso.',
  alternates: { canonical: '/proyectos' },
};

export default function ProyectosPage() {
  const esquema = ranurasProceso().find((r) => r.id === 'proceso:proyectos-verificacion');
  const hay = projectsPublicados.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">EVIDENCIA</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Proyectos, sin clientes inventados.</h1>
      {/* Diagrama del registro. `ImagenContenido` degrada solo: mientras el
          archivo no exista no se pinta nada roto, y en cuanto se publique
          aparece aquí sin tocar esta página. */}
      {esquema && <ImagenContenido ranura={esquema} prioridad className="mt-8" sizes="(min-width: 768px) 720px, 100vw" />}

      {hay ? (
        <>
          <p className="mt-4 text-gray-600">
            Los nombres comerciales se omiten salvo permiso escrito del cliente. Cada ficha se
            publica después de confirmarse con el área comercial.
          </p>
          <div className="mt-10 space-y-6">
            {projectsPublicados.map((p) => (
              <section key={p.slug} className="border border-gray-100 rounded-3xl p-6">
                <div className="text-xs uppercase tracking-widest text-[#059669]">
                  {p.country} · {p.region}
                </div>
                <h2 className="text-xl font-semibold text-[#0A2540] mt-1">{p.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{p.client}</p>
                <p className="mt-4 text-sm text-gray-700"><strong>Reto.</strong> {p.challenge}</p>
                <p className="mt-2 text-sm text-gray-700"><strong>Qué hicimos.</strong> {p.solution}</p>
                <p className="mt-2 text-sm text-gray-700"><strong>Resultado publicado.</strong> {p.result}</p>
                <p className="mt-3 text-xs text-gray-400">{p.yearLabel}</p>
                <Link href={`/aplicaciones/${p.applicationSlug}`} className="inline-block mt-4 text-sm text-[#059669]">
                  Ver aplicación →
                </Link>
              </section>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="mt-4 text-gray-600">
            Todavía no hay ninguna ficha publicada en esta página. No es un descuido: una ficha de
            proyecto solo se publica cuando el suministro está confirmado con el área comercial y,
            si aparece el nombre del cliente, cuando ese cliente lo ha autorizado por escrito.
          </p>
          <p className="mt-4 text-gray-600">
            Un comprador industrial que detecta un caso inexacto descarta el resto del sitio con él.
            Preferimos una página vacía a una página que no se sostenga.
          </p>
          <div className="mt-10 border border-gray-100 rounded-3xl p-6 bg-gray-50/60">
            <h2 className="text-lg font-semibold text-[#0A2540]">Mientras tanto, lo que sí es verificable</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li>
                · <Link href="/confianza" className="text-[#059669]">Identidad de la empresa</Link> — RUC,
                domicilio fiscal y clasificación industrial, contrastables en SUNAT.
              </li>
              <li>
                · <Link href="/calidad" className="text-[#059669]">Proceso de planta</Link> — cómo se
                fabrica, sin certificados que no existan.
              </li>
              <li>
                · <Link href="/biblioteca" className="text-[#059669]">Biblioteca de especificación</Link> —
                criterios técnicos que un ingeniero puede juzgar por sí mismo.
              </li>
            </ul>
          </div>
          <p className="mt-8 text-sm text-gray-500">
            ¿Tiene un requerimiento concreto?{' '}
            <Link href="/cotizacion" className="text-[#059669] font-medium">Pida una cotización</Link>{' '}
            y se responde con especificación, no con adjetivos.
          </p>
        </>
      )}
    </div>
  );
}
