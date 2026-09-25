import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Building2, Mail, Lock, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthSuccess } from "@/components/auth/AuthSuccess";
import { ApprovalNotice } from "@/components/auth/ApprovalNotice";
import { FormField } from "@/components/auth/FormField";
import { focusFirstError } from "@/components/auth/focus-first-error";
import { TermsConsent } from "@/components/auth/TermsConsent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { TERMOS_VERSAO_ATUAL } from "@/lib/legal";

export const Route = createFileRoute("/registro-clube")({
  head: () => ({
    meta: [
      { title: "Cadastro de Clube — Pelé Next Gen" },
      {
        name: "description",
        content: "Cadastre seu clube na plataforma Pelé Next Gen.",
      },
    ],
  }),
  component: CadastroClubePage,
});

const schema = z
  .object({
    nomeClube: z.string().trim().min(2, "Informe o nome do clube").max(100),
    cnpj: z.string().trim().min(11, "CNPJ/identificação inválido").max(20),
    nome: z.string().trim().min(3, "Informe o nome do responsável").max(100),
    email: z.string().trim().email("E-mail inválido").max(255),
    senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(72),
    confirmarSenha: z.string(),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

/** Ordem visual dos campos — usada para focar o primeiro erro. */
const ORDEM_CAMPOS = ["nomeClube", "cnpj", "nome", "email", "senha", "confirmarSenha", "termos"];

function maskCNPJ(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function CadastroClubePage() {
  const [form, setForm] = useState({
    nomeClube: "",
    cnpj: "",
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [aceitaTermos, setAceitaTermos] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    const result = schema.safeParse(form);
    const fieldErrors: Record<string, string> = {};
    if (!result.success) {
      result.error.errors.forEach((err) => {
        const key = err.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
    }
    if (!aceitaTermos) {
      fieldErrors.termos = "Você precisa aceitar os Termos de Uso e a Política de Privacidade.";
    }
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      toast.error("Corrija os campos destacados.");
      focusFirstError(fieldErrors, ORDEM_CAMPOS);
      return;
    }

    setLoading(true);

    const body = new FormData();
    body.set("kind", "clube");
    body.set("email", form.email);
    body.set("password", form.senha);
    body.set(
      "metadata",
      JSON.stringify({
        nome: form.nome,
        nome_clube: form.nomeClube,
        cnpj: form.cnpj,
        termos_aceitos_em: new Date().toISOString(),
        termos_versao: TERMOS_VERSAO_ATUAL,
      }),
    );

    const { error } = await supabase.functions.invoke("register-pending-user", { body });

    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Falha ao enviar o cadastro.");
      return;
    }

    setSuccess(true);
  }

  if (success) return <AuthSuccess />;

  const temErros = Object.values(errors).some(Boolean);

  return (
    <AuthShell
      icon={Building2}
      title="Cadastro de Clube"
      description="Preencha os dados para solicitar acesso como clube."
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormField label="Nome do clube" name="nomeClube" icon={Building2} error={errors.nomeClube}>
          {(field) => (
            <Input
              {...field}
              value={form.nomeClube}
              onChange={(e) => update("nomeClube", e.target.value)}
              placeholder="Ex: FC Estrela do Sul"
              autoComplete="organization"
            />
          )}
        </FormField>

        <FormField label="CNPJ ou identificação" name="cnpj" icon={FileText} error={errors.cnpj}>
          {(field) => (
            <Input
              {...field}
              inputMode="numeric"
              value={form.cnpj}
              onChange={(e) => update("cnpj", maskCNPJ(e.target.value))}
              placeholder="00.000.000/0000-00"
            />
          )}
        </FormField>

        <FormField label="Nome do responsável" name="nome" icon={User} error={errors.nome}>
          {(field) => (
            <Input
              {...field}
              value={form.nome}
              onChange={(e) => update("nome", e.target.value)}
              placeholder="Nome completo do responsável"
              autoComplete="name"
            />
          )}
        </FormField>

        <FormField label="E-mail" name="email" icon={Mail} error={errors.email}>
          {(field) => (
            <Input
              {...field}
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="contato@seuclube.com"
              autoComplete="email"
            />
          )}
        </FormField>

        <FormField
          label="Senha"
          name="senha"
          icon={Lock}
          error={errors.senha}
          hint="Mínimo de 6 caracteres."
        >
          {(field) => (
            <PasswordInput
              {...field}
              value={form.senha}
              onChange={(e) => update("senha", e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          )}
        </FormField>

        <FormField
          label="Confirmar senha"
          name="confirmarSenha"
          icon={Lock}
          error={errors.confirmarSenha}
        >
          {(field) => (
            <PasswordInput
              {...field}
              value={form.confirmarSenha}
              onChange={(e) => update("confirmarSenha", e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          )}
        </FormField>

        <ApprovalNotice />

        <TermsConsent
          checked={aceitaTermos}
          onCheckedChange={(v) => {
            setAceitaTermos(v);
            if (v && errors.termos) setErrors((e) => ({ ...e, termos: "" }));
          }}
          error={errors.termos}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading}
          aria-busy={loading}
          variant={temErros ? "error" : "default"}
        >
          {loading ? "Enviando..." : "Solicitar cadastro"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        É um atleta?{" "}
        <Link
          to="/cadastro"
          className="rounded-sm font-semibold text-primary transition-colors hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Cadastre-se aqui
        </Link>
      </p>
    </AuthShell>
  );
}
