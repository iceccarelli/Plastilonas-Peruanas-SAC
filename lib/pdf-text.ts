/**
 * Saneado de texto para las fuentes estándar de PDF (WinAnsi).
 *
 * Vive en su propio módulo porque lo usan tanto la ficha técnica (servidor,
 * junto al catálogo completo) como el brief del marco (navegador). Importarlo
 * desde lib/datasheet.ts arrastraría las 1600 líneas del catálogo al bundle
 * del cliente.
 *
 * WinAnsi cubre el español (acentos y ñ) pero NO los signos tipográficos que
 * usamos en la web: sin esta conversión, pdf-lib lanza excepción al primer
 * guion largo y el documento no se genera.
 */
export function toWinAnsi(text: string): string {
  return text
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[→➡]/g, '->')
    .replace(/·/g, '-')
    .replace(/•/g, '-')
    .replace(/ /g, ' ')
    .replace(/[≤]/g, '<=')
    .replace(/[≥]/g, '>=')
    .replace(/²/g, '2')
    .replace(/³/g, '3')
    .replace(/º/g, 'o')
    .replace(/[^\x00-\xFF]/g, '');
}
