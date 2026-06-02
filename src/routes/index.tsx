import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  Clock,
  Percent,
  Smartphone,
  ChevronDown
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
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden selection:bg-teal-500/35 selection:text-white relative">
      {/* Dynamic colorful blur backgrounds */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[40vh] right-1/4 translate-x-1/2 w-[400px] h-[400px] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none z-0" />

      {/* Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/60 border-b border-zinc-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition">
          <img src="/logo-completa.png" alt="RangoClick Logo" className="h-10 sm:h-12 w-auto object-contain" />
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to="/admin"
            className="h-9 px-4 rounded-xl hover:bg-zinc-900 text-zinc-300 hover:text-white font-bold text-xs flex items-center justify-center transition active:scale-95 border border-transparent hover:border-zinc-800"
          >
            Área do Lojista 🏪
          </Link>

          <Link
            to="/cadastro"
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-teal-500/10"
          >
            <span>Criar Meu Cardápio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      {/* BLOCO 1: DOBRA PRINCIPAL - O TOPO DA PÁGINA */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Hero Left Content */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/25 text-[10px] font-black uppercase tracking-wider animate-pulse mx-auto lg:mx-0">
            <Sparkles className="w-3 h-3 animate-spin" />
            <span>Modernize seu delivery hoje mesmo.</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Transforme o Instagram e o WhatsApp do seu restaurante em uma <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400">máquina de vendas</span> com um Cardápio Digital Ultra-Moderno.
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
            Esqueça PDFs pesados e sistemas lentos. Tenha um site rápido, com fotos em altíssima resolução, sorteios integrados e controle total do seu faturamento.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
            <Link
              to="/cadastro"
              className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-black text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-lg shadow-teal-500/15"
            >
              <span>👉 QUERO CRIAR MEU CARDÁPIO GRÁTIS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-xs text-zinc-500 font-semibold pt-1">
            🔒 Teste grátis por 7 dias • Não pede cartão de crédito • Pronto em 10 minutos.
          </p>
        </div>

        {/* Hero Right: iPhone Mockup with User Screenshot */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative select-none">
          <div className="absolute inset-0 bg-teal-550/5 blur-[80px] rounded-full pointer-events-none" />

          {/* Phone chassis */}
          <div className="w-[300px] h-[600px] rounded-[48px] border-[10px] border-zinc-800 bg-zinc-950 shadow-2xl relative flex flex-col ring-4 ring-zinc-800/20 shrink-0 overflow-hidden text-left font-sans group">
            {/* Phone Notch/Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-850 rounded-full z-30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-800/80 mr-2" />
              <div className="w-1 h-1 rounded-full bg-zinc-900 border border-zinc-800/80" />
            </div>

            {/* Real Screenshot Preview Rendering inside phone chassis */}
            <div className="flex-1 rounded-[38px] overflow-hidden bg-zinc-950 relative z-10 border-t border-zinc-900 flex flex-col text-white">
              <img 
                src="/preview-real.jpg" 
                alt="RangoClick Real Mockup Preview" 
                className="w-full h-full object-cover object-top select-none pointer-events-none group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
          </div>
          
          {/* Action indicator for mobile screen */}
          <span className="text-[10px] text-zinc-500 font-extrabold mt-3 tracking-wide bg-zinc-900/60 border border-zinc-800/60 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
            📱 Exemplo de Cardápio Digital (Demonstração Real)
          </span>
        </div>
      </section>

      {/* BLOCO 2: A QUEBRA DE OBJEÇÃO IMEDIATA (ÍCONES) */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12 border-t border-b border-zinc-900/80 bg-zinc-900/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">⚡ Carregamento Ultra-Rápido</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Seu cliente não perde tempo esperando o cardápio abrir.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">🚫 Zero Taxas por Pedido</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">O lucro do seu restaurante é 100% seu, sem comissões.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">📱 Direto no Navegador</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">O cliente não precisa baixar nenhum aplicativo para pedir.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 3: OS DIFERENCIAIS QUE NENHUM CONCORRENTE TEM */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 py-20">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
          <h3 className="text-3xl font-black tracking-tight text-white">Por que os restaurantes mais modernos estão mudando para a nossa plataforma?</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-zinc-900/30 border border-zinc-850 p-6 rounded-2xl space-y-3 hover:border-teal-500/20 transition duration-200">
            <span className="text-3xl">📸</span>
            <h4 className="font-extrabold text-base text-white">Fotos em Altíssima Resolução (Sem travar)</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <strong>O cliente come com os olhos.</strong> Nosso sistema suporta <strong>fotos profissionais em alta definição</strong> que carregam <strong>instantaneamente</strong>, sem travar o celular do seu cliente.
            </p>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-850 p-6 rounded-2xl space-y-3 hover:border-teal-500/20 transition duration-200">
            <span className="text-3xl">🎉</span>
            <h4 className="font-extrabold text-base text-white">Sorteios Automáticos Integrados</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <strong>Faça sorteios e promoções</strong> diretamente no seu cardápio. A ferramenta perfeita para <strong>bombar seu Instagram</strong> e <strong>fidelizar clientes</strong> toda semana.
            </p>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-850 p-6 rounded-2xl space-y-3 hover:border-teal-500/20 transition duration-200">
            <span className="text-3xl">📊</span>
            <h4 className="font-extrabold text-base text-white">Painel de Faturamento Inteligente</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <strong>Chega de planilhas bagunçadas.</strong> Monitore as vendas do dia, da semana ou do mês com <strong>gráficos simples e limpos</strong> na palma da sua mão.
            </p>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-850 p-6 rounded-2xl space-y-3 hover:border-teal-500/20 transition duration-200">
            <span className="text-3xl">🔗</span>
            <h4 className="font-extrabold text-base text-white">Link 100% Personalizado</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <strong>Passe mais autoridade</strong> para o seu negócio. Tenha um <strong>link limpo, curto e profissional</strong> (ex: <span className="text-teal-400 font-bold">bio-cardapio.com.br/nome-do-seu-delivery</span>), feito exclusivamente para o seu restaurante.
            </p>
          </div>
        </div>
      </section>

      {/* BLOCO 4: SEÇÃO DE PREÇO TRANSPARENTE */}
      <section className="relative z-10 max-w-4xl mx-auto w-full px-6 py-16 border-t border-zinc-900">
        <div className="text-center space-y-3 max-w-xl mx-auto mb-12">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Quanto custa ter o delivery mais moderno da sua região?</h3>
          <p className="text-xs sm:text-sm text-zinc-450 font-semibold">Sem pegadinhas, sem contratos de fidelidade e sem letras miúdas.</p>
        </div>

        <div className="bg-gradient-to-r from-zinc-900 via-teal-950/20 to-zinc-900 border border-teal-500/30 rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

          <div className="space-y-4">
            <h4 className="font-black text-xl text-teal-400 uppercase tracking-widest">Plano Completo</h4>
            <div className="space-y-3">
              {/* Line 1: 0 nos primeiros 7 dias */}
              <span className="text-2xl md:text-3xl font-extrabold block text-white">
                R$ 0 nos primeiros 7 dias
              </span>
              
              {/* Line 2: transition text 'depois' */}
              <span className="text-[10px] md:text-xs text-zinc-400 font-extrabold uppercase tracking-widest block pt-1">
                depois
              </span>

              {/* Line 3: 3,30 por dia */}
              <div className="py-1">
                <span className="text-5xl md:text-6xl font-black block text-teal-400">
                  R$ 3,30 <span className="text-lg md:text-2xl font-normal text-teal-300/80">por dia</span>
                </span>
              </div>

              {/* Line 4: transparency statement in white */}
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide block max-w-xl mx-auto leading-relaxed">
                Faturamento simples: sem fidelidade, cancele quando quiser. (R$ 99/mês após o teste)
              </span>
            </div>
          </div>

          <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 text-left pt-6 border-t border-zinc-800/80">
            {[
              "Pedidos ILIMITADOS via WhatsApp",
              "Cadastro de produtos com fotos em Alta Resolução",
              "Ferramenta de Sorteios Internos Integrada",
              "Link 100% Personalizado e Rápido",
              "Painel de Faturamento e Relatórios Diários",
              "Suporte Prioritário para o Seu Delivery"
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2.5 text-xs font-semibold text-zinc-300">
                <span className="text-teal-400 font-black text-sm">✓</span>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-center">
            <Link
              to="/cadastro"
              className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] shadow-md shadow-teal-500/15"
            >
              <span>👉 COMEÇAR MEU TESTE GRATUITO AGORA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* BLOCO 5: PERGUNTAS FREQUENTES (FAQ) */}
      <section className="relative z-10 max-w-4xl mx-auto w-full px-6 py-12 border-t border-zinc-900">
        <div className="text-center space-y-3 max-w-xl mx-auto mb-12">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Dúvidas Frequentes</h3>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Pergunta 1: Preciso colocar meu cartão de crédito para testar?",
              a: "Resposta: Não! O teste de 7 dias é totalmente gratuito e livre de compromisso. Você só insere uma forma de pagamento se usar, aprovar e decidir continuar com o sistema após o período de teste."
            },
            {
              q: "Pergunta 2: É muito difícil de configurar o cardápio?",
              a: "Resposta: De forma alguma. O sistema é totalmente intuitivo e moderno. Em menos de 10 minutos você consegue colocar suas fotos, preços, horários de funcionamento e já começar a vender."
            },
            {
              q: "Pergunta 3: Meus clientes precisam baixar algum aplicativo no celular?",
              a: "Resposta: Não. O seu cardápio funciona como um site moderno. O cliente clica no link (no Instagram ou no WhatsApp) e o cardápio abre na hora, direto no navegador do celular ou computador."
            },
            {
              q: "Pergunta 4: Como eu recebo o dinheiro das vendas?",
              a: "Resposta: O pagamento vai direto para você. O sistema organiza o pedido perfeitamente e envia para o seu painel ou WhatsApp, e você recebe do cliente via Pix, cartão ou dinheiro na entrega."
            }
          ].map((item, idx) => (
            <FaqItem key={idx} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* BLOCO 6: RODAPÉ (FOOTER) */}
      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-550 space-y-2 relative z-10 max-w-7xl mx-auto w-full px-6">
        <p>© 2026 RangoClick. Todos os direitos reservados.</p>
        <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-600">
          <Link to="/admin" className="hover:text-zinc-400 transition font-semibold">Termos de Uso</Link>
          <span>•</span>
          <Link to="/cadastro" className="hover:text-zinc-400 transition font-semibold">Política de Privacidade</Link>
        </div>
      </footer>
    </div>
  );
}

// Collapsible FAQ Item Component
function FaqItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-zinc-900/20 border border-zinc-850 rounded-2xl overflow-hidden transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 text-left font-extrabold text-sm sm:text-base flex items-center justify-between text-white hover:text-teal-400 transition"
      >
        <span>{q}</span>
        <ChevronDown className={`w-5 h-5 text-teal-400 transform transition-transform duration-200 shrink-0 ml-4 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      <div className={`overflow-hidden transition-all duration-350 ${isOpen ? "max-h-[300px] border-t border-zinc-900/60" : "max-h-0"}`}>
        <p className="p-5 text-xs sm:text-sm text-zinc-400 leading-relaxed text-left">
          {a}
        </p>
      </div>
    </div>
  );
}
