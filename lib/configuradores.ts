import { hrefConfiguradorLona } from './lona-config';

/**
 * QUÉ FICHAS TIENEN CONFIGURADOR — y el enlace precargado de cada una.
 *
 * EL HUECO QUE CIERRA. Los dos configuradores del sitio existían desde hace
 * etapas y sólo se enlazaban desde la portada y desde el pie. Es decir: la
 * página donde el comprador YA está mirando la lona —su ficha— no tenía forma
 * de llevarlo a la herramienta que arma su RFQ. El visitante llegaba al final
 * de la ficha y su única salida era el formulario en blanco.
 *
 * POR QUÉ UN MAPA Y NO UN CAMPO EN `lib/products.ts`. El catálogo describe
 * productos; qué herramienta del sitio los configura es una decisión de
 * navegación, y meterla en la ficha obligaría a tocar el catálogo cada vez que
 * se mueve una ruta. Aquí son tres líneas y `test/configurador-lona.test.ts`
 * comprueba que cada destino existe.
 *
 * REGLA: el enlace de la lona NO se escribe a mano. Lo construye
 * `hrefConfiguradorLona`, que valida la preselección contra el mismo enum que
 * lee el configurador al arrancar. Un valor que deje de existir no puede
 * sobrevivir en un enlace.
 */
export interface DestinoConfigurador {
  href: string;
  /** Rótulo del botón, en imperativo y con el producto dentro. */
  label: string;
  /** Una línea de por qué merece la pena el desvío. */
  detalle: string;
}

export const CONFIGURADORES: Record<string, DestinoConfigurador> = {
  'lona-plastificada-rafia-polytarp': {
    // PVC 500–700 g/m² en 3.0 m es el punto de partida del que arranca la
    // mayoría de las consultas de esta ficha; sigue siendo editable entero.
    href: hrefConfiguradorLona({ material: 'pvc', gramaje: '500-700', ancho: '3.0' }),
    label: 'Configurar esta lona',
    detalle:
      'Material, gramaje, ancho, color, acabado, confección y tratamientos. El resumen viaja al RFQ. No calcula precio.',
  },
  'big-bags-bolsones-polipropileno': {
    href: '/configurador',
    label: 'Configurar este big bag',
    detalle:
      'Capacidad, factor de seguridad, tipo de boca y fondo, izaje y extras. El resumen viaja al RFQ. No calcula precio.',
  },
};

/** Destino del configurador de una ficha, si esa ficha tiene uno. */
export function configuradorDe(slug: string): DestinoConfigurador | undefined {
  return CONFIGURADORES[slug];
}
