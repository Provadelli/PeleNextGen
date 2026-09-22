import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "png-cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "aceito");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 px-4 py-4 shadow-2xl backdrop-blur sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-xs text-muted-foreground sm:text-sm">
          Usamos cookies essenciais para manter sua sessão autenticada e lembrar suas preferências
          de tema. Não usamos cookies de rastreamento publicitário de terceiros. Saiba mais na{" "}
          <Link to="/privacidade" hash="cookies" className="underline hover:text-foreground">
            Política de Privacidade
          </Link>
          .
        </p>
        <Button size="sm" onClick={accept} className="shrink-0">
          Entendi
        </Button>
      </div>
    </div>
  );
}
