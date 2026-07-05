'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

interface Props {
  providers: { id: string; name: string }[];
}

function ProviderIcon({ id }: { id: string }) {
  if (id === 'google') {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
    );
  }
  if (id === 'facebook') {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
        <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z" />
      </svg>
    );
  }
  // X / Twitter
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />
    </svg>
  );
}

export default function LoginButtons({ providers }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSignIn = (id: string) => {
    setLoading(id);
    signIn(id, { callbackUrl: '/dashboard' });
  };

  return (
    <div className="space-y-3">
      {providers.map((p) => (
        <button
          key={p.id}
          onClick={() => handleSignIn(p.id)}
          disabled={loading !== null}
          className="flex items-center justify-center gap-3 w-full bg-white border border-gray-200 hover:border-gray-400 rounded-2xl px-6 py-3.5 font-medium text-gray-800 transition-all active:scale-[0.985] disabled:opacity-60"
        >
          {loading === p.id ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ProviderIcon id={p.id} />
          )}
          Continuar con {p.name === 'Twitter' ? 'X' : p.name}
        </button>
      ))}
    </div>
  );
}
