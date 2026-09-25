import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Shield, Mail, Lock, User, Phone, Calendar, Building2, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthSuccess } from "@/components/auth/AuthSuccess";
import { ApprovalNotice } from "@/components/auth/ApprovalNotice";
import { FileField } from "@/components/auth/FileField";
import { FormField } from "@/components/auth/FormField";
import { focusFirstError } from "@/components/auth/focus-first-error";
import { TermsConsent } from "@/components/auth/TermsConsent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { TERMOS_VERSAO_ATUAL } from "@/lib/legal";

export const Route = createFileRoute("/registro-admin")({
  head: () => ({
    meta: [
      { title: "Cadastro de Administrador — Pelé Next Gen" },
      {
        name: "description",
        content: "Crie sua conta de administrador na plataforma Pelé Next Gen.",
      },
    ],
  }),
  component: CadastroAdminPage,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileSchema = z
  .instanceof(File, { message: "Envie uma imagem" })
  .refine((f) => f.size <= MAX_FILE_SIZE, "Imagem deve ter no máximo 5 MB")
  .refine((f) => ALLOWED_MIME.includes(f.type), "Formato inválido (use JPG, PNG ou WEBP)");

const schema = z
  .object({
    nome: z.string().trim().min(3, "Informe seu nome completo").max(100),
    email: z.string().trim().email("E-mail inválido").max(255),
    celular: z
      .string()
      .trim()
      .min(10, "Celular inválido")
      .max(20)
      .regex(/^[0-9()\-\s+]+$/, "Use apenas números e símbolos de telefone"),
    idade: z
      .number({ invalid_type_error: "Informe a idade" })
      .int()
      .min(18, "Idade mínima 18 anos")
      .max(99, "Idade máxima 99 anos"),
    clubeAtual: z.string().trim().min(2, "Informe o clube").max(120),
    senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(72),
    confirmarSenha: z.string(),
    rgFrente: fileSchema,
    rgVerso: fileSchema,
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

/** Ordem visual dos campos — usada para focar o primeiro erro. */
const ORDEM_CAMPOS = [
  "nome",
  "email",
  "celular",
  "idade",
  "clubeAtual",
  "senha",
  "confirmarSenha",
  "rgFrente",
  "rgVerso",
  "termos",
];

function CadastroAdminPage() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    celular: "",
    idade: "",
    clubeAtual: "",
    senha: "",
    confirmarSenha: "",
  });
  const [rgFrente, setRgFrente] = useState<File | null>(null);
  const [rgVerso, setRgVerso] = useState<File | null>(null);
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
    const result = schema.safeParse({
      ...form,
      idade: form.idade ? Number(form.idade) : Number.NaN,
      rgFrente,
      rgVerso,
    });
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
    body.set("kind", "admin");
    body.set("email", form.email);
    body.set("password", form.senha);
    body.set(
      "metadata",
      JSON.stringify({
        nome: form.nome,
        termos_aceitos_em: new Date().toISOString(),
        termos_versao: TERMOS_VERSAO_ATUAL,
      }),
    );
    body.set("celular", form.celular);
    body.set("idade", form.idade);
    body.set("clubeAtual", form.clubeAtual);
    body.set("rgFrente", rgFrente!);
    body.set("rgVerso", rgVerso!);

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
      icon={Shield}
      title="Cadastro de Administrador"
      description="Preencha os dados para solicitar acesso administrativo."
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormField label="Nome completo" name="nome" icon={User} error={errors.nome}>
          {(field) => (
            <Input
              {...field}
              value={form.nome}
              onChange={(e) => update("nome", e.target.value)}
              placeholder="Seu nome completo"
              autoComplete="name"
            />
          )}
        </FormField>

        <FormField label="E-mail institucional" name="email" icon={Mail} error={errors.email}>
          {(field) => (
            <Input
              {...field}
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="admin@pelenextgen.com"
              autoComplete="email"
            />
          )}
        </FormField>

        <FormField label="Celular" name="celular" icon={Phone} error={errors.celular}>
          {(field) => (
            <Input
              {...field}
              type="tel"
              inputMode="tel"
              value={form.celular}
              onChange={(e) => update("celular", e.target.value)}
              placeholder="(11) 99999-9999"
              autoComplete="tel"
            />
          )}
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <FormField label="Idade" name="idade" icon={Calendar} error={errors.idade}>
            {(field) => (
              <Input
                {...field}
                type="number"
                inputMode="numeric"
                min={18}
                max={99}
                value={form.idade}
                onChange={(e) => update("idade", e.target.value)}
                placeholder="30"
              />
            )}
          </FormField>

          <FormField label="Clube" name="clubeAtual" icon={Building2} error={errors.clubeAtual}>
            {(field) => (
              <Input
                {...field}
                value={form.clubeAtual}
                onChange={(e) => update("clubeAtual", e.target.value)}
                placeholder="Clube atual/anterior"
              />
            )}
          </FormField>
        </div>

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

        <section
          aria-labelledby="rg-titulo"
          className="space-y-3 rounded-xl border border-border bg-card/40 p-3"
        >
          <h2
            id="rg-titulo"
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <IdCard className="h-4 w-4 text-primary" aria-hidden="true" />
            Documento de identidade (RG)
          </h2>
          <p className="-mt-1 text-xs text-muted-foreground">
            Envie fotos legíveis da frente e do verso. JPG, PNG ou WEBP até 5 MB.
          </p>
          <FileField
            label="RG — Frente"
            previewAlt="Foto enviada da frente do RG"
            name="rgFrente"
            file={rgFrente}
            onChange={(f) => {
              setRgFrente(f);
              setErrors((e) => ({ ...e, rgFrente: "" }));
            }}
            error={errors.rgFrente}
          />
          <FileField
            label="RG — Verso"
            previewAlt="Foto enviada do verso do RG"
            name="rgVerso"
            file={rgVerso}
            onChange={(f) => {
              setRgVerso(f);
              setErrors((e) => ({ ...e, rgVerso: "" }));
            }}
            error={errors.rgVerso}
          />
        </section>

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
