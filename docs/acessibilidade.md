# Acessibilidade — WCAG 2.1 AA (Sprints 3 e 4)

Escopo: **Home** (`/`), **Dashboard** (`/dashboard`), **Candidatos** (`/candidatos`) e, na Sprint 4, **/login, /cadastro, /peneiras, /ranking, /suporte, /clubes, /chat, /perfil e /demo-componentes** (ainda não há `/design-system`; a página de componentes é a `demo-componentes`), além do layout compartilhado (`__root.tsx`, `AppLayout.tsx`, `Footer.tsx`).

## 0. Resultado da Sprint 4 (axe-core, claro e escuro, `scripts/axe-audit.mjs`)

Rodar: `node scripts/axe-audit.mjs https://pelenextgen.vercel.app /login /cadastro ...` (regras `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`; também lista erros de console e respostas HTTP ≥ 400).

| Tela | Antes | Correção | Depois |
|---|---|---|---|
| `/login` | `label-content-name-mismatch` (botão "Ouvir página") | `aria-label` agora contém o texto visível (2.5.3) | 0 |
| `/cadastro` | `button-name` (select Posição sem nome); `label-content-name-mismatch` (altura e peso) | `aria-label="Posição"`; rótulos de altura/peso iniciam pelo texto visível | 0 |
| `/peneiras`, `/chat`, `/perfil`, `/ranking` | mesmo botão "Ouvir página" | idem `/login` | 0 |
| `/suporte`, `/clubes` | — | — | 0 |
| `/demo-componentes` | `label` (2 inputs) e `color-contrast` (`text-white` sobre `--success`/`--error`, que clareiam no escuro) | `aria-label` nos inputs; `text-background` no lugar de `text-white` | ⚠️ restam só contrastes dos estados *simulados* (disabled com `opacity-50`, pulso de animação), que não existem em controles reais |

Observações:
- `/chat` e `/perfil` exigem login; sem sessão o axe auditou a tela exibida ao visitante. Auditar logado: ver pendências.
- `/ranking` registra no console `401` em `rpc/get_athlete_leaderboard` para visitante anônimo (permissão do Supabase, não é código de front; regra de negócio inalterada).
- Teclado nas novas telas: a mesma base de foco visível global, Radix (Popover/Select/Dialog) com `Esc` e retorno de foco, e link "Pular para o conteúdo". Roteiro da seção 3 vale para elas.

## 0.1 Lighthouse (produção)

| Momento | Mobile (Perf / A11y) | Desktop (Perf / A11y) | Peso |
|---|---|---|---|
| Antes (main, 21/10/2026) | 61 / 100 (LCP 44 s) | 86 / 100 | 24,9 MB |
| Depois | _preencher após o merge/deploy_ | _preencher_ | |

Mudanças de performance: vídeo do Hero 8,8 MB → 1,2 MB (720p, sem áudio, `faststart`) e só carregado em ≥ 1024px sem "economia de dados"; 4 fotos da home de 3–4 MB → ~0,2–0,3 MB (máx. 1600 px); logos de 606 KB → ~20 KB; `width`/`height` nos logos. Relatórios em `docs/lighthouse/`.

Legenda de status: ✅ Atende · ⚠️ Parcial (ver observação) · 🔲 Verificação manual pendente · N/A Não se aplica às telas do escopo.

Ferramentas usadas:
- **axe-core 4** (mesmo motor da auditoria de acessibilidade do Lighthouse), regras `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` e `best-practice`, executado nas 3 telas, **tema claro e escuro**: **0 violações** após as correções.
- Script de contraste (conversão OKLCH → sRGB + fórmula de luminância relativa da WCAG) sobre os tokens de `src/styles.css`.
- Teste manual por teclado (roteiro no fim deste documento).

---

## 1. Checklist WCAG 2.1 — níveis A e AA

### 1. Perceptível

