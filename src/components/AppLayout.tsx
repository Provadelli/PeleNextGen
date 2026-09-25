import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Trophy,
  Users,
  ClipboardCheck,
  BookOpen,
  LogOut,
  Menu,
  MessageCircle,
  X,
  PlusCircle,
  Building2,
  UserCog,
  ShieldCheck,
  LineChart,
  BarChart3,
  GitCompareArrows,
} from "lucide-react";
import { Logo } from "./Logo";
import { NotificationsBell } from "./NotificationsBell";
import { ThemeToggle } from "./ThemeToggle";
import { AthleteAvatar } from "./AthleteAvatar";

import { useSession, clearSession, type Role } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "suporte"] },
  {
    to: "/peneiras",
    label: "Peneiras",
    icon: Trophy,
    roles: ["admin", "atleta", "clube", "suporte"],
  },
  { to: "/peneiras/criar", label: "Criar peneira", icon: PlusCircle, roles: ["admin", "clube"] },
  { to: "/candidatos", label: "Candidatos", icon: Users, roles: ["admin", "suporte"] },
  { to: "/avaliacoes", label: "Avaliações ao vivo", icon: ClipboardCheck, roles: ["admin"] },
  { to: "/chat", label: "Mensagens", icon: MessageCircle, roles: ["admin", "atleta", "clube"] },
  { to: "/suporte", label: "Suporte / Acessos", icon: ShieldCheck, roles: ["suporte"] },
  { to: "/clubes", label: "Atletas aprovados", icon: Building2, roles: ["clube"] },
  {
    to: "/comparador",
    label: "Comparador",
    icon: GitCompareArrows,
    roles: ["clube", "admin", "suporte"],
  },
  {
    to: "/ranking",
    label: "Ranking",
    icon: BarChart3,
    roles: ["admin", "atleta", "clube", "suporte"],
  },
  { to: "/manual", label: "Manual do Atleta", icon: BookOpen, roles: ["atleta"] },
  { to: "/perfil-atleta", label: "Meu perfil de atleta", icon: UserCog, roles: ["atleta"] },
  {
    to: "/perfil-olheiro",
    label: "Meu perfil de olheiro",
    icon: ShieldCheck,
    roles: ["admin", "suporte"],
  },
  { to: "/desempenho", label: "Desempenho", icon: LineChart, roles: ["atleta"] },
  {
    to: "/perfil",
    label: "Configurações da conta",
    icon: UserCog,
    roles: ["admin", "clube", "suporte"],
  },
];

const ROLE_LABEL: Record<Role, string> = {
  admin: "Olheiro / Admin",
  atleta: "Atleta",
  clube: "Clube",
  suporte: "Suporte",
};

const ROLE_AREA: Record<Role, string> = {
  admin: "Painel administrativo",
  atleta: "Área do atleta",
  clube: "Área do clube",
  suporte: "Painel de suporte",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const role: Role | null = user?.role ?? null;
  const items = role ? NAV.filter((i) => i.roles.includes(role)) : [];

  const activeTo = items
    .filter((i) => location.pathname === i.to || location.pathname.startsWith(i.to + "/"))
    .sort((a, b) => b.to.length - a.to.length)[0]?.to;

  const handleLogout = async () => {
    await clearSession();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-bg2/90 px-4 backdrop-blur [view-transition-name:app-topbar] lg:hidden">
        <Link
          to="/"
          aria-label="Ir para a página inicial"
          className="transition-opacity hover:opacity-80"
        >
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && <NotificationsBell />}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-sidebar-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="app-sidebar"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-72 max-w-[85vw] flex-col border-r border-border bg-sidebar transition-transform [view-transition-name:app-sidebar] lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="hidden h-28 items-center border-b border-border px-6 lg:flex">
          <Link
            to="/"
            aria-label="Ir para a página inicial"
            className="transition-opacity hover:opacity-80"
          >
            <Logo />
          </Link>
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 pt-20 lg:pt-4">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {role ? ROLE_AREA[role] : "\u00A0"}
          </p>
          <nav className="space-y-1" aria-label="Navegação principal" aria-busy={!ready}>
            {!ready ? (
              <div className="space-y-1.5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-xl bg-sidebar-accent/40" />
                ))}
              </div>
            ) : (
              items.map((item) => {
                const Icon = item.icon;
                const active = item.to === activeTo;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
                      active
                        ? "bg-gradient-to-r from-primary/25 to-primary/5 text-primary shadow-[inset_3px_0_0_0_var(--gold)] ring-1 ring-primary/20"
                        : "text-foreground/80 hover:translate-x-0.5 hover:bg-sidebar-accent hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        active ? "text-primary" : "text-foreground/60 group-hover:text-foreground",
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })
            )}
          </nav>
        </div>

        <div className="border-t border-border p-4">
          {user && (
            <Link
              to="/perfil"
              onClick={() => setOpen(false)}
              className="mb-3 flex items-center gap-3 rounded-xl bg-bg3 p-3 transition-colors hover:bg-sidebar-accent"
            >
              <AthleteAvatar
                src={user.avatarUrl ?? undefined}
                alt={user.nome}
                className="h-10 w-10 shrink-0 border border-primary/30"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user.nome}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {role ? ROLE_LABEL[role] : ""}
                </p>
              </div>
            </Link>
          )}
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 cursor-default bg-background/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Content */}
      <main className="flex-1 lg:pl-72">
        {user && (
          <div className="hidden justify-end gap-2 px-4 pt-6 sm:px-6 lg:flex lg:px-10">
            <ThemeToggle />
            <NotificationsBell />
          </div>
        )}

        {/* Troca de página: menu e topo ficam parados; só este bloco faz a transição
            (view transition "app-content" em styles.css; page-enter é o fallback). */}
        <div
          key={location.pathname}
          className="page-enter app-reveal px-4 pb-12 pt-20 [view-transition-name:app-content] sm:px-6 lg:px-10 lg:pt-4"
        >
          {children}
        </div>
      </main>
    </div>
  );
}
