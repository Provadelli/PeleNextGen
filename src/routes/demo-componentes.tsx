import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * A documentação visual de componentes migrou para o styleguide em /design-system,
 * que usa os componentes reais em vez de classes copiadas.
 */
export const Route = createFileRoute("/demo-componentes")({
  beforeLoad: () => {
    throw redirect({ to: "/design-system", replace: true });
  },
});