| Critério | Nível | Status | Onde foi verificado | Observação |
|---|---|---|---|---|
| 1.1.1 Conteúdo não textual | A | ✅ | Home (`Hero`, `Parceiros`, `CtaFinal`, `PeneirasSection`), Dashboard (`ChartCard`), Candidatos (`AthleteAvatar`) | Imagens informativas com `alt`; decorativas com `alt=""`/`aria-hidden`. Logos duplicados do marquee ocultos. Gráficos com tabela equivalente `sr-only`. Avatar com `alt=""` quando o nome já está no link. |
| 1.2.1 Somente áudio/vídeo (pré-gravado) | A | N/A | Home (`Hero`) | Vídeo de fundo é decorativo, mudo e sem informação. |
| 1.2.2 Legendas (pré-gravado) | A | N/A | Home | Sem vídeo com áudio no escopo. Galeria de vídeos de atletas está fora do escopo. |
| 1.2.3 Audiodescrição ou mídia alternativa | A | N/A | Home | Idem. |
| 1.2.4 Legendas (ao vivo) | AA | N/A | — | Sem mídia ao vivo. |
| 1.2.5 Audiodescrição (pré-gravado) | AA | N/A | — | Idem 1.2.2. |
| 1.3.1 Informações e relações | A | ✅ | Todas | Landmarks (`header`, `nav` rotulados, `main`, `footer`), `h1` único por página e hierarquia sem saltos, `<table>` com `caption` e `th scope`, `dl` na Próxima peneira, grupo de filtros com `role="group"`, `label` associado à busca. |
| 1.3.2 Sequência significativa | A | ✅ | Todas | Ordem do DOM = ordem visual. Botão de pausa do vídeo movido para depois do conteúdo do Hero. |
| 1.3.3 Características sensoriais | A | ✅ | Todas | Nenhuma instrução depende de forma, cor ou posição. |
| 1.3.4 Orientação | AA | ✅ | Todas | Sem bloqueio de orientação. |
| 1.3.5 Identificar propósito de entrada | AA | N/A | Candidatos | A busca não coleta dados pessoais do usuário. |
| 1.4.1 Uso de cor | A | ✅ | Candidatos (status), Dashboard (gráficos) | Status com texto ("Pendente", "Aprovado"…), filtro ativo com `aria-pressed` + fundo; gráfico de pizza com legenda textual e tabela. |
| 1.4.2 Controle de áudio | A | ✅ | Home | Vídeo é `muted`. |
| 1.4.3 Contraste (mínimo) | AA | ✅ | Todas (tabela na seção 2) | Novo token `--gold-ink` para dourado em texto; `--success`, `--error`, `--blue-ink`, eixos dos gráficos e textos com transparência corrigidos. |
| 1.4.4 Redimensionar texto | AA | 🔲 | Todas | Tipografia em `rem`, sem alturas fixas em blocos de texto. Confirmar com zoom 200% no navegador. |
| 1.4.5 Imagens de texto | AA | ✅ | Home | Texto real em HTML; logos são exceção permitida. |
| 1.4.10 Reflow | AA | 🔲 | Todas | Candidatos troca a tabela por cartões abaixo de 768px (sem rolagem lateral); Dashboard em 1 coluna no celular. Confirmar em 320/375px no DevTools. |
| 1.4.11 Contraste não textual | AA | ✅ | Todas | Anel de foco `--ring` ≥ 5,8:1 no claro e 9,3:1 no escuro; bordas de input/botões mantidas. |
| 1.4.12 Espaçamento de texto | AA | 🔲 | Todas | Sem alturas fixas em texto; os títulos truncados (`truncate`) têm o texto completo no leitor de tela. Testar com bookmarklet de espaçamento. |
| 1.4.13 Conteúdo em hover ou foco | AA | ⚠️ | Dashboard (tooltip dos gráficos) | O tooltip do Recharts some ao tirar o mouse e não é "hoverable". O mesmo conteúdo está sempre disponível na tabela `sr-only`, mas não visualmente. |

### 2. Operável

