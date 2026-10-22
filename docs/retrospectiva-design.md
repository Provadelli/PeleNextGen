# Retrospectiva de design — Pelé Next Gen (Sprints 1 a 4)

> O que está escrito vem do histórico do git (`git log`, 1.069 commits até 22/10/2026), dos tokens em `src/styles.css`, do primeiro design publicado e do que o grupo informou (sem Figma nas Sprints 1 e 2). Trechos em **[PREENCHER]** são opcionais e dependem de informação que o git não tem (datas e motivos das decisões).

## Linha do tempo (evidência no git)

| Data | Marco | Evidência |
|---|---|---|
| 24/04/2026 | Projeto nasce de um template (TanStack Start) e as primeiras telas e a marca (logo, cores) são geradas no mesmo dia: 60 commits em um dia, com ajustes sucessivos de logo e fundo ("Substituiu logo e trocou cores", "Corrigiu fundo do logo"…) | `git log --since=2026-04-24 --until=2026-04-25` |
| 24–25/04 | Primeiros fluxos: sistema de peneiras, fluxo de clube e perfis | mensagens "Criou sistema de peneiras", "Implementou fluxo clube e roles" |
| mai–jun/2026 | Muitos commits curtos por dia (103 em 07/05, 94 em 09/05, 129 em 15/06): iteração rápida de interface, ainda sem registro de decisões | `git log --format=%ad \| sort \| uniq -c` |
| 19/09/2026 | **Redesign da home**: Hero com vídeo, carrossel no Legado e na Academia, header transparente, fotos reais e "paleta preto/dourado". É também quando a fonte Poppins deixa de aparecer no código | commit `468cde7` |
| 22–23/09 | Novo design do dashboard e das abas Legado/Peneiras, repaginação de login e cadastro, ranking, **responsividade mobile** e ajustes de navegação | commits `a91064a` e seguintes |
| 25/09 (entrega da Sprint 3) | **Acessibilidade no sistema todo** (contraste, foco visível, tokens `--gold-ink` e `--blue-ink` para texto) | commit `6b395df` |
| 21/10 | Sprint 4, validação com usuários: 3 ajustes (botão de tema com 44px, selos do card com 11px, rótulo do menu com `text-xs`), com prints antes/depois | `docs/validacao/` |
| 22/10 | **Design system**: rota `/design-system`, tokens vivos, componentes em todos os estados, alvos de 44px | commits `feat(s4)` e `fix(s4)` |

## Como o design evoluiu

1. **Do gerado para o sistematizado.** Até setembro as telas foram sendo ajustadas por commits curtos, quase todos sem descrição ("Changes"). A Sprint 4 é a primeira vez em que existe uma página que documenta tokens e estados.
2. **Mesma identidade, outra base técnica.** O primeiro design (https://pelescout-nextgen.lovable.app/, lido em 22/10/2026) já era escuro, azul-marinho com dourado, `--radius` de 0,75rem, títulos em **Poppins** e corpo em **Inter** (`--font-display`/`--font-body` lidos da página) — exatamente o que o README descreve. O dourado `--gold` e o azul `--blue` publicados lá são os mesmos valores de hoje no tema escuro (`lab(74.68% 10.27 63.23)` e `lab(42.75% 7.54 -61.91)`). O que mudou depois: fonte (Space Grotesk), **tema claro**, tokens para texto (`*-ink`) e a home redesenhada. A divergência com o README está em `docs/design-system.md`.
3. **Da cor decorativa para a cor com função.** A acessibilidade (25/09) criou tokens específicos para texto (`--gold-ink`, `--blue-ink`), com os comentários no `styles.css` explicando o porquê (dourado claro dava ~2,5:1 sobre fundo claro). Na Sprint 4 o contraste passou a ser **medido na própria página** para cada par texto/fundo.
4. **Do desktop para o celular.** A responsividade entrou em 23/09; na Sprint 4 o critério passou a ser mensurável (sem rolagem lateral, alvo de 44px). A medição achou um defeito real: o dashboard ficava 81px mais largo que a tela de 375px porque a grade não tinha `grid-cols-1` (conteúdo cortado, escondido por `overflow-x: clip`).

## Sprints 1 e 2

- **Sem Figma.** Nas Sprints 1 e 2 o design foi feito direto em código, na plataforma Lovable; o resultado das duas sprints é a versão publicada em https://pelescout-nextgen.lovable.app/ (informação do grupo). Não houve protótipo para comparar, então "o que mudou em relação ao Figma" não se aplica.
- Características dessa versão (lidas na página em 22/10/2026): tema escuro azul-marinho com dourado, Poppins (títulos) e Inter (corpo), `--radius` 0,75rem, alternância de tema, Hero "O talento existe. Falta a oportunidade.", cartão da próxima peneira, menu Propósito · Legado · Academia · Como funciona · Peneiras · Mapa · Parceiros. Print: `docs/design-system/primeiro-design-lovable-1280.jpg`.
- No git, esse período corresponde aos commits do bot do Lovable (997 de 1.069 commits), de 24/04/2026 em diante.
- **Decisão de cores (informada pelo grupo):** dourado e azul foram escolhidos pelo aspecto futebolístico da marca.
- **Datas das sprints (informadas pelo grupo):** Sprint 1 em 27/04/2026, Sprint 2 em 22/06/2026, Sprint 3 em 25/09/2026 e Sprint 4 com encerramento em 25/10/2026. Cruzando com o git: o grosso do design inicial (24–25/04) vem antes da entrega da Sprint 1, e as 129 mudanças de 15/06 e os commits de 21–22/06 ficam na janela da Sprint 2.
- **Não registrado:** o motivo da escolha de Poppins/Inter.

## Sprint 3 e 4 — o que o histórico confirma

- **Sprint 3:** acessibilidade WCAG 2.1 AA documentada em `docs/acessibilidade.md` (Miguel). Na janela da sprint (22/06 a 25/09) o git registra o redesenho da home (19/09), o novo dashboard, login/cadastro, ranking e a responsividade mobile (22–23/09).
- **Sprint 4:** validação com usuários e 3 ajustes pós-teste (Vitor); auditoria axe sem violações nas telas novas (Miguel); design system e responsividade (Arthur).

## O que aprendemos

- Tokens semânticos (`--primary`, `--ring`, `--card`) permitiram ter tema claro e escuro sem reescrever componentes; sempre que uma cor foi escrita fixa (`text-white`, `text-slate-50`) ela apareceu depois como falha de contraste.
- Documentar a rota com os **componentes reais** (e não classes copiadas, como era a `/demo-componentes`) expõe o que não é consistente: foco `ring-1` × `ring-2`, falta de hover nos campos, componente de sucesso inexistente no `Alert`.
- Medir antes de afirmar: o contraste `--accent-foreground`/`--accent` (3,44:1) só apareceu quando a página passou a calcular a razão.

## O que fica para depois

- Decidir um tom de `--accent` com contraste ≥ 4,5:1 com texto branco.
- Unificar foco (`ring-2`) e dar hover aos campos.
- Criar variante de sucesso no `Alert` e `Badge`.
- Atualizar a seção "Design System" do README (texto proposto em `docs/design-system.md`).
