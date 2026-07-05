'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="inline-flex items-center gap-2 border border-gray-200 hover:border-red-300 hover:text-red-600 rounded-2xl px-5 py-2.5 text-sm font-medium text-gray-600 transition-all"
    >
      <LogOut className="w-4 h-4" />
      Cerrar sesión
    </button>
  );
}
