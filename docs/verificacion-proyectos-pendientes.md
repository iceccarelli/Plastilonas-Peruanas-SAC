# Fichas de proyecto pendientes de verificación

**Estado al 2026-09-19.** `lib/projects.ts` contiene **cinco borradores**, los
cinco con `verificado: false`. Mientras esa bandera siga en `false`, la ficha
**no se renderiza, no entra al sitemap y no se enlaza desde ninguna parte**:
vive en el repositorio como borrador, no como afirmación pública.
`test/proyectos.test.ts` impide que una llegue al público sin ese paso.

Este documento es la lista de lo que el **área comercial** debe confirmar, ficha
por ficha, antes de que alguien ponga `verificado: true`.

> **Quién ejecuta esto:** una persona del área comercial de Plastilonas
> Peruanas SAC, con acceso al archivo del proyecto y a la relación con el
> cliente. **No lo ejecuta ningún agente, ningún script y nadie desde fuera de
> la empresa.** Ninguna de estas fichas ha sido verificada por quien escribió
> este documento.

## Cómo se verifica una ficha (las cinco preguntas)

Las cinco tienen que responderse **Sí** por escrito. Una sola «no sé» deja la
ficha en `false`.

1. **¿La obra existió tal como está redactada?** No «algo parecido»: el reto,
   la solución y el resultado, tal cual están escritos, describen un suministro
   real de esta empresa.
2. **¿El cliente autorizó que se mencione?** Si autorizó su **nombre**,
   reemplazar el campo `client` por el nombre real. Si **no** lo autorizó, la
   fórmula genérica («Contratista minero en el Perú») es legítima y suficiente
   — pero la autorización a publicar el caso, aunque sea anónimo, **también
   hace falta**.
3. **¿Las fotos corresponden a esta obra específica?** Si las imágenes que
   acompañarían la ficha son referenciales o de otra obra, no se publican como
   si fueran de ésta.
4. **¿Los productos listados (`productSlugs`) son los que de verdad se
   suministraron?** Cada slug tiene que corresponder a una línea que
   efectivamente entró en ese suministro.
5. **¿El resultado está redactado sin afirmar lo que no se puede probar?** Nada
   de porcentajes de ahorro, plazos récord, volúmenes ni certificaciones que no
   consten en un documento del expediente.

Confirmadas las cinco, el cambio en el código es de **una línea**:
`verificado: false` → `verificado: true` en esa ficha, y opcionalmente el campo
`client`. Nada más.

## Inventario de borradores

### 1. `ventilacion-contratista-minero-peru`
- **Título:** Mangas de ventilación para tramos subterráneos
- **Cliente declarado:** Contratista minero en el Perú (nombre bajo acuerdo)
- **Sector / región:** minería · Sierra peruana · Perú
- **Productos:** `mangas-ventilacion-minas-tuneles`
- **Año declarado:** «Operación continua — año no publicado»

- [ ] 1. ¿La obra existió tal como está redactada?
- [ ] 2. ¿El cliente autorizó la mención (aunque sea anónima)? ¿Autorizó su nombre?
- [ ] 3. ¿Las fotos corresponden a esta obra específica?
- [ ] 4. ¿Se suministraron esas mangas, con accesorios de unión, en ese alcance?
- [ ] 5. **Punto a vigilar:** «uniones que debían armarse en sitio» y el alcance
      de instalación. La ficha dice explícitamente que el alcance se define en
      cotización y no como cobertura nacional automática — confirmar que sigue
      siendo exacto.
- [ ] 6. Confirmar el año o dejarlo sin publicar, pero decidirlo: «operación
      continua» no puede ser una forma de no tener la fecha.

### 2. `malla-fundo-costa`
- **Título:** Malla de protección de cultivo en costa
- **Cliente declarado:** Fundo agroexportador (nombre bajo acuerdo)
- **Sector / región:** agroexportación · Costa peruana · Perú
- **Productos:** `mallas-antiafidas`, `malla-raschel-sombra`
- **Año declarado:** «Campañas sucesivas — año no publicado»

- [ ] 1. ¿La obra existió tal como está redactada?
- [ ] 2. ¿El fundo autorizó la mención? ¿Autorizó su nombre?
- [ ] 3. ¿Las fotos corresponden a este fundo y a esta campaña?
- [ ] 4. ¿Entraron las dos líneas (antiáfida **y** raschel) en el suministro?
- [ ] 5. **Punto a vigilar:** el resultado dice que los ensayos agronómicos los
      define el fundo. Confirmar que la ficha no se lee como si la empresa
      hubiera medido un efecto sobre la plaga o sobre el rendimiento.
