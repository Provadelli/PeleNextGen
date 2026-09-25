# Design System — Fluxos de entrada (Sprint 3)

Componentes e padrões usados nos fluxos de **login**, **cadastro de atleta** e
**solicitação de acesso (clube/admin)**. Regra da casa: **só classes utilitárias do
Tailwind e tokens do tema** (`src/styles.css`) — nada de cor hex solta nem CSS novo.

---

## 1. Tokens usados

| Uso | Classe / token | Onde está definido |
| --- | --- | --- |
| Fundo da página | `bg-background` | `@theme inline` → `--color-background` |
| Superfície (card) | `bg-card`, `bg-bg2`, `bg-bg3` | `--color-card`, `--color-bg2`, `--color-bg3` |
| Texto | `text-foreground`, `text-muted-foreground` | `--color-foreground`, `--color-muted-foreground` |
| Marca (dourado) | `bg-primary`, `text-primary`, `hover:text-gold-light` | `--color-primary`, `--color-gold-light` |
| Borda | `border-border`, `border-input` | `--color-border`, `--color-input` |
| Anel de foco | `ring-ring` | `--color-ring` |
| Erro | `text-error`, `border-error`, `bg-error/10` | `--color-error` |
| Sucesso | `text-success`, `bg-success/15` | `--color-success` |
| Tipografia de título | `font-display` | `--font-display` |
| Sombra de card | `shadow-card` | `@utility shadow-card` |

---

## 2. Padrão de estados

Todo elemento interativo dos fluxos segue a mesma receita:

| Estado | Classes | Observação |
| --- | --- | --- |
| **hover** | `hover:text-foreground`, `hover:border-primary`, `hover:border-foreground/30` (inputs) | Nunca é o único indicativo — sempre há foco equivalente. |
| **active** | `active:scale-[0.98]` (botões/cards), `active:opacity-70` (links) | Feedback de toque no mobile. |
| **focus-visible** | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` (+ `ring-offset-2 ring-offset-background` em cards) | Só aparece com teclado; nunca remover sem substituto. |
| **disabled** | `disabled:pointer-events-none disabled:opacity-50` (Button), `disabled:cursor-not-allowed disabled:opacity-50` (Input/Select) | Durante envio os campos e botões ficam `disabled`, e o submit ganha `aria-busy`. |
| **error** | `aria-[invalid=true]:border-error aria-[invalid=true]:focus-visible:ring-error/40` | Aplicado **automaticamente** pelo `Input`, `PasswordInput`, `SelectTrigger` e `Checkbox` quando recebem `aria-invalid`. |

### Erro em campo — contrato de acessibilidade

```
<label for="campo-email">E-mail</label>
<input id="campo-email" aria-invalid="true" aria-describedby="campo-email-erro" />
<p id="campo-email-erro">E-mail inválido.</p>
```

- `aria-invalid` só quando há erro (senão `undefined`, não `false`).
- A mensagem fica **ligada** ao campo por `aria-describedby` (o leitor de tela lê ao focar).
- No envio com erro, o foco vai para o **primeiro campo inválido** (`focusFirstError`).
- Toasts continuam existindo, mas são complemento — a informação principal é inline.

---

## 3. Componentes (`src/components/auth/`)

### `AuthShell`
Casca das páginas de cadastro: `<main id="conteudo">`, link de voltar, logo e cabeçalho com o único `<h1>`.

| Prop | Tipo | Padrão |
| --- | --- | --- |
| `title` | `string` | — (vira o `<h1>`) |
| `description` | `string?` | — |
| `icon` | `LucideIcon?` | — |
| `eyebrow` | `string?` | — (selo acima do título) |
| `backTo` / `backLabel` | rota / `string` | `"/login"` / `"Voltar ao login"` |
| `size` | `"md" \| "lg"` | `"md"` (`max-w-md`); `"lg"` = `max-w-3xl` dentro de card |

```tsx
<AuthShell icon={Building2} title="Cadastro de Clube" description="Preencha os dados…">
  <form>…</form>
