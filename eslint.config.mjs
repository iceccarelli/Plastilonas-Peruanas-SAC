import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

// Antes no existía configuración de ESLint: `next lint` caía en el asistente
// interactivo y no se ejecutaba en CI. Esta config activa las reglas de
// Next.js. Las reglas estilísticas que podrían romper `next build` se degradan
// a "warn" para que la compilación nunca falle por lint, pero sigan visibles.
const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    // `servicio/` es un proceso Node independiente que se despliega en Fly con
    // su propio tsconfig, sus propias pruebas y su propia construcción: el
    // Dockerfile corre `tsc` y `node --test` antes de publicar nada. Las reglas
    // de `next/core-web-vitals` —pensadas para páginas y componentes— no
    // aplican a un servidor HTTP sin React.
    ignores: ['.next/**', 'node_modules/**', 'public/**', 'next-env.d.ts', '*.sh', 'servicio/**'],
  },
  {
    rules: {
      'react/no-unescaped-entities': 'warn',
      '@next/next/no-img-element': 'warn',
    },
  },
];

export default eslintConfig;