| Critério | Nível | Status | Onde foi verificado | Observação |
|---|---|---|---|---|
| 2.1.1 Teclado | A | ✅ | Todas | Tudo é alcançável por Tab/Enter/Espaço. Abas dos carrosséis da home com setas (padrão WAI-ARIA + roving tabindex). |
| 2.1.2 Sem armadilha de teclado | A | ✅ | Todas | Menu mobile fecha com Esc e devolve o foco ao botão; diálogo de desbloqueio (Radix) prende o foco só enquanto aberto. |
| 2.1.4 Atalhos de teclado por caractere | A | N/A | — | Sem atalhos de uma tecla. |
| 2.2.1 Tempo ajustável | A | N/A | — | Sem limite de tempo. |
| 2.2.2 Pausar, parar, ocultar | A | ⚠️ | Home | ✅ Vídeo do Hero (botão Pausar) e marquee de parceiros (botão + pausa ao focar/hover). ⚠️ Carrosséis "Legado" e "Academia" pausam com hover, foco, fora da tela e com `prefers-reduced-motion`, mas não têm botão explícito de pausa. |
| 2.3.1 Três flashes | A | ✅ | Todas | Sem conteúdo piscante. |
| 2.4.1 Ignorar blocos | A | ✅ | `__root.tsx` | Link "Pular para o conteúdo" é a 1ª parada de Tab em todas as páginas; foca `#conteudo` ou o primeiro `<main>`. |
| 2.4.2 Página com título | A | ✅ | Todas | `head()` de cada rota. |
| 2.4.3 Ordem do foco | A | ✅ | Todas | Sidebar fechada no mobile fica `inert` (fora da tabulação); backdrop sem parada de Tab; menu abre e foca o 1º item. |
| 2.4.4 Finalidade do link | A | ✅ | Todas | "Ver todas" tem complemento `sr-only` ("as peneiras"); links de atleta usam o nome. |
| 2.4.5 Várias formas | AA | ✅ | Layout | Menu lateral, menu de seções da home e rodapé. |
| 2.4.6 Cabeçalhos e rótulos | AA | ✅ | Todas | Títulos descritivos; filtros rotulados. |
| 2.4.7 Foco visível | AA | ✅ | Global (`styles.css`) | Contorno padrão `:focus-visible` de 2px em `--ring`; o header da home não se esconde com foco dentro (`focus-within`). |
| 2.5.1 Gestos de ponteiro | A | ✅ | Home | Swipe dos carrosséis tem alternativa em botões. |
| 2.5.2 Cancelamento de ponteiro | A | ✅ | Todas | Ações disparam no `click` (subida). |
| 2.5.3 Rótulo no nome | A | ✅ | Candidatos | Nome acessível começa pelo texto visível (ex.: "Desbloquear por R$ 49,99 o contato de …"). |
| 2.5.4 Atuação por movimento | A | N/A | — | — |

### 3. Compreensível

| Critério | Nível | Status | Onde foi verificado | Observação |
|---|---|---|---|---|
| 3.1.1 Idioma da página | A | ✅ | `__root.tsx` | `<html lang="pt-BR">`. |
| 3.1.2 Idioma das partes | AA | N/A | — | Sem trechos em outro idioma. |
| 3.2.1 Em foco | A | ✅ | Todas | Receber foco não muda contexto. |
| 3.2.2 Em entrada | A | ✅ | Candidatos | Filtrar só atualiza a lista e anuncia a contagem; não navega. |
| 3.2.3 Navegação consistente | AA | ✅ | `AppLayout` | Mesmo menu em todas as telas internas. |
| 3.2.4 Identificação consistente | AA | ✅ | Todas | Mesmos ícones e rótulos para as mesmas funções. |
| 3.3.1 Identificação de erro | A | ✅ | Candidatos, Dashboard | Falha de carregamento com `role="alert"` e texto claro. |
| 3.3.2 Rótulos ou instruções | A | ✅ | Candidatos | `<label for="busca-atletas">` visível e grupo "Filtrar por status". |
| 3.3.3 Sugestão de erro | AA | ✅ | Candidatos | Estado vazio por filtro sugere outro termo e oferece "Limpar filtros". Erro de carga oferece "Tentar novamente". |
| 3.3.4 Prevenção de erro (financeiro) | AA | ✅ | Candidatos (visão clube) | Desbloqueio pago passa por diálogo de confirmação com Cancelar. |

