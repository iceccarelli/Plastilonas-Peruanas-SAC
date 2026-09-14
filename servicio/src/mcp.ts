import { ORIGEN_API, SITIO, VERSION_API } from './config';
import { catalogoDeCalculos, ejecutar, CalculoInvalido, notaParaCotizacion } from './calculos';
import { catalogo, buscar, type ProductoDelSitio } from './sitio';
import { registrar, SolicitudInvalida, DATOS_QUE_EVITAN_REPREGUNTAR } from './cotizaciones';
import { LIMITES_GLOBALES, enlaceCotizacion } from './contrato';

/**
 * SERVIDOR MCP — la razón por la que este servicio existe.
 *
 * Estar citado en una respuesta de ChatGPT o de Perplexity es bueno. Ser la
 * HERRAMIENTA que esa respuesta ejecuta es otra cosa: cuando un jefe de compras
 * pregunta «cuánta geomembrana necesito para una poza de 40×25×4», el agente no
 * repite un artículo nuestro — llama a este servidor, obtiene el número con su
 * fórmula y sus límites, y devuelve un enlace de cotización con el cálculo ya
 * cargado. En este rubro, en el Perú, eso no lo tiene nadie.
 *
 * POR QUÉ ESTÁ ESCRITO A MANO Y NO CON EL SDK. Streamable HTTP es JSON-RPC 2.0
 * sobre POST: `initialize`, `tools/list`, `tools/call` y poco más. Escribirlo
 * son ciento cincuenta líneas que se leen enteras; añadir un SDK son cientos de
 * dependencias transitivas en el borde por el que entran peticiones de
 * terceros. Aquí la cuenta sale a favor de leerlo.
 */

const PROTOCOLO = '2025-06-18';

