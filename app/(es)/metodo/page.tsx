import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, faqSchema, webPageSchema } from '@/lib/schema';
import { PRODUCT_COUNT, FAMILY_COUNT, YEARS_STATEMENT } from '@/lib/facts';
import { products } from '@/lib/products';
import { terminos } from '@/lib/glosario';
import { articles } from '@/lib/articles';
import { guides } from '@/lib/guides';
import { solutions } from '@/lib/solutions';
import { calculadoras } from '@/lib/calculadoras';
import { pillars, totalCriteria } from '@/lib/framework';
import { projects, projectsPublicados } from '@/lib/projects';
import { todasLasRanurasConPublicadas } from '@/lib/imagenes';
import { OG_IMAGEN } from '@/lib/meta';

/**
 * MÉTODO EDITORIAL — cómo se decide lo que se publica aquí.
 *
 * POR QUÉ EXISTE ESTA PÁGINA. El sitio ya declara lo que NO afirma (/confianza),
 * publica una página de obras vacía antes que un caso sin confirmar (/proyectos)
 * y obliga a cada calculadora a enumerar sus límites. Lo que faltaba era el
 * escalón anterior: explicar el MÉTODO por el que eso ocurre, para que un
 * comprador —o un agente que cite este sitio— pueda juzgar la fiabilidad de la
 * fuente y no sólo el dato suelto.
 *
 * Es la diferencia entre afirmar «somos rigurosos», que no significa nada y que
 * afirma cualquiera, y publicar el procedimiento para que se compruebe. Todo lo
 * que dice esta página se puede verificar desde fuera: los conteos salen de los
 * mismos arreglos que alimentan el catálogo, y los datos abiertos del final
 * permiten contrastarlos sin pedirnos permiso.
 *
 * REGLA AL EDITARLA: ninguna cifra se teclea. Si el número no se puede derivar
 * de lib/, no va en esta página — sería exactamente el defecto que la página
 * dice que este sitio evita.
 */

const URL_METODO = `${SITE.url}/metodo`;

const FAQS = [
  {
    q: '¿Cómo sé que las cifras de este sitio están al día?',
    a: 'Porque no se escriben: se calculan. El número de productos, de familias, de criterios del marco o de años de operación sale del mismo arreglo de datos que genera las páginas, los PDF y los archivos abiertos. Cambiar el dato cambia todo a la vez; no hay una segunda copia que se quede atrás.',
  },
  {
    q: '¿Las imágenes son fotografías de obras que ustedes ejecutaron?',
    a: 'No. Las ilustraciones son referenciales y los esquemas son dibujos explicativos. Cuando la fotografía es de nuestro catálogo, el pie lo dice. Ninguna imagen de este sitio se presenta como el registro de una obra ejecutada por esta empresa.',
  },
  {
    q: '¿Por qué la página de proyectos está vacía?',
    a: `Porque una ficha de obra sólo se publica cuando el área comercial confirma que el suministro ocurrió tal como está escrito y, si aparece el nombre del cliente, cuando ese cliente lo autorizó. Hoy hay ${projects.length} fichas redactadas y ${projectsPublicados.length} publicadas. Preferimos una página vacía a una página que no se sostenga.`,
  },
  {
    q: '¿Qué pasa cuando encuentran un error en el sitio?',
    a: 'Se corrige y queda registrado con su fecha en la página de novedades, que no se reescribe en silencio. Un registro que sólo cuenta los aciertos no es un registro.',
  },
  {
    q: '¿Puedo verificar estos datos sin pedirles nada?',
    a: 'Sí. El catálogo completo, el glosario, los métodos de cálculo y la ficha de entidad de la empresa se publican como archivos abiertos, sin registro previo y sin formulario. Están enlazados al final de esta página.',
  },
];

export const metadata: Metadata = {
  title: 'Cómo se publica este sitio',
  description:
    'El método editorial: de dónde sale cada cifra, qué se comprueba antes de publicar, qué no se afirma y cómo verificarlo por su cuenta.',
  alternates: { canonical: '/metodo' },
  openGraph: {
    images: OG_IMAGEN,
    title: 'Cómo se publica este sitio — método editorial',
    description:
      'De dónde sale cada cifra, qué se comprueba antes de publicar y cómo verificarlo sin pedirnos permiso.',
    url: URL_METODO,
    locale: 'es_PE',
    type: 'website',
  },
};

