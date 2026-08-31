"use client";

import { readySocialLinks } from "@/lib/social";
import { trackSocialClick } from "@/lib/analytics";

interface Props {
  variant?: "dark" | "light";
  className?: string;
}

export default function SocialIcons({ variant = "dark", className = "" }: Props) {
  const base =
    variant === "dark"
      ? "text-white/50 hover:text-white hover:bg-white/10 border-white/10"
      : "text-gray-400 hover:text-[#0A2540] hover:bg-gray-100 border-gray-200";

  const links = readySocialLinks();
  // Sin ningún perfil real no se pinta el contenedor: una fila de iconos vacía
  // deja un hueco en el pie que parece un fallo de carga.
  if (links.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-social={name.toLowerCase()}
          onClick={() => trackSocialClick(name)}
          className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${base}`}
          title={name}
          aria-label={name}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}
