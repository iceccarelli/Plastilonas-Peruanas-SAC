import type { Metadata } from 'next';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasProceso } from '@/lib/imagenes';

export const metadata: Metadata = {
  title: 'Configurador FIBC / Big Bag',
  description: 'Especifique capacidad, boca, fondo, asas y liner. El resumen alimenta el RFQ. Sin precio y sin certificación UN inventada.',
  alternates: { canonical: '/configurador' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // El despiece va sobre el formulario porque el formulario pregunta por
  // boca, fondo, asas y liner sin enseñar qué es cada cosa. La página es un
  // componente de cliente y no puede mirar el disco; este layout sí puede.
  const esquema = ranurasProceso().find((r) => r.id === 'proceso:configurador-fibc');

  return (
    <>
      {esquema && (
        <div className="mx-auto max-w-3xl px-6 pt-14">
          <ImagenContenido ranura={esquema} prioridad sizes="(min-width: 768px) 720px, 100vw" />
        </div>
      )}
      {children}
    </>
  );
}
