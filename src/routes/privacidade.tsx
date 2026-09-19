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
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: 19 de setembro de 2026</p>

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
                <strong>Conta e perfil:</strong> nome, e-mail, foto, posição, cidade/estado, data de
                nascimento, altura, peso, histórico de clubes e vídeos que você envia.
              </li>
              <li>
                <strong>Login social (Google):</strong> se você entra com sua Conta Google, recebemos seu
                nome, e-mail e foto de perfil públicos, fornecidos pelo próprio Google.
              </li>
              <li>
                <strong>Avaliações:</strong> notas técnicas, físicas, táticas e comentários registrados
                por olheiros credenciados durante peneiras.
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
              <li>Registrar e mostrar sua evolução técnica ao longo do tempo;</li>
              <li>Viabilizar o chat entre atletas, olheiros e clubes;</li>
              <li>Sincronizar métricas de atividade física quando você conecta um wearable;</li>
              <li>Melhorar a segurança e o funcionamento da plataforma.</li>
            </ul>
            <p className="mt-2">Não vendemos seus dados pessoais a terceiros.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">
              4. Uso de dados do Google (login e Google Fit)
            </h2>
            <p className="mt-2">
              Ao entrar com sua Conta Google, usamos apenas seu nome, e-mail e foto para criar/autenticar
              sua conta. Ao conectar o Google Fit, solicitamos acesso de leitura a atividade física,
              frequência cardíaca e localização de treino (distância/velocidade) — nunca gravamos ou
              alteramos dados na sua Conta Google, apenas lemos. O uso dessas informações pelo Pelé Next
              Gen segue esta política e a{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                Política de Dados de Usuário dos Serviços de API do Google
              </a>
              , incluindo os requisitos de Uso Limitado.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">5. Compartilhamento</h2>
            <p className="mt-2">
              Clubes só têm acesso a vídeos, perfil completo e chat de um atleta depois de desbloquear o
              contato dele na plataforma. Olheiros veem os dados necessários para conduzir avaliações nas
              peneiras em que atuam. Não compartilhamos seus dados com terceiros fora da plataforma, exceto
              quando exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">6. Seus direitos</h2>
            <p className="mt-2">
              Você pode acessar, corrigir ou excluir seus dados a qualquer momento pelo seu perfil, ou
              solicitando a exclusão da sua conta pelo suporte. Você pode desconectar o Google Fit a
              qualquer momento, o que interrompe imediatamente a coleta de novos dados de atividade física.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">7. Segurança</h2>
            <p className="mt-2">
              Os dados são armazenados com controle de acesso por perfil (Row Level Security) e conexões
              criptografadas. O acesso a dados sensíveis é restrito à equipe técnica responsável pela
              operação da plataforma.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">8. Contato</h2>
            <p className="mt-2">
              Dúvidas sobre esta política ou sobre seus dados podem ser enviadas para{" "}
              <a href="mailto:pedroprovadelli@gmail.com" className="text-primary underline">
                pedroprovadelli@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