/** Las siete puertas, nombradas por lo que impiden y no por su comando. */
const PUERTAS = [
  ['Tipos', 'Que una página compile pero sirva un dato que no existe.'],
  ['Pruebas', 'Que vuelva a colarse una certificación propia, un recuento de clientes, una sede que no existe o una cifra que contradiga al catálogo.'],
  ['Imágenes', 'Que una página cite una ruta de imagen sin archivo, o que un archivo ocupe disco sin mostrarse en ninguna parte.'],
  ['Construcción', 'Que el sitio se despliegue a medio generar.'],
  ['Auditoría del HTML servido', 'Que se publique una página huérfana, un enlace roto, un título fuera de presupuesto o un dato estructurado con referencias rotas.'],
  ['Viewport', 'Que un botón quede fuera de pantalla o una imagen no llegue a pintarse, en 17 anchos distintos de 280 a 2560 píxeles.'],
  ['Navegación', 'Que un desplegable del menú se cierre antes de que el puntero llegue a la opción.'],
];

export default function MetodoPage() {
  const ranuras = todasLasRanurasConPublicadas().length;
  const conFicha = products.filter((p) => p.specifications.length > 0).length;
  const minSpecs = Math.min(...products.map((p) => p.specifications.length));

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <JsonLd
        data={[
          webPageSchema({
            url: URL_METODO,
            name: 'Cómo se publica este sitio',
            description:
              'Método editorial: de dónde sale cada cifra, qué se comprueba antes de publicar y cómo verificarlo por su cuenta.',
            speakable: ['.respuesta-directa'],
            breadcrumbId: `${URL_METODO}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Cómo se publica este sitio', url: URL_METODO },
            ],
            `${URL_METODO}#breadcrumb`,
          ),
          faqSchema(FAQS, URL_METODO),
        ]}
      />

      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:text-[#059669]">Inicio</Link>{' / '}
        <span>Cómo se publica este sitio</span>
      </nav>

      <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">MÉTODO EDITORIAL</div>
      <h1 className="t-display font-semibold text-[#0A2540]">Cómo se publica este sitio</h1>

      <p className="respuesta-directa mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 leading-relaxed text-[#0A2540]">
        Todo dato publicado aquí sale del mismo origen que genera las páginas, los PDF y los archivos
        abiertos: ninguna cifra se teclea a mano. Antes de publicar, siete comprobaciones
        automáticas tienen que pasar. Lo que no se puede respaldar con un documento no se afirma, y se
        declara que no se afirma. {YEARS_STATEMENT}.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-[#0A2540]">1 · Las cifras se calculan, no se escriben</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Un número escrito a mano en una página no es un error de estilo: es una afirmación que nadie
          vuelve a comprobar. Cuando el catálogo cambia, esa cifra sigue diciendo lo de antes y nadie se
          entera. Por eso los conteos de este sitio se derivan del dato en el momento de construirlo.
        </p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ['Catálogo', `${PRODUCT_COUNT} soluciones en ${FAMILY_COUNT} líneas`],
            ['Glosario técnico', `${terminos.length} términos`],
            ['Guías y biblioteca', `${articles.length} guías · ${guides.length} fichas de especificación`],
            ['Arquitecturas de referencia', `${solutions.length}`],
            ['Marco de Especificación', `${pillars.length} pilares · ${totalCriteria()} criterios`],
            ['Métodos de cálculo', `${calculadoras.length} calculadoras`],
            ['Huecos de imagen declarados', `${ranuras}`],
            ['Fichas de obra', `${projects.length} redactadas · ${projectsPublicados.length} publicadas`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-gray-100 p-4">
              <dt className="text-xs uppercase tracking-widest text-gray-500">{k}</dt>
              <dd className="mt-1 font-medium text-[#0A2540]">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-gray-600">
          Esas ocho cifras se han calculado al construir esta página. Si alguna no coincide con lo que
          ve en la sección correspondiente, es un defecto y le agradecemos que nos lo diga.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-[#0A2540]">2 · Lo que no se afirma se declara</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Esta empresa no tiene certificación ISO, ASTM, CE ni UL a su nombre, y no la va a declarar. Se
          citan las normas ajenas que su operación o su cliente exigen, y se entrega la documentación
          que el fabricante de cada material sí puede emitir. No se publican precios de lista en líneas
          a medida, no se promete envío mundial y no se nombran clientes sin permiso escrito.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          La lista completa de lo que no se afirma está publicada, y cada hub de aplicación publica
          además sus propios límites.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/confianza" className="text-[#059669]">Centro de confianza →</Link>
          <Link href="/proyectos" className="text-[#059669]">Fichas de obra →</Link>
          <Link href="/calidad" className="text-[#059669]">Proceso de planta →</Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-[#0A2540]">3 · Qué son y qué no son las imágenes</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Cada hueco de imagen del sitio está declarado antes de que exista el archivo, con su ruta, su
          tamaño y su texto alternativo. Mientras la imagen no llegue, la página muestra un marcador
          sobrio que dice qué falta: nunca un icono roto, y nunca un relleno genérico —que es peor,
          porque ocupa el sitio del bueno y nadie vuelve a acordarse de encargarlo.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          <strong>Las ilustraciones son referenciales y los esquemas son dibujos explicativos.</strong>{' '}
          Cuando lo que ve es una fotografía de nuestro catálogo, el pie de la imagen lo dice.
          Ninguna imagen de este sitio se presenta como el registro fotográfico de una obra ejecutada
          por esta empresa.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-[#0A2540]">4 · Siete comprobaciones antes de publicar</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Ninguna versión llega al sitio sin que estas siete pasen. Están nombradas por lo que impiden,
          que es lo que le importa a quien lee, y no por el comando que las ejecuta.
        </p>
        <ol className="mt-5 space-y-3">
          {PUERTAS.map(([nombre, impide], i) => (
            <li key={nombre} className="rounded-2xl border border-gray-100 p-4">
              <span className="font-mono text-xs text-gray-400">{String(i + 1).padStart(2, '0')}</span>{' '}
              <span className="font-semibold text-[#0A2540]">{nombre}</span>
              <p className="mt-1 text-sm text-gray-600">Impide: {impide}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-[#0A2540]">5 · Cuando nos equivocamos</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Estas comprobaciones existen porque cada una nació de un fallo real que llegó a publicarse.
          Cuando se encuentra uno, se corrige y la corrección queda fechada en el registro de novedades,
          que no se reescribe en silencio. Un registro que sólo cuenta los aciertos no es un registro:
          es publicidad.
        </p>
        <Link href="/novedades" className="mt-4 inline-block text-[#059669]">Registro fechado de cambios →</Link>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-[#0A2540]">6 · Verifíquelo sin pedirnos permiso</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Todo lo anterior es comprobable desde fuera. Estos archivos se publican sin registro, sin
          formulario y sin límite de uso, y salen de las mismas fuentes que las páginas que acaba de leer.
        </p>
        <ul className="mt-5 space-y-2 text-sm">
          {[
            ['/entidad.json', 'Identidad de la empresa: razón social, RUC, domicilio y alcance declarado'],
            ['/productos/catalogo.json', `El catálogo completo, ${conFicha} fichas con al menos ${minSpecs} filas de especificación cada una`],
            ['/glosario/terminos.json', `Los ${terminos.length} términos del rubro, con su definición`],
            ['/calculadoras/formulas.json', 'Los métodos de cálculo, con sus supuestos y sus límites'],
            ['/llms.txt', 'El mapa del sitio para agentes, con lo que esta empresa no resuelve'],
          ].map(([ruta, que]) => (
            <li key={ruta} className="flex flex-wrap gap-x-3 rounded-2xl border border-gray-100 p-4">
              <a href={ruta} className="font-mono text-[#059669]">{ruta}</a>
              <span className="text-gray-600">{que}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-gray-600">
          El RUC {SITE.ruc} y el domicilio fiscal se contrastan en SUNAT, que es una fuente que no
          controlamos nosotros.
        </p>
      </section>

      <section className="mt-12 border-t pt-10">
        <h2 className="text-xl font-semibold text-[#0A2540]">Preguntas frecuentes</h2>
        <dl className="mt-5 space-y-5">
          {FAQS.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
