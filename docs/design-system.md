# Design System — Pelé Next Gen (Sprint 4)

Styleguide vivo da plataforma: **`/design-system`**. Tudo é feito com **Tailwind CSS v4** e os tokens de `src/styles.css`; nenhum token foi removido ou renomeado na Sprint 4 (só foi acrescentado o seletor `.light`, ver "Convenções").

## 1. Como acessar

| Onde | Endereço |
|---|---|
| Local | `npm run dev` → `http://localhost:8080/design-system` |
| Produção | `https://pelenextgen.vercel.app/design-system` (após o merge/deploy desta branch) |
| Antigo | `/demo-componentes` agora **redireciona (307)** para `/design-system` |

Estrutura da página (arquivos em `src/routes/design-system.tsx` e `src/components/design-system/`):

| Âncora | Conteúdo | Arquivo |
|---|---|---|
| `#tokens` | cores (claro e escuro lado a lado), contraste, espaçamento, raios, sombras | `TokensSection.tsx` |
| `#tipografia` | famílias, escala, pesos, hierarquia de títulos | `TypographySection.tsx` |
| `#componentes` | componentes reais em todos os estados | `ComponentsSection.tsx` |
| `#padroes` | cabeçalho de página, formulário, grade de cards | `PatternsSection.tsx` |
| `#estados` | carregando, vazio, erro e sucesso | `PatternsSection.tsx` |

Acessibilidade da rota: um único `h1`, headings em ordem, landmarks `header` / `nav` (âncoras) / `main#conteudo` / `footer`, e o link "Pular para o conteúdo" do `__root.tsx` (não duplicado). Foco visível pela regra global de `styles.css`.

## 2. Tokens

Os valores não são digitados: a página usa a classe Tailwind do token e lê o valor com `getComputedStyle`. Hexadecimais abaixo são os lidos em 22/10/2026 (conversão do OKLCH para sRGB) e servem de referência rápida.

### Cores

| Token | Classe Tailwind | Claro | Escuro | Uso |
|---|---|---|---|---|
| `--gold` | `bg-gold` | `#D09A21` | `#E0AF3B` | Dourado principal (= `--primary`) |
| `--gold-light` | `bg-gold-light` | `#E7BF57` | `#F2CD64` | Gradientes e realces |
| `--gold-dark` | `bg-gold-dark` | `#A46E00` | `#BB881A` | Gradientes; `--primary` em superfícies claras |
| `--gold-ink` | `text-gold-ink` | `#875800` | `#E0AF3B` | Dourado para **texto** e anel de foco |
| `--blue` | `bg-blue` | `#0065CD` | `#0065CD` | Azul da marca (= `--secondary`) |
| `--blue-light` | `bg-blue-light` | `#2288E8` | `#2288E8` | Destaque (= `--accent`) |
| `--blue-dark` | `bg-blue-dark` | `#003B95` | `#003B95` | Fundos profundos |
| `--blue-ink` | `text-blue-ink` | `#0058BF` | `#73B2F8` | Azul para texto pequeno |
| `--background` | `bg-background` | `#F8FAFD` | `#061223` | Fundo da página |
| `--foreground` | `text-foreground` | `#0D1624` | `#E6ECF2` | Texto principal |
| `--card` / `--popover` | `bg-card` / `bg-popover` | `#FFFFFF` | `#0B192A` / `#13243C` | Cards; menus e diálogos |
| `--primary` / `--primary-foreground` | `bg-primary` | `#D09A21` / `#061223` | `#E0AF3B` / `#061223` | Botão padrão |
| `--secondary` | `bg-secondary` | `#0065CD` | `#0065CD` | Ação secundária |
| `--muted` / `--muted-foreground` | `bg-muted` / `text-muted-foreground` | `#E4EAF1` / `#525F6E` | `#13243C` / `#8B9AAB` | Fundos discretos; texto de apoio |
| `--accent` | `bg-accent` | `#2288E8` | `#2288E8` | Hover de ghost/outline |
| `--destructive` / `--error` | `bg-destructive` / `text-error` | `#BB0916` | `#FF655A` | Erro e ações destrutivas |
| `--success` | `text-success` | `#007136` | `#52CD7D` | Sucesso, "aberta", contato liberado |
| `--ring` | `ring-ring` | `#875800` | `#E0AF3B` | Anel de foco (≥ 3:1) |
| `--bg2` / `--bg3` | `bg-bg2` / `bg-bg3` | `#EFF4F9` / `#E4EAF1` | `#0B192A` / `#13243C` | Superfícies elevadas |
| `--ink` / `--ink-foreground` | `bg-ink` | `#040609` / `#EFF2F5` | `#020204` / `#F3F5F8` | Blocos sempre escuros |
| `--border`, `--input` | `border-border`, `border-input` | preto 12% / 14% | branco 14% / 16% | Bordas (com transparência) |
| `--chart-1…5` | `bg-chart-1…5` | dourado, azul claro, verde, dourado claro, azul | idem (verde mais claro) | Gráficos |
| `--sidebar-*` | `bg-sidebar` etc. | — | — | Menu lateral do `AppLayout` |

