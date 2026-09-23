import { useCallback, type MouseEventHandler, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Navega para uma área interna somente com sessão ativa.
 * Sem sessão, envia para o login guardando o destino pretendido.
 */
export function useAuthNav() {
  const navigate = useNavigate();

  return useCallback(
    async (href: string) => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate({ href });
        return;
      }
      navigate({ to: "/login", search: { redirect: href } });
    },
    [navigate],
  );
}

/** Link para área interna: exige cadastro/login antes de entrar. */
export function AuthLink({
  href,
  className,
  children,
  ariaLabel,
  onMouseMove,
  onMouseLeave,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  onMouseMove?: MouseEventHandler<HTMLAnchorElement>;
  onMouseLeave?: MouseEventHandler<HTMLAnchorElement>;
}) {
  const go = useAuthNav();

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        e.preventDefault();
        void go(href);
      }}
    >
      {children}
    </a>
  );
}
