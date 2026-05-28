import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      loja: (search.loja as string) || undefined,
    };
  },
  beforeLoad: ({ search }) => {
    // Redireciona links antigos formatados como ?loja=slug para o novo formato dinâmico /cardapio/slug
    if (search.loja && search.loja !== "insano-lanches") {
      throw redirect({
        to: "/cardapio/$slug",
        params: { slug: search.loja as string },
        replace: true,
      });
    }
    // Redireciona visitas padrão da home para a tela de Onboarding / Criação de Lojas
    throw redirect({ to: "/cadastro", replace: true });
  },
  component: () => null,
});
