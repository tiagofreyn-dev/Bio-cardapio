import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  Clock,
  Percent,
  Smartphone,
  ChevronDown,
  MessageSquare,
  Send,
  Database,
  Star,
  Users,
  Shield,
  CreditCard,
  Ticket,
  LayoutDashboard
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
    <div className="min-h-screen bg-zinc-900 text-white font-sans overflow-x-hidden selection:bg-teal-500/35 selection:text-white relative">
      {/* Dynamic colorful blur backgrounds */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[40vh] right-1/4 translate-x-1/2 w-[400px] h-[400px] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none z-0" />

      {/* Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-zinc-900/80 border-b border-zinc-800/50 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition shrink-0">
          <img src="/logo-completa.png" alt="RangoClick Logo" className="h-8 sm:h-11 w-auto object-contain" />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/admin"
            className="hidden sm:flex h-9 px-3.5 rounded-xl hover:bg-zinc-900 text-zinc-300 hover:text-white font-bold text-xs items-center justify-center transition active:scale-95 border border-transparent hover:border-zinc-800"
          >
            Área do Lojista 🏪
          </Link>

          <Link
            to="/cadastro"
            className="h-9 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-350 hover:to-teal-450 text-zinc-950 font-black text-xs flex items-center justify-center gap-1 transition-all duration-200 active:scale-95 shadow-md shadow-emerald-500/10"
          >
            <span>Criar Meu Cardápio</span>
            <ArrowRight className="w-3 h-3 text-zinc-950 stroke-[3]" />
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
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 justify-center lg:justify-start w-full">
            <Link
              to="/cadastro"
              className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-350 hover:to-teal-450 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(52,211,153,0.35)]"
            >
              <span>Criar Meu Cardápio Grátis</span>
              <ArrowRight className="w-4 h-4 text-zinc-950 stroke-[3]" />
            </Link>

            <Link
              to="/cardapio/burger-insano-demo?demo=true"
              className="w-full sm:w-auto h-14 px-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700/80 text-zinc-300 hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border border-zinc-750"
            >
              <span>Testar Cardápio (Cliente) 📱</span>
            </Link>

            <Link
              to="/admin"
              className="w-full sm:w-auto h-14 px-6 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800 text-teal-400 hover:text-teal-300 font-extrabold text-sm flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border border-teal-500/20"
            >
              <span>Painel Admin (Demo) 📊</span>
            </Link>
          </div>

          <p className="text-xs text-zinc-500 font-semibold pt-1">
            🔒 Teste grátis por 7 dias • Sem cartão de crédito • Pronto em 10 minutos.
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

      {/* FAIXA DE PROVA SOCIAL: LOGOS DE CLIENTES */}
      <section className="relative z-10 w-full px-6 py-10 border-t border-b border-zinc-800/80 bg-zinc-850/30">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <span className="text-[10px] sm:text-xs font-black text-zinc-550 uppercase tracking-[0.2em] text-center">
            Mais de 20.000 empresas de delivery confiam na nossa plataforma para vender mais
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 select-none">
            <span className="text-xs sm:text-sm font-black tracking-widest text-zinc-500 hover:text-zinc-300 hover:scale-105 transition-all duration-300 uppercase italic cursor-default">EL PATRÓN</span>
            <span className="text-xs sm:text-sm font-extrabold tracking-wider text-zinc-500 hover:text-zinc-300 hover:scale-105 transition-all duration-300 uppercase cursor-default">Milk & Mellow</span>
            <span className="text-xs sm:text-sm font-bold tracking-normal text-zinc-500 hover:text-zinc-300 hover:scale-105 transition-all duration-300 uppercase font-serif cursor-default">Restaurante Caseiro</span>
            <span className="text-xs sm:text-sm font-mono tracking-widest text-zinc-500 hover:text-zinc-300 hover:scale-105 transition-all duration-300 uppercase cursor-default">Nakato Sushi</span>
            <span className="text-xs sm:text-sm font-black tracking-wider text-zinc-500 hover:text-zinc-300 hover:scale-105 transition-all duration-300 uppercase font-sans cursor-default">BIG BOCA</span>
            <span className="text-xs sm:text-sm font-extrabold tracking-widest text-zinc-500 hover:text-zinc-300 hover:scale-105 transition-all duration-300 uppercase italic font-bold cursor-default">Lugano</span>
            <span className="text-xs sm:text-sm font-serif tracking-widest text-zinc-500 hover:text-zinc-300 hover:scale-105 transition-all duration-300 uppercase font-semibold cursor-default">Kopenhagen</span>
          </div>
        </div>
      </section>

      {/* SEÇÃO DO ATENDENTE VIRTUAL WHATSAPP */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Esquerda: Texto */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Quer responder rapidamente aos seus clientes?
          </h3>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
            O atendente virtual faz isso por você. Na hora, pelo WhatsApp, sem a necessidade de um colaborador dedicado apenas para enviar links e anotar pedidos.
          </p>

          <div className="space-y-4 max-w-lg mx-auto lg:mx-0">
            {[
              "Respostas imediatas sobre cardápio, horários e taxas de entrega.",
              "Status dos pedidos atualizados automaticamente do preparo até a saída para entrega.",
              "Seu cliente não fica esperando e você não perde nenhuma venda por demora."
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-left">
                <Check className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-semibold text-zinc-300">{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-center lg:justify-start w-full">
            <Link
              to="/cadastro"
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-350 hover:to-teal-450 text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 shadow-[0_0_25px_rgba(52,211,153,0.3)]"
            >
              <span>Criar Cardápio Grátis</span>
              <ArrowRight className="w-4 h-4 text-zinc-950 stroke-[3]" />
            </Link>
          </div>
        </div>

        {/* Direita: Mockup de Conversa no WhatsApp */}
        <div className="lg:col-span-6 flex justify-center select-none">
          <div className="w-full max-w-[380px] bg-zinc-900 border border-zinc-800 rounded-3xl p-3 shadow-2xl flex flex-col h-[460px] font-sans">
            {/* Header do WhatsApp */}
            <div className="bg-zinc-950 p-3 rounded-2xl flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-extrabold text-xs border border-teal-500/30">
                RC
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-[11px] text-white flex items-center gap-1">
                  Restaurante Caseiro
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-white">✓</span>
                </span>
                <span className="text-[9px] text-zinc-550">Conta comercial</span>
              </div>
            </div>

            {/* Balões de Conversa */}
            <div className="flex-1 overflow-y-auto py-4 px-2 space-y-3.5 scrollbar-none flex flex-col text-left text-[10px] md:text-[11px]">
              <span className="text-[8px] text-zinc-600 font-extrabold uppercase tracking-widest mx-auto my-1">Hoje</span>

              {/* Mensagem do Cliente */}
              <div className="max-w-[85%] self-end bg-teal-600 text-white p-2.5 rounded-2xl rounded-tr-none shadow flex flex-col gap-0.5">
                <span>Olá! Gostaria de ver o cardápio e fazer um pedido.</span>
                <span className="text-[7px] text-teal-200 self-end mt-1">11:47</span>
              </div>

              {/* Resposta do Atendente */}
              <div className="max-w-[85%] self-start bg-zinc-850 text-zinc-200 p-2.5 rounded-2xl rounded-tl-none shadow flex flex-col gap-1">
                <span>Olá, Paulo! Seja muito bem-vindo! 🍔</span>
                <span>Clique no link abaixo para ver nosso cardápio completo com fotos e fazer seu pedido em menos de 1 minuto:</span>
                <span className="text-teal-400 font-bold hover:underline">bio-cardapio.com.br/restaurante-caseiro</span>
                <span className="text-[7px] text-zinc-550 self-end mt-1">11:47</span>
              </div>

              {/* Cliente Finalizando */}
              <div className="max-w-[85%] self-end bg-teal-600 text-white p-2.5 rounded-2xl rounded-tr-none shadow flex flex-col gap-0.5 whitespace-pre-line font-mono text-[9px] md:text-[10px]">
                <span>{`*Novo Pedido!* 🚀
--------------------------------
*Cliente:* Paulo
*WhatsApp:* (11) 98765-4321

*Itens:*
- 1x X-Monster Proteín (R$ 33,00)
- 1x Coca-Cola Lata (R$ 6,00)

*Taxa de Entrega:* R$ 5,00
*Total:* R$ 44,00

*Pagamento:* Pix ⚡`}</span>
                <span className="text-[7px] text-teal-200 self-end mt-1">11:48</span>
              </div>

              {/* Confirmação do Atendente */}
              <div className="max-w-[85%] self-start bg-zinc-850 text-zinc-200 p-2.5 rounded-2xl rounded-tl-none shadow flex flex-col gap-1">
                <span>Olá, Paulo! Seu pedido foi recebido com sucesso! 🎉</span>
                <span>Status atual: <strong>Em Preparo na Cozinha</strong> 🍳</span>
                <span>Fique tranquilo, te avisaremos assim que o motoboy sair!</span>
                <span className="text-[7px] text-zinc-550 self-end mt-1">11:48</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4 COLUNAS: VENDA MAIS E MAIS RÁPIDO */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 py-16 border-t border-b border-zinc-900 bg-zinc-900/10">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Venda mais – e mais rápido – com o Cardápio Online para Delivery
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Facilite para o cliente",
              desc: "Garanta que seus clientes encontrem facilmente o seu cardápio, através de um link exclusivo para compartilhar no Instagram e WhatsApp.",
              icon: Smartphone
            },
            {
              title: "Centralize os pedidos",
              desc: "Organize todos os pedidos recebidos de forma automatizada no seu painel gestor, agilizando o fluxo de trabalho da sua cozinha.",
              icon: Database
            },
            {
              title: "Informe o status",
              desc: "Envie atualizações automáticas sobre o andamento dos pedidos diretamente no WhatsApp do cliente de forma 100% automatizada.",
              icon: Send
            },
            {
              title: "Fidelize e lucre mais",
              desc: "Use cupons de desconto estratégicos e sorteios integrados para fazer o cliente voltar a comprar de você toda semana.",
              icon: Ticket
            }
          ].map((col) => {
            const Icon = col.icon;
            return (
              <div key={col.title} className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 bg-zinc-900/25 border border-zinc-900 p-5 rounded-2xl hover:border-teal-500/10 transition">
                <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-white">{col.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{col.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-8 flex justify-center w-full">
          <Link
            to="/cadastro"
            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-350 hover:to-teal-450 text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 shadow-[0_0_25px_rgba(52,211,153,0.3)]"
          >
            <span>Começar Delivery Grátis</span>
            <ArrowRight className="w-4 h-4 text-zinc-950 stroke-[3]" />
          </Link>
        </div>
      </section>

      {/* SEÇÃO DE NICHOS: FEITO PARA O SEU DELIVERY */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 py-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/25 text-[10px] font-black uppercase tracking-wider mx-auto">
            <span>Segmentos Atendidos</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Um cardápio moderno, feito sob medida para o seu nicho
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            Seja qual for a sua especialidade, nosso sistema foi planejado para encantar o seu cliente e aumentar as vendas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Hamburguerias & Lanches",
              desc: "Controle de adicionais ilimitados, escolha do ponto da carne, combos promocionais e bebidas organizados por etapas.",
              img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
              tag: "🍔 Lanches & Burgers"
            },
            {
              title: "Pizzarias & Massas",
              desc: "Venda pizzas meio a meio de forma intuitiva, ofereça bordas recheadas e tamanhos diferentes sem complicação.",
              img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
              tag: "🍕 Pizzarias"
            },
            {
              title: "Açaiterias & Sorveterias",
              desc: "Monte o açaí ideal com adicionais, caldas, frutas e coberturas divididos de forma clara para o seu cliente.",
              img: "/acai.jpg",
              tag: "🍧 Açaí & Sorvetes"
            },
            {
              title: "Restaurantes & Marmitas",
              desc: "Exiba o prato do dia, ofereça escolhas de acompanhamentos e saladas, e controle o estoque diário de refeições.",
              img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
              tag: "🍱 Pratos & Marmitas"
            }
          ].map((nicho) => (
            <div 
              key={nicho.title} 
              className="group relative h-72 rounded-2xl overflow-hidden border border-zinc-850 bg-zinc-900/30 hover:border-teal-500/20 transition duration-300 shadow-xl"
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={nicho.img} 
                  alt={nicho.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-50 group-hover:opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 z-20 p-5 flex flex-col justify-end gap-2 text-left">
                <span className="text-[9px] bg-teal-500/20 text-teal-400 border border-teal-500/30 font-extrabold px-2 py-0.5 rounded-full w-fit tracking-wider uppercase">
                  {nicho.tag}
                </span>
                <h4 className="font-extrabold text-base text-white leading-tight">
                  {nicho.title}
                </h4>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  {nicho.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO VANTAGENS: BULLETS + DEMO */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 py-20 border-t border-b border-zinc-900/60 bg-zinc-900/5">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Vantagens do Cardápio Digital para Delivery
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Esquerda: Bullets de CRO */}
          <div className="lg:col-span-7 space-y-8 text-left">
            {[
              {
                title: "0% taxas, 100% ganhos",
                desc: "Marketplaces tradicionais cobram taxas de até 30% sobre os pedidos. Na RangoClick, não há taxas, e seu faturamento cresce sem aumento de custos."
              },
              {
                title: "Entregas flexíveis",
                desc: "Configure taxas de entrega por bairro ou raio de distância e tenha controle total do frete sem depender de comissões terceirizadas."
              },
              {
                title: "Fluxo totalmente integrado",
                desc: "Sincronize automaticamente pedidos, estoque e financeiro com seu painel de controle, eliminando retrabalhos e erros manuais."
              },
              {
                title: "Lucre mais em cada pedido",
                desc: "Aumente seu ticket médio com preços calculados automaticamente para combinações personalizadas e adicionais sugeridos na hora certa."
              }
            ].map((bullet) => (
              <div key={bullet.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                  <Check className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm sm:text-base text-white">{bullet.title}</h4>
                  <p className="text-xs sm:text-sm text-zinc-450 leading-relaxed">{bullet.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Direita: Card de visualização do cliente */}
          <div className="lg:col-span-5 flex justify-center relative select-none">
            <div className="w-full max-w-[320px] h-[500px] bg-zinc-900 border border-zinc-800 rounded-3xl p-3 shadow-2xl relative overflow-hidden flex flex-col justify-end text-left">
              <img 
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80" 
                alt="Hambúrguer Artesanal RangoClick" 
                className="absolute inset-0 w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
              
              <div className="relative z-10 p-4 space-y-2">
                <span className="text-[9px] bg-teal-500/20 text-teal-400 border border-teal-500/30 font-extrabold px-2 py-0.5 rounded-full w-fit uppercase">
                  Cardápio do Cliente
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-white">X-Monster Artesanal</h4>
                <p className="text-xs text-zinc-300">Peça o mais suculento hambúrguer artesanal de 150g com cheddar derretido e molho especial.</p>
                <div className="flex items-center gap-1.5 pt-1 text-[9px] font-black text-teal-400">
                  <span>Visualização Real</span>
                  <span>•</span>
                  <span>Alta Conversão</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO PAGAMENTOS */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 py-20 border-b border-zinc-900/60 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Esquerda: Preview visual de pagamentos */}
        <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center select-none">
          <div className="w-full max-w-[320px] bg-zinc-900 border border-zinc-850 rounded-3xl p-4 shadow-2xl flex flex-col gap-4">
            <span className="font-extrabold text-[10px] text-zinc-400 uppercase tracking-widest text-left">Formas de Pagamento</span>
            
            <div className="flex flex-col gap-2">
              {[
                { label: "Pix (Desconto de 2%)", icon: "⚡", active: true },
                { label: "Cartão de Crédito Online", icon: "💳", active: false },
                { label: "Pagar na Entrega (Maquininha)", icon: "🛵", active: false },
                { label: "Google Pay & Apple Pay", icon: "📱", active: false }
              ].map((pay) => (
                <div 
                  key={pay.label} 
                  className={`p-3 rounded-xl border flex items-center justify-between text-left transition ${
                    pay.active 
                      ? "bg-teal-500/10 border-teal-500/30 text-teal-400" 
                      : "bg-zinc-950 border-zinc-850 text-zinc-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{pay.icon}</span>
                    <span className="text-[10px] font-bold">{pay.label}</span>
                  </div>
                  {pay.active && <Check className="w-3.5 h-3.5 text-teal-400" />}
                </div>
              ))}
            </div>

            <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-850 flex items-center justify-between text-left">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-zinc-500 uppercase tracking-wider">Bandeiras Aceitas</span>
                <span className="text-[10px] font-bold text-zinc-300">NuPay • Visa • Mastercard • Elo</span>
              </div>
              <span className="text-xs">💳</span>
            </div>
          </div>
        </div>

        {/* Direita: Copys */}
        <div className="lg:col-span-7 order-1 lg:order-2 space-y-6 text-center lg:text-left">
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Facilite os pagamentos e conquiste a clientela
          </h3>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
            Garanta conveniência absoluta oferecendo múltiplos métodos de pagamento. Deixe seu cliente escolher como prefere pagar a conta, reduzindo o tempo de atendimento e facilitando o recebimento direto.
          </p>

          <div className="pt-4 flex justify-center lg:justify-start w-full">
            <Link
              to="/cadastro"
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-350 hover:to-teal-450 text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 shadow-[0_0_25px_rgba(52,211,153,0.3)]"
            >
              <span>Iniciar Gratuito</span>
              <ArrowRight className="w-4 h-4 text-zinc-950 stroke-[3]" />
            </Link>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE DEPOIMENTOS & PAINEL DE PEDIDOS */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 py-20 border-b border-zinc-900/60 text-center space-y-16">
        <div className="space-y-4 max-w-3xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Quem usa o Cardápio para Delivery da RangoClick, recomenda!
          </h3>
          
          {/* Depoimentos Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 text-left">
            <div className="bg-zinc-900/30 border border-zinc-850 p-6 rounded-2xl space-y-3">
              <div className="flex gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4.5 h-4.5 fill-current" />)}
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                "Hoje, com 9 mesas e delivery ativo, só preciso de 1 pessoa atendendo com qualidade e nossa taxa de erros é praticamente zero. Além disso, ao final do dia o fechamento financeiro é automático."
              </p>
              <div className="flex flex-col">
                <span className="font-extrabold text-xs text-white">Marcelo R.</span>
                <span className="text-[10px] text-zinc-500">Lanchonete Marcelo Burguer</span>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-850 p-6 rounded-2xl space-y-3">
              <div className="flex gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4.5 h-4.5 fill-current" />)}
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                "Antes era uma confusão de áudios no WhatsApp. Agora o cliente entra, seleciona os opcionais, insere a taxa de entrega e paga online. O pedido cai pronto na impressora da cozinha!"
              </p>
              <div className="flex flex-col">
                <span className="font-extrabold text-xs text-white">Sabrina G.</span>
                <span className="text-[10px] text-zinc-500">Pizzaria di Napoli</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel de Faturamento Automático */}
        <div className="space-y-6 max-w-5xl mx-auto pt-8">
          <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/30 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Painel de Faturamento Automático (Incluso)
          </span>
          <h4 className="text-xl sm:text-2xl font-black text-white">Acompanhe seu faturamento em tempo real, sem planilhas</h4>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
            Cada pedido concluído atualiza automaticamente o seu relatório financeiro. Tenha controle completo de vendas, formas de pagamento e ticket médio sem precisar digitar um único dado.
          </p>
          
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-left font-sans select-none max-w-3xl mx-auto space-y-6">
            {/* Dashboard Header/Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-1">
                <span className="text-[10px] text-zinc-550 uppercase font-bold tracking-wider">Faturamento Hoje</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-white">R$ 1.248,50</span>
                  <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">+12%</span>
                </div>
                <span className="text-[8px] text-zinc-500 block">Atualizado às 19:42</span>
              </div>
              
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-1">
                <span className="text-[10px] text-zinc-550 uppercase font-bold tracking-wider">Pedidos Concluídos</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-white">42</span>
                  <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">+8%</span>
                </div>
                <span className="text-[8px] text-zinc-500 block">Ticket médio: R$ 29,72</span>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-1">
                <span className="text-[10px] text-zinc-550 uppercase font-bold tracking-wider">Formas de Pagamento</span>
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[9px] text-zinc-400">
                    <span className="flex items-center gap-1">⚡ Pix</span>
                    <span className="font-extrabold text-white">85% (R$ 1.061,22)</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                    <div className="bg-teal-400 h-full w-[85%]" />
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-zinc-400 pt-0.5">
                    <span className="flex items-center gap-1">💳 Cartão</span>
                    <span className="font-extrabold text-white">15% (R$ 187,28)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Chart Mockup */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Desempenho Semanal (Seg - Dom)</span>
                <span className="text-[9px] text-teal-400 font-extrabold">Faturamento total: R$ 7.840,00</span>
              </div>
              <div className="h-28 flex items-end justify-between gap-2.5 pt-2">
                {[
                  { day: "Seg", val: 30 },
                  { day: "Ter", val: 45 },
                  { day: "Qua", val: 40 },
                  { day: "Qui", val: 55 },
                  { day: "Sex", val: 80 },
                  { day: "Sáb", val: 100, highlight: true },
                  { day: "Dom", val: 90 }
                ].map((bar) => (
                  <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-full relative flex flex-col justify-end h-20 bg-zinc-900/60 rounded-md overflow-hidden">
                      <div 
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          bar.highlight 
                            ? "bg-gradient-to-t from-emerald-500 to-teal-450 shadow-[0_0_10px_rgba(52,211,153,0.3)]" 
                            : "bg-teal-500/20 group-hover:bg-teal-500/40"
                        }`} 
                        style={{ height: `${bar.val}%` }} 
                      />
                    </div>
                    <span className="text-[8px] text-zinc-500 font-extrabold group-hover:text-zinc-300">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>
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

          <div className="pt-6 flex justify-center w-full">
            <Link
              to="/cadastro"
              className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-350 hover:to-teal-450 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shadow-[0_0_30px_rgba(52,211,153,0.4)]"
            >
              <span>Começar Meu Teste Gratuito</span>
              <ArrowRight className="w-4 h-4 text-zinc-950 stroke-[3]" />
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
              q: "Preciso colocar meu cartão de crédito para testar?",
              a: "Não! O teste de 7 dias é totalmente gratuito e livre de compromisso. Você só insere uma forma de pagamento se usar, aprovar e decidir continuar com o sistema após o período de teste."
            },
            {
              q: "É muito difícil configurar o cardápio?",
              a: "De forma alguma. O nosso sistema é totalmente intuitivo e moderno. Em menos de 10 minutos você consegue cadastrar seus produtos, preços, taxas, horários de funcionamento e já começar a vender."
            },
            {
              q: "Meus clientes precisam baixar algum aplicativo no celular?",
              a: "Não. O seu cardápio funciona como um site moderno e ultra-rápido. O cliente clica no link do seu perfil ou conversa e o cardápio abre na hora, direto no navegador do celular ou computador."
            },
            {
              q: "Como eu recebo o faturamento das minhas vendas?",
              a: "O pagamento vai direto para a sua conta. O sistema organiza o pedido perfeitamente e envia para o seu painel de controle e WhatsApp, permitindo que você receba via Pix, cartão online ou dinheiro na entrega."
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
                className="w-full h-9 mt-2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-350 hover:to-teal-450 text-zinc-950 font-black rounded-xl flex items-center justify-center gap-1 shadow active:scale-95 transition-all duration-200 text-[10px] shadow-emerald-500/10"
              >
                <span>Finalizar Pedido (Testar)</span>
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
