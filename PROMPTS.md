# Uso de IA no projeto

Ferramenta: **Claude Code** (Anthropic), usada por Pedro Lucas Souza Provadelli na Sprint 4. Todo o código gerado foi revisado, compilado (`vite build`) e verificado com `tsc` antes do commit.

| # | Prompt (resumo) | Resultado | Revisão humana |
|---|---|---|---|
| 1 | Transformar o desbloqueio de contato simulado (R$ 49,99) em fluxo concierge real | Migration `solicitacoes_desbloqueio` com RLS, endpoints `unlock` (solicitar) e `resolver`, diálogo "Solicitar desbloqueio", aba Desbloqueios no suporte | Regras de papel, RLS e textos legais conferidos |
| 2 | Revisar o fluxo principal e remover botões mortos e textos "em breve" | Removido o placeholder de vídeo do manual; legenda do mapa e textos de termos/privacidade ajustados | Itens de roadmap legítimos mantidos |
| 3 | README final, `integrantes.txt` e este arquivo | Seção "Sprint 4" no README | PRs e links de Figma preenchidos pela equipe |
| 4 | Auditoria de acessibilidade e performance (fonte, Hero LCP, imagens, link-name) | Ver PR `feat/s4-a11y-auditoria` | Métricas finais medidas em produção após o deploy |
