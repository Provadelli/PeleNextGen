# Achados e ajustes

> As anotações de observação (tempo, erros, travamentos por tarefa) **não foram registradas**. `03-metricas.csv`
> está vazio e nada abaixo foi inventado. Os campos sem dado estão como **A PREENCHER**.

## Matriz de achados

Severidade de Nielsen: 0 (não é problema) a 4 (catástrofe de usabilidade).

| ID | Tela | Evidência | Nº de participantes | Severidade (0-4) | Proposta |
|---|---|---|---|---|---|
| A1 | A PREENCHER | A PREENCHER (sem anotações de observação) | A PREENCHER | A PREENCHER | A PREENCHER |

Dados do questionário que apontam onde olhar, sem serem achados confirmados:

- P6 (computador) teve o menor índice (75,0) e Q10 = 5 ("precisei aprender várias coisas"). Foi o único em computador.
- Nas respostas abertas, 6 de 6 não citaram problema ("Nada" ou elogio).

## Ajustes de tela (3)

**Atenção:** nenhum ajuste abaixo nasceu de um achado do teste (não há anotações de observação). São
**hipóteses, não validadas com usuários**, vindas da leitura do código. A justificativa liga cada um ao dado
disponível (aparelho dos participantes), sem afirmar que alguém tenha errado por causa disso.

| Nº | Achado | Tela | Antes | Depois | Justificativa |
|---|---|---|---|---|---|
| 1 | Hipótese H1 (não validada): botão de tema com 36 px | Barra superior no celular (T7) | antes-1.png | depois-1.png | 5 de 6 participantes usaram celular. Área de toque de 44 px reduz erro de toque; o botão passa a ser maior que o de menu vizinho (40 px). Commit 73befab |
| 2 | Hipótese H2 (não validada): selos de 9 px | Card de peneira em /peneiras (T1, T3) | antes-2.png | depois-2.png | Categoria e status são informação usada para escolher a peneira. 11 px melhora a leitura em tela pequena. Commit 4dd0c32 |
| 3 | Hipótese H3 (não validada): rótulo de 10 px | Menu lateral (todas as tarefas) | antes-3.png | depois-3.png | O rótulo informa a área do usuário (atleta, clube, olheiro). `text-xs` (12 px) é mais legível. Arquivo do Miguel (AppLayout), aviso feito. Commit 7fd6be0 |

Prints: recortes em **desktop** (a janela do navegador não encolheu para celular). ANTES no site em produção
(conta de clube) e DEPOIS no `npm run dev` (conta de atleta), por isso o rótulo do menu diz "ÁREA DO CLUBE" no
antes e "ÁREA DO ATLETA" no depois. Medidas no depois: botão de tema 44x44 px, selos 11 px, rótulo 12 px.
No antes, o botão de tema media 36x36 px em produção.

## Resumo de métricas

| Métrica | Valor |
|---|---|
| Participantes | 6 (3 atletas, 2 clubes, 1 olheiro; 5 em celular, 1 em computador) |
| Taxa de conclusão | A PREENCHER |
| Tempo médio por tarefa | A PREENCHER |
| Erros por participante | A PREENCHER |
| Travamentos | A PREENCHER |
| Índice SUS reduzido médio | 89,2 (de 0 a 100; versão de 4 afirmações, não comparável a 68) |
