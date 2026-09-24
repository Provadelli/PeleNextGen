# Design System — Pelé Next Gen

Fonte da verdade: bloco `@theme inline` em [`src/styles.css`](../src/styles.css).
Os valores primitivos ficam em `:root` (claro) e `.dark` (escuro); o `@theme` só os referencia,
por isso toda classe (`bg-primary`, `text-muted-foreground`…) troca de tema sozinha. A classe
`.dark` é aplicada no `<html>` por `src/lib/theme.tsx`.

## Tokens

### Cores de marca

| Token (classe) | Variável       | Claro                  | Escuro                 | Uso                             |
| -------------- | -------------- | ---------------------- | ---------------------- | ------------------------------- |
| `gold`         | `--gold`       | `oklch(0.72 0.14 82)`  | `oklch(0.78 0.14 85)`  | Cor primária, CTAs, foco        |
| `gold-light`   | `--gold-light` | `oklch(0.82 0.13 88)`  | `oklch(0.86 0.13 90)`  | Gradientes, hover               |
| `gold-dark`    | `--gold-dark`  | `oklch(0.58 0.13 78)`  | `oklch(0.66 0.13 80)`  | Primária em superfícies claras  |
| `blue`         | `--blue`       | `oklch(0.52 0.18 256)` | igual                  | Secundária                      |
| `blue-light`   | `--blue-light` | `oklch(0.62 0.17 252)` | igual                  | Accent (hover de ghost/outline) |
| `blue-dark`    | `--blue-dark`  | `oklch(0.38 0.16 258)` | igual                  | Gradiente azul                  |
| `success`      | `--success`    | `oklch(0.62 0.16 152)` | `oklch(0.76 0.16 152)` | Aprovado                        |
| `error`        | `--error`      | `oklch(0.60 0.21 27)`  | `oklch(0.65 0.21 27)`  | Erro / reprovado                |

### Cores semânticas (padrão shadcn)

| Classe                              | Aponta para                           | Uso                              |
| ----------------------------------- | ------------------------------------- | -------------------------------- |
| `background` / `foreground`         | off-white · azul-marinho              | Página e texto                   |
| `card`, `popover` (+ `-foreground`) | branco (claro) · `bg2`/`bg3` (escuro) | Cartões, menus                   |
| `primary` (+ `-foreground`)         | `gold`                                | Ação principal                   |
| `secondary` (+ `-foreground`)       | `blue`                                | Ação secundária                  |
| `accent` (+ `-foreground`)          | `blue-light`                          | Hover de itens                   |
| `muted` / `muted-foreground`        | `bg3` · cinza-azulado                 | Fundos e textos secundários      |
| `destructive` (+ `-foreground`)     | `error`                               | Ações destrutivas, erro de campo |
| `border`, `input`, `ring`           | 12–16% de alfa · `gold`               | Bordas, campos, anel de foco     |
| `bg2`, `bg3`, `ink`                 | superfícies em camadas                | Seções e cartões internos        |
| `sidebar-*`                         | superfícies do menu lateral           | `AppLayout`                      |

### Tipografia

| Token          | Valor                 | Uso                               |
| -------------- | --------------------- | --------------------------------- |
| `font-display` | Space Grotesk 600–700 | h1–h6 (aplicado no `@layer base`) |
| `font-body`    | Space Grotesk 400–500 | Texto corrido                     |

> A Sprint 1 previa Poppins + Inter. Na Sprint 3 unificamos em Space Grotesk: uma família só,
> menos requisições de fonte e um visual mais esportivo/técnico.

### Raios

| Classe        | Valor (`--radius` = 0.75rem) |
| ------------- | ---------------------------- |
| `rounded-sm`  | 8px                          |
| `rounded-md`  | 10px                         |
| `rounded-lg`  | 12px                         |
| `rounded-xl`  | 16px                         |
| `rounded-2xl` | 20px                         |
| `rounded-3xl` | 24px                         |
| `rounded-4xl` | 28px                         |

### Sombras e gradientes (`@utility`)

`shadow-card`, `shadow-gold`, `bg-gradient-gold`, `bg-gradient-blue`, `bg-gradient-hero`, `text-gradient-gold`.

### Superfícies de seção

`surface-ink`, `surface-paper`, `surface-cream`: redefinem os tokens dentro da seção, e os componentes filhos se adaptam sozinhos.

### Breakpoints e espaçamento

Padrão do Tailwind v4: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536.
Espaçamento base de 0.25rem (`p-4` = 16px, `h-9` = 36px). Telas validadas em 375, 768 e 1280px.

## Componentes (`src/components/ui/`)

Estados globais:

- **focus-visible**: anel dourado (`ring`), só com teclado
- **disabled**: 50% de opacidade, sem interação
- **erro**: `aria-invalid="true"` deixa borda/anel `destructive`, e o estado também é anunciado por leitores de tela

### Button

