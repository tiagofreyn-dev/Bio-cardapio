import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Store, 
  DollarSign, 
  Gift, 
  Trophy, 
  ShieldCheck, 
  TrendingUp, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Smartphone, 
  ShoppingBag,
  ExternalLink,
  MessageSquare
} from "lucide-react";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      loja: (search.loja as string) || undefined,
    };
  },
  component: LandingPage,
});

function LandingPage() {
  const [isMasterLoggedIn, setIsMasterLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const masterAuth = sessionStorage.getItem("insano.master.auth");
      const masterEmail = sessionStorage.getItem("insano.master.email");
      if (masterAuth === "true" && masterEmail) {
        setIsMasterLoggedIn(true);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden selection:bg-indigo-500/35 selection:text-white relative">
      {/* Dynamic colorful blur backgrounds */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[40vh] right-1/4 translate-x-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none z-0" />

      {/* Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/60 border-b border-zinc-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center border border-indigo-400/20 text-white shadow-lg shadow-indigo-500/10">
            <Store className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            Bio-Cardápio
          </span>
        </div>

        <nav className="flex items-center gap-4">
          <Link
            to="/admin"
            className="h-9 px-4 rounded-xl hover:bg-zinc-900 text-zinc-300 hover:text-white font-bold text-xs flex items-center justify-center transition active:scale-95 border border-transparent hover:border-zinc-800"
          >
            Área do Lojista 🏪
          </Link>

          <Link
            to="/cadastro"
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-indigo-500/10"
          >
            <span>Criar Meu Cardápio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {isMasterLoggedIn && (
            <Link
              to="/master-admin"
              className="h-9 px-3.5 rounded-xl bg-red-950/30 border border-red-900/30 hover:bg-red-500 hover:text-black text-red-400 font-extrabold text-xs flex items-center justify-center gap-1 transition duration-150"
              title="Acesso Rápido Dono da Plataforma"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Painel Master</span>
            </Link>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Hero Left Content */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 text-[10px] font-black uppercase tracking-wider animate-pulse mx-auto lg:mx-0">
            <Sparkles className="w-3 h-3" />
            <span>SaaS Multi-tenant Genérico</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Tenha seu próprio <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400">Cardápio Digital</span> no WhatsApp!
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
            Esqueça taxas abusivas de aplicativos de entrega! Crie um catálogo profissional para o seu negócio, personalize as cores do seu tema e receba pedidos organizados de forma instantânea diretamente no WhatsApp.
          </p>

          {/* Highlights Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl text-left pt-2 mx-auto lg:mx-0">
            {[
              "Sem comissões por pedido",
              "Taxas de entrega por região",
              "Programa de Fidelidade integrado",
              "Sorteios e campanhas de cupons",
              "Açaí, pizzaria, hambúrguer e outros",
              "Recebimento de PIX na hora"
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5 text-xs font-semibold text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
            <Link
              to="/cadastro"
              className="w-full sm:w-auto h-13 px-8 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-lg shadow-indigo-500/15"
            >
              <span>Começar Agora — R$ 99,90/mês</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/cardapio/insano-lanches"
              className="w-full sm:w-auto h-13 px-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 hover:text-white font-extrabold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <span>Visualizar Demonstração</span>
              <ExternalLink className="w-4 h-4 text-zinc-500" />
            </Link>
          </div>
        </div>

        {/* Hero Right: Pure Tailwind CSS Mobile Smartphone Mockup */}
        <div className="lg:col-span-5 flex items-center justify-center relative select-none">
          {/* Subtle neon drop shadow behind phone */}
          <div className="absolute inset-0 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

          {/* Phone chassis */}
          <div className="w-[280px] h-[550px] rounded-[42px] border-[7px] border-zinc-800 bg-zinc-950 shadow-2xl relative flex flex-col ring-4 ring-zinc-800/20 shrink-0">
            {/* Phone Notch/Island */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-3 bg-zinc-800 rounded-full z-30" />

            {/* Mock Screen Content */}
            <div className="flex-1 flex flex-col rounded-[35px] overflow-hidden bg-zinc-950 text-[10px] text-zinc-100 relative">
              {/* Mock Status Bar */}
              <div className="h-5 bg-zinc-950 text-zinc-500 px-5 flex items-center justify-between text-[7px] font-black tracking-wider select-none shrink-0 pt-1">
                <span>09:41</span>
                <span>📶 🔋</span>
              </div>

              {/* Mock Store Header Banner */}
              <div className="h-16 bg-gradient-to-r from-violet-950/80 to-indigo-950/80 relative flex items-end p-2 border-b border-zinc-900/60 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-violet-500/40 flex items-center justify-center shrink-0 text-xs">
                    🍨
                  </div>
                  <div>
                    <span className="font-extrabold text-white text-[9px] block">Açaí Tropical Delivery</span>
                    <span className="text-[7px] text-emerald-400 block font-bold">🟢 Aberto Agora</span>
                  </div>
                </div>
              </div>

              {/* Mock Promo Message */}
              <div className="bg-violet-500/10 border-b border-violet-500/20 text-center py-1 text-[7px] font-bold text-violet-400">
                ✨ Cupom GANHE10 ativo: 10% Off acima de R$ 50,00!
              </div>

              {/* Mock Content Body */}
              <div className="flex-1 p-3 space-y-3 overflow-hidden select-none">
                {/* Mock Stamp Loyalty Program Card */}
                <div className="bg-zinc-900/80 border border-zinc-850 p-2.5 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-[7px] font-bold">
                    <span className="text-indigo-400">Cartão Fidelidade Açaí</span>
                    <span className="text-zinc-400">4/10</span>
                  </div>
                  <div className="flex justify-between gap-1 pt-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((stamp) => (
                      <div 
                        key={stamp} 
                        className={`w-4 h-4 rounded-full border flex items-center justify-center text-[6px] ${
                          stamp <= 4 
                            ? "bg-gradient-to-tr from-indigo-500 to-violet-500 border-indigo-400/20 text-white font-black" 
                            : "bg-zinc-950 border-zinc-850 text-zinc-600"
                        }`}
                      >
                        {stamp <= 4 ? "✓" : stamp}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock Categories Filter */}
                <div className="flex gap-1.5">
                  <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold text-[7px]">🍧 Açaí</span>
                  <span className="bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded-full font-bold text-[7px] border border-zinc-850">🥤 Bebidas</span>
                  <span className="bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded-full font-bold text-[7px] border border-zinc-850">🍧 Adicionais</span>
                </div>

                {/* Mock Product Card */}
                <div className="bg-zinc-900/40 border border-zinc-850/60 p-2 rounded-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-base shrink-0">
                    🍧
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-extrabold text-[8px] text-zinc-100 block">Açaí Premium 500ml</span>
                    <span className="text-[6px] text-zinc-400 block line-clamp-1">Granola, leite condensado, morango e banana...</span>
                    <span className="text-indigo-400 font-black mt-0.5 block">R$ 22,00</span>
                  </div>
                </div>

                {/* Mock Product Card 2 */}
                <div className="bg-zinc-900/40 border border-zinc-850/60 p-2 rounded-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-base shrink-0">
                    🍧
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-extrabold text-[8px] text-zinc-100 block">Barca de Açaí Especial</span>
                    <span className="text-[6px] text-zinc-400 block line-clamp-1">Barca completa com kiwi, uva, morango e creme.</span>
                    <span className="text-indigo-400 font-black mt-0.5 block">R$ 45,00</span>
                  </div>
                </div>
              </div>

              {/* Mock Cart Drawer Floating Overlay */}
              <div className="absolute inset-x-2 bottom-2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl p-2 flex items-center justify-between text-[7px] font-black shadow-md border border-indigo-400/20">
                <div className="flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  <span className="text-zinc-200">1 item selecionado</span>
                </div>
                <span className="text-white text-[8px] bg-black/20 px-2.5 py-0.5 rounded-lg">R$ 22,00 &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 py-20 border-t border-zinc-900">
        <div className="text-center space-y-3 max-w-xl mx-auto mb-16">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">Recursos Completos para o seu Crescimento</h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            Tudo o que sua lanchonete, pizzaria ou comércio precisa em um só lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-900/40 border border-zinc-850 p-6 rounded-2xl space-y-4 hover:border-indigo-500/20 transition duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-black transition">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-white">Pedidos Scoped no WhatsApp</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Os clientes escolhem produtos e adicionais no cardápio interativo e mandam o carrinho já somado e formatado no seu WhatsApp.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-850 p-6 rounded-2xl space-y-4 hover:border-indigo-500/20 transition duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-black transition">
              <DollarSign className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-white">PIX Direto & Sem Taxas</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Insira a chave PIX do seu comércio e o cliente visualizará a chave copia-e-cola na finalização do pedido. O dinheiro cai direto na sua conta!
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-850 p-6 rounded-2xl space-y-4 hover:border-indigo-500/20 transition duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-black transition">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-white">Faturamento & Métricas</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dashboard administrativa robusta com gráficos de desempenho diários e mensais para acompanhar seus ganhos em tempo real.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-850 p-6 rounded-2xl space-y-4 hover:border-indigo-500/20 transition duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-black transition">
              <Trophy className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-white">Fidelidade Liga/Desliga</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dê prêmios por carimbos recorrentes acumulados. Se preferir não oferecer fidelidade, desative nas configurações com um só clique.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-850 p-6 rounded-2xl space-y-4 hover:border-indigo-500/20 transition duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-black transition">
              <Gift className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-white">Campanhas & Sorteios</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Crie sorteios com prêmios cadastrados. O sistema gera automaticamente Números da Sorte para clientes que compram acima de um valor mínimo.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-850 p-6 rounded-2xl space-y-4 hover:border-indigo-500/20 transition duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-black transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-white">Cobrança Flexível Master</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sistema inteligente de paywall. O administrador master da plataforma decide reativamente se a cobrança é automática (SaaS) ou manual.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing / Call-to-action */}
      <section className="relative z-10 max-w-5xl mx-auto w-full px-6 py-20">
        <div className="bg-gradient-to-r from-zinc-900 via-indigo-950/20 to-zinc-900 border border-indigo-500/20 rounded-3xl p-8 md:p-12 text-center space-y-6 relative overflow-hidden shadow-xl">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/25">
              Valor Fixo & Transparente
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight pt-2">Apenas R$ 99,90/mês</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Sem taxas escondidas. Sem comissão por pedidos. Setup em menos de 3 minutos. Crie sua conta e comece a vender ainda hoje!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/cadastro"
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] shadow-md shadow-indigo-500/15"
            >
              <span>Criar Meu Cardápio Grátis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/admin"
              className="w-full sm:w-auto h-12 px-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 hover:text-white font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
            >
              <span>Acessar Meu Painel</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-500 space-y-2 relative z-10 max-w-7xl mx-auto w-full px-6">
        <p>© 2026 Bio-Cardápio SaaS — O melhor e mais leve cardápio digital multi-tenant do mercado.</p>
        <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-600">
          <Link to="/admin" className="hover:text-zinc-400 transition font-semibold">Painel Administrativo</Link>
          <span>•</span>
          <Link to="/cadastro" className="hover:text-zinc-400 transition font-semibold">Criar Conta</Link>
          <span>•</span>
          <Link to="/cardapio/insano-lanches" className="hover:text-zinc-400 transition font-semibold">Demonstração</Link>
        </div>
      </footer>
    </div>
  );
}
