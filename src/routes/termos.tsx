import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Pelé Next Gen" },
      {
        name: "description",
        content: "Termos de uso da plataforma Pelé Next Gen.",
      },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <Link to="/">
          <Logo />
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Termos de Uso</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: 19 de setembro de 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90 sm:text-base">
          <section>
            <h2 className="font-display text-xl font-bold text-foreground">1. Aceitação</h2>
            <p className="mt-2">
              Ao criar uma conta ou usar o Pelé Next Gen, você concorda com estes Termos de Uso e com a{" "}
              <Link to="/privacidade" className="text-primary underline">
                Política de Privacidade
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">2. Quem pode usar</h2>
            <p className="mt-2">
              A plataforma é destinada a atletas, olheiros/administradores de peneiras e clubes. Cada
              papel tem áreas e permissões específicas. Cadastros de olheiro e clube passam por aprovação
              antes de ficarem ativos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">3. Sua conta</h2>
            <p className="mt-2">
              Você é responsável por manter a confidencialidade da sua senha e por todas as atividades
              feitas na sua conta. Informações de cadastro (idade, posição, cidade etc.) devem ser
              verdadeiras.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">4. Conteúdo enviado</h2>
            <p className="mt-2">
              Vídeos, fotos e informações de perfil enviados por você continuam sendo seus. Ao publicá-los
              na plataforma, você autoriza que sejam exibidos para olheiros e clubes conforme as regras de
              desbloqueio de contato descritas na Política de Privacidade.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">
              5. Conexão com Google Fit e outros serviços
            </h2>
            <p className="mt-2">
              A conexão com Google Fit é opcional. Ao conectar, você autoriza a leitura de dados de
              atividade física para exibição no seu perfil. Você pode revogar esse acesso a qualquer
              momento, pela plataforma ou diretamente na sua Conta Google.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">6. Conduta</h2>
            <p className="mt-2">
              É proibido usar a plataforma para assédio, discurso de ódio, fraude (incluindo informações
              falsas em avaliações ou perfis) ou qualquer atividade ilegal. Contas que violarem estas
              regras podem ser suspensas ou removidas.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">7. Pagamentos (clubes)</h2>
            <p className="mt-2">
              Clubes podem pagar para desbloquear o contato de atletas avaliados. Os valores e a forma de
              cobrança são informados no momento da compra, dentro da plataforma.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">8. Alterações</h2>
            <p className="mt-2">
              Podemos atualizar estes termos periodicamente. Mudanças relevantes serão comunicadas na
              plataforma.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground">9. Contato</h2>
            <p className="mt-2">
              Dúvidas sobre estes termos podem ser enviadas para{" "}
              <a href="mailto:suportepelenextgen@hotmail.com" className="text-primary underline">
                suportepelenextgen@hotmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