### 4. Robusto

| Critério | Nível | Status | Onde foi verificado | Observação |
|---|---|---|---|---|
| 4.1.1 Análise sintática | A | ✅ | Todas | JSX/React sem IDs duplicados (`useId` nos painéis e gráficos). |
| 4.1.2 Nome, função, valor | A | ✅ | Todas | Botões de ícone com `aria-label`; menus com `aria-expanded`/`aria-controls`; filtros com `aria-pressed`; abas com `role="tab"`, `aria-selected`, `aria-controls` e `tabpanel`; link ativo com `aria-current="page"`. |
| 4.1.3 Mensagens de status | AA | ✅ | Candidatos, Dashboard | Contagem de resultados em `role="status"` + `aria-live="polite"`; skeletons com `role="status"` e texto "Carregando…". |

---

## 2. Contraste medido (tokens de `src/styles.css`)

| Uso | Cor do texto | Fundo | Razão | Mínimo |
|---|---|---|---|---|
| Dourado de texto (claro) `--gold-ink` | oklch(0.50 0.11 75) | card branco | 6,11:1 | 4,5 |
| Dourado de texto (escuro) `--gold-ink` = `--gold` | oklch(0.78 0.14 85) | `--bg2` escuro | 8,78:1 | 4,5 |
| Dourado em seção creme (Academia) | oklch(0.46 0.10 75) | creme | 5,63:1 | 4,5 |
| Dourado em blocos escuros (`on-dark`) | oklch(0.78 0.14 85) | `--ink` | 10,25:1 | 4,5 |
| ~~Dourado antigo no claro~~ `--gold` | oklch(0.72 0.14 82) | branco | ~~2,51:1~~ | reprovava |
| `--muted-foreground` claro | oklch(0.48 0.03 252) | card branco | 6,52:1 | 4,5 |
| `--muted-foreground` escuro | oklch(0.68 0.03 252) | `--bg2` escuro | 6,17:1 | 4,5 |
| `--success` claro (texto KPI) | oklch(0.48 0.13 152) | card branco | > 5:1 | 4,5 |
| Badge "Aprovado" claro | `--success` | success/15 | 4,89:1 | 4,5 |
| Badge "Avaliado" claro / escuro | `--blue-ink` | blue-ink/15 | 5,24 / 6,07:1 | 4,5 |
| Badge "Reprovado" claro / escuro | `--error` | error/15 | 5,06 / 5,08:1 | 4,5 |
| Botão destrutivo (escuro) | oklch(0.18 0.04 258) | `--error` escuro | 6,48:1 | 4,5 |
| Texto do botão dourado | `--primary-foreground` | `--primary` | 7,49 / 9,32:1 | 4,5 |
| Anel de foco claro / escuro | `--ring` | fundo | 5,86 / 9,32:1 | 3,0 |
| Rodapé: links / copyright | ink-foreground/75 e /70 | `--ink` | 10,47 / 9,14:1 | 4,5 |
| Número dos passos (texto grande) | foreground/45 | surface-ink | 4,32:1 | 3,0 |

---

## 3. Roteiro de teste só por teclado

Pré-requisitos: mouse desconectado ou sem uso; Chrome ou Firefox; opcional NVDA (Windows) ou VoiceOver (macOS) para ouvir os anúncios.

**Teclas:** `Tab` avança · `Shift+Tab` volta · `Enter` ativa link/botão · `Espaço` ativa botão · `←/→` (e `↑/↓`) trocam abas · `Esc` fecha menu/diálogo.

