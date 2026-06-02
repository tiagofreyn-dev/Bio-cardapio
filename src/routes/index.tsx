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
              <InteractiveDemoCardapio />
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

// Fully Interactive Demo Cardapio Component
interface CartItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
}

function InteractiveDemoCardapio() {
  const [activeCategory, setActiveCategory] = useState("hamburgueres");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [fidelityPoints, setFidelityPoints] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const DEMO_PRODUCTS = [
    {
      id: "1",
      nome: "X Monster Proteín",
      categoria: "hamburgueres",
      descricao: "Pão, maionese, ketchup, milho, 2 hambúrgueres artesanais de 150g, ovo, filé de frango, queijo duplo e presunto.",
      preco: 33.00,
      imagem: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
      novo: true,
      destaque: true
    },
    {
      id: "2",
      nome: "X Insano Fit",
      categoria: "hamburgueres",
      descricao: "Pão integral, maionese light, ketchup, milho, cebola caramelizada, hambúrguer de frango fit e rúcula.",
      preco: 30.00,
      imagem: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&q=80",
      novo: true,
      destaque: true
    },
    {
      id: "3",
      nome: "X-Burguer",
      categoria: "hamburgueres",
      descricao: "Pão brioche, hambúrguer artesanal 150g, maionese da casa, ketchup, queijo e presunto.",
      preco: 14.00,
      imagem: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80"
    },
    {
      id: "4",
      nome: "Batata Especial",
      categoria: "porcoes",
      descricao: "Porção de batatas fritas super crocantes com muito cheddar cremoso e bacon crocante.",
      preco: 22.00,
      imagem: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80"
    },
    {
      id: "5",
      nome: "Coca-Cola Lata",
      categoria: "bebidas",
      descricao: "Refrigerante Coca-Cola original lata de 350ml trincando de gelada.",
      preco: 6.00,
      imagem: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80"
    }
  ];

  const addToCart = (product: typeof DEMO_PRODUCTS[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantidade: item.quantidade + 1 } : item);
      }
      return [...prev, { id: product.id, nome: product.nome, preco: product.preco, quantidade: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantidade + delta;
          return newQty > 0 ? { ...item, quantidade: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantidade, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
  const taxaEntrega = 5.00;
  const total = subtotal + taxaEntrega;

  const handleFinalize = () => {
    setOrderSuccess(true);
    setCart([]);
    setIsCartOpen(false);
    setFidelityPoints(prev => Math.min(prev + 1, 10));
  };

  const filteredProducts = DEMO_PRODUCTS.filter(p => p.categoria === activeCategory && !p.destaque);
  const highlights = DEMO_PRODUCTS.filter(p => p.destaque);

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-white font-sans text-xs relative select-none overflow-hidden">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto pb-16 scrollbar-none flex flex-col">
        {/* Banner / Store Header Info */}
        <div className="bg-zinc-900/60 p-3 flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center gap-2">
            {/* Store Logo Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-base shadow-inner shrink-0">
              🍔
            </div>
            
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-[11px] text-white tracking-wide truncate">Insano Lanches</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[9px] text-emerald-400 font-extrabold uppercase">Aberto agora</span>
                <span className="text-[8px] text-zinc-500">•</span>
                <span className="text-[9px] text-zinc-400 font-medium">Entrega 30-60 min</span>
              </div>
            </div>
          </div>

          <span className="text-[8px] text-zinc-500 leading-tight truncate">
            📍 Rua Edivino Fritz, Nº 8, Capitão Leônidas Marques, PR
          </span>
        </div>

        {/* Highlight Section: Lançamentos Imperdíveis */}
        {activeCategory === "hamburgueres" && (
          <div className="py-2.5 flex flex-col gap-2 shrink-0 border-b border-zinc-900/40">
            <span className="px-3 font-black text-[10px] text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              🚀 Lançamentos Imperdíveis
            </span>
            
            <div className="flex overflow-x-auto gap-2.5 px-3 pb-1.5 scrollbar-none snap-x snap-mandatory">
              {highlights.map(p => {
                const cartQty = cart.find(c => c.id === p.id)?.quantidade || 0;
                return (
                  <div key={p.id} className="w-[145px] shrink-0 bg-zinc-900/40 border border-zinc-850 rounded-2xl p-2 flex flex-col gap-1.5 snap-start relative hover:border-teal-500/20 transition">
                    <div className="w-full h-18 rounded-lg overflow-hidden relative shrink-0">
                      <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover select-none pointer-events-none" />
                      <span className="absolute top-1 left-1 bg-red-650 text-white font-black text-[6px] uppercase px-1 py-0.5 rounded-full tracking-wider shadow">
                        NOVO
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-[10px] text-white truncate leading-tight">{p.nome}</span>
                      <span className="text-[8px] text-zinc-500 line-clamp-2 mt-0.5 leading-snug">{p.descricao}</span>
                    </div>

                    <div className="flex items-center justify-between mt-0.5 pt-1.5 border-t border-zinc-900/60">
                      <span className="font-black text-[10px] text-teal-400">R$ {p.preco.toFixed(2)}</span>
                      
                      {cartQty > 0 ? (
                        <div className="flex items-center bg-zinc-800 rounded-full h-6 border border-zinc-700 overflow-hidden shrink-0">
                          <button onClick={() => updateQuantity(p.id, -1)} className="w-5 h-full text-zinc-400 font-extrabold hover:text-white transition active:bg-zinc-700 flex items-center justify-center text-[10px]">-</button>
                          <span className="text-[9px] font-black text-white px-1 min-w-[12px] text-center">{cartQty}</span>
                          <button onClick={() => addToCart(p)} className="w-5 h-full text-teal-400 font-extrabold hover:text-white transition active:bg-zinc-700 flex items-center justify-center text-[10px]">+</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addToCart(p)}
                          className="w-6 h-6 rounded-full bg-teal-550 hover:bg-teal-400 text-white flex items-center justify-center shadow transition active:scale-90 shrink-0 font-extrabold text-xs"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fidelity Progress Card */}
        {activeCategory === "hamburgueres" && (
          <div className="px-3 py-2 shrink-0">
            <div className="bg-zinc-900/40 border border-zinc-850 p-2.5 rounded-xl flex flex-col gap-1.5 relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between">
                <span className="font-black text-[9px] text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                  🔥 Cartão Fidelidade Insano
                </span>
                <span className="text-[8px] font-black text-teal-400 bg-teal-500/10 px-1 py-0.5 rounded-full">
                  {fidelityPoints}/10
                </span>
              </div>
              <p className="text-[8px] text-zinc-500 leading-normal">
                A cada 10 pedidos acima de R$ 30,00, ganhe 1 X-Insano grátis!
              </p>

              <div className="flex items-center justify-between gap-1 pt-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center text-[9px] transition shrink-0 ${
                      i < fidelityPoints 
                        ? "bg-teal-500/10 border-teal-500/40 text-teal-400" 
                        : "bg-zinc-950 border-zinc-850 text-zinc-700"
                    }`}
                  >
                    {i < fidelityPoints ? "🍔" : "•"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Category Pills */}
        <div className="flex items-center gap-1.5 px-3 py-2 sticky top-0 bg-zinc-950/95 backdrop-blur z-20 shrink-0 border-b border-zinc-900/50">
          {[
            { id: "hamburgueres", label: "Hambúrgueres", emoji: "🍔" },
            { id: "porcoes", label: "Porções", emoji: "🍟" },
            { id: "bebidas", label: "Bebidas", emoji: "🥤" }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-extrabold text-[9px] flex items-center gap-1 transition active:scale-95 shrink-0 ${
                activeCategory === cat.id 
                  ? "bg-teal-500 text-white shadow" 
                  : "bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Products List under selected Category */}
        <div className="flex flex-col gap-2.5 px-3 pt-1.5 flex-1">
          {filteredProducts.map(p => {
            const cartQty = cart.find(c => c.id === p.id)?.quantidade || 0;
            return (
              <div key={p.id} className="flex gap-2.5 bg-zinc-900/10 border border-zinc-900 p-2 rounded-xl hover:border-teal-500/10 transition shrink-0">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-900 shrink-0 relative">
                  <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover select-none pointer-events-none" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-[10px] text-white truncate leading-tight">{p.nome}</span>
                    <span className="text-[8px] text-zinc-500 line-clamp-2 mt-0.5 leading-normal">{p.descricao}</span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className="font-black text-[10px] text-teal-400">R$ {p.preco.toFixed(2)}</span>
                    
                    {cartQty > 0 ? (
                      <div className="flex items-center bg-zinc-850 rounded-full h-6 border border-zinc-800 overflow-hidden shrink-0">
                        <button onClick={() => updateQuantity(p.id, -1)} className="w-5 h-full text-zinc-400 font-extrabold hover:text-white transition active:bg-zinc-700 flex items-center justify-center text-[10px]">-</button>
                        <span className="text-[9px] font-black text-white px-1 min-w-[12px] text-center">{cartQty}</span>
                        <button onClick={() => addToCart(p)} className="w-5 h-full text-teal-400 font-extrabold hover:text-white transition active:bg-zinc-700 flex items-center justify-center text-[10px]">+</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(p)}
                        className="w-6 h-6 rounded-full bg-teal-550 hover:bg-teal-400 text-white flex items-center justify-center shadow transition active:scale-90 shrink-0 font-extrabold text-xs"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pulsing Floating Sacola Bar */}
      {totalItems > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="absolute bottom-2.5 left-2.5 right-2.5 h-9 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-extrabold flex items-center justify-between px-3 shadow shadow-teal-550/15 active:scale-95 transition z-30 select-none"
        >
          <div className="flex items-center gap-1.5 text-[9px]">
            <span>🛍️ Sacola</span>
            <span className="bg-white/20 px-1 py-0.5 rounded-full font-black text-[8px]">{totalItems}</span>
          </div>
          <div className="flex items-center gap-1 font-black text-[9px]">
            <span>Ver Sacola</span>
            <span>•</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
        </button>
      )}

      {/* Sliding SAC CART Drawer Overlay (inside mock phone screen) */}
      {isCartOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-40 flex flex-col justify-end">
          <div className="w-full bg-zinc-900 border-t border-zinc-800 rounded-t-xl p-3 flex flex-col max-h-[85%] overflow-hidden animate-in slide-in-from-bottom duration-200 select-none">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 shrink-0">
              <span className="font-black text-[9px] text-zinc-300 uppercase tracking-widest flex items-center gap-1">
                🛍️ Meu Carrinho
              </span>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-[9px] font-extrabold text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 transition"
              >
                Voltar
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-2.5 space-y-2.5 scrollbar-none">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between min-w-0">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-extrabold text-[10px] text-white truncate leading-tight">{item.nome}</span>
                    <span className="text-[9px] text-teal-400 font-bold mt-0.5">R$ {item.preco.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center bg-zinc-850 rounded-full h-6 border border-zinc-800 overflow-hidden shrink-0">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-full text-zinc-400 font-extrabold hover:text-white transition active:bg-zinc-700 flex items-center justify-center text-[10px]">-</button>
                    <span className="text-[9px] font-black text-white px-1 min-w-[12px] text-center">{item.quantidade}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-full text-teal-400 font-extrabold hover:text-white transition active:bg-zinc-700 flex items-center justify-center text-[10px]">+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total prices & action */}
            <div className="border-t border-zinc-800 pt-2.5 space-y-1.5 shrink-0">
              <div className="flex items-center justify-between text-[8px] text-zinc-400">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-[8px] text-zinc-400">
                <span>Taxa de Entrega</span>
                <span className="text-emerald-400 font-bold">R$ 5,00</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-extrabold text-white pt-0.5">
                <span>Total</span>
                <span className="text-teal-400 font-black">R$ {total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleFinalize}
                className="w-full h-8.5 mt-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-black rounded-lg flex items-center justify-center gap-1 shadow active:scale-95 transition text-[9px]"
              >
                <span>👉 FINALIZAR PEDIDO (TESTAR)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal Overlay (within phone canvas screen) */}
      {orderSuccess && (
        <div className="absolute inset-0 bg-zinc-950/95 z-55 flex flex-col items-center justify-center p-4.5 text-center select-none animate-in fade-in duration-200">
          <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl text-emerald-400 shrink-0">
            ✓
          </div>
          
          <span className="font-black text-xs text-white mt-3 uppercase tracking-wider">
            🎉 Pedido Recebido!
          </span>
          
          <p className="text-[8.5px] text-zinc-400 mt-2 leading-relaxed max-w-[200px]">
            <strong>Este é um exemplo de cardápio digital funcional.</strong> No sistema real, esse pedido seria enviado formatado para o seu <strong>WhatsApp</strong> e painel de controle em menos de 3 segundos!
          </p>

          <button
            onClick={() => setOrderSuccess(false)}
            className="mt-5 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-teal-400 font-black hover:text-white transition active:scale-95 text-[9px]"
          >
            Voltar a Testar 🍔
          </button>
        </div>
      )}
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
