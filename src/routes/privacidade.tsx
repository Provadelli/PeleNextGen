import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Pelé Next Gen" },
      {
        name: "description",
        content: "Como o Pelé Next Gen coleta, usa e protege os dados dos usuários da plataforma.",
      },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <Link to="/">
          <Logo />
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: 23 de setembro de 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90 sm:text-base">
          <section>
            <h2 className="font-display text-xl font-bold text-foreground">1. Quem somos</h2>
            <p className="mt-2">
              O Pelé Next Gen ("nós", "nosso") é uma plataforma que conecta atletas, olheiros e clubes
              para organização e avaliação de peneiras de futebol. Esta política explica quais dados
              coletamos, como usamos e quais direitos você tem sobre eles.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">2. Dados que coletamos</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Conta e perfil:</strong> nome, e-mail, celular, foto, posição, cidade/estado,
                data de nascimento, altura, peso, pé preferencial, histórico de clubes e vídeos que você
                envia.
              </li>
              <li>
                <strong>Login social (Google):</strong> se você entra com sua Conta Google, recebemos seu
                nome, e-mail e foto de perfil públicos, fornecidos pelo próprio Google.
              </li>
              <li>
                <strong>Avaliações:</strong> notas técnicas, físicas, táticas, comentários e a decisão
                (aprovado ou reprovado) registrados por olheiros credenciados. Quando o olheiro não marca
                a decisão, ela é definida automaticamente pela nota geral da avaliação.
              </li>
              <li>
                <strong>Dados de dispositivos vestíveis (opcional):</strong> se você conectar um
                dispositivo via Google Fit, sincronizamos passos, distância, frequência cardíaca e
                minutos ativos dos últimos dias, apenas enquanto a conexão estiver ativa. Você pode
                desconectar a qualquer momento no seu perfil.
              </li>
              <li>
                <strong>Uso da plataforma:</strong> mensagens de chat entre atletas/clubes/olheiros,
                presença online e notificações.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">3. Como usamos seus dados</h2>
            <p className="mt-2">Usamos os dados coletados para:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Organizar peneiras e permitir sua inscrição;</li>
              <li>Exibir seu perfil esportivo para olheiros e clubes que você autorizar;</li>
              <li>
                Disponibilizar seus dados de contato (e-mail e celular) a clubes quando você for
                aprovado em uma avaliação, conforme a seção 5;
              </li>
              <li>Registrar e mostrar sua evolução técnica ao longo do tempo;</li>
              <li>Viabilizar o chat entre atletas, olheiros e clubes;</li>
              <li>Sincronizar métricas de atividade física quando você conecta um wearable;</li>
              <li>Melhorar a segurança e o funcionamento da plataforma.</li>
            </ul>
            <p className="mt-2">
              Não vendemos seus dados pessoais a terceiros. A taxa cobrada dos clubes remunera o serviço
              da plataforma de intermediação — seus dados de contato só são liberados a clubes
              cadastrados e verificados, para a finalidade descrita na seção 5.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">
              4. Uso de dados do Google (login e Google Fit)
            </h2>
            <p className="mt-2">
              Ao entrar com sua Conta Google, usamos apenas seu nome, e-mail e foto (escopos{" "}
              <code>userinfo.email</code>, <code>userinfo.profile</code> e <code>openid</code>) para
              criar/autenticar sua conta. Essa conexão de login é obrigatória para usar a plataforma com
              Google.
            </p>
            <p className="mt-2">
              A conexão com o Google Fit é totalmente opcional e separada do login, feita a partir do seu
              perfil. Ao conectar, solicitamos três escopos de leitura específicos:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <code>fitness.activity.read</code>: passos, distância percorrida e minutos ativos, exibidos
                no seu perfil de atleta.
              </li>
              <li>
                <code>fitness.heart_rate.read</code>: frequência cardíaca registrada durante treinos,
                exibida no seu perfil de atleta.
              </li>
              <li>
                <code>fitness.location.read</code>: velocidade e distância de rotas de treino, exibidas no
                seu perfil de atleta.
              </li>
            </ul>
            <p className="mt-2">
              Esses dados de atividade física ficam visíveis apenas no seu próprio perfil e para
              olheiros/clubes que já têm acesso ao seu perfil pelas regras da seção 5. Nunca gravamos,
              alteramos ou excluímos dados na sua Conta Google — o acesso é somente leitura. Você pode
              revogar a conexão a qualquer momento pelo seu perfil na plataforma ou diretamente em{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                myaccount.google.com/permissions
              </a>
              ; a revogação interrompe imediatamente a coleta de novos dados e não afeta seu login. O uso
              dessas informações pelo Pelé Next Gen segue esta política e a{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                Política de Dados de Usuário dos Serviços de API do Google
              </a>
              , incluindo os requisitos de Uso Limitado (Limited Use): os dados do Google Fit não são
              usados para publicidade, não são vendidos, e só são acessados por pessoas humanas quando
              necessário para suporte, segurança ou cumprimento legal.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">5. Compartilhamento</h2>
            <p className="mt-2">
              Clubes só têm acesso a vídeos, perfil completo e chat de um atleta depois de desbloquear o
              contato dele na plataforma. Olheiros veem os dados necessários para conduzir avaliações nas
              peneiras em que atuam. Não compartilhamos, vendemos nem alugamos seus dados pessoais a
              terceiros fora da plataforma para fins de marketing ou publicidade. Podemos divulgar dados
              quando exigido por lei, ordem judicial ou para proteger direitos, segurança e propriedade da
              plataforma e de seus usuários.
            </p>

            <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <h3 className="font-display text-base font-bold text-foreground">
                5.1. Dados de contato de atletas aprovados
              </h3>
              <p className="mt-2">
                Ao se cadastrar como atleta, você está ciente e concorda que, se for{' '}
                <strong>aprovado por um olheiro</strong> em uma avaliação, seu perfil esportivo (nome,
                foto, posição, cidade, idade, nota e habilidades) passa a ser listado para{' '}
                <strong>clubes cadastrados e aprovados pela plataforma</strong>. Após o pagamento da
                taxa de desbloqueio pelo clube, ele passa a ter acesso aos seus{' '}
                <strong>dados de contato: e-mail e celular</strong>, e poderá também iniciar uma
                conversa com você pelo chat.
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <strong>Finalidade:</strong> exclusivamente contato para oportunidades esportivas
                  (testes, convites e propostas). O clube não pode usar esses dados para publicidade
                  nem repassá-los a terceiros.
                </li>
                <li>
                  <strong>Base legal:</strong> execução do serviço contratado ao aceitar estes termos
                  (art. 7º, V, da LGPD) e, para menores de 18 anos, consentimento do responsável legal
                  (art. 14 da LGPD).
                </li>
                <li>
                  <strong>Registro:</strong> guardamos quais clubes desbloquearam seu contato e quando.
                  Você pode solicitar essa lista a qualquer momento.
                </li>
                <li>
                  <strong>Seu controle:</strong> você pode pedir a remoção da sua listagem para clubes
                  ou a exclusão dos seus dados pelos canais da seção 10. Clubes que já desbloquearam seu
                  contato serão notificados para descartá-lo.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">
              6. Provedores de infraestrutura (subprocessadores)
            </h2>
            <p className="mt-2">
              Usamos os seguintes provedores para operar a plataforma, cada um com suas próprias políticas
              de segurança e privacidade:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Supabase</strong> — banco de dados, autenticação e armazenamento de arquivos.
              </li>
              <li>
                <strong>Cloudflare</strong> — hospedagem da aplicação web (Cloudflare Workers).
              </li>
              <li>
                <strong>Google (Fitness API)</strong> — leitura de dados de atividade física, apenas para
                usuários que optarem por conectar o Google Fit.
              </li>
            </ul>
            <p className="mt-2">
              Esses provedores processam dados em nosso nome, sob contrato, e não têm permissão para usar
              seus dados para fins próprios.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">7. Retenção de dados</h2>
            <p className="mt-2">
              Mantemos seus dados de conta e perfil enquanto sua conta estiver ativa. Dados de atividade
              física do Google Fit são armazenados apenas enquanto a conexão estiver ativa e são apagados
              quando você desconecta o Google Fit ou exclui sua conta. Ao solicitar a exclusão da conta,
              removemos ou anonimizamos seus dados pessoais em um prazo razoável, exceto quando a retenção
              for exigida por lei (por exemplo, obrigações fiscais ou contábeis).
            </p>
          </section>

          <section>
            <h2 id="cookies" className="font-display text-xl font-bold text-foreground">8. Cookies e tecnologias similares</h2>
            <p className="mt-2">
              Usamos cookies e armazenamento local do navegador apenas para manter sua sessão autenticada e
              lembrar preferências de interface (como tema claro/escuro). Não usamos cookies de
              rastreamento publicitário de terceiros.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">9. Privacidade de menores</h2>
            <p className="mt-2">
              Atletas menores de idade podem usar a plataforma para participar de peneiras, sob
              responsabilidade de um responsável legal ou do clube/olheiro que os cadastra. Não coletamos
              intencionalmente dados de crianças fora do contexto de cadastro esportivo supervisionado. A
              conexão opcional com o Google Fit segue as mesmas regras de consentimento explícito descritas
              na seção 4.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">10. Seus direitos</h2>
            <p className="mt-2">
              Nos termos da Lei Geral de Proteção de Dados (LGPD), você pode acessar, corrigir, portar ou
              excluir seus dados a qualquer momento pelo seu perfil, ou solicitando a exclusão da sua conta
              pelo suporte. Você pode desconectar o Google Fit a qualquer momento, o que interrompe
              imediatamente a coleta de novos dados de atividade física.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">11. Segurança</h2>
            <p className="mt-2">
              Os dados são armazenados com controle de acesso por perfil (Row Level Security) e conexões
              criptografadas (HTTPS/TLS). O acesso a dados sensíveis é restrito à equipe técnica responsável
              pela operação da plataforma.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">12. Alterações a esta política</h2>
            <p className="mt-2">
              Podemos atualizar esta política periodicamente para refletir mudanças na plataforma ou na
              legislação. A data da última atualização é sempre exibida no topo desta página. Mudanças
              relevantes serão comunicadas na plataforma.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">13. Contato</h2>
            <p className="mt-2">
              Dúvidas sobre esta política ou sobre seus dados podem ser enviadas para{" "}
              <a href="mailto:pelenextgen@hotmail.com" className="text-primary underline">
                pelenextgen@hotmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