### Home (`/`)
1. Carregar a página e pressionar `Tab` → aparece **"Pular para o conteúdo"** no canto superior esquerdo. ✔ Foco visível (contorno).
2. `Enter` → o foco vai para o `<main>`; o próximo `Tab` cai em **"Encontrar minha peneira"** (pulou o header).
3. Recarregar e navegar com `Tab` pelo header: logo → seções (Propósito…Parceiros) → tema → Entrar → Cadastrar. Cada item com contorno dourado visível.
4. Rolar a página com o teclado (`Espaço`/`PageDown`) até o header sumir; `Shift+Tab` até um link do header → **o header reaparece** com o foco.
5. No Hero, `Tab` até **"Pausar vídeo de fundo"** → `Enter` pausa; rótulo vira "Reproduzir vídeo de fundo".
6. Seção Legado/Academia: `Tab` chega na aba ativa; `→` troca de aba e o foco acompanha; `Tab` sai do grupo de abas (só a aba ativa é parada de Tab).
7. Filtros de peneiras: `Tab` pelo campo de busca e pelos 3 selects (anel de foco visível).
8. Parceiros: `Tab` até **"Pausar animação"** → `Enter` para a faixa.
9. Rodapé: todos os links alcançáveis; "Voltar ao topo" com `Enter` sobe a página.
10. Em 375px: `Tab` até o botão de menu → `Enter` abre ("Fechar menu de seções", `aria-expanded=true`) → links das seções → `Enter` numa seção fecha o menu e rola até ela.

### Dashboard (`/dashboard`, perfil admin/suporte)
1. `Tab` → "Pular para o conteúdo" → `Enter` → foco no conteúdo.
2. Desktop (≥ 1024px): `Tab` passa pelo menu lateral; o item atual é anunciado como "página atual".
3. Mobile (< 1024px): `Tab` até **"Abrir menu"** → `Enter` → o foco vai para o 1º item do menu → `Esc` fecha e **o foco volta ao botão**. Com o menu fechado, `Tab` **não** entra nos links escondidos.
4. Conteúdo: tema/notificações → **"Ver todas as peneiras"** → cada item de "Próximas peneiras" (links com foco visível). Os gráficos não recebem foco; no leitor de tela, cada gráfico é lido como tabela ("Inscrições mensais: Jan 120…").
5. Carregamento: ao recarregar, o leitor anuncia "Carregando painel…".

### Candidatos (`/candidatos`, perfil admin)
1. `Tab` até **"Buscar atletas"** (rótulo visível) → digitar um nome → o leitor anuncia **"N atletas encontrados de M"** (aria-live polite), sem mover o foco.
2. `Tab` até o grupo **"Filtrar por status"** → `Tab` entre Todos/Pendentes/Avaliados/Aprovados → `Espaço` seleciona (anunciado como "pressionado") → nova contagem anunciada.
3. Digitar algo sem resultado → aparece "Nenhum candidato corresponde aos filtros" → `Tab` até **"Limpar filtros"** → `Enter` restaura a lista.
4. Na lista/tabela: `Tab` pelo nome do atleta (link) → "Ver perfil de …" → "Iniciar conversa com …". Botões de candidatos sem conta aparecem desabilitados e ficam fora da tabulação.
5. Falha de rede (DevTools → Network → Offline e recarregar): aparece o alerta "Não foi possível carregar os candidatos" → `Tab` até **"Tentar novamente"** → `Enter`.
6. Em 375px a tabela vira lista de cartões, na mesma ordem de Tab.

**Resultado esperado:** nenhuma parada de Tab invisível, nenhum elemento inalcançável, foco sempre visível e nenhuma armadilha de teclado.

---

## 4. Como reproduzir a auditoria

