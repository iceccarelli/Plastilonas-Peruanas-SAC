/**
 * SUPERFICIES PARA MÁQUINAS — la lista, en un solo sitio.
 *
 * Estas rutas son el camino corto que un agente puede tomar sin renderizar
 * React: identidad, catálogo, límites y URLs comerciales en texto plano o
 * JSON. Tres consumidores las necesitan idénticas:
 *
 *   · app/robots.ts las permite EXPLÍCITAMENTE para cada agente nombrado.
 *     Hoy solo las salva el «Allow: /» genérico; una regla futura más
 *     específica (p. ej. un Disallow de *.json) las bloquearía sin que nadie
 *     lo note. La permisión explícita es la intención escrita.
 *   · app/sitemap.ts declara las indexables, para el rastreador que solo
 *     consume sitemaps y nunca vería /llms.txt ni /ai.txt.
 *   · test/ai-txt.test.ts comprueba que cada ruta listada aquí tenga un
 *     route handler real: una superficie anunciada que responde 404 es un
 *     defecto de observabilidad, no un detalle.
 *
 * /llms-full.txt va aparte: se rastrea y se cita, pero es noindex con
 * canónica en /llms.txt (dos copias del mismo texto compitiendo en el índice
 * se restan). Por eso se permite en robots y NO se declara en el sitemap.
 */

/** Rutas legibles por máquina que además son indexables (X-Robots-Tag: all). */
export const SUPERFICIES_INDEXABLES = [
  "/llms.txt",
  "/ai.txt",
  "/entidad.json",
  "/mapa-consultas.json",
  "/productos/catalogo.json",
  "/glosario/terminos.json",
  "/calculadoras/formulas.json",
  "/indicadores/datos.json",
] as const;

/** Rastreables y citables, pero noindex: su canónica es otra página. */
export const SUPERFICIES_NO_INDEXABLES = ["/llms-full.txt"] as const;

/** Todo lo que robots.txt debe permitir explícitamente, para todo agente. */
export const SUPERFICIES_MAQUINA: readonly string[] = [
  ...SUPERFICIES_INDEXABLES,
  ...SUPERFICIES_NO_INDEXABLES,
];