- **Variantes:** `default` · `secondary` · `outline` · `ghost` · `link` · `destructive`
- **`error`:** usada no submit dos formulários (cadastro, registro, criar peneira) enquanto houver erro de validação. Pulsa, exceto com `prefers-reduced-motion`.
- **Tamanhos:** `default` (h-9) · `sm` · `lg` · `icon`
- **Estados:** hover (escurece 10%) · active (escala 0.98 + escurece 20%) · focus-visible (anel dourado + `shadow-gold`) · disabled · erro (`aria-invalid`)

```tsx
<Button>Inscrever-se</Button>
<Button variant="outline" size="sm" disabled>Encerrada</Button>
<Button variant="ghost" size="icon" aria-label="Fechar"><X /></Button>
<Button asChild><Link to="/peneiras">Ver peneiras</Link></Button>
```

### Input / PasswordInput / Textarea

- **Variantes:** única. `PasswordInput` adiciona o botão mostrar/ocultar e herda todos os estados do `Input`.
- **Estados:** hover (borda mais forte) · active/focus-visible (borda + anel dourado) · disabled · erro (`aria-invalid`)

```tsx
<Label htmlFor="email">E-mail</Label>
<Input id="email" type="email" aria-invalid={!!erro} aria-describedby="email-erro" />
{erro && <p id="email-erro" className="text-sm text-destructive">{erro}</p>}

<PasswordInput id="senha" autoComplete="current-password" />
<Textarea placeholder="Conte sobre você" />
```

### Label

- Sempre ligado ao campo via `htmlFor`.
- **Estados:** `peer-disabled:` (cursor bloqueado, 70% de opacidade).

```tsx
<Label htmlFor="nome">Nome completo</Label>
```

### Select

- **Partes:** `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`
- **Estados:** foco no trigger · `data-[state=open]` · item `focus`/`data-[highlighted]` · `data-[disabled]` · placeholder

```tsx
<Select value={posicao} onValueChange={setPosicao}>
  <SelectTrigger aria-label="Posição">
    <SelectValue placeholder="Selecione" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="goleiro">Goleiro</SelectItem>
    <SelectItem value="atacante">Atacante</SelectItem>
  </SelectContent>
</Select>
```

### Badge

- **Variantes:** `default` · `secondary` · `destructive` · `outline`
- **Estados:** hover (80%) · focus (anel)

```tsx
<Badge variant="secondary">Sub-17</Badge>
```

### Checkbox · RadioGroup

- **Estados:** `data-[state=checked]` · focus-visible · disabled

```tsx
<RadioGroup value={tipo} onValueChange={setTipo}>
  <div className="flex items-center gap-2">
    <RadioGroupItem id="atleta" value="atleta" />
    <Label htmlFor="atleta">Atleta</Label>
  </div>
</RadioGroup>

<Checkbox id="termos" checked={aceito} onCheckedChange={(v) => setAceito(!!v)} />
```

### Dialog · AlertDialog

- `Dialog`: conteúdo modal genérico. `AlertDialog`: confirmação de ação destrutiva, que não fecha ao clicar fora.
- **Estados:** `data-[state=open|closed]` (fade/zoom) · foco preso dentro do modal · `Esc` fecha

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Cancelar inscrição</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Cancelar inscrição?</AlertDialogTitle>
      <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Voltar</AlertDialogCancel>
      <AlertDialogAction>Confirmar</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Popover · Calendar

- **Estados do dia no Calendar:** selecionado · hoje · fora do mês · desabilitado · focus-visible

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">{data ? format(data, "dd/MM/yyyy") : "Escolher data"}</Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <Calendar mode="single" selected={data} onSelect={setData} />
  </PopoverContent>
</Popover>
```

### DropdownMenu

- **Itens:** `Item` · `CheckboxItem` · `RadioItem` · `Sub` · `Separator` · `Label`
- **Estados:** item `focus`/`data-[highlighted]` · `data-[disabled]` · `data-[state=checked]`

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="Opções">
      <MoreVertical />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onSelect={arquivar}>Arquivar</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Tabs

- **Estados:** trigger `data-[state=active]` · focus-visible · disabled

```tsx
<Tabs defaultValue="abertos">
  <TabsList>
    <TabsTrigger value="abertos">Abertos</TabsTrigger>
    <TabsTrigger value="resolvidos">Resolvidos</TabsTrigger>
  </TabsList>
  <TabsContent value="abertos">…</TabsContent>
</Tabs>
```

### Sonner (toasts)

- `<Toaster />` é montado uma vez em `src/routes/__root.tsx`.
- **Tipos:** `toast()` · `toast.success` · `toast.error` · `toast.promise`

```tsx
import { toast } from "sonner";

toast.success("Inscrição confirmada!");
```

## Regras de uso

1. Cores sempre via token (`bg-primary`), nunca hex/oklch soltos no JSX.
2. `style={{}}` só para valores dinâmicos de runtime (porcentagem, cor vinda de dado, motion values), sempre com comentário justificando.
3. Erro de campo = `aria-invalid` no campo + mensagem ligada por `aria-describedby`.
4. Novo componente shadcn: `npx shadcn@latest add <nome>`. Se ele deixar de ser usado, remova o arquivo e a dependência.