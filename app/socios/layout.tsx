import EsquemaPagina from '@/components/EsquemaPagina';

/**
 * Este layout existe sólo para colgar /socios del grafo de entidad.
 *
 * La página ya declara título, descripción y canonical; lo que le faltaba era
 * el nodo WebPage que dice de qué sitio forma parte y en qué posición de la
 * jerarquía está. Va en un layout y no en la página para no tocar su JSX: el
 * bloque es el mismo en las diez páginas que lo necesitaban, y tenerlo en un
 * sitio evita que diez copias se desincronicen.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EsquemaPagina
        ruta="/socios"
        nombre="Partners de ingeniería y proyecto"
        descripcion={'EPC, estudios y contratistas. Canal de especificación, no programa de afiliados.'}
      />
      {children}
    </>
  );
}