Gradientes e sombras: `--gradient-hero`, `--gradient-gold`, `--gradient-blue`, `--shadow-card`, `--shadow-gold` (classes `bg-gradient-*`, `shadow-card`, `shadow-gold`).

### Contraste medido (WCAG 2.1, na própria página)

| Par | Claro | Escuro |
|---|---|---|
| `foreground` / `background` | 17,35:1 | 15,78:1 |
| `muted-foreground` / `background` | 6,24:1 | 6,53:1 |
| `primary-foreground` / `primary` | 7,44:1 | 9,27:1 |
| `secondary-foreground` / `secondary` | 5,28:1 | 5,28:1 |
| `destructive-foreground` / `destructive` | 6,25:1 | 6,49:1 |
| `gold-ink` / `background` | 5,86:1 | 9,27:1 |
| `blue-ink` / `background` | 6,38:1 | 8,45:1 |
| `success` / `background` | 5,88:1 | 9,29:1 |
| `error` / `background` | 6,35:1 | 6,49:1 |
| **`accent-foreground` / `accent`** | **3,44:1** | **3,44:1** |

> **Ponto de atenção:** `--accent` (`#2288E8`) com texto branco dá 3,44:1, abaixo dos 4,5:1 do AA para texto normal. Aparece no *hover* de `Button` `ghost`/`outline`. A correção exige escolher outro tom de `--accent` (decisão de design; não feita aqui porque a regra é não alterar tokens existentes).

### Tipografia

`--font-display` e `--font-body` = **Space Grotesk** (400, 500, 600, 700, carregada por Google Fonts em `__root.tsx`). Títulos `h1–h6` usam `font-display` por regra global.

Escala realmente usada (ocorrências de `text-*` em `src/`): `text-xs` 224 · `text-sm` 305 · `text-base` 34 · `text-lg` 41 · `text-xl` 38 · `text-2xl` 46 · `text-3xl` 34 · `text-4xl` 22 · `text-5xl` 6. Pesos: `font-bold` 283, `font-semibold` 153, `font-extrabold` 93, `font-medium` 61, `font-normal` 13.

### Espaçamento, raios e sombras

- Espaçamento: escala do Tailwind (0,25rem). Mais usados: `gap-2` (207), `gap-3` (118), `gap-1` (100), `p-6` (71), `p-3` (59), `p-4` (56).
- Raios derivados de `--radius` (0,75rem): `rounded-sm/md/lg/xl/2xl/3xl` = radius −4px, −2px, 0, +4px, +8px, +12px; `rounded-full` para avatar e pílulas. Mais usados: `rounded-full` 175, `rounded-2xl` 133, `rounded-xl` 103.
- Sombras: `shadow-sm`, `shadow`, `shadow-card`, `shadow-gold`.

## 3. Componentes e estados

Todos usam os componentes reais. *Hover*, *focus-visible* e *active* são **forçados com as classes utilitárias equivalentes** (legenda na página); *default*, *disabled*, erro, sucesso e *loading* são reais.

