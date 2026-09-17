import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { webPageSchema, breadcrumbSchema, webApiSchema } from '@/lib/schema';
import {
  superficiesDeDatos,
  LO_QUE_EJECUTA,
  REGLAS,
  bloqueApi,
  RUTA_INTEGRACIONES,
} from '@/lib/integraciones';
import { calculadoras } from '@/lib/calculadoras';
import { products } from '@/lib/products';
import { terminos } from '@/lib/glosario';
import CierreComercial from '@/components/CierreComercial';
import { ACCIONES } from '@/lib/acciones';
import PreguntasDeCompra from '@/components/PreguntasDeCompra';

export const metadata: Metadata = {
  title: 'Integraciones: API, MCP y datos abiertos',
  description:
    'Catálogo, glosario y métodos de cálculo en JSON abierto, y una API con servidor MCP para calcular y cotizar por programa. Sin precios publicados.',
  alternates: { canonical: RUTA_INTEGRACIONES },
};

/**
 * LA PÁGINA QUE EXISTE PARA QUE NOS ENCUENTRE UN PROGRAMA.
 *
 * El comprador industrial de este rubro ya no busca sólo con los ojos: busca
 * preguntándole a un asistente, y su empresa carga catálogos en un ERP. Esta
 * página es la puerta de esos dos, y está escrita para los dos: un integrador
 * decide en dos minutos si esto le sirve, y un agente encuentra aquí lo que
 * puede ejecutar y con qué límites.
 *
 * SE PUBLICA SIEMPRE, PORQUE LA MITAD DE LO QUE DESCRIBE ES CIERTA SIEMPRE: las
 * ocho superficies en JSON llevan etapas publicadas y no dependen de que ningún
 * servicio esté levantado. El bloque ejecutable —API y MCP— aparece sólo cuando
 * responde de verdad.
 */
