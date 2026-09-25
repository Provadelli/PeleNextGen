import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { forwardRef, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Mail, Lock, Shield, User, Building2, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { HeroFade } from "@/components/ui/minimalist-hero";
import { ThemeToggle } from "@/components/ThemeToggle";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { BackLink } from "@/components/auth/BackLink";
import { AuthHeader } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { focusFirstError } from "@/components/auth/focus-first-error";
import { type Role } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { traduzirErroAuth } from "@/lib/auth-errors";
import { useTTS } from "@/hooks/use-tts";

const PAGE_NARRATION =
  "Bem-vindo de volta à Pelé Next Gen. Entre na sua conta para continuar. " +
  "Selecione o tipo de conta: atleta, clube ou administrador. " +
  "Em seguida, informe seu e-mail e sua senha nos campos correspondentes e clique no botão Entrar. " +
  "Você também pode entrar com sua conta Google clicando no botão Entrar com Google. " +
  "Se ainda não tem conta, é possível se cadastrar como atleta, como clube ou como administrador " +
  "pelos links no final da página.";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search.redirect === "string" && search.redirect.startsWith("/")
      ? { redirect: search.redirect }
      : {},
  head: () => ({
    meta: [
      { title: "Entrar — Pelé Next Gen" },
      { name: "description", content: "Acesse sua conta na Pelé Next Gen." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  /** Vai para o destino pretendido (se houver) ou para a área do papel. */
  function goTo(dest: string) {
    navigate({ href: redirect ?? dest });
  }

  const [role, setRole] = useState<Role>("atleta");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { speak, stop, isSpeaking, isLoading: ttsLoading } = useTTS();
  const roleRefs = useRef<Partial<Record<Role, HTMLButtonElement | null>>>({});

  function toggleNarration() {
    if (isSpeaking || ttsLoading) {
      stop();
    } else {
      void speak(PAGE_NARRATION);
    }
  }

  /** Setas movem a seleção dentro do radiogroup de tipo de conta (padrão WAI-ARIA). */
  function onRoleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const delta =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (!delta) return;
    e.preventDefault();
    const idx = ROLE_ORDER.indexOf(role);
    const next = ROLE_ORDER[(idx + delta + ROLE_ORDER.length) % ROLE_ORDER.length];
    setRole(next);
    roleRefs.current[next]?.focus();
  }

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!active || !data.user) return;
      // Após um redirect de OAuth (ex.: Google), o papel selecionado antes de
      // sair da página fica salvo aqui — a sessionStorage sobrevive ao reload.
      const oauthRole = sessionStorage.getItem("png-oauth-role") as Role | null;
      sessionStorage.removeItem("png-oauth-role");
      const dest = await destinationFor(data.user.id, oauthRole ?? undefined);
      if (!active) return;
      if (!dest) {
        await supabase.auth.signOut();
        return;
      }
      goTo(dest);
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  /**
   * Retorna a rota de destino conforme o papel selecionado e os papéis reais do usuário.
   * Retorna `null` quando o login deve ser bloqueado (papel incompatível ou
   * cadastro de admin pendente/rejeitado). Quando `selectedRole` é omitido,
   * usa a sessão existente para redirecionar (auto-login na montagem).
   */
  async function destinationFor(userId: string, selectedRole?: Role): Promise<string | null> {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const roles = new Set((data ?? []).map((r) => r.role));
    const isSuporte = roles.has("suporte");
    const isAdmin = roles.has("admin");
    const isClube = roles.has("clube");

    // Sem papel selecionado (auto-login): manda para a área de maior privilégio.
    if (!selectedRole) {
      if (isSuporte) return "/suporte";
      if (isAdmin) return "/dashboard";
      if (isClube) return "/clubes";
      return "/peneiras";
    }

    if (selectedRole === "admin") {
      if (isSuporte) return "/suporte";
      if (isAdmin) return "/dashboard";
      // Verifica solicitação para mensagem adequada.
      const { data: req } = await supabase
        .from("admin_requests")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();
      if (req?.status === "pending") {
        toast.error("Seu cadastro de administrador ainda aguarda aprovação.");
      } else if (req?.status === "rejected") {
        toast.error("Seu cadastro de administrador foi rejeitado.");
      } else {
        toast.error("Esta conta não tem acesso de administrador.");
      }
      return null;
    }

    if (selectedRole === "clube") {
      if (isClube) return "/clubes";
      const { data: req } = await supabase
        .from("clube_requests")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();
      if (req?.status === "pending") {
        toast.error("Seu cadastro de clube ainda aguarda aprovação.");
      } else if (req?.status === "rejected") {
        toast.error("Seu cadastro de clube foi rejeitado.");
      } else {
        toast.error("Esta conta não está cadastrada como clube.");
      }
      return null;
    }

    // selectedRole === "atleta"
    if (isAdmin || isClube || isSuporte) {
      toast.error("Esta conta não é de atleta. Selecione o tipo correto.");
      return null;
    }
    return "/peneiras";
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const fieldErrors: Record<string, string> = {};
    if (!email.trim()) fieldErrors.email = "Informe seu e-mail.";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) fieldErrors.email = "E-mail inválido.";
    if (!senha) fieldErrors.senha = "Informe sua senha.";
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) {
      focusFirstError(fieldErrors, ["email", "senha"]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    setLoading(false);
    if (error || !data.user) {
      const msg = traduzirErroAuth(error, "E-mail ou senha incorretos.");
      setErrors({ senha: msg });
      toast.error(msg);
      focusFirstError({ senha: msg }, ["senha"]);
      return;
    }
    const dest = await destinationFor(data.user.id, role);
    if (!dest) {
      await supabase.auth.signOut();
      return;
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem("png-selected-role", role);
    }
    toast.success("Bem-vindo!");
    goTo(dest);
  }

  async function loginWithGoogle() {
    setLoading(true);
    // Salva o papel selecionado para recuperá-lo depois do redirect de volta do Google.
    sessionStorage.setItem("png-oauth-role", role);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      sessionStorage.removeItem("png-oauth-role");
      setLoading(false);
      toast.error("Falha ao entrar com Google.");
      return;
    }
    // Sucesso: o navegador está sendo redirecionado para o Google agora.
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1400&q=80"
          alt=""
          className="hero-anim-bg h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.13 0.02 75 / 0.92) 0%, oklch(0.19 0.03 80 / 0.78) 45%, oklch(0.16 0.05 258 / 0.55) 100%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <HeroFade from="left" delay={0.3}>
            <Link to="/" aria-label="Ir para a página inicial" className={logoLinkClass}>
              <Logo />
            </Link>
          </HeroFade>
          <div>
            {/* Mesma sequência do MinimalistHero: faixa dourada cresce → título sobe → texto. */}
            <div
              aria-hidden="true"
              className="hero-anim-circle mb-6 h-1 w-24 origin-left rounded-full bg-primary"
            />
            <p
              style={{ animationDelay: "0.6s" }}
              className="hero-anim-rise max-w-md font-display text-4xl font-extrabold leading-tight"
            >
              A nova geração do <span className="text-gradient-gold">futebol</span> começa aqui!
            </p>
            <p
              style={{ animationDelay: "1.1s" }}
              className="hero-anim-fade-up mt-4 max-w-md text-muted-foreground"
            >
              Entre na plataforma para gerenciar peneiras, candidatos e avaliações em tempo real.
            </p>
          </div>
        </div>
      </div>

      <main
        id="conteudo"
        className="flex min-w-0 items-center justify-center px-4 py-8 sm:px-6 sm:py-12"
      >
        <HeroFade delay={0.2} className="w-full min-w-0 max-w-md">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <BackLink to="/">Voltar ao início</BackLink>
            <div className="flex items-center gap-2">
              <ThemeToggle />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleNarration}
                aria-label={isSpeaking ? "Parar leitura da página" : "Ouvir conteúdo da página"}
                aria-pressed={isSpeaking}
                disabled={ttsLoading}
              >
                {ttsLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isSpeaking ? (
                  <VolumeX className="mr-2 h-4 w-4" />
                ) : (
                  <Volume2 className="mr-2 h-4 w-4" />
                )}
                {isSpeaking ? "Parar" : "Ouvir página"}
              </Button>
            </div>
          </div>

          <div role="status" aria-live="polite" className="sr-only">
            {ttsLoading
              ? "Carregando leitura da página."
              : isSpeaking
                ? "Lendo página em voz alta."
                : ""}
          </div>

          <div className="mb-8 lg:hidden">
            <Link to="/" aria-label="Ir para a página inicial" className={logoLinkClass}>
              <Logo />
            </Link>
          </div>

          <AuthHeader title="Bem-vindo de volta" description="Entre na sua conta para continuar." />

          <div
            role="radiogroup"
            aria-label="Tipo de conta"
            className="relative grid grid-cols-3 gap-2 rounded-xl border border-border bg-bg2 p-1"
          >
            {/* Pílula dourada que desliza até o tipo de conta escolhido. */}
            <span
              aria-hidden="true"
              className="absolute inset-y-1 left-1 rounded-lg bg-primary shadow transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{
                width: "calc((100% - 1.5rem) / 3)",
                transform: `translateX(calc(${ROLE_ORDER.indexOf(role)} * (100% + 0.5rem)))`,
              }}
            />
            {ROLE_ORDER.map((r) => (
              <RoleButton
                key={r}
                ref={(el) => {
                  roleRefs.current[r] = el;
                }}
                active={role === r}
                onClick={() => setRole(r)}
                onKeyDown={onRoleKeyDown}
                icon={ROLE_META[r]?.icon}
                label={ROLE_META[r]?.label ?? r}
              />
            ))}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Use suas credenciais — o tipo de conta é detectado automaticamente.
          </p>

          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            <FormField label="E-mail" name="email" icon={Mail} error={errors.email}>
              {(field) => (
                <Input
                  {...field}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((er) => ({ ...er, email: "" }));
                  }}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  disabled={loading}
                />
              )}
            </FormField>

            <FormField label="Senha" name="senha" icon={Lock} error={errors.senha}>
              {(field) => (
                <PasswordInput
                  {...field}
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    if (errors.senha) setErrors((er) => ({ ...er, senha: "" }));
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                />
              )}
            </FormField>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div
            aria-hidden="true"
            className="my-4 flex items-center gap-3 text-xs text-muted-foreground"
          >
            <div className="h-px flex-1 bg-border" />
            ou
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            onClick={loginWithGoogle}
            disabled={loading}
          >
            {/* Cores oficiais da marca Google — exceção documentada em docs/design-system.md. */}
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Entrar com Google
          </Button>

          <nav aria-labelledby="cadastro-titulo" className="mt-6">
            <h2
              id="cadastro-titulo"
              className="text-center text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground"
            >
              Ainda não tem conta? Escolha como cadastrar
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
              {SIGNUP_LINKS.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex h-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-center transition-all hover:-translate-y-0.5 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0 active:scale-[0.98] min-[420px]:flex-col min-[420px]:gap-1.5 min-[420px]:px-2"
                  >
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="text-xs font-semibold leading-tight">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="mt-4 text-center text-sm font-medium text-foreground">
            Ao continuar, você concorda com os{" "}
            <Link
              to="/termos"
              target="_blank"
              rel="noopener noreferrer"
              className={inlineLinkClass}
            >
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link
              to="/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className={inlineLinkClass}
            >
              Política de Privacidade
            </Link>
            <span className="sr-only"> (abrem em nova aba)</span>.
          </p>
        </HeroFade>
      </main>
    </div>
  );
}

