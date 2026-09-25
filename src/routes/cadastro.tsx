import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { CheckCircle2, Camera, Trash2, CalendarIcon, Ruler, Weight } from "lucide-react";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { focusFirstError } from "@/components/auth/focus-first-error";
import { FormSection } from "@/components/auth/FormSection";
import { TermsConsent } from "@/components/auth/TermsConsent";
import { TERMOS_VERSAO_ATUAL } from "@/lib/legal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollPicker, range } from "@/components/ScrollPicker";
import {
  calcularIdade,
  formatarDataBR,
  fromISODate,
  toISODate,
  IDADE_MIN,
  IDADE_MAX,
} from "@/lib/date";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { traduzirErroAuth } from "@/lib/auth-errors";
import { z } from "zod";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Cadastro de atleta — Pelé Next Gen" },
      {
        name: "description",
        content: "Crie sua conta de atleta na Pelé Next Gen e participe das peneiras oficiais.",
      },
    ],
  }),
  component: CadastroPage,
});

const schema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  celular: z
    .string()
    .trim()
    .min(10, "Celular inválido")
    .max(20, "Celular inválido")
    .regex(/[\d\s()+\-]+/, "Use apenas números e (), +, -"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(72),
  dataNascimento: z
    .string()
    .min(1, "Selecione sua data de nascimento")
    .refine((v) => {
      const idade = calcularIdade(v);
      return idade >= IDADE_MIN && idade <= IDADE_MAX;
    }, `Idade deve estar entre ${IDADE_MIN} e ${IDADE_MAX} anos`),
  altura: z.coerce.number().min(120, "Altura em cm").max(230),
  peso: z.coerce.number().min(25, "Peso em kg").max(150),
  posicao: z.string().min(1, "Selecione a posição"),
  pe: z.enum(["Destro", "Canhoto", "Ambidestro"]),
});

const POSICOES = ["Goleiro", "Zagueiro", "Lateral", "Volante", "Meia", "Atacante"];

/** Ordem visual dos campos — usada para focar o primeiro erro. */
const ORDEM_CAMPOS = [
  "nome",
  "email",
  "celular",
  "senha",
  "dataNascimento",
  "altura",
  "peso",
  "posicao",
  "pe",
  "termos",
];

/** Estado de erro para gatilhos de Popover (botões outline) — só utilitários. */
const triggerErrorClass = "aria-[invalid=true]:border-error aria-[invalid=true]:text-error";

/**
 * Temporário: com `false`, o atleta é criado já confirmado pela edge function
 * `register-atleta` e NENHUM e-mail de confirmação é enviado (evita o
 * "email rate limit exceeded" do SMTP padrão do Supabase). Volte para `true`
 * quando houver SMTP próprio configurado.
 */
const CONFIRMAR_EMAIL_ATLETA = false;

/** Extrai a mensagem de erro do corpo da resposta de uma edge function. */
async function mensagemDaFunction(err: unknown): Promise<string> {
  const ctx = (err as { context?: Response }).context;
  if (ctx && typeof ctx.json === "function") {
    const body = await ctx.json().catch(() => null);
    if (body?.error) return traduzirErroAuth({ message: body.error, code: body.code });
  }
  return traduzirErroAuth(err as { message?: string });
}

const PES = ["Destro", "Canhoto", "Ambidestro"] as const;
type Pe = (typeof PES)[number];