- [ ] 6. ¿Se puede nombrar el valle o la región sin identificar al cliente?

### 3. `toldos-flota-lima`
- **Título:** Toldos a medida para flota de carga
- **Cliente declarado:** Operador logístico en Lima (nombre bajo acuerdo)
- **Sector / región:** transporte y logística · Lima · Perú
- **Productos:** `mantas-cobertores-toldos-camiones`, `siders-tolderas-camiones`
- **Año declarado:** «Reposición periódica — año no publicado»

- [ ] 1. ¿La obra existió tal como está redactada?
- [ ] 2. ¿El operador autorizó la mención? ¿Autorizó su nombre?
- [ ] 3. ¿Las fotos corresponden a esta flota? **Ojo con las placas y el
      rotulado**: una foto de flota identifica al cliente aunque el texto no lo
      nombre.
- [ ] 4. ¿Se suministraron mantas **y** siders?
- [ ] 5. **Punto a vigilar:** «Flota cubierta por tipo de caja» sugiere un
      alcance total. Confirmar cuántos tipos de unidad se cubrieron de verdad,
      o redactarlo sin dar a entender que fue la flota completa.
- [ ] 6. ¿Se puede publicar el número de unidades? Si no, no insinuarlo.

### 4. `almacen-temporal-infraestructura`
- **Título:** Almacén textil temporal de obra
- **Cliente declarado:** Contratista de infraestructura (nombre bajo acuerdo)
- **Sector / región:** construcción · Perú
- **Productos:** `carpas-lona-estructuras-metalicas`, `galpones-invernaderos-estructurados`
- **Año declarado:** «Proyecto de obra — año no publicado»

- [ ] 1. ¿La obra existió tal como está redactada?
- [ ] 2. ¿El contratista autorizó la mención? ¿Autorizó su nombre?
- [ ] 3. ¿Las fotos corresponden a esta obra específica?
- [ ] 4. ¿Fue carpa, galpón o ambos? Los dos slugs están declarados.
- [ ] 5. **Punto a vigilar:** «Instalación propia según alcance del sitio».
      Confirmar que la instalación la ejecutó equipo propio y no un tercero: es
      la afirmación diferencial de toda la empresa y la más cara de equivocar.
- [ ] 6. La región dice sólo «Perú». Precisarla o dejarla, pero decidirlo.

### 5. `exportacion-colombia-senal`
- **Título:** Suministro internacional con señal hacia Colombia
- **Cliente declarado:** Operación de comercio exterior (detalle comercial no publicado)
- **Sector / región:** minería · Colombia · exportación desde Callao / Lima
- **Productos:** `lona-plastificada-rafia-polytarp`, `big-bags-bolsones-polipropileno`
- **Año declarado:** «Señal pública de comercio — no es una cuenta abierta»

- [ ] 1. **Ésta es distinta a las otras cuatro.** No describe una obra sino una
      *señal pública de comercio exterior*. Antes de publicarla, decidir si es
      una ficha de proyecto o si su sitio natural es `/exportacion`, donde la
      evidencia de comercio ya se trata como lo que es.
- [ ] 2. ¿De qué documento sale la evidencia pública hacia Colombia? Anotar la
      referencia (aduana, partida, fecha) en el expediente antes de publicar.
- [ ] 3. ¿Hay un cliente concreto que haya autorizado algo, o es una
      afirmación sobre la empresa sin contraparte identificable?
- [ ] 4. **Punto a vigilar (el más importante del inventario):** publicar esto
      como «proyecto» se lee como una cuenta abierta en Colombia. La propia
      ficha lo niega en el campo `yearLabel`. Si al publicarse pudiera
      entenderse como presencia comercial permanente en Colombia, **no se
      publica**: es exactamente el tipo de afirmación que un jefe de compras
      castiga y que `test/afirmaciones.test.ts` vigila en el resto del sitio.
- [ ] 5. Confirmar que EXW / FOB Callao, packing list y factura describen el
      procedimiento real y no el deseable.

## Estado del inventario

| Ficha | `verificado` hoy | Publicada |
|---|---|---|
| `ventilacion-contratista-minero-peru` | `false` | No |
| `malla-fundo-costa` | `false` | No |
| `toldos-flota-lima` | `false` | No |
| `almacen-temporal-infraestructura` | `false` | No |
| `exportacion-colombia-senal` | `false` | No |

`/proyectos` mantiene entretanto su estado vacío honesto: dice que no hay
fichas publicadas en lugar de rellenar la página. Eso es correcto y no hay que
«arreglarlo» publicando un borrador.
