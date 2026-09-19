/**
 * LEYENDAS DE HONESTIDAD, EN UN SOLO SITIO.
 *
 * `components/FotoReferencial.tsx` llevaba la frase escrita dentro del JSX.
 * Funcionaba mientras fuera el único sitio que la usaba. Dejó de serlo cuando
 * la galería de producto empezó a rotar tomas de aplicación —un frente
 * ventilado, un talud revestido, un patio de secado—: el mismo tipo de
 * material, con la misma condición, y sin ninguna leyenda que lo dijera.
 *
 * La frase vive acá y no en el componente porque la galería es un componente
 * de CLIENTE y el otro no: importar uno desde el otro arrastraría el árbol
 * equivocado al paquete del navegador. Una cadena no arrastra nada.
 *
 * Por qué una sola redacción y no dos parecidas: dos redacciones envejecen a
 * ritmos distintos, y la que quede más blanda será la que lea quien homologa.
 *
 * Qué NO dice, a propósito: no dice que la foto sea de archivo ni que sea
 * generada. Dice lo único que esta empresa puede sostener hoy sobre cualquiera
 * de sus imágenes de catálogo — que ninguna documenta una obra ejecutada—,
 * porque `lib/projects.ts` no publica ninguna ficha con `verificado: true`.
 */
export const LEYENDA_REFERENCIAL = {
  es: 'Imagen referencial de la aplicación: no documenta una obra ejecutada.',
  en: 'Illustrative image of the application: it does not document a project delivered by this company.',
} as const;
