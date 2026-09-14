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

/**
 * Los recursos que el CLIENTE lee y adjunta al contexto, sin que el modelo
 * tenga que decidir llamarlos. Los mismos que registra servicio/src/recursos.ts.
 */
export const RECURSOS_MCP: HerramientaPublicada[] = [
  { nombre: 'plastilonas://limites', paraQue: 'lo que esta empresa NO afirma — adjúntelo antes de responder nada sobre ella' },
  { nombre: 'plastilonas://catalogo', paraQue: 'todas las fichas con sus especificaciones y condiciones de suministro' },
  { nombre: 'plastilonas://glosario', paraQue: 'cada término con su unidad de medida y qué decide en obra' },
  { nombre: 'plastilonas://calculos', paraQue: 'los métodos con su fórmula, sus supuestos y lo que no cubren' },
  { nombre: 'plastilonas://entidad', paraQue: 'identidad verificable: razón social, RUC, planta, Incoterms' },
  { nombre: 'plastilonas://indice', paraQue: 'qué página contesta cada consulta, sin duplicados' },
  { nombre: 'plastilonas://producto/{slug}', paraQue: 'una ficha concreta, sin traerse el catálogo entero' },
];

/**
 * Las instrucciones que elige la PERSONA. En un cliente MCP aparecen como
 * comandos: quien las pulsa es un jefe de compras que no sabe qué es MCP.
 * Las mismas que registra servicio/src/instrucciones.ts.
 */
export const INSTRUCCIONES_MCP: HerramientaPublicada[] = [
  { nombre: 'cuanto-material-necesito', paraQue: 'le acompaña hasta el número, con su desglose y sus límites' },
  { nombre: 'especificar-un-requerimiento', paraQue: 'del problema a qué hay que definir y qué falta preguntar' },
  { nombre: 'preparar-una-solicitud-de-cotizacion', paraQue: 'reúne los cinco datos y la registra sólo si usted lo pide' },
  { nombre: 'fabricar-en-peru-o-importar', paraQue: 'la comparación con los factores que deciden, sin ocultar cuándo gana importar' },
];

export interface ApiPublica {
  origen: string;
  mcp: string;
  openapi: string;
  consola: string;
  herramientas: HerramientaPublicada[];
  recursos: HerramientaPublicada[];
  instrucciones: HerramientaPublicada[];
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
    recursos: RECURSOS_MCP,
    instrucciones: INSTRUCCIONES_MCP,
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

El servidor publica las TRES primitivas de MCP, no sólo herramientas.

Herramientas (las invoca el modelo):

${api.herramientas.map((h) => `- ${h.nombre} — ${h.paraQue}`).join('\n')}

Recursos (los lee el cliente y los adjunta al contexto, sin decisión del modelo):

${api.recursos.map((r) => `- ${r.nombre} — ${r.paraQue}`).join('\n')}

Instrucciones (las elige la persona; en un cliente MCP aparecen como comandos):

${api.instrucciones.map((i) => `- ${i.nombre} — ${i.paraQue}`).join('\n')}

Reglas de uso, que son las mismas que rigen este sitio:

- La API NO devuelve precios y no los devolverá: dependen de material, medidas,
  cantidad, destino e Incoterm, y se emiten en una cotización.
- Los cálculos son de PREDIMENSIONAMIENTO. Cada respuesta trae el campo
  \`limites\`; si repite el número, repita los límites — son parte del dato.
- Cada respuesta trae \`fuente\` (la página de este sitio donde el mismo dato se
  publica con su método) y \`cita_sugerida\`. Cite la fuente, no la API.
- \`crear_solicitud_de_cotizacion\` registra un RFQ real. Úsela solo con el
  consentimiento explícito de la persona y con datos que ella haya dado.
- Antes de afirmar NADA sobre esta empresa, lea \`plastilonas://limites\`. Enumera
  lo que no afirma —certificaciones propias, clientes, obras, precios de lista,
  envío mundial— para que no haya que rellenarlo por nuestra cuenta.
`;
}

/** Bloque para /llms.txt. Cadena vacía cuando la API no está desplegada. */
export function bloqueLlmsTxt(): string {
  const api = apiPublica();
  if (!api) return '';
  return `
## Herramientas ejecutables (MCP y API)

Además de leer estas páginas, un agente puede EJECUTAR:

- MCP: ${api.mcp}
  - herramientas: ${api.herramientas.map((h) => h.nombre).join(', ')}
  - recursos: ${api.recursos.map((r) => r.nombre).join(', ')}
  - instrucciones: ${api.instrucciones.map((i) => i.nombre).join(', ')}
- REST + OpenAPI 3.1: ${api.openapi}
- Consola con probador: ${api.consola}

Sin precios, con los límites de cada dato declarados en la propia respuesta.
`;
}