| Componente | Variações / estados mostrados |
|---|---|
| `Button` | 7 variantes (default, destructive, error, outline, secondary, ghost, link) × default, hover, focus-visible, active, disabled, loading; tamanhos sm, default, lg, icon; `ThemeToggle` |
| `Input`, `Textarea`, `Select` + `Label` | default, focus-visible, preenchido, disabled, erro (`aria-invalid` + `aria-describedby`), sucesso |
| `Badge` | default, secondary, destructive, outline, focus |
| `StatusBadge` | aberta, em andamento, encerrada |
| `Card` | default, hover, loading (Skeleton) |
| `Alert` | default, destructive, sucesso (classes do token `--success`) |
| `Dialog` | abre de verdade (foco preso, Esc fecha) |
| `Tabs` | default, ativa, disabled, focus |
| `Table` | com dados (hover de linha), loading, vazia |
| `Skeleton`, `EmptyState` | loading; vazio e busca sem resultado |
| `PeneiraCard` | aberta, em andamento, encerrada, lotada, privada (dados de `mock-data`) |
| `SolicitacaoStatus` | pendente, liberado, recusado (com e sem observação) |
| `AthleteAvatar` | com foto, sem foto, decorativo (`alt=""`), tamanhos |
| Padrões | cabeçalho de página, formulário, grade responsiva, estados carregando/vazio/erro/sucesso |

`EmptyState` foi extraído do `dashboard.tsx` para `src/components/EmptyState.tsx` (o dashboard passou a importá-lo). O `EmptyState` de `ScoutProfileView.tsx` é outra versão (só texto) e continua local.

## 4. Convenções de uso

1. **Só tokens.** Cor, borda e sombra vêm de classes do token (`bg-card`, `text-muted-foreground`, `border-border`, `shadow-card`). Evite hex, `text-white`, `text-slate-*`.
2. **Texto colorido = `*-ink`.** Dourado e azul pequenos em texto usam `text-gold-ink` / `text-blue-ink`, não `text-gold`.
3. **Alvo de toque.** Abaixo de `md`, `Button`, `Input`, `SelectTrigger` e `TabsTrigger` têm no mínimo 44px (`max-md:min-h-11`). Ícones clicáveis: `h-11 w-11`.
4. **Foco.** Nunca remover o foco; o padrão global é `outline` com `--ring`, e os componentes shadcn usam `ring-2 ring-ring`.
5. **Campos.** `Label` com `htmlFor`; erro com `aria-invalid="true"` e `aria-describedby` apontando para a mensagem; mensagem com ícone (não só cor).
6. **Estados.** Carregando = `Skeleton` com `aria-busy`; vazio = `EmptyState`; erro = `Alert variant="destructive"` (ou `role="alert"`); sucesso = `role="status"` com `--success`.
7. **Grades.** Use `grid-cols-1` na base (`grid gap-4 grid-cols-1 sm:grid-cols-2`): sem isso a coluna automática cresce com o conteúdo (gráficos) e corta a tela em 375px (corrigido no dashboard).
8. **Tema.** Padrão escuro; a classe `.dark` está em `<html>`. Para mostrar o claro dentro de uma página escura use a classe `.light` (adicionada ao seletor `:root` em `styles.css`).
9. **Títulos.** Um `h1` por página, `h2`/`h3` em ordem.

## 5. Divergência do README e texto corrigido

O README (seção "Design System") **não corresponde ao código**:

| README diz | O código tem |
|---|---|
| Tema escuro azul-marinho | Tema claro **e** escuro (`:root` / `.dark`), alternados por `ThemeToggle` |
| `--gold #d4af37`, `--blue #005baa`, `--background #0a1628`, `--success #2ecc71`, `--error #e74c3c` | Tokens em **OKLCH** (tabela acima), com variantes `*-ink` para texto |
| Headings **Poppins** 600–900, body **Inter** 400–700 | **Space Grotesk** 400–700 para ambos |

Histórico: `git log -S"Poppins"` mostra a remoção da Poppins no commit `468cde7` (19/09/2026, "Redesign da home… paleta preto/dourado"); o README nunca foi atualizado depois.

**Texto proposto para a seção (README é do Pedro; só proposta):**

```markdown
## Design System

Styleguide vivo em **`/design-system`** (documentação em [`docs/design-system.md`](docs/design-system.md)).
Tailwind CSS v4 com tokens em OKLCH definidos em `src/styles.css`, tema **claro e escuro** (classe `.dark`)
e acentos dourado e azul.

### Cores

| Token | Claro | Escuro | Uso |
|-------|-------|--------|-----|
| `--gold` | `#D09A21` | `#E0AF3B` | Primária, botões, destaques |
| `--gold-ink` | `#875800` | `#E0AF3B` | Dourado para texto e foco (contraste AA) |
| `--blue` | `#0065CD` | `#0065CD` | Secundária |
| `--blue-dark` | `#003B95` | `#003B95` | Fundos profundos |
| `--background` | `#F8FAFD` | `#061223` | Fundo principal |
| `--bg2` | `#EFF4F9` | `#0B192A` | Cards e superfícies |
| `--success` | `#007136` | `#52CD7D` | Sucesso / aberta |
| `--error` | `#BB0916` | `#FF655A` | Erro / reprovado |

