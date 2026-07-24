import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A2540',
          light: '#1A3A5C',
        },
        brand: {
          DEFAULT: '#059669',
          dark: '#047857',
          // Variante con contraste AA verificado sobre blanco (5.48:1).
          // Migrar `text-[#059669]` -> `text-brand-text` para retirar el
          // override !important de globals.css sin perder accesibilidad.
          text: '#047857',
          emerald: '#10B981',
        },
        amber: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
        whatsapp: '#25D366',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
