# Plastilonas Peruanas SAC — Sitio Web Premium

Sitio web oficial de **Plastilonas Peruanas SAC** — Soluciones textiles industriales de nivel internacional para minería, agricultura, construcción, transporte e industria en Perú.

Construido con **Next.js 15 (App Router)** + **TypeScript** + **Tailwind CSS** + **shadcn/ui-inspired components** + **Framer Motion** + **Vercel AI SDK**.

## 🚀 Características Destacadas

- **Diseño de nivel enterprise** (inspirado en AWS, Stripe y Vercel)
- **Chatbot IA profesional** en la esquina inferior derecha (Vercel AI SDK + GPT-4o-mini)
- **Mega menú de productos** estilo AWS
- **Command Palette** global (⌘K) para búsqueda instantánea
- **Formulario de cotización** inteligente (modal + página dedicada)
- **Catálogo avanzado** con filtros por categoría y sector
- **Páginas de detalle de producto** ricas en información
- **Totalmente responsive** y optimizado para conversiones
- **SEO optimizado** (Metadata API, sitemap, Open Graph)
- **Animaciones premium** con Framer Motion
- **WhatsApp floating button** + CTA de cotización en todo el sitio

## 📦 Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript estricto
- **Estilos**: Tailwind CSS 4 + componentes premium personalizados
- **Animaciones**: Framer Motion
- **Formularios**: react-hook-form + zod + sonner (toasts)
- **Chatbot IA**: @ai-sdk/react + ai + @ai-sdk/openai
- **Iconos**: lucide-react
- **Deployment**: Vercel (recomendado) o cualquier plataforma Next.js

## 🛠️ Instalación y Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone <tu-repo>
cd plastilonas-peruanas

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (ver abajo)
cp .env.example .env.local

# 4. Ejecutar en modo desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🔑 Configuración del Chatbot IA (Obligatorio para producción)

El chatbot utiliza **Vercel AI SDK** con OpenAI por defecto.

1. Crea una cuenta en [OpenAI](https://platform.openai.com)
2. Genera una API Key
3. Crea el archivo `.env.local` en la raíz del proyecto:

```env
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

> **Recomendación**: Para producción de alto volumen, considera cambiar a `gpt-4o` o integrar con Grok/xAI (compatible con OpenAI SDK cambiando el baseURL).

El system prompt del chatbot está optimizado para actuar como un **experto comercial real** de Plastilonas Peruanas.

## 🚀 Despliegue en Vercel (1 clic)

1. Sube el proyecto a GitHub
2. Ve a [vercel.com/new](https://vercel.com/new)
3. Importa tu repositorio
4. **Variables de entorno**: Agrega `OPENAI_API_KEY` en la configuración de Vercel
5. Haz clic en **Deploy**

El sitio estará en producción en menos de 2 minutos.

### Configuración recomendada en Vercel:
- Framework Preset: **Next.js**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

## 🖼️ Reemplazo de Imágenes

Actualmente el sitio usa placeholders visuales. Para usar fotos reales del cliente:

1. Crea la carpeta `public/images/`
2. Agrega las fotos con los nombres:
   - `big-bags.jpg`
   - `geomembranas.jpg`
   - `carpas.jpg`
   - `mangas-ventilacion.jpg`
   - etc. (ver `lib/products.ts` → campo `image`)
3. Actualiza las rutas en `lib/products.ts` si es necesario
4. Para mejor rendimiento, usa `next/image` con optimización automática

**Consejo profesional**: Usa fotos reales de fábrica, productos instalados y clientes para generar máxima confianza.

## ✏️ Cómo Modificar Productos Fácilmente

Todo el catálogo está centralizado en:

```ts
lib/products.ts
```

Cada producto tiene:
- `slug` (URL amigable)
- `name`, `category`, `sector[]`
- `shortDescription` + `description` (rica)
- `specifications[]` (tabla técnica)
- `applications[]` y `benefits[]`
- `image` + `gallery[]`
- `featured` / `popular` flags

Simplemente edita el array `products` y el sitio se actualiza automáticamente.

## 📁 Estructura del Proyecto

```
app/
├── layout.tsx              # Root + Navbar + Footer + Chatbot
├── page.tsx                # Home premium
├── productos/
│   ├── page.tsx            # Catálogo con filtros avanzados
│   └── [slug]/page.tsx     # Detalle de producto
├── servicios/page.tsx
├── nosotros/page.tsx
├── contacto/page.tsx
├── cotizacion/page.tsx
└── api/chat/route.ts       # Endpoint del Chatbot IA
components/
├── Navbar.tsx              # Header con mega menú + Command
├── Footer.tsx
├── Chatbot.tsx             # Asistente IA flotante
├── CotizacionModal.tsx     # Formulario de cotización
├── ProductCard.tsx
└── CommandPalette.tsx
lib/
├── products.ts             # Base de datos central de productos
├── types.ts
public/images/              # Imágenes del sitio
```

## ✅ Checklist de Producción

- [ ] Agregar `OPENAI_API_KEY` en Vercel
- [ ] Reemplazar imágenes placeholder por fotos reales
- [ ] Personalizar textos de testimonios (si se tienen reales)
- [ ] Configurar dominio personalizado en Vercel
- [ ] Verificar sitemap y robots.txt (Next.js los genera automáticamente)
- [ ] Probar flujo completo de cotización + chatbot
- [ ] Configurar Google Analytics / Meta Pixel (opcional)

## 📞 Soporte y Personalización

Este sitio fue diseñado y desarrollado como una experiencia digital **premium de nivel billonario** para Plastilonas Peruanas SAC.

¿Necesitas ajustes, nuevas secciones, integración con CRM, WhatsApp Business API o pasarela de pagos? Contáctame.

---

**WE WILL TAKE OVER THIS NICHE MARKET**

Sitio listo para convertir visitantes en clientes de alto valor.