### Tipografia

- **Headings e corpo**: Space Grotesk (400–700), via Google Fonts (`src/routes/__root.tsx`).
- Escala: `text-xs` a `text-5xl` do Tailwind (ver `/design-system#tipografia`).
```

## 6. Evidências (prints)

Pasta `docs/design-system/prints/`, gerada por `node scripts/responsive-audit.mjs http://localhost:8080 --prints` (tema escuro) e `… --prints --theme=light` (sufixo `-claro`). O script usa o `puppeteer-core` já presente no projeto e o Chrome instalado; ele também mede rolagem lateral, elementos fora da tela e alvos de toque < 44px em 375px.

Nome dos arquivos: `<tela>-<375|768|1280>[-claro].png`. Na `/design-system` há um print por seção/bloco: `design-system-<tokens|tipografia|padroes|estados|cmp-botao|cmp-campos|…>-<largura>.png`.

Resultado da última rodada (rolagem lateral e alvos de toque em 375px):

| Tela | 375 | 768 | 1280 | Observações |
|---|---|---|---|---|
| `/` | sem rolagem lateral | ok | ok | restam 2 alvos < 44px no rodapé (`Footer.tsx`, Miguel) |
| `/login` | ok, 0 alvos < 44px | ok | ok | |
| `/cadastro` | ok | ok | ok | restam só radios/checkbox dentro de `label` clicável |
| `/dashboard` | ok (antes: conteúdo cortado em 81px) | ok | ok | botão "Abrir menu" 40px (`AppLayout.tsx`, Miguel) |
| `/design-system` | ok | ok | ok | os 7 "alvos" de 43px são o botão em estado *active* forçado (`scale-[0.98]`) |
| `/peneiras`, `/ranking` | **não medidas**: exigem login (redirecionam para `/login`) | | | rodar logado — ver pendências |

## 7. Inconsistências encontradas

- **Foco:** `Button` usa `ring-2` + `ring-offset-2` + `scale-[1.02]`; `Input`/`Textarea`/`Select` usam `ring-1`. Já a `Tabs` e o `Badge` usam `ring-2`.
- **Hover:** `Input`, `Textarea` e `Select` não têm estilo de hover (os demais componentes têm).
- **Raio:** botões e campos `rounded-md`, cards `rounded-xl`, painéis `rounded-2xl`, `Dialog` `rounded-2xl` no mobile e `rounded-lg` em `sm`.
- **Altura de controles:** botão `sm` 32px, padrão 36px, `lg` 40px, `Input` 36px (agora 44px no celular).
- **Cor:** `Button variant="error"` usa `text-white` fixo e `animate-pulse`; `StatusBadge` usa `text-background`; `PeneiraCard` usa `text-slate-50` nas categorias (fora dos tokens). `Alert` não tem variante de sucesso (usa-se `--success` por classe).
- **`StatusBadge`** mostra "Inscrições abertas" também para peneira lotada (o botão do card diz "Vagas esgotadas").
- **Tipografia:** `font-display` e `font-body` apontam para a mesma fonte; `text-[11px]` e `text-[10px]` aparecem fora da escala.
- **Texto em inglês:** o botão de fechar do `Dialog` dizia "Close" (corrigido para "Fechar").
- **Contraste:** `--accent-foreground` / `--accent` = 3,44:1 (ver seção 2).

## 8. O que mudou nesta sprint (resumo)

- `src/routes/design-system.tsx` + `src/components/design-system/*` (rota nova); `src/routes/demo-componentes.tsx` virou redirect.
- `src/components/EmptyState.tsx` (extraído do dashboard).
- `src/styles.css`: seletor `:root, .light` (nenhum token removido/renomeado).
- Alvos de 44px (celular) em `button`, `input`, `select`, `tabs`, `password-input`, `dialog`; chips/pontos/menu da home; links e abas de `login`/`cadastro`; `grid-cols-1` no `dashboard`.
- `scripts/responsive-audit.mjs`.
