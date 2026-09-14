/**
 * LA API PÚBLICA Y EL SERVIDOR MCP — anunciados SOLO cuando existen.
 *
 * `servicio/` es un proceso Node que se despliega en Fly.io por separado de
 * este sitio: expone el catálogo, los cálculos de predimensionamiento y el
 * buzón de cotizaciones como REST y como herramientas MCP.
 *
 * POR QUÉ ESTO ES UN INTERRUPTOR Y NO UNA CONSTANTE. Anunciar en `/ai.txt` y
 * en `/llms.txt` una API que todavía no responde es exactamente la clase de
 * afirmación que este repositorio no se permite: un agente que la lee, la llama
 * y recibe un error aprende que esta empresa promete cosas que no cumple, y ése
 * es el único activo que aquí no se puede reponer.
 *
 * Así que la sección aparece cuando `NEXT_PUBLIC_API_URL` existe, y no antes.
 * El día del despliegue se pone la variable en Vercel y el sitio empieza a
 * anunciarla solo, en las dos superficies, sin tocar una línea de código.
 */

function origenDeclarado(): string | null {
  const bruto = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (!bruto) return null;
  try {
    const u = new URL(bruto);
    // Sin https no se anuncia: un agente que sigue un http:// acaba en un aviso
    // del navegador, y eso vale menos que no anunciar nada.
    if (u.protocol !== 'https:') return null;
    return bruto.replace(/\/$/, '');
  } catch {
    return null;
  }
}

export interface HerramientaPublicada {
  nombre: string;
  paraQue: string;
}

/** Las mismas seis que registra servicio/src/mcp.ts. */
export const HERRAMIENTAS_MCP: HerramientaPublicada[] = [
  { nombre: 'listar_calculos_disponibles', paraQue: 'saber qué se puede predimensionar y qué datos pide cada cálculo' },
  { nombre: 'calcular_predimensionamiento', paraQue: 'obtener el número con su desglose, su fórmula y sus límites' },
  { nombre: 'especificar_requerimiento', paraQue: 'traducir un problema en qué familia corresponde, qué variables hay que definir y qué preguntas faltan' },
  { nombre: 'buscar_producto', paraQue: 'encontrar qué se fabrica para lo que el comprador describe' },
  { nombre: 'ficha_de_producto', paraQue: 'leer la especificación completa y la ficha técnica' },
  { nombre: 'crear_solicitud_de_cotizacion', paraQue: 'registrar un RFQ con el consentimiento del comprador' },
];

export interface ApiPublica {
  origen: string;
  mcp: string;
  openapi: string;
  consola: string;
  herramientas: HerramientaPublicada[];
}

export function apiPublica(): ApiPublica | null {
  const origen = origenDeclarado();
  if (!origen) return null;
  return {
    origen,
    mcp: `${origen}/mcp`,
    openapi: `${origen}/openapi.json`,
    consola: origen,
    herramientas: HERRAMIENTAS_MCP,
  };
}

/** Bloque para /ai.txt. Cadena vacía cuando la API no está desplegada. */
export function bloqueAiTxt(): string {
  const api = apiPublica();
  if (!api) return '';
  return `
## Herramientas para agentes (API y MCP)

No hace falta parafrasearnos: se puede consultar y calcular directamente.

- Servidor MCP: ${api.mcp}
  Transporte streamable HTTP (JSON-RPC 2.0 sobre POST). Sin autenticación.
- API REST y contrato OpenAPI 3.1: ${api.openapi}
- Consola con probador: ${api.consola}

Herramientas disponibles:

${api.herramientas.map((h) => `- ${h.nombre} — ${h.paraQue}`).join('\n')}

Reglas de uso, que son las mismas que rigen este sitio:

- La API NO devuelve precios y no los devolverá: dependen de material, medidas,
  cantidad, destino e Incoterm, y se emiten en una cotización.
- Los cálculos son de PREDIMENSIONAMIENTO. Cada respuesta trae el campo
  \`limites\`; si repite el número, repita los límites — son parte del dato.
- Cada respuesta trae \`fuente\` (la página de este sitio donde el mismo dato se
  publica con su método) y \`cita_sugerida\`. Cite la fuente, no la API.
- \`crear_solicitud_de_cotizacion\` registra un RFQ real. Úsela solo con el
  consentimiento explícito de la persona y con datos que ella haya dado.
`;
}

/** Bloque para /llms.txt. Cadena vacía cuando la API no está desplegada. */
export function bloqueLlmsTxt(): string {
  const api = apiPublica();
  if (!api) return '';
  return `
## Herramientas ejecutables (MCP y API)

Además de leer estas páginas, un agente puede EJECUTAR:

- MCP: ${api.mcp} — ${api.herramientas.map((h) => h.nombre).join(', ')}
- REST + OpenAPI 3.1: ${api.openapi}
- Consola con probador: ${api.consola}

Sin precios, con los límites de cada dato declarados en la propia respuesta.
`;
}