- **Lighthouse:** Chrome DevTools → aba *Lighthouse* → modo *Navigation*, categoria *Accessibility*, dispositivo *Mobile* e *Desktop* → rodar na URL publicada (`https://pelenextgen.vercel.app/`). Meta: **≥ 90**. O Lighthouse usa o axe-core; com 0 violações do axe nas mesmas regras, a expectativa é 95–100. Registrar a nota aqui após o deploy.
- **axe DevTools** (extensão) ou, no console da página em dev: carregar `/node_modules/axe-core/axe.min.js` e rodar `await axe.run()`.
- **Viewports:** DevTools → *Toggle device toolbar* → 375 × 812, 768 × 1024 e 1280 × 800.

| Tela | Lighthouse (mobile) | Lighthouse (desktop) | Data |
|---|---|---|---|
| Home | _preencher após o deploy_ | _preencher_ | |

## Auditoria Sprint 4 — correções e checklist das telas novas

Medição de partida (produção, 21/10/2026): Lighthouse home — desktop Perf 87 / A11y 100; mobile Perf 65 / A11y 100 (LCP 6,9 s, parágrafo do Hero com 3,4 s de atraso de renderização). axe (`scripts/axe-audit.mjs`): `/`, `/login`, `/cadastro`, `/peneiras` com 0 violações; `/privacidade` e `/termos` com `link-name` no logo do cabeçalho.

| Achado | Correção |
|---|---|
| Fonte Space Grotesk bloqueava a renderização | `<link media="print">` virando `all` ao carregar (script em `__root.tsx`), mantendo `preconnect` |
| Parágrafo do Hero (LCP) começava em `opacity-0` via `<Reveal>` | `<Reveal>` removido só desse parágrafo; `prefers-reduced-motion` e o resto do Hero preservados |
| Imagens abaixo da dobra de 190–340 KB | Convertidas para WebP (máx. 1200 px, 70–180 KB) com `width`/`height`; `loading="lazy"` mantido |
| `/privacidade` e `/termos`: `link-name` | `aria-label="Pelé Next Gen, ir para a página inicial"` no link do logo |
| `/ranking`: 401 no console para visitante | A chamada a `get_athlete_leaderboard` só ocorre com sessão (a tela já exige login via `useRequireAuth`) |

### Checklist WCAG 2.1 AA — telas do fluxo concierge
Verificação por leitura do código; **a conferência com axe DevTools e teclado nas telas logadas continua pendente** (o script não faz login).

| Critério | Solicitar desbloqueio (diálogo) | Aba Desbloqueios (suporte) | Status do pedido (cards) |
|---|---|---|---|
| 1.1.1 Alternativa textual | Ícones com `aria-hidden` | Ícones com `aria-hidden` | Ícones com `aria-hidden` |
| 1.3.1 Estrutura | `DialogTitle`/`DialogDescription` (Radix) | Lista `<ul>`, `<label>` envolvendo o `Textarea` | Texto de status, não só cor |
| 1.4.1 Cor não é o único meio | Texto "pendente/liberado/recusado" | Rótulo textual de status | Idem |
| 2.1.1 / 2.4.3 Teclado e foco | Foco preso e devolvido pelo Radix; Esc fecha | Botões nativos, ordem natural | — |
| 2.5.3 Rótulo no nome | "Solicitar desbloqueio" + `sr-only` com o nome | "Aprovar"/"Recusar" + `sr-only` com o clube | — |
| 3.3.1 Erros identificados | `role="alert"` com nova tentativa | `role="alert"` com "Tentar novamente" | — |
| 4.1.3 Mensagens de status | `role="status"` na confirmação | Carregando com `role="status"` | `role="status"` |

Pendente (manual, telas com login — `/chat`, `/perfil`, `/clubes`, `/suporte`, `/candidatos`, `/peneiras/$id`): axe DevTools, Tab/Enter/Esc, foco visível, labels, `alt`, `h1` único. Itens já conhecidos do lint: `jsx-a11y/label-has-associated-control` em `src/routes/clubes.tsx` (filtros).

### Números finais
_A preencher após o deploy do PR: Lighthouse mobile e desktop da home e axe nas rotas públicas (metas: Acessibilidade ≥ 90, Performance ≥ 80, console sem erros)._