const ROLE_ORDER: Role[] = ["atleta", "clube", "admin"];

const ROLE_META: Partial<Record<Role, { label: string; icon: React.ReactNode }>> = {
  atleta: { label: "Atleta", icon: <User className="h-4 w-4" /> },
  clube: { label: "Clube", icon: <Building2 className="h-4 w-4" /> },
  admin: { label: "Admin", icon: <Shield className="h-4 w-4" /> },
};

const SIGNUP_LINKS = [
  { to: "/cadastro", label: "Sou atleta", icon: User },
  { to: "/registro-admin", label: "Sou olheiro/admin", icon: Shield },
  { to: "/registro-clube", label: "Sou um clube", icon: Building2 },
] as const;

const logoLinkClass =
  "inline-block w-fit rounded-md transition-opacity hover:opacity-80 active:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const inlineLinkClass =
  "rounded-sm font-semibold text-primary underline transition-colors hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const RoleButton = forwardRef<
  HTMLButtonElement,
  {
    active: boolean;
    onClick: () => void;
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
    icon: React.ReactNode;
    label: string;
  }
>(function RoleButton({ active, onClick, onKeyDown, icon, label }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={
        "relative z-10 flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-1 py-2.5 text-xs font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] sm:gap-2 sm:px-2 sm:text-sm " +
        (active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")
      }
    >
      {/* O ícone "salta" quando o tipo de conta fica ativo (key força a animação). */}
      <span
        key={active ? "on" : "off"}
        aria-hidden="true"
        className={"hidden min-[360px]:inline " + (active ? "hero-anim-pop" : "")}
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
});
