import EsquemaPagina from '@/components/EsquemaPagina';

/**
 * Este layout existe sólo para colgar /biblioteca del grafo de entidad.
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
        ruta="/biblioteca"
        nombre="Biblioteca técnica"
        descripcion={'Guías HTML de especificación: mangas de ventilación, gramaje de lona, FIBC, geomembrana y malla agrícola.'}
      tipo="CollectionPage"
      />
      {children}
    </>
  );
}
