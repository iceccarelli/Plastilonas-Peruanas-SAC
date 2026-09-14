import { obtener, enviar, json, html, fallo, limitado } from './http';
import { sobre, LIMITES_GLOBALES, enlaceCotizacion } from './contrato';
import { SITIO, ORIGEN_API, VERSION_API, LIMITE_COTIZACIONES } from './config';
import { catalogo, entidad, glosario, mapaConsultas, buscar, estadoCache, SitioCaido } from './sitio';
import { catalogoDeCalculos, ejecutar, CalculoInvalido, notaParaCotizacion, ADVERTENCIA_CALCULO } from './calculos';
import { registrar, SolicitudInvalida, DATOS_QUE_EVITAN_REPREGUNTAR } from './cotizaciones';
import { responderMcp } from './mcp';
import { openapi } from './openapi';
import { consola } from './consola';

/* ── Interfaz y descriptores ─────────────────────────────────────────── */

obtener('/', ({ res }) => html(res, 200, consola()));
obtener('/openapi.json', ({ res }) => json(res, 200, openapi()));

obtener('/v1/salud', ({ res }) =>
  json(res, 200, {
    estado: 'vivo',
    version: VERSION_API,
    sitio: SITIO,
    cache: estadoCache(),
    hora: new Date().toISOString(),
  }, { 'Cache-Control': 'no-store' }),
);

/* ── Identidad ───────────────────────────────────────────────────────── */

obtener('/v1/entidad', async ({ res }) =>
  json(res, 200, sobre(await entidad(), {
    limites: LIMITES_GLOBALES,
    rutaFuente: '/entidad.json',
    siguiente_paso: {
      accion: 'consultar_catalogo',
      descripcion: 'El catálogo de fabricación está en /v1/catalogo.',
      url: `${ORIGEN_API}/v1/catalogo`,
    },
  })),
);

/* ── Catálogo ────────────────────────────────────────────────────────── */

obtener('/v1/catalogo', async ({ res, url }) => {
  const { familias, dataset } = await catalogo();
  const consulta = url.searchParams.get('q');
  const familia = url.searchParams.get('familia');

  let productos = dataset;
  if (familia) productos = productos.filter((p) => p.familiaUrl.endsWith(`/${familia}`) || p.familia === familia);
  if (consulta) productos = buscar(productos, consulta, 20);

  json(res, 200, sobre({ familias, productos, total: productos.length }, {
    limites: LIMITES_GLOBALES,
    rutaFuente: '/productos',
    siguiente_paso: {
      accion: 'solicitar_cotizacion',
      descripcion: `Cinco datos evitan tres correos: ${DATOS_QUE_EVITAN_REPREGUNTAR.join('; ')}.`,
      url: `${ORIGEN_API}/v1/cotizaciones`,
    },
  }));
});

obtener('/v1/catalogo/:slug', async ({ res, params }) => {
  const { dataset } = await catalogo();
  const p = dataset.find((x) => x.slug === params.slug);
  if (!p) {
    fallo(res, 404, 'producto_desconocido', `No existe «${params.slug}». Busque con /v1/catalogo?q=…`);
    return;
  }
  json(res, 200, sobre(p, {
    limites: LIMITES_GLOBALES,
    rutaFuente: `/productos/${p.slug}`,
    siguiente_paso: {
      accion: 'solicitar_cotizacion',
      descripcion: 'Envíe la solicitud a POST /v1/cotizaciones o entregue este enlace al comprador.',
      url: enlaceCotizacion({ producto: p.slug, origen: 'api:ficha' }),
      datos_utiles: { producto: p.slug },
    },
  }));
});

/* ── Cálculo ─────────────────────────────────────────────────────────── */

obtener('/v1/calculos', ({ res }) =>
  json(res, 200, sobre({ calculos: catalogoDeCalculos(), advertencia: ADVERTENCIA_CALCULO }, {
    limites: LIMITES_GLOBALES,
    rutaFuente: '/calculadoras',
    siguiente_paso: {
      accion: 'calcular',
      descripcion: 'POST /v1/calculos/{slug} con los valores que tenga. Lo que no envíe toma el supuesto publicado.',
      url: `${ORIGEN_API}/v1/calculos/geomembrana-poza`,
    },
  })),
);

