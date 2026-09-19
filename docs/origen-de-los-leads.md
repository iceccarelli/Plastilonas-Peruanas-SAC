# De dónde sale cada RFQ — el campo `origen`, de punta a punta

**Estado al 2026-09-19.** Este documento explica qué hace hoy el sitio con el
campo `origen` de un lead y **qué tiene que configurar una persona** en su
herramienta de automatización para poder filtrar por él. No describe ninguna
integración que no exista: el repositorio no tiene CRM propio, no tiene panel
de leads y no pretende tenerlo.

## 1. Qué hace el sitio, sin que nadie configure nada

`origen` es una etiqueta de **superficie**: qué parte del sitio produjo la
solicitud. Viaja por la URL y llega hasta el final de la cadena.

| Superficie | Enlace que emite | Valor de `origen` |
|---|---|---|
| Configurador de lona | `components/LonaConfigurador.tsx` | `configurador-lona` |
| Configurador de FIBC / big bag | `app/(es)/configurador/page.tsx` | `configurador` |
| Asistente del sitio | `components/Chatbot.tsx` | `chat` |
| Calculadoras | `components/CalculadoraForm.tsx` | `calculadora` |
| Hubs de sector | `app/(es)/industria/[sector]/page.tsx` | `industria:<slug>` |
| ¿Fabricar o importar? | `components/FabricarOImportar.tsx` | `fabricar-o-importar` |

La cadena completa, eslabón por eslabón:

1. La superficie enlaza `/cotizacion?...&origen=<valor>` (o `/en/rfq?...` en
   inglés). El configurador de lona añade además `notas=<resumen>` con la
   especificación entera en texto plano.
2. `app/(es)/cotizacion/page.tsx` lee `origen`, lo sanea (máximo 40 caracteres,
   sólo `[a-z0-9:_-]`) y lo pasa al formulario. Lee `notas` (o `nota`) y lo
   deja escrito en el campo de descripción del requerimiento.
3. `components/CotizacionForm.tsx` lo incluye en el objeto que manda a
   `/api/lead` (`origen`), y dispara `rfq_start` con él en analítica.
4. `app/api/lead/route.ts` lo **declara en el esquema zod** —lo que no se
   declara, zod lo descarta en silencio— y lo reenvía en dos formas:
   - el payload entero (`...lead`), donde `origen` va como campo propio;
   - `source`, un texto compuesto: `plastilonas.com/cotizacion (configurador-lona)`.
5. Si Supabase está configurado, la fila de `quotes` guarda ese mismo `source`
   y el payload completo en la columna `payload`.

`test/cadena-configurador-lona.test.ts` y `test/parametros-cotizacion.test.ts`
fallan la compilación si cualquiera de esos eslabones deja de pasar el dato.

## 2. Lo que este entorno NO tiene

- **`CRM_WEBHOOK_URL` / `N8N_WEBHOOK_URL` no están definidas** en este
  repositorio. Sin ellas, el paso 4 no reenvía nada a ninguna parte y **no
  falla**: el lead ya viajó por WhatsApp (que es el canal comercial real) y el
  comprador ya recibió su código `RFQ-AAAAMMDD-XXXX` en la respuesta.
- No hay panel de leads en el sitio, no hay «CRM» y no hay puntuación
  automática de solicitudes. Nada de eso existe y ninguna página lo afirma.

**La ruta de respaldo funciona hoy sin configurar nada:** el formulario abre
WhatsApp con el mensaje armado (`lib/whatsapp.ts`), guarda una copia local en
el navegador del visitante y muestra el acuse con el código RFQ aunque el
navegador bloquee la ventana emergente.

## 3. Lo que una persona debe configurar para filtrar por `origen`

Esto se hace **fuera del repositorio**. Ningún paso requiere tocar código.

1. **Crear el webhook en la herramienta de automatización** (n8n, Make, Zapier
   o lo que use el área comercial): un nodo de entrada tipo *Webhook* que
   acepte `POST` con `Content-Type: application/json`.
2. **Poner la URL en Vercel** → Settings → Environment Variables:
   `CRM_WEBHOOK_URL = https://…` (el nombre heredado `N8N_WEBHOOK_URL` también
   se lee, por compatibilidad). Redeploy.
3. **Filtrar por `origen` dentro del flujo.** El cuerpo que llega es el lead
   completo más cuatro campos añadidos por `/api/lead`:

   ```json
   {
     "nombre": "…", "empresa": "…", "email": "…", "telefono": "…",
     "producto": "lona-plastificada-rafia-polytarp",
     "mensaje": "Configuración de lona a medida (preliminar, sin precio)\nMaterial: PVC plastificado\n…",
     "origen": "configurador-lona",
     "path": "/cotizacion?producto=…&origen=configurador-lona&notas=…",
     "slug": "lona-plastificada-rafia-polytarp",
     "rfqId": "RFQ-20260919-A1B2",
     "persisted": false,
     "source": "plastilonas.com/cotizacion (configurador-lona)",
     "receivedAt": "2026-09-19T14:03:11.000Z"
   }
   ```

   En n8n, el filtro es un nodo *Switch* o *IF* sobre `{{$json.origen}}`. Las
   ramas que valen la pena separar, por lo que dicen del comprador:

   - `configurador-lona` y `configurador` — **la especificación ya está
     escrita** en `mensaje`. Es el lead más caliente del sitio: llega con
     material, gramaje, ancho, confección y tratamientos decididos. Responder
     con la cotización, no con preguntas.
   - `calculadora` — trae un predimensionado; falta confirmarlo.
   - `chat` — conversación previa con el asistente; el contexto está en el
     mensaje.
   - `industria:<slug>` — llegó por el hub de sector, sin pieza definida.
   - vacío / ausente — entró directo al formulario.

4. **Qué campo usar como identificador** en la herramienta: `rfqId`. Es único
   por solicitud y es el mismo código que el comprador ve en pantalla, así que
   sirve para casar una llamada con un registro.

### Si prefiere no montar el webhook

Hay dos caminos que también funcionan y no requieren automatización:

- **`RESEND_API_KEY` + `LEAD_EMAIL_TO`**: copia de cada RFQ por correo a
  ventas. El asunto lleva el código RFQ, el producto y la ciudad de entrega; el
  cuerpo incluye la página de origen. Filtrar por `origen` es entonces una
  regla de bandeja de entrada, no un flujo.
- **Supabase**: si `NEXT_PUBLIC_SUPABASE_URL` y la clave de servicio están
  puestas, cada lead queda en la tabla `quotes` con `source` y `payload`. Una
  consulta `where source like '%(configurador-lona)%'` responde la pregunta sin
  ninguna herramienta externa.

## 4. Qué NO hacer

- No declarar en ninguna página pública que el sitio «integra con un CRM» ni
  que «puntúa leads automáticamente». Hoy no es cierto, y
  `test/afirmaciones.test.ts` existe precisamente para que una afirmación así
  no llegue a producción.
- No poner la URL del webhook en el repositorio. Es una variable de entorno de
  Vercel y nada más.
- No cambiar el valor de `origen` de una superficie sin buscar antes quién lo
  lee: `test/parametros-cotizacion.test.ts` compara los dos extremos del
  enlace, pero un flujo de n8n filtrando por el valor viejo no lo sabe nadie
  más que quien lo escribió.
