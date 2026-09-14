# G4 — el gate imprimía la advertencia y empujaba igual

**Fecha:** 2026-09-14 · **Base:** `main` con 0002 a 0012 aplicados ·
**Archivos tocados:** 4 · **Advertencias de lint:** 1 → 0 · **Pruebas nuevas:** 3

## 1. Lo que pasó dos veces

```
./app/og.png/route.tsx
59:11  Warning: Using `<img>` could result in slower LCP …  @next/next/no-img-element
```

El gate lo imprimió, siguió, construyó y **empujó**. Es la segunda vez en esta
serie:

| Entrega | Advertencia introducida | Qué hizo el gate |
|---|---|---|
| 0009 | `react-hooks/exhaustive-deps` en `CotizacionForm` | imprimir y empujar |
| 0012 | `@next/next/no-img-element` en la tarjeta social | imprimir y empujar |

Las dos las arreglé en la entrega siguiente. El problema no son las dos
advertencias: es que **un lint con «sólo una advertencia conocida» deja de ser
una señal**. A la segunda ya no se lee, y a la tercera no se distingue una nueva
de la vieja.

## 2. Por qué apareció ésta, y por qué la regla no aplica aquí

`@next/next/no-img-element` protege el LCP de una página HTML: recomienda
`<Image>` de `next/image`, que emite `srcset`, carga diferida y un componente de
cliente.

`app/og.png/route.tsx` no es una página. Satori —el motor de `ImageResponse`—
interpreta un subconjunto de HTML y CSS y devuelve un PNG: no ejecuta
componentes de React del cliente ni entiende `srcset`. `<Image>` **no se puede
usar**, y un `<img>` con un data URI es exactamente lo que corresponde.

El aviso apareció al convertir el archivo en manejador de ruta (entrega 0012):
el plugin de ESLint de Next exime a los archivos de convención de metadatos
—`opengraph-image.tsx` lo era— y a un `route.tsx` no.

Se silencia **la línea**, con el motivo escrito entero al lado. No el archivo y
no la regla: si mañana alguien mete aquí una fotografía de verdad, vuelve a
avisar.

## 3. Lo que entra para que no haya una tercera vez

`"lint": "next lint --max-warnings=0"`.

Una advertencia pasa a ser un fallo: el gate **para antes del push** y quien la
introdujo la arregla en el momento, que es cuando cuesta barato. La alternativa
—arreglarla en la entrega siguiente— es la que llevamos dos veces.

Se comprueba que hoy son cero: el último gate completo imprimió exactamente una
advertencia, la de este parche.

## 4. Lo que lo mantiene

`test/gate.test.ts`, 3 pruebas sobre el único mecanismo que separa este
repositorio de la rama que se despliega:

- `npm run lint` lleva `--max-warnings=0`;
- `scripts/aplicar-entrega.sh` corre las **cuatro** comprobaciones —typecheck,
  pruebas, lint, build— y las cuatro **antes** del `git push`;
- el script conserva `set -euo pipefail`, sin el cual un typecheck en rojo
  imprime el error y el script sigue hasta el push como si nada.

Verificadas en sentido contrario: quitando `--max-warnings=0`, quitando
`npm run lint` del gate y cambiando `set -euo pipefail` por `set -u`, falla
exactamente la que corresponde.

## 5. Comprobación en producción de la entrega anterior

Aprovechando el despliegue de 0012, medido sobre el sitio en vivo:

| | |
|---|---|
| `/en/truck-tarpaulins-peru` → `og:image` | `https://…/og.png` ✅ |
| `/en/truck-tarpaulins-peru` → `og:locale` | `en_US` ✅ |
| `/og.png` | devuelve imagen ✅ |
| `/opengraph-image` | redirige a la imagen ✅ |

Las siete páginas que servían un 404 como tarjeta ya no lo hacen.

## 6. Lo que sigue pendiente

El gate sigue sin comprobar que las URLs que el HTML emite existan: 0011 pasó
las cuatro etapas y salió con `og:image` apuntando a un 404. Eso necesita
recorrer el sitio construido y pedir cada `og:image`, cada `canonical` y cada
enlace interno. Es el siguiente parche.