export default function IntegracionesPage() {
  const url = `${SITE.url}${RUTA_INTEGRACIONES}`;
  const superficies = superficiesDeDatos();
  const api = bloqueApi();

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: 'Integraciones: API, MCP y datos abiertos',
            description:
              'Superficies de datos abiertas y, cuando está desplegada, una API con servidor MCP para calcular, especificar y cotizar por programa.',
          }),
          breadcrumbSchema([
            { name: 'Inicio', url: SITE.url },
            { name: 'Integraciones', url },
          ]),
          ...(api
            ? [
                webApiSchema({
                  url,
                  origen: api.origen,
                  documentacion: api.openapi,
                  mcp: api.mcp,
                  nombre: `API de especificación y cotización — ${SITE.legalName}`,
                  descripcion:
                    'Catálogo de fabricación, predimensionamiento con fórmula publicada y registro de solicitudes de cotización. No devuelve precios.',
                  herramientas: api.herramientas,
                }),
              ]
            : []),
        ]}
      />

      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#059669]">
        Para programas y para agentes
      </div>
      <h1 className="t-display font-semibold tracking-tight text-[#0A2540]">
        Nuestros datos técnicos son abiertos, y se pueden ejecutar
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-gray-600">
        El catálogo de fabricación, el vocabulario del rubro y los {calculadoras.length} métodos
        de predimensionamiento están publicados en JSON, sin clave y sin registro. Un sistema de
        compras los puede cargar hoy; un agente los puede citar hoy.
      </p>

      {/* ── Lo que siempre es cierto ─────────────────────────────────── */}
      <h2 className="mt-14 text-2xl font-semibold tracking-tight text-[#0A2540]">
        Datos abiertos: {superficies.length} superficies, sin clave
      </h2>
      <p className="mt-3 text-gray-600">
        {products.length} fichas de producto con sus especificaciones, {terminos.length} términos
        del rubro con la unidad en la que se mide cada uno, y los métodos de cálculo con su
        fórmula a la vista. Se consultan y se citan libremente indicando la fuente.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="py-2 pr-4 font-semibold">Superficie</th>
              <th className="py-2 pr-4 font-semibold">Qué contiene</th>
              <th className="py-2 font-semibold">Para qué sirve</th>
            </tr>
          </thead>
          <tbody>
            {superficies.map((s) => (
              <tr key={s.ruta} className="border-b border-gray-100 align-top">
                <td className="py-3 pr-4">
                  <Link href={s.ruta} className="font-mono text-[13px] text-[#059669] hover:underline">
                    {s.ruta}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-gray-700">{s.que}</td>
                <td className="py-3 text-gray-600">{s.paraQue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Lo que la API añade ──────────────────────────────────────── */}
      <h2 className="mt-14 text-2xl font-semibold tracking-tight text-[#0A2540]">
        Y lo que un archivo no puede hacer: ejecutar
      </h2>
      <p className="mt-3 text-gray-600">
        Un JSON publica la fórmula. Hace falta un servicio para aplicarla a los números de quien
        pregunta, buscar en el catálogo con sus palabras y recibir una solicitud.
      </p>
      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        {LO_QUE_EJECUTA.map((c) => (
          <div key={c.titulo} className="rounded-2xl border border-gray-200 p-5">
            <dt className="font-semibold text-[#0A2540]">{c.titulo}</dt>
            <dd className="mt-2 text-sm text-gray-600">{c.detalle}</dd>
          </div>
        ))}
      </dl>

      {api ? (
        <>
          <h3 className="mt-10 text-lg font-semibold text-[#0A2540]">Cómo se conecta</h3>
          <div className="mt-4 space-y-5">
            <div>
              <p className="text-sm font-semibold text-gray-700">Servidor MCP, para agentes</p>
              <p className="mt-1 text-sm text-gray-600">
                Transporte streamable HTTP (JSON-RPC 2.0 sobre POST). Sin autenticación: es
                información pública de un fabricante.
              </p>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-[#0A2540] p-4 text-[13px] leading-relaxed text-white">
                <code>{api.ejemploMcp}</code>
              </pre>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">API REST, para sistemas</p>
              <p className="mt-1 text-sm text-gray-600">
                Contrato completo en{' '}
                <a href={api.openapi} className="text-[#059669] hover:underline">
                  OpenAPI 3.1
                </a>
                , generado desde el propio motor de cálculo.
              </p>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-[#0A2540] p-4 text-[13px] leading-relaxed text-white">
                <code>{api.ejemploCurl}</code>
              </pre>
            </div>
          </div>

          <h3 className="mt-10 text-lg font-semibold text-[#0A2540]">
            Las {api.herramientas.length} herramientas que un agente puede ejecutar
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {api.herramientas.map((h) => (
              <li key={h.nombre} className="flex flex-col gap-1 border-b border-gray-100 pb-2 sm:flex-row sm:gap-4">
                <code className="shrink-0 font-mono text-[13px] text-[#059669] sm:w-72">{h.nombre}</code>
                <span className="text-gray-600">{h.paraQue}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-10 text-lg font-semibold text-[#0A2540]">
            Y las otras dos primitivas, que casi ningún servidor publica
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Una herramienta la invoca el modelo cuando cree que le hace falta. Un{' '}
            <strong>recurso</strong> lo lee el cliente y lo adjunta al contexto —no hay decisión que
            acertar—, y una <strong>instrucción</strong> la elige la persona: en un cliente MCP
            aparece como un comando. Por eso esto lo puede usar quien no sabe qué es MCP.
          </p>

          <p className="mt-6 text-sm font-semibold text-gray-700">
            Recursos ({api.recursos.length}) — el cliente los adjunta
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {api.recursos.map((r) => (
              <li key={r.nombre} className="flex flex-col gap-1 border-b border-gray-100 pb-2 sm:flex-row sm:gap-4">
                <code className="shrink-0 font-mono text-[13px] text-[#059669] sm:w-72">{r.nombre}</code>
                <span className="text-gray-600">{r.paraQue}</span>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm font-semibold text-gray-700">
            Instrucciones ({api.instrucciones.length}) — las elige usted
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {api.instrucciones.map((i) => (
              <li key={i.nombre} className="flex flex-col gap-1 border-b border-gray-100 pb-2 sm:flex-row sm:gap-4">
                <code className="shrink-0 font-mono text-[13px] text-[#059669] sm:w-72">{i.nombre}</code>
                <span className="text-gray-600">{i.paraQue}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-gray-500">
            Consola con probador y documentación:{' '}
            <a href={api.origen} className="text-[#059669] hover:underline">
              {api.origen.replace(/^https:\/\//, '')}
            </a>
          </p>
        </>
      ) : (
        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-gray-700">
          El servicio ejecutable no está publicado todavía. Las {superficies.length} superficies de
          datos de arriba sí, y no dependen de él. Si necesita ejecutar cálculos o cargar el
          catálogo contra un endpoint, escríbanos a{' '}
          <a href={`mailto:${SITE.email}`} className="text-[#059669] hover:underline">
            {SITE.email}
          </a>{' '}
          y lo coordinamos.
        </p>
      )}

      {/* ── Las reglas ───────────────────────────────────────────────── */}
      <h2 className="mt-14 text-2xl font-semibold tracking-tight text-[#0A2540]">
        Tres reglas, y las tres limitan lo que decimos
      </h2>
      <dl className="mt-6 space-y-5">
        {REGLAS.map((r) => (
          <div key={r.regla} className="border-l-2 border-[#059669] pl-5">
            <dt className="font-semibold text-[#0A2540]">{r.regla}</dt>
            <dd className="mt-1 text-sm text-gray-600">{r.porque}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-sm text-gray-500">
        Los cálculos son de <strong>predimensionamiento</strong>: sirven para llegar a una
        cotización con un número propio y para entender qué variable manda. No sustituyen una
        memoria de cálculo firmada y no autorizan a construir nada. Lo que esta empresa no afirma
        está enumerado en{' '}
        <Link href="/confianza" className="text-[#059669] hover:underline">
          el centro de confianza
        </Link>
        , y cómo se publica cada dato, en{' '}
        <Link href="/metodo" className="text-[#059669] hover:underline">
          el método editorial
        </Link>
        .
      </p>

      <PreguntasDeCompra ruta={RUTA_INTEGRACIONES} />

      <CierreComercial
        contexto="integraciones"
        titulo="¿Integra esto en su sistema de compras?"
        principal={{ href: ACCIONES.cotizar.href, label: ACCIONES.cotizar.label }}
        secundaria={{ href: '/descargas', label: 'Ver descargas y datos abiertos', flecha: true }}
        className="mt-14"
      >
        Escríbanos qué necesita leer o ejecutar y desde qué sistema. Respondemos en horario
        comercial de Lima con el contrato, un ejemplo y los límites de cada dato.
      </CierreComercial>
    </div>
  );
}
