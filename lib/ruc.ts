/**
 * VALIDACIÓN DE RUC PERUANO — MÓDULO 11.
 *
 * Por qué existe este archivo y no una expresión regular.
 *
 * Un formulario B2B que pide RUC con `/^[0-9]{11}$/` acepta 12345678901,
 * 00000000000 y el número de teléfono del que rellena por salir del paso. Eso
 * no es validar: es contar dígitos. El campo entonces no cualifica nada y el
 * comercial descubre el error cuando ya emitió la cotización a un RUC que no
 * existe.
 *
 * El RUC lleva su propio dígito verificador. Comprobarlo cuesta diez
 * multiplicaciones y rechaza en el navegador la inmensa mayoría de números
 * inventados o mal tecleados, ANTES de que el lead entre al CRM.
 *
 * ALCANCE HONESTO: esto verifica que el número esté BIEN FORMADO, no que
 * exista en el padrón de SUNAT ni que esté activo y habido. Para eso hace
 * falta consultar el servicio de SUNAT, que es una decisión de servidor y de
 * costo, no de formulario. Decirlo aquí evita que alguien lea esta función
 * como una comprobación de existencia.
 *
 * Prueba de que el algoritmo es el correcto: valida el RUC de la propia
 * empresa (20523135385). Está fijado en test/ruc.test.ts.
 */

/** Factores del módulo 11, aplicados a los diez primeros dígitos. */
const FACTORES = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2] as const;

/**
 * Prefijos de dos dígitos que SUNAT tiene asignados.
 *  10 → persona natural con negocio
 *  15 → persona natural no domiciliada (asignación histórica)
 *  17 → persona jurídica no domiciliada
 *  20 → persona jurídica
 */
const PREFIJOS = ['10', '15', '17', '20'] as const;

/** Deja solo dígitos: el comprador escribe «20523135385», «20-52313538-5» o con espacios. */
export function normalizarRuc(valor: string): string {
  return valor.replace(/\D/g, '');
}

/** Dígito verificador esperado para los diez primeros dígitos. */
export function digitoVerificadorRuc(diez: string): number {
  const suma = FACTORES.reduce((acc, f, i) => acc + f * Number(diez[i]), 0);
  const dv = 11 - (suma % 11);
  if (dv === 10) return 0;
  if (dv === 11) return 1;
  return dv;
}

/** ¿El número está bien formado (longitud, prefijo y dígito verificador)? */
export function rucValido(valor: string): boolean {
  const d = normalizarRuc(valor);
  if (d.length !== 11) return false;
  if (!(PREFIJOS as readonly string[]).includes(d.slice(0, 2))) return false;
  return digitoVerificadorRuc(d.slice(0, 10)) === Number(d[10]);
}

/** Empresa (20/17) frente a persona natural con negocio (10/15). */
export function esPersonaJuridica(valor: string): boolean {
  const d = normalizarRuc(valor);
  return d.length === 11 && (d.startsWith('20') || d.startsWith('17'));
}

/**
 * Mensaje de error específico. Un «RUC inválido» genérico hace que el
 * comprador reescriba el mismo número tres veces sin saber qué corregir.
 */
export function errorRuc(valor: string): string | null {
  const d = normalizarRuc(valor);
  if (!d) return null; // vacío: el campo es opcional, no se reclama.
  if (d.length !== 11) return `El RUC tiene 11 dígitos; ingresó ${d.length}.`;
  if (!(PREFIJOS as readonly string[]).includes(d.slice(0, 2)))
    return 'El RUC empieza en 10, 15, 17 o 20.';
  if (digitoVerificadorRuc(d.slice(0, 10)) !== Number(d[10]))
    return 'El dígito verificador no corresponde: revise el número.';
  return null;
}
