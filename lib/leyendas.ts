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

/**
 * LA MISMA REGLA, EN MOVIMIENTO.
 *
 * Las tres piezas de `lib/cine.ts` son fotografía en movimiento del producto y
 * del oficio. Un vídeo pide más crédito que una foto —se parece más a un
 * reportaje— y por eso la leyenda tiene que ser, si acaso, más explícita: dice
 * lo mismo que la de las fotos y lo dice nombrando lo que un espectador podría
 * suponer por su cuenta, que es que está viendo una obra entregada.
 *
 * Vive aquí, junto a la otra, por el motivo de siempre: dos redacciones
 * parecidas envejecen a ritmos distintos y la más blanda es la que acaba
 * leyendo quien homologa.
 */
export const LEYENDA_CINE = {
  es: 'Fotografía en movimiento del producto y del oficio. No representa una obra nominada.',
  en: 'Moving photography of the product and the craft. It does not represent a named project.',
} as const;