</AuthShell>
```

`AuthHeader` (exportado do mesmo arquivo) é só o cabeçalho — usado no login, que tem layout próprio com hero.

### `BackLink`
Link "voltar" com seta e estados completos. Garante que nenhuma tela de entrada fique sem saída.

```tsx
<BackLink to="/">Voltar ao início</BackLink>
```

### `FormField`
Liga `label ↔ controle ↔ erro/dica` sem o desenvolvedor lembrar de ids. O filho é uma
**função** que recebe `{ id, aria-invalid, aria-describedby }`.

| Prop | Tipo | Descrição |
| --- | --- | --- |
| `label` | `string` | Texto do `<label>` |
| `name` | `string?` | Gera `id="campo-<name>"` (necessário para `focusFirstError`) |
| `error` | `string?` | Mensagem de erro (ativa `aria-invalid`) |
| `hint` | `string?` | Dica permanente, também ligada por `aria-describedby` |
| `icon` | `LucideIcon?` | Ícone à esquerda; aplica `pl-10` no input automaticamente |
| `className` | `string?` | Ex.: `sm:col-span-2` |

```tsx
<FormField label="E-mail" name="email" icon={Mail} error={errors.email}>
  {(field) => <Input {...field} type="email" value={email} onChange={…} />}
</FormField>
```

Para **grupos de rádio**, use `<fieldset>` + `<legend>` (veja "Pé preferencial" em `cadastro.tsx`).

### `focusFirstError(errors, ordem)` — `focus-first-error.ts`
Foca o primeiro campo com erro seguindo a ordem visual do formulário.

### `FormSection`
`<section aria-labelledby>` com `<h2>` e grid responsiva (`1 coluna → sm:2 colunas`).

```tsx
<FormSection title="Dados pessoais">…campos…</FormSection>
```

### `TermsConsent`
Checkbox de aceite dos Termos/Privacidade, com erro inline (`id="campo-termos"`). Os links
abrem em nova aba e anunciam isso para leitor de tela.

```tsx
<TermsConsent checked={aceita} onCheckedChange={setAceita} error={errors.termos} />
```

### `ApprovalNotice`
Aviso "Aprovação necessária" dos cadastros de clube e admin (`<aside>` rotulado).

### `AuthSuccess`
Tela "Cadastro enviado!" com `role="status"` e **duas saídas** (login e início).

```tsx
if (success) return <AuthSuccess />;
```

### `FileField`
Upload de imagem com pré-visualização. Botão rotulado pelo título do campo, `alt`
descritivo na prévia (`previewAlt`) e URL de objeto liberada ao trocar/remover o arquivo.

```tsx
<FileField label="RG — Frente" previewAlt="Foto enviada da frente do RG" name="rgFrente" file={f} onChange={setF} error={errors.rgFrente} />
```

---

## 4. Checklist por página

**Responsivo (mobile-first)**
- [ ] Sem scroll horizontal em **375px, 768px e 1280px** (teste com `overflow-x` do `html/body` desligado no DevTools — o `overflow-x: clip` global de `styles.css` esconde vazamentos).
- [ ] Grids começam em 1 coluna e abrem com `sm:`/`min-[420px]:` — nunca `grid-cols-2/3` fixo em linha com texto.
- [ ] Filhos flex com texto longo têm `min-w-0` (+ `truncate` quando fizer sentido).
- [ ] Popovers largos limitados com `max-w-[calc(100vw-2rem)]`.

**Semântica**
- [ ] Um `<h1>` por página; seções com `<h2>` ligado por `aria-labelledby`.
- [ ] Conteúdo principal em `<main id="conteudo">`; grupos de links em `<nav aria-label…>`.
- [ ] Todo campo tem `<label>` associado (ou `<fieldset>/<legend>` para grupos).
- [ ] Imagens de conteúdo com `alt` descritivo; decorativas com `alt=""`/`aria-hidden`.
- [ ] Ícones decorativos com `aria-hidden="true"`.

**Navegação**
- [ ] Link ativo do menu com `aria-current="page"` (`AppLayout`).
- [ ] Botão de menu com `aria-expanded` + `aria-controls`.
- [ ] Toda tela tem saída (voltar, cancelar ou link para início).

---

## 5. Exceções de cor

| Arquivo | Motivo |
| --- | --- |
| `src/routes/login.tsx` — SVG "Entrar com Google" | Cores oficiais da marca Google (`#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`), exigidas pelas diretrizes da marca. O SVG é `aria-hidden`. |

---

## 6. Próximos passos (fora do escopo desta sprint)

- `peneiras.criar.tsx` e `components/scout/ScoutProfileEditor.tsx` ainda têm `Field`/`Section` locais — migrar para `FormField`/`FormSection`.
- Paletas hex em `dashboard.tsx`, `candidatos.$candidatoId.tsx`, `SkillsInsights.tsx` e `RadarPreview.tsx` — trocar por `var(--color-chart-1…5)` / `var(--color-gold)`.
- Estados vazios repetidos em ~12 rotas — extrair `EmptyState`.
