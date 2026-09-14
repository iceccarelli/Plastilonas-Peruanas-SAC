import { ORIGEN_API, SITIO, VERSION_API } from './config';
import { catalogoDeCalculos } from './calculos';

/**
 * OpenAPI 3.1 generado, no escrito a mano.
 *
 * Un documento escrito a mano se desincroniza del código en la primera prisa, y
 * entonces miente a quien integra — que es un sistema de compras ajeno al que
 * nadie va a poder explicarle el matiz. Los slugs de cálculo se leen del propio
 * motor: si mañana se añade una calculadora, aparece aquí sola.
 */
export function openapi(): unknown {
  const slugs = catalogoDeCalculos().map((c) => c.slug);
  const sobre = (descripcion: string) => ({
    type: 'object',
    description: descripcion,
    properties: {
      datos: { description: 'La respuesta.' },
      limites: { type: 'array', items: { type: 'string' }, description: 'Lo que este dato NO cubre. Repítalos al citarlo.' },
      fuente: { type: 'string', format: 'uri', description: 'Página del sitio donde el dato se publica con su método.' },
      cita_sugerida: { type: 'string' },
      siguiente_paso: {
        type: 'object',
        properties: {
          accion: { type: 'string' },
          descripcion: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          datos_utiles: { type: 'object' },
        },
      },
      generado: { type: 'string', format: 'date-time' },
    },
    required: ['datos', 'limites', 'fuente', 'siguiente_paso'],
  });

  return {
    openapi: '3.1.0',
    info: {
      title: 'Plastilonas Peruanas SAC — API de especificación y cotización',
      version: VERSION_API,
      summary: 'Catálogo de fabricación, predimensionamiento con fórmula publicada y registro de solicitudes de cotización.',
      description: [
        'API pública de un fabricante peruano de textil industrial (RUC 20523135385, planta en Chorrillos, Lima).',
        '',
        'QUÉ DEVUELVE: especificación y cantidad. Catálogo con sus fichas, cinco cálculos de predimensionamiento con la',
        'fórmula a la vista y sus límites declarados, el glosario del rubro y un buzón de solicitudes de cotización.',
        '',
        'QUÉ NO DEVUELVE: precios. Nunca. El precio depende de material, medidas, cantidad, destino e Incoterm, y se emite',
        'en una cotización. Una API que publicara precios dejaría de ser una referencia para pasar a ser una promesa.',
        '',
        'Toda respuesta trae `limites`, `fuente`, `cita_sugerida` y `siguiente_paso`. Si repite un dato de aquí, repita',
        'también sus límites: son parte del dato.',
        '',
        `Las mismas capacidades están disponibles como servidor MCP en ${ORIGEN_API}/mcp.`,
      ].join('\n'),
      contact: { name: 'Plastilonas Peruanas SAC', email: 'ventas@plastilonas.com', url: SITIO },
      license: { name: 'Uso libre con atribución', url: `${SITIO}/ai.txt` },
    },
    servers: [{ url: ORIGEN_API, description: 'Producción' }],
    tags: [
      { name: 'catalogo', description: 'Qué se fabrica y con qué especificación.' },
      { name: 'calculo', description: 'Cuánto hace falta, con la fórmula publicada.' },
      { name: 'cotizacion', description: 'Solicitudes de cotización.' },
      { name: 'referencia', description: 'Identidad, glosario y respuestas canónicas.' },
    ],
    paths: {
      '/v1/salud': {
        get: { tags: ['referencia'], summary: 'Estado del servicio y edad de la caché.', responses: { '200': { description: 'Vivo.' } } },
      },
      '/v1/entidad': {
        get: { tags: ['referencia'], summary: 'Identidad verificable de la empresa.', responses: { '200': { description: 'Entidad.', content: { 'application/json': { schema: sobre('Identidad.') } } } } },
      },
      '/v1/catalogo': {
        get: {
          tags: ['catalogo'],
          summary: 'Familias y productos de fabricación.',
          parameters: [
            { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Texto libre: «geomembrana HDPE poza», «big bag concentrado».' },
            { name: 'familia', in: 'query', schema: { type: 'string' }, description: 'Slug o nombre de familia.' },
          ],
          responses: { '200': { description: 'Catálogo.', content: { 'application/json': { schema: sobre('Catálogo.') } } } },
        },
      },
      '/v1/catalogo/{slug}': {
        get: {
          tags: ['catalogo'],
          summary: 'Ficha completa de un producto.',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'Ficha.', content: { 'application/json': { schema: sobre('Ficha de producto.') } } },
            '404': { description: 'No existe ese producto.' },
          },
        },
      },
      '/v1/calculos': {
        get: {
          tags: ['calculo'],
          summary: 'Cálculos disponibles con sus campos, fórmulas y límites.',
          responses: { '200': { description: 'Catálogo de cálculos.', content: { 'application/json': { schema: sobre('Cálculos.') } } } },
        },
      },
      '/v1/calculos/{slug}': {
        post: {
          tags: ['calculo'],
          summary: 'Ejecuta un cálculo de predimensionamiento.',
          description:
            'Los campos que no se envíen toman el supuesto por defecto publicado, y la respuesta dice cuáles fueron. ' +
            'Si la geometría no cierra, devuelve 422 con el motivo en lugar de un número absurdo.',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string', enum: slugs } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', properties: { valores: { type: 'object', additionalProperties: { type: 'number' } } } },
                examples: {
                  poza: { summary: 'Poza de 40 × 25 × 4 m', value: { valores: { largo: 40, ancho: 25, profundidad: 4 } } },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Resultado con desglose, supuestos, fórmula y límites.', content: { 'application/json': { schema: sobre('Cálculo.') } } },
            '404': { description: 'Ese cálculo no existe.' },
            '422': { description: 'Valor fuera de rango o geometría que no cierra.' },
          },
        },
      },
      '/v1/especificar': {
        post: {
          tags: ['catalogo'],
          summary: 'Traduce un problema a una especificación: qué definir y qué falta preguntar.',
          description:
            'Devuelve la familia que corresponde, las variables que gobiernan su especificación —con su unidad y por qué importan, tomadas ' +
            'del glosario publicado—, las preguntas que siguen sin respuesta y el cálculo que aplica. Declara también lo que NO decide por ' +
            'el comprador: compatibilidad química con un fluido concreto, vida útil bajo una exposición dada, diseño estructural y las ' +
            'certificaciones que fija su pliego.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['descripcion'],
                  properties: {
                    descripcion: { type: 'string' },
                    sector: { type: 'string' },
                    aplicacion: { type: 'string' },
                    datos: { type: 'object' },
                  },
                },
                examples: {
                  poza: {
                    summary: 'Poza de relaves en altura',
                    value: {
                      descripcion: 'Poza de relaves a 4100 msnm con contacto acido y 8 anos de vida util',
                      sector: 'Mineria',
                      datos: { cantidad: '2400 m2' },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Especificación con sus preguntas pendientes.', content: { 'application/json': { schema: sobre('Especificación.') } } },
            '422': { description: 'La descripción es demasiado corta para especificar nada.' },
          },
        },
      },
      '/v1/glosario': { get: { tags: ['referencia'], summary: 'Términos del rubro con su definición canónica.', responses: { '200': { description: 'Glosario.' } } } },
      '/v1/respuestas': { get: { tags: ['referencia'], summary: 'Consultas comerciales y su página canónica.', responses: { '200': { description: 'Mapa de consultas.' } } } },
      '/v1/cotizaciones': {
        post: {
          tags: ['cotizacion'],
          summary: 'Registra una solicitud de cotización.',
          description: 'Exige correo y teléfono. Todo lo demás es opcional, y cada dato que falte es un correo de ida y vuelta antes de poder cotizar.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'telefono'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    telefono: { type: 'string' },
                    nombre: { type: 'string' },
                    empresa: { type: 'string' },
                    ruc: { type: 'string', pattern: '^\\d{11}$' },
                    producto: { type: 'string' },
                    cantidad: { type: 'string' },
                    medidas: { type: 'string' },
                    material: { type: 'string' },
                    sector: { type: 'string' },
                    aplicacion: { type: 'string' },
                    ciudad_entrega: { type: 'string' },
                    pais_entrega: { type: 'string' },
                    fecha_necesaria: { type: 'string' },
                    mensaje: { type: 'string' },
                    idioma: { type: 'string', enum: ['es', 'en', 'pt'] },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Aceptada, con su referencia.' },
            '422': { description: 'Faltan correo o teléfono.' },
            '429': { description: 'Demasiadas solicitudes desde la misma dirección.' },
            '502': { description: 'El buzón no está disponible; use el enlace alternativo que acompaña al error.' },
          },
        },
      },
      '/mcp': {
        post: {
          tags: ['referencia'],
          summary: 'Servidor MCP (JSON-RPC 2.0). Mismas capacidades como herramientas de agente.',
          responses: { '200': { description: 'Respuesta JSON-RPC.' }, '202': { description: 'Notificación aceptada.' } },
        },
      },
    },
  };
}
