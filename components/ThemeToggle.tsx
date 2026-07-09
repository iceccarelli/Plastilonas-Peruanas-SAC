'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

/**
 * Zero-dependency theme toggle. Writes `.dark` onto <html> and persists to
 * localStorage. Pairs with the token overrides in app/globals.css.
 *
 * Requires `darkMode: 'class'` in tailwind.config.ts and the inline no-flash
 * script in app/layout.tsx (see APPLY notes).
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('theme') as Theme | null;
    const initial: Theme =
      stored ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  // Render a fixed-size placeholder pre-hydration to avoid layout shift.
  if (!mounted) return <div className="h-9 w-9" aria-hidden />;

  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={next === 'dark' ? 'Activar modo oscuro' : 'Activar modo claro'}
      title={next === 'dark' ? 'Modo oscuro' : 'Modo claro'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--brand)] hover:border-[var(--brand)]"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