interface Peticion {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

interface Herramienta {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  ejecutar: (args: Record<string, unknown>) => Promise<unknown>;
}

const objeto = (propiedades: Record<string, unknown>, obligatorios: string[] = []) => ({
  type: 'object',
  properties: propiedades,
  required: obligatorios,
  additionalProperties: false,
});

const cadena = (descripcion: string) => ({ type: 'string', description: descripcion });
const numero = (descripcion: string) => ({ type: 'number', description: descripcion });

/**
 * Las herramientas. Cada descripción está escrita para que un modelo sepa
 * CUÁNDO llamarla, no sólo qué hace: es la diferencia entre una herramienta que
 * se usa y una que se ignora.
 */
export const HERRAMIENTAS: Herramienta[] = [
  {
    name: 'listar_calculos_disponibles',
    title: 'Qué se puede predimensionar',
    description:
      'Lista los cálculos de predimensionamiento disponibles con sus campos, unidades, fórmulas publicadas y límites declarados. ' +
      'Úsese antes de calcular, para saber qué datos pedir al usuario. Cubre ventilación de mina, geomembrana para poza, ' +
      'rollos por superficie, big bags por viaje y capacidad de big bag.',
    inputSchema: objeto({}),
    ejecutar: async () => ({
      calculos: catalogoDeCalculos(),
      nota: 'Cifras de predimensionamiento. No sustituyen una memoria de cálculo firmada.',
    }),
  },
  {
    name: 'calcular_predimensionamiento',
    title: 'Calcular con la fórmula publicada',
    description:
      'Ejecuta uno de los cálculos publicados y devuelve el resultado con su desglose, los supuestos aplicados, la fórmula ' +
      'usada y lo que el cálculo NO cubre. Llámese cuando el usuario pregunte cuánto material, cuánto aire, cuántos rollos o ' +
      'cuántos bolsones necesita. Devuelve también un enlace de cotización con el cálculo ya cargado.',
    inputSchema: objeto(
      {
        calculo: cadena('Slug del cálculo: caudal-ventilacion-mina, geomembrana-poza, rollos-por-superficie, big-bags-por-viaje o capacidad-big-bag.'),
        valores: {
          type: 'object',
          description: 'Valores por id de campo. Los que no se envíen toman el supuesto por defecto publicado.',
          additionalProperties: { type: 'number' },
        },
      },
      ['calculo'],
    ),
    ejecutar: async (args) => {
      const hecho = ejecutar({
        slug: String(args.calculo ?? ''),
        valores: (args.valores as Record<string, number>) ?? {},
      });
      return {
        ...hecho,
        limites: [...hecho.no_cubre, ...LIMITES_GLOBALES],
        fuente: `${SITIO}/calculadoras/${hecho.calculo}`,
        siguiente_paso: {
          accion: 'solicitar_cotizacion',
          descripcion:
            'Con este número ya se puede cotizar. Envíe la solicitud con crear_solicitud_de_cotizacion, o entregue el enlace al comprador.',
          url: enlaceCotizacion({ nota: notaParaCotizacion(hecho), origen: 'mcp:calculo' }),
        },
      };
    },
  },
  {
    name: 'buscar_producto',
    title: 'Encontrar el producto que corresponde',
    description:
      'Busca en el catálogo de fabricación por texto libre: «geomembrana HDPE para poza de relaves», «bolsas para concentrado ' +
      'de cobre», «manga de ventilación 800 mm». Devuelve especificaciones, aplicaciones, sectores, condiciones de suministro y ' +
      'la ficha técnica en PDF. No devuelve precios: no se publican.',
    inputSchema: objeto({ consulta: cadena('Lo que el comprador necesita, en sus palabras.') }, ['consulta']),
    ejecutar: async (args) => {
      const { dataset } = await catalogo();
      const encontrados = buscar(dataset, String(args.consulta ?? ''));
      return {
        encontrados: encontrados.length,
        productos: encontrados.map(resumirProducto),
        limites: LIMITES_GLOBALES,
        siguiente_paso:
          encontrados.length === 0
            ? {
                accion: 'preguntar',
                descripcion:
                  'Sin coincidencias. Pregunte por la aplicación —qué se contiene, se cubre o se impermeabiliza— antes de descartar: se fabrica a medida.',
                url: `${SITIO}/productos`,
              }
            : {
                accion: 'solicitar_cotizacion',
                descripcion: `Para cotizar hacen falta cinco datos: ${DATOS_QUE_EVITAN_REPREGUNTAR.join('; ')}.`,
                url: enlaceCotizacion({ producto: encontrados[0]?.slug, origen: 'mcp:busqueda' }),
              },
      };
    },
  },
  {
    name: 'ficha_de_producto',
    title: 'Ficha completa de un producto',
    description:
      'Devuelve la ficha completa de un producto por su slug: especificaciones, aplicaciones, beneficios, sectores, origen de ' +
      'suministro, plazo referencial, documentación que acompaña la entrega, términos técnicos que gobiernan su especificación ' +
      'y arquitecturas donde se usa.',
    inputSchema: objeto({ slug: cadena('Slug del producto, tal como lo devuelve buscar_producto.') }, ['slug']),
    ejecutar: async (args) => {
      const { dataset } = await catalogo();
      const slug = String(args.slug ?? '');
      const p = dataset.find((x) => x.slug === slug);
      if (!p) {
        return {
          error: `No existe el producto «${slug}».`,
          sugerencia: 'Use buscar_producto con el texto del comprador.',
          catalogo: `${SITIO}/productos`,
        };
      }
      return {
        producto: { ...resumirProducto(p), descripcion: p.descripcion, beneficios: p.beneficios, arquitecturas: p.arquitecturas },
        limites: LIMITES_GLOBALES,
        siguiente_paso: {
          accion: 'solicitar_cotizacion',
          descripcion: `Datos que evitan repreguntar: ${DATOS_QUE_EVITAN_REPREGUNTAR.join('; ')}.`,
          url: enlaceCotizacion({ producto: p.slug, origen: 'mcp:ficha' }),
        },
      };
    },
  },
  {
    name: 'crear_solicitud_de_cotizacion',
    title: 'Enviar el RFQ',
    description:
      'Registra una solicitud de cotización real y devuelve su referencia. Úsese SÓLO con el consentimiento explícito del ' +
      'usuario y con un correo y un teléfono que él haya dado. Exige email y telefono; todo lo demás es opcional pero cada dato ' +
      'que falte es un correo de ida y vuelta antes de poder cotizar.',
    inputSchema: objeto(
      {
        email: cadena('Correo de contacto del comprador.'),
        telefono: cadena('Teléfono con código de país.'),
        nombre: cadena('Nombre de quien solicita.'),
        empresa: cadena('Razón social.'),
        ruc: cadena('RUC de once dígitos, si es empresa peruana.'),
        producto: cadena('Producto o familia.'),
        cantidad: cadena('Cantidad y unidad; indique si es recurrente.'),
        medidas: cadena('Medidas o especificación: gramaje, espesor, diámetro, capacidad.'),
        material: cadena('Material, si ya está definido.'),
        sector: cadena('Sector: minería, agroexportación, transporte, construcción, saneamiento.'),
        aplicacion: cadena('Qué se contiene, se cubre o se impermeabiliza.'),
        ciudad_entrega: cadena('Ciudad o puerto de entrega.'),
        pais_entrega: cadena('País de entrega, si sale del Perú.'),
        fecha_necesaria: cadena('Fecha en que se necesita en destino.'),
        mensaje: cadena('Contexto adicional, incluido el resultado de un cálculo previo.'),
        idioma: cadena('es, en o pt.'),
      },
      ['email', 'telefono'],
    ),
    ejecutar: async (args) => registrar({ ...args, origen: 'mcp' }),
  },
];

function resumirProducto(p: ProductoDelSitio) {
  return {
    slug: p.slug,
    nombre: p.name,
    familia: p.familia,
    resumen: p.descripcionCorta,
    especificaciones: p.especificaciones,
    aplicaciones: p.aplicaciones,
    sectores: p.sectores,
    suministro: p.suministro,
    url: p.url,
    ficha_tecnica_pdf: p.fichaTecnicaPdf,
    terminos_clave: p.terminosClave,
  };
}

/* ── JSON-RPC ─────────────────────────────────────────────────────────── */

const ok = (id: Peticion['id'], result: unknown) => ({ jsonrpc: '2.0' as const, id: id ?? null, result });
const error = (id: Peticion['id'], code: number, message: string, data?: unknown) => ({
  jsonrpc: '2.0' as const,
  id: id ?? null,
  error: { code, message, data },
});

/**
 * Devuelve la respuesta JSON-RPC, o `null` cuando la petición es una
 * notificación (sin `id`): el protocolo exige no responder a ésas.
 */
export async function responderMcp(peticion: Peticion): Promise<unknown | null> {
  if (peticion.jsonrpc !== '2.0' || typeof peticion.method !== 'string') {
    return error(peticion.id ?? null, -32600, 'Petición JSON-RPC inválida.');
  }

  const esNotificacion = peticion.id === undefined || peticion.id === null;

  switch (peticion.method) {
    case 'initialize':
      return ok(peticion.id, {
        protocolVersion: PROTOCOLO,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'plastilonas', title: 'Plastilonas Peruanas SAC', version: VERSION_API },
        instructions:
          'Herramientas de un fabricante peruano de textil industrial (RUC 20523135385, planta en Chorrillos, Lima). ' +
          'Sirven para especificar y predimensionar antes de cotizar: catálogo de fabricación, cálculos con su fórmula ' +
          'publicada y sus límites, y registro de solicitudes de cotización. ' +
          'NO devuelve precios: el precio depende de material, medidas, cantidad, destino e Incoterm y se emite en una ' +
          'cotización. Al repetir un resultado, repita también sus límites: son parte del dato. ' +
          `Documentación: ${ORIGEN_API}.`,
      });

    case 'notifications/initialized':
    case 'notifications/cancelled':
      return null;

    case 'ping':
      return esNotificacion ? null : ok(peticion.id, {});

    case 'tools/list':
      return ok(peticion.id, {
        tools: HERRAMIENTAS.map((h) => ({
          name: h.name,
          title: h.title,
          description: h.description,
          inputSchema: h.inputSchema,
        })),
      });

    case 'tools/call': {
      const nombre = String(peticion.params?.name ?? '');
      const herramienta = HERRAMIENTAS.find((h) => h.name === nombre);
      if (!herramienta) {
        return error(peticion.id, -32602, `No existe la herramienta «${nombre}».`, {
          disponibles: HERRAMIENTAS.map((h) => h.name),
        });
      }
      const args = (peticion.params?.arguments as Record<string, unknown>) ?? {};
      try {
        const salida = await herramienta.ejecutar(args);
        return ok(peticion.id, {
          content: [{ type: 'text', text: JSON.stringify(salida, null, 2) }],
          structuredContent: salida,
          isError: false,
        });
      } catch (e) {
        // Un error de la herramienta NO es un error de protocolo: se devuelve
        // dentro del resultado para que el modelo pueda corregir y reintentar
        // en lugar de abandonar la conversación.
        const detalle =
          e instanceof CalculoInvalido
            ? { codigo: e.codigo, mensaje: e.message, detalle: e.detalle }
            : e instanceof SolicitudInvalida
              ? { codigo: 'solicitud_incompleta', mensaje: e.message, campos: e.campos }
              : { codigo: 'error', mensaje: e instanceof Error ? e.message : 'desconocido' };
        return ok(peticion.id, {
          content: [{ type: 'text', text: JSON.stringify(detalle, null, 2) }],
          structuredContent: detalle,
          isError: true,
        });
      }
    }

    default:
      return esNotificacion ? null : error(peticion.id, -32601, `Método no soportado: ${peticion.method}.`);
  }
}