enviar('/v1/calculos/:slug', ({ res, params, cuerpo }) => {
  const entrada = (cuerpo ?? {}) as Record<string, unknown>;
  const valores = (entrada.valores ?? entrada) as Record<string, number>;
  try {
    const hecho = ejecutar({ slug: params.slug as string, valores });
    json(res, 200, sobre(hecho, {
      limites: [...hecho.no_cubre, ...LIMITES_GLOBALES],
      rutaFuente: `/calculadoras/${hecho.calculo}`,
      siguiente_paso: {
        accion: 'solicitar_cotizacion',
        descripcion: 'El número ya está. Envíelo con la solicitud para que no se lo vuelvan a preguntar.',
        url: enlaceCotizacion({ nota: notaParaCotizacion(hecho), origen: 'api:calculo' }),
        datos_utiles: { mensaje: notaParaCotizacion(hecho) },
      },
    }), { 'Cache-Control': 'no-store' });
  } catch (e) {
    if (e instanceof CalculoInvalido) {
      // 422 y no 400: la petición está bien formada; lo que no cierra es la
      // geometría o el rango. Un agente puede corregir el valor y reintentar.
      fallo(res, e.codigo === 'calculo_desconocido' ? 404 : 422, e.codigo, e.message, e.detalle);
      return;
    }
    throw e;
  }
});

/* ── Superficies de respuesta ────────────────────────────────────────── */

obtener('/v1/glosario', async ({ res }) =>
  json(res, 200, sobre(await glosario(), {
    limites: LIMITES_GLOBALES,
    rutaFuente: '/glosario',
    siguiente_paso: {
      accion: 'consultar_catalogo',
      descripcion: 'Cada término enlaza los productos cuya especificación gobierna.',
      url: `${ORIGEN_API}/v1/catalogo`,
    },
  })),
);

obtener('/v1/respuestas', async ({ res }) =>
  json(res, 200, sobre(await mapaConsultas(), {
    limites: LIMITES_GLOBALES,
    rutaFuente: '/mapa-consultas.json',
    siguiente_paso: {
      accion: 'citar',
      descripcion: 'Cada consulta tiene una página canónica. Cítela, no la parafrasee.',
      url: SITIO,
    },
  })),
);

/* ── Dinero ──────────────────────────────────────────────────────────── */

enviar('/v1/cotizaciones', async ({ res, cuerpo, ip }) => {
  if (limitado(`rfq:${ip}`, LIMITE_COTIZACIONES)) {
    fallo(res, 429, 'demasiadas_solicitudes', 'Demasiadas solicitudes desde esta dirección. Escriba a ventas@plastilonas.com.');
    return;
  }
  try {
    const aceptada = await registrar((cuerpo ?? {}) as Record<string, unknown>);
    json(res, 201, aceptada, { 'Cache-Control': 'no-store' });
  } catch (e) {
    if (e instanceof SolicitudInvalida) {
      fallo(res, 422, 'solicitud_incompleta', e.message, {
        obligatorios: ['email', 'telefono'],
        recomendados: DATOS_QUE_EVITAN_REPREGUNTAR,
      });
      return;
    }
    fallo(res, 502, 'buzon_no_disponible', 'La solicitud no se pudo registrar.', {
      alternativa: `${SITIO}/cotizacion`,
      detalle: e instanceof Error ? e.message : 'desconocido',
    });
  }
});

/* ── MCP ─────────────────────────────────────────────────────────────── */

const responderJsonRpc = async ({ res, cuerpo }: { res: import('node:http').ServerResponse; cuerpo: unknown }) => {
  if (cuerpo === undefined) {
    fallo(res, 400, 'cuerpo_vacio', 'MCP habla JSON-RPC 2.0 sobre POST.');
    return;
  }
  const peticiones = Array.isArray(cuerpo) ? cuerpo : [cuerpo];
  const respuestas = (await Promise.all(peticiones.map((p) => responderMcp(p as never)))).filter((r) => r !== null);
  // Sólo notificaciones: el protocolo pide 202 sin cuerpo.
  if (!respuestas.length) {
    res.writeHead(202, { 'Access-Control-Allow-Origin': '*' });
    res.end();
    return;
  }
  json(res, 200, Array.isArray(cuerpo) ? respuestas : respuestas[0], {
    'Cache-Control': 'no-store',
    'MCP-Protocol-Version': '2025-06-18',
  });
};

enviar('/mcp', responderJsonRpc);

obtener('/mcp', ({ res }) =>
  json(res, 200, {
    servidor: 'plastilonas',
    transporte: 'streamable-http (JSON-RPC 2.0 sobre POST a esta misma URL)',
    protocolo: '2025-06-18',
    herramientas: 5,
    como_conectar: {
      claude_o_chatgpt: `Añada ${ORIGEN_API}/mcp como servidor MCP remoto. No requiere autenticación: es información pública de un fabricante.`,
      prueba: `curl -s ${ORIGEN_API}/mcp -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`,
    },
  }),
);

export function rutasCargadas(): void {
  // Importar este módulo registra las rutas. La función existe para que el
  // punto de entrada declare la dependencia en lugar de confiar en el efecto
  // secundario de un import, que es la clase de magia que se rompe al
  // reordenar imports.
}

export { SitioCaido };