function maskCelular(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function CadastroPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    celular: "",
    senha: "",
    dataNascimento: "",
    altura: "",
    peso: "",
    posicao: "",
    pe: "Destro" as Pe,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [aceitaTermos, setAceitaTermos] = useState(false);
  const [foto, setFoto] = useState<string>("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  function handleFotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setFoto(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  }

  function removerFoto() {
    setFoto("");
    setFotoFile(null);
    if (fotoInputRef.current) fotoInputRef.current.value = "";
  }

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as string]) setErrors((e) => ({ ...e, [key as string]: "" }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    // Evita dois signUp (e dois e-mails) num duplo clique.
    if (loading) return;
    const result = schema.safeParse(form);
    const fieldErrors: Record<string, string> = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        const k = issue.path[0] as string;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
    }
    if (!aceitaTermos) {
      fieldErrors.termos = "Você precisa aceitar os Termos de Uso e a Política de Privacidade.";
    }
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      toast.error("Verifique os campos do formulário.");
      focusFirstError(fieldErrors, ORDEM_CAMPOS);
      return;
    }
    setLoading(true);
    const metadata = {
      nome: form.nome,
      celular: form.celular,
      data_nascimento: form.dataNascimento,
      posicao: form.posicao,
      altura: form.altura,
      peso: form.peso,
      pe: form.pe,
      termos_aceitos_em: new Date().toISOString(),
      termos_versao: TERMOS_VERSAO_ATUAL,
    };

    let userId: string | undefined;
    if (CONFIRMAR_EMAIL_ATLETA) {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.senha,
        options: { emailRedirectTo: `${window.location.origin}/`, data: metadata },
      });
      if (error) {
        setLoading(false);
        toast.error(traduzirErroAuth(error));
        return;
      }
      userId = signUpData.user?.id;
    } else {
      // Conta criada já confirmada no servidor (nenhum e-mail enviado) e
      // login feito em seguida para o atleta cair direto no app.
      const { error: fnErr } = await supabase.functions.invoke("register-atleta", {
        body: { email: form.email, password: form.senha, metadata },
      });
      if (fnErr) {
        setLoading(false);
        toast.error(await mensagemDaFunction(fnErr));
        return;
      }
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.senha,
      });
      if (signInErr) {
        setLoading(false);
        toast.error(traduzirErroAuth(signInErr));
        navigate({ to: "/login" });
        return;
      }
      userId = signInData.user?.id;
    }

    // Upload da foto de perfil (se enviada e usuário já autenticado pós-signup)
    if (fotoFile && userId) {
      const ext = fotoFile.name.split(".").pop() ?? "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, fotoFile, { upsert: true, contentType: fotoFile.type });
      if (!upErr) {
        const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
        await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", userId);
      }
    }

    setLoading(false);
    toast.success("Cadastro concluído! Bem-vindo à Pelé Next Gen.");
    navigate({ to: "/manual" });
  }

  const temErros = Object.values(errors).some(Boolean);

  return (
    <AuthShell
      size="lg"
      backLabel="Voltar para login"
      eyebrow="Novo atleta"
      title="Crie sua conta de atleta"
      description="Preencha os dados abaixo. Eles serão usados pelos olheiros para acompanhar seu desempenho durante as peneiras."
    >
      <form onSubmit={submit} noValidate className="mt-2 space-y-8">
        {temErros && (
          <p
            role="alert"
            className="rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm font-medium text-error"
          >
            Há campos com erro. Corrija os itens destacados para continuar.
          </p>
        )}

        <section aria-labelledby="foto-titulo">
          <h2 id="foto-titulo" className="mb-4 font-display text-lg font-bold">
            Foto de perfil
          </h2>
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-bg2/40 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
            <AthleteAvatar
              src={foto}
              alt={foto ? "Pré-visualização da sua foto de perfil" : "Nenhuma foto enviada"}
              className="h-24 w-24 border-2 border-primary/40 shadow-card"
            />
            <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
              <p className="text-sm font-semibold">Adicione uma foto sua (opcional)</p>
              <p id="foto-dica" className="text-xs text-muted-foreground">
                Use uma foto recente, do rosto, em boa iluminação. PNG ou JPG até 5MB.
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-describedby="foto-dica"
                  onClick={() => fotoInputRef.current?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" aria-hidden="true" />
                  {foto ? "Trocar foto" : "Enviar foto"}
                </Button>
                {foto && (
                  <Button type="button" variant="ghost" size="sm" onClick={removerFoto}>
                    <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Remover
                  </Button>
                )}
              </div>
              <input
                ref={fotoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden"
                onChange={handleFotoChange}
              />
            </div>
          </div>
        </section>

        <FormSection title="Dados pessoais">
          <FormField
            label="Nome completo"
            name="nome"
            error={errors.nome}
            className="sm:col-span-2"
          >
            {(field) => (
              <Input
                {...field}
                value={form.nome}
                onChange={(e) => update("nome", e.target.value)}
                placeholder="Ex: João Pedro Silva"
                autoComplete="name"
              />
            )}
          </FormField>
          <FormField label="E-mail" name="email" error={errors.email}>
            {(field) => (
              <Input
                {...field}
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
              />
            )}
          </FormField>
          <FormField label="Celular (WhatsApp)" name="celular" error={errors.celular}>
            {(field) => (
              <Input
                {...field}
                type="tel"
                inputMode="tel"
                value={form.celular}
                onChange={(e) => update("celular", maskCelular(e.target.value))}
                placeholder="(11) 98765-4321"
                maxLength={20}
                autoComplete="tel"
              />
            )}
          </FormField>
          <FormField
            label="Senha"
            name="senha"
            error={errors.senha}
            hint="Mínimo de 6 caracteres."
            className="sm:col-span-2"
          >
            {(field) => (
              <PasswordInput
                {...field}
                value={form.senha}
                onChange={(e) => update("senha", e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            )}
          </FormField>
        </FormSection>

        <FormSection title="Perfil esportivo">
          <FormField label="Data de nascimento" name="dataNascimento" error={errors.dataNascimento}>
            {(field) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    {...field}
                    type="button"
                    variant="outline"
                    aria-label={`Data de nascimento: ${
                      form.dataNascimento ? formatarDataBR(form.dataNascimento) : "não selecionada"
                    }`}
                    className={cn(
                      "w-full min-w-0 justify-start text-left font-normal",
                      !form.dataNascimento && "text-muted-foreground",
                      triggerErrorClass,
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                    {form.dataNascimento ? (
                      <span className="truncate">
                        {formatarDataBR(form.dataNascimento)}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({calcularIdade(form.dataNascimento)} anos)
                        </span>
                      </span>
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.dataNascimento ? fromISODate(form.dataNascimento) : undefined}
                    onSelect={(d) => d && update("dataNascimento", toISODate(d))}
                    captionLayout="dropdown"
                    fromYear={new Date().getFullYear() - IDADE_MAX}
                    toYear={new Date().getFullYear() - IDADE_MIN}
                    defaultMonth={
                      form.dataNascimento
                        ? fromISODate(form.dataNascimento)
                        : new Date(new Date().getFullYear() - 16, 0, 1)
                    }
                    disabled={(date) => {
                      const idade = calcularIdade(date);
                      return idade < IDADE_MIN || idade > IDADE_MAX;
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            )}
          </FormField>

          <FormField label="Altura (cm)" name="altura" error={errors.altura}>
            {(field) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    {...field}
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.altura && "text-muted-foreground",
                      triggerErrorClass,
                    )}
                    aria-label={`Altura em centímetros: ${form.altura ? `${form.altura} cm` : "não selecionada"}`}
                  >
                    <Ruler className="mr-2 h-4 w-4" aria-hidden="true" />
                    {form.altura ? `${form.altura} cm` : <span>Selecione a altura</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3" align="start">
                  <ScrollPicker
                    values={range(120, 230)}
                    value={form.altura ? Number(form.altura) : 175}
                    onChange={(v) => update("altura", String(v))}
                    ariaLabel="Altura em centímetros"
                    format={(v) => `${v} cm`}
                  />
                </PopoverContent>
              </Popover>
            )}
          </FormField>

          <FormField label="Peso (kg)" name="peso" error={errors.peso}>
            {(field) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    {...field}
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.peso && "text-muted-foreground",
                      triggerErrorClass,
                    )}
                    aria-label={`Peso em quilogramas: ${form.peso ? `${form.peso} kg` : "não selecionado"}`}
                  >
                    <Weight className="mr-2 h-4 w-4" aria-hidden="true" />
                    {form.peso ? `${form.peso} kg` : <span>Selecione o peso</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3" align="start">
                  <ScrollPicker
                    values={range(25, 150)}
                    value={form.peso ? Number(form.peso) : 70}
                    onChange={(v) => update("peso", String(v))}
                    ariaLabel="Peso em quilogramas"
                    format={(v) => `${v} kg`}
                  />
                </PopoverContent>
              </Popover>
            )}
          </FormField>

          <FormField label="Posição" name="posicao" error={errors.posicao}>
            {(field) => (
              <Select value={form.posicao} onValueChange={(v) => update("posicao", v)}>
                <SelectTrigger {...field}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {POSICOES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          {/* Grupo de rádios: fieldset + legend em vez de label/htmlFor. */}
          <fieldset
            className="min-w-0 space-y-1.5 sm:col-span-2"
            aria-describedby={errors.pe ? "campo-pe-erro" : undefined}
          >
            <legend className={cn("mb-1.5 text-sm font-semibold", errors.pe && "text-error")}>
              Pé preferencial
            </legend>
            <RadioGroup
              id="campo-pe"
              value={form.pe}
              onValueChange={(v) => update("pe", v as Pe)}
              aria-invalid={errors.pe ? true : undefined}
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              {PES.map((opt) => (
                <label
                  key={opt}
                  htmlFor={`pe-${opt}`}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring active:scale-[0.99]",
                    form.pe === opt
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-bg2 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  <RadioGroupItem value={opt} id={`pe-${opt}`} />
                  <span className="font-semibold">{opt}</span>
                </label>
              ))}
            </RadioGroup>
            {errors.pe && (
              <p id="campo-pe-erro" className="text-xs font-medium text-error">
                {errors.pe}
              </p>
            )}
          </fieldset>
        </FormSection>

        <TermsConsent
          checked={aceitaTermos}
          onCheckedChange={(v) => {
            setAceitaTermos(v);
            if (v && errors.termos) setErrors((e) => ({ ...e, termos: "" }));
          }}
          error={errors.termos}
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link to="/login">Cancelar</Link>
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            aria-busy={loading}
            variant={temErros ? "error" : "default"}
          >
            {loading ? (
              "Criando conta..."
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" aria-hidden="true" />
                {temErros ? "Preencha os campos obrigatórios" : "Criar conta de atleta"}
              </>
            )}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
