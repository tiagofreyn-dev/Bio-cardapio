import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import * as Accordion from "@radix-ui/react-accordion";
import { 
  Check, ArrowRight, Smartphone, Star, 
  ChevronDown, LayoutDashboard, Shield, Ticket,
  Zap, PieChart, Store, Menu, X, CheckCircle2,
  TrendingUp, Clock, CreditCard
} from "lucide-react";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      loja: (search.loja as string) || undefined,
    };
  },
  component: LandingPage,
});

// Animações reutilizáveis
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans overflow-x-hidden selection:bg-amber-500/30 selection:text-orange-950">
      
      {/* CABEÇALHO / NAVBAR */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-zinc-950/95 backdrop-blur-md py-3 shadow-2xl border-b border-white/5' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition z-50">
            {/* Logo placeholder - O usuário trocará a URL depois */}
            <img 
              src={isScrolled ? "/logo-branca.png" : "/logo-branca.png"} 
              alt="RangoClick Logo" 
              className="h-8 sm:h-10 w-auto object-contain hidden sm:block" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden text-xl font-black tracking-tighter text-white">Rango<span className="text-amber-500">Click</span></span>
            <span className="sm:hidden text-xl font-black tracking-tighter text-white">Rango<span className="text-amber-500">Click</span></span>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-sm font-semibold text-zinc-300 hover:text-white transition">Recursos</a>
            <a href="#vantagens" className="text-sm font-semibold text-zinc-300 hover:text-white transition">Vantagens</a>
            <a href="#planos" className="text-sm font-semibold text-zinc-300 hover:text-white transition">Planos</a>
            <a href="#faq" className="text-sm font-semibold text-zinc-300 hover:text-white transition">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/admin" className="text-sm font-bold text-zinc-300 hover:text-white transition">
              Área do Lojista
            </Link>
            <Link to="/cadastro" className="h-10 px-5 rounded-full bg-amber-500 hover:bg-amber-400 text-orange-950 font-black text-sm flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              Criar Meu Cardápio
            </Link>
          </div>

          {/* Menu Mobile Toggle */}
          <button className="md:hidden text-white z-50 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menu Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-800 p-6 flex flex-col gap-4 shadow-2xl md:hidden"
            >
              <a href="#recursos" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-zinc-300">Recursos</a>
              <a href="#vantagens" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-zinc-300">Vantagens</a>
              <a href="#planos" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-zinc-300">Planos</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-zinc-300">FAQ</a>
              <div className="h-px w-full bg-zinc-800 my-2" />
              <Link to="/admin" className="text-lg font-bold text-zinc-300 text-center py-2">Área do Lojista</Link>
              <Link to="/cadastro" className="w-full h-12 rounded-xl bg-amber-500 text-orange-950 font-black flex items-center justify-center">Criar Meu Cardápio</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 1. SEÇÃO HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-zinc-950 pt-20">
        {/* Vídeo Background */}
        <div className="absolute inset-0 z-0 bg-zinc-950">
          <img 
            src="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=2500&auto=format&fit=crop"
            alt="Hambúrguer Premium"
            className="w-full h-full object-cover opacity-50 object-center"
          />
          {/* Overlay Escuro com gradiente terracota */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/90 via-zinc-950/50 to-orange-950/90 mix-blend-multiply" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-10 pb-20">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>Alta Gastronomia, Alta Conversão</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl font-serif font-black text-white leading-[1.05] tracking-tight mb-6">
              Transforme o Instagram e o WhatsApp em uma <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 italic">máquina de vendas.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-zinc-300 font-medium leading-relaxed mb-10 max-w-2xl">
              Com um Cardápio Digital Ultra-Moderno. Esqueça PDFs pesados e sistemas lentos. Tenha um site rápido, com fotos em altíssima resolução, sorteios integrados e controle total do seu faturamento.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/cadastro" className="w-full sm:w-auto h-14 px-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-orange-950 font-black text-base flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                Testar Cardápio (Cliente)
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </Link>
              <Link to="/admin" className="w-full sm:w-auto h-14 px-8 rounded-xl bg-transparent border-2 border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-bold text-base flex items-center justify-center transition-all backdrop-blur-sm">
                Painel Admin (Demo)
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. BARRA DE PROVA SOCIAL */}
      <section className="bg-amber-500 py-4 border-b border-orange-900/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-2">
          <p className="text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-orange-950/70">
            Mais de 20.000 empresas de delivery confiam na nossa plataforma para vender mais
          </p>
        </div>
        <div className="flex w-[200%] sm:w-full animate-[marquee_20s_linear_infinite] sm:animate-none sm:justify-center items-center gap-12 sm:gap-16 opacity-80 select-none">
          {["Milk & Mellow", "Restaurante Caseiro", "Barate Sushi", "BIG BOCA", "Lugano", "Kopenhagen"].map((brand, i) => (
            <span key={i} className="text-sm sm:text-base font-black tracking-widest text-orange-950 uppercase font-serif whitespace-nowrap">
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* 3. ATENDENTE VIRTUAL DO WHATSAPP */}
      <section id="recursos" className="py-24 sm:py-32 bg-[#FDFBF7] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-4xl sm:text-5xl font-serif font-black text-orange-950 leading-tight">
                Quer responder rapidamente aos seus clientes?
              </h2>
              <p className="text-lg text-zinc-600 mt-4 leading-relaxed font-medium">
                O atendente virtual faz isso por você. Na hora, pelo WhatsApp, sem a necessidade de um colaborador dedicado apenas para enviar links e anotar pedidos.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-5 pt-4">
              {[
                "Respostas imediatas sobre cardápio, horários e taxas de entrega.",
                "Status dos pedidos atualizados automaticamente do preparo até a saída para entrega.",
                "Seu cliente não fica esperando e você não perde nenhuma venda por demora."
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-orange-600 stroke-[3]" />
                  </div>
                  <span className="text-base text-zinc-700 font-semibold">{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Mockup Celular */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-[340px]"
          >
            {/* Sombras e brilhos de fundo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-200 to-orange-300 rounded-[3rem] blur-3xl opacity-40 -z-10" />
            
            <div className="bg-zinc-900 border-[8px] border-zinc-800 rounded-[2.5rem] shadow-2xl h-[600px] overflow-hidden flex flex-col relative">
              {/* WhatsApp Header */}
              <div className="bg-zinc-800 px-4 py-3 flex items-center gap-3 shadow-md z-10">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white text-sm">
                  RC
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm flex items-center gap-1">
                    Restaurante Caseiro <CheckCircle2 className="w-3 h-3 text-green-400 fill-green-400/20" />
                  </h4>
                  <span className="text-zinc-400 text-[10px]">Conta comercial</span>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 bg-[#efeae2] p-4 flex flex-col gap-3 overflow-hidden relative">
                {/* Background Pattern fake */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }} />
                
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="self-end bg-[#d9fdd3] text-zinc-800 p-2.5 rounded-xl rounded-tr-none shadow-sm max-w-[85%] text-xs font-medium z-10">
                  Olá! Gostaria de ver o cardápio e fazer um pedido.
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="self-start bg-white text-zinc-800 p-2.5 rounded-xl rounded-tl-none shadow-sm max-w-[90%] text-xs font-medium z-10">
                  Olá! Seja muito bem-vindo! 🍔<br/><br/>Clique no link abaixo para ver nosso cardápio completo com fotos e fazer seu pedido em menos de 1 minuto:<br/>
                  <span className="text-blue-500 font-bold">rango.click/restaurante-caseiro</span>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="self-end bg-[#d9fdd3] text-zinc-800 p-2.5 rounded-xl rounded-tr-none shadow-sm max-w-[90%] text-[11px] font-mono whitespace-pre-line z-10 mt-2">
                  {`*Novo Pedido!* 🚀\n--------------------\n*Itens:*\n- 1x X-Monster (R$ 33,00)\n- 1x Coca Lata (R$ 6,00)\n\n*Total:* R$ 39,00\n*Pagamento:* Pix`}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. NICHOS E VERSATILIDADE */}
      <section className="py-24 bg-zinc-900 border-t border-zinc-800 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-serif font-black text-white mb-4">Um cardápio moderno, feito sob medida para o seu nicho.</h2>
            <p className="text-zinc-400 text-lg font-medium max-w-2xl mx-auto">
              Seja qual for a sua especialidade, nosso sistema foi planejado para encantar o seu cliente e aumentar as suas vendas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Hamburguerias & Lanches", icon: "🍔", color: "from-orange-500/20 to-orange-900/20", border: "border-orange-500/30" },
              { title: "Pizzarias & Massas", icon: "🍕", color: "from-red-500/20 to-red-900/20", border: "border-red-500/30" },
              { title: "Restaurantes & Marmitas", icon: "🍱", color: "from-amber-500/20 to-amber-900/20", border: "border-amber-500/30" },
              { title: "Açaiterias & Sorveterias", icon: "🍦", color: "from-purple-500/20 to-purple-900/20", border: "border-purple-500/30" },
            ].map((niche, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`bg-zinc-950 rounded-2xl p-6 border ${niche.border} bg-gradient-to-b ${niche.color} flex flex-col items-center text-center group cursor-pointer shadow-xl transition-all`}
              >
                <span className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-2xl">{niche.icon}</span>
                <h3 className="text-white font-bold text-lg">{niche.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. VANTAGENS DO CARDÁPIO */}
      <section id="vantagens" className="py-24 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-serif font-black text-orange-950 mb-4">Vantagens do Cardápio Digital</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {[
              {
                icon: <PieChart className="w-8 h-8 text-orange-600" />,
                title: "0% taxas, 100% ganhos",
                desc: "Marketplaces tradicionais cobram taxas de até 30% sobre os pedidos. Na RangoClick, não há taxas, e seu faturamento cresce sem aumento de custos."
              },
              {
                icon: <Store className="w-8 h-8 text-orange-600" />,
                title: "Entregas flexíveis",
                desc: "Configure taxas de entrega por bairro ou raio de distância e tenha controle total do frete sem depender de comissões terceirizadas."
              },
              {
                icon: <Zap className="w-8 h-8 text-orange-600" />,
                title: "Fluxo totalmente integrado",
                desc: "Sincronize automaticamente pedidos, estoque e financeiro com seu painel de controle, eliminando retrabalhos e erros manuais."
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
                title: "Lucre mais em cada pedido",
                desc: "Aumente seu ticket médio com preços calculados automaticamente para combinações personalizadas e adicionais sugeridos na hora certa."
              }
            ].map((v, i) => (
              <motion.div 
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="flex gap-6 p-6 rounded-3xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow"
              >
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                  {v.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">{v.title}</h3>
                  <p className="text-zinc-600 font-medium leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. EXPERIÊNCIA DO CLIENTE E PAGAMENTO */}
      <section className="py-24 bg-orange-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* Mockup da Sacola */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-2xl relative"
          >
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-500 rounded-full blur-2xl opacity-30" />
            
            <h4 className="text-xl font-black mb-4 flex items-center gap-2"><Smartphone className="w-5 h-5 text-amber-500" /> Sua Sacola</h4>
            <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop" alt="Burger" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-white text-sm">X-Monster Artesanal</h5>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">Peça o suculento hambúrguer artesanal de 150g com cheddar derretido e molho especial.</p>
                <div className="mt-2 font-black text-amber-400">R$ 38,90</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center font-black">
              <span>Total</span>
              <span className="text-xl">R$ 38,90</span>
            </div>
            <button className="w-full mt-4 h-12 bg-amber-500 text-orange-950 font-black rounded-xl">Finalizar Pedido</button>
          </motion.div>

          {/* Textos e Botões de Pagamento */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-serif font-black leading-tight mb-6">
              Facilite os pagamentos e <span className="text-amber-500">conquiste a clientela.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-zinc-300 mb-8 font-medium">
              Garanta conveniência absoluta oferecendo múltiplos métodos de pagamento. Deixe seu cliente escolher como prefere pagar a conta, reduzindo o tempo de atendimento e facilitando o recebimento direto.
            </motion.p>
            
            <motion.div variants={staggerContainer} className="flex flex-wrap gap-3">
              {["Pix Automático no Zap", "Cartão de Crédito Online", "Pagar na Entrega", "Google Pay & Apple Pay"].map((method, i) => (
                <motion.div key={i} variants={fadeUp} className="px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700 text-sm font-bold text-zinc-200 flex items-center gap-2 backdrop-blur-sm">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  {method}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* 7. DEPOIMENTOS */}
      <section className="py-24 bg-[#FDFBF7] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-orange-950">Quem usa a RangoClick, recomenda!</h2>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-stone-100">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-zinc-600 text-lg italic mb-6 leading-relaxed">
              "Hoje, com 9 mesas e delivery ativo, só preciso de 1 pessoa atendendo com qualidade e nossa taxa de erros é praticamente zero. Além disso, ao final do dia o fechamento financeiro é automático."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-500">M</div>
              <div>
                <h5 className="font-bold text-zinc-900">Marcelo R.</h5>
                <span className="text-xs text-zinc-500 font-semibold">Dono de Hamburgueria</span>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-stone-100">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-zinc-600 text-lg italic mb-6 leading-relaxed">
              "Antes era uma confusão de áudios no WhatsApp. Agora o cliente entra, seleciona os opcionais, insere a taxa de entrega e paga online. O pedido cai pronto na impressora da cozinha!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-500">S</div>
              <div>
                <h5 className="font-bold text-zinc-900">Sabrina G.</h5>
                <span className="text-xs text-zinc-500 font-semibold">Proprietária de Pizzaria</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 8. PAINEL DE GESTÃO (DARK SECTION) */}
      <section className="py-24 bg-zinc-950 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest mb-6">
            <LayoutDashboard className="w-4 h-4" /> Gestão Inteligente
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-white mb-6">PAINEL DE FATURAMENTO AUTOMÁTICO</h2>
          <p className="text-zinc-400 text-lg font-medium max-w-3xl mx-auto">
            Acompanhe seu faturamento em tempo real, sem planilhas. Cada pedido concluído atualiza automaticamente o seu relatório financeiro. Tenha controle completo de vendas, formas de pagamento e ticket médio.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="bg-[#0c0c0e] border border-zinc-800/80 rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <span className="text-zinc-400 text-sm font-bold block mb-2">Faturamento Hoje</span>
                <span className="text-3xl font-black text-green-400">R$ 1.248,50</span>
              </div>
              <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <span className="text-zinc-400 text-sm font-bold block mb-2">Pedidos Concluídos</span>
                <span className="text-3xl font-black text-white">42</span>
              </div>
              <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <span className="text-zinc-400 text-sm font-bold block mb-2">Ticket Médio</span>
                <span className="text-3xl font-black text-white">R$ 29,72</span>
              </div>
            </div>

            {/* Gráfico Animado Fake */}
            <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2">
              {[40, 60, 30, 80, 50, 90, 70].map((height, i) => (
                <div key={i} className="w-full flex flex-col items-center gap-3">
                  <motion.div 
                    initial={{ height: 0 }} whileInView={{ height: `${height}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                    className="w-full bg-gradient-to-t from-green-500/20 to-green-400/80 rounded-t-lg relative group cursor-pointer"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-xs font-bold px-2 py-1 rounded text-white pointer-events-none">
                      {height * 15}
                    </div>
                  </motion.div>
                  <span className="text-xs font-bold text-zinc-500 uppercase">{["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][i]}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 9. PRICING */}
      <section id="planos" className="py-24 bg-stone-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-serif font-black text-orange-950 mb-4">Quanto custa ter o delivery mais moderno?</h2>
            <p className="text-zinc-600 text-lg font-medium">Sem pegadinhas, sem contratos de fidelidade e sem letras miúdas.</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="max-w-md mx-auto bg-white rounded-[2rem] p-8 sm:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-orange-100 relative overflow-hidden group"
          >
            {/* Brilho hover animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 font-black text-xs uppercase tracking-widest mb-6">Plano Completo</div>
              
              <div className="mb-6">
                <div className="text-4xl font-black text-zinc-900 mb-2">R$ 0 <span className="text-lg text-zinc-400 font-medium tracking-normal">nos primeiros 7 dias</span></div>
                <div className="text-sm font-bold text-zinc-500 bg-stone-100 inline-block px-3 py-1 rounded-lg">DEPOIS R$ 3,30 / dia (R$ 99/mês)</div>
              </div>

              <p className="text-sm font-semibold text-zinc-600 mb-8 border-b border-stone-100 pb-6">
                Faturamento simples: sem fidelidade, cancele quando quiser.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  "Pedidos ILIMITADOS via WhatsApp",
                  "Ferramenta de Sorteios Internos Integrada",
                  "Painel de Faturamento e Relatórios Diários",
                  "Cadastro de produtos com fotos em Alta Resolução",
                  "Link 100% Personalizado e Rápido",
                  "Suporte Prioritário para o Seu Delivery"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                    <span className="text-zinc-700 font-medium text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Link to="/cadastro" className="w-full h-14 rounded-xl bg-amber-500 hover:bg-amber-400 text-orange-950 font-black text-base flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20 relative overflow-hidden group/btn">
                <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                Começar Meu Teste Gratuito
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 10. FAQ ACCORDION */}
      <section id="faq" className="py-24 bg-[#FDFBF7]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-orange-950">Dúvidas Frequentes</h2>
          </div>

          <Accordion.Root type="single" collapsible className="space-y-4">
            {[
              { q: "Preciso colocar meu cartão de crédito para testar?", a: "Não! Você pode criar sua conta e usar todas as funcionalidades premium por 7 dias totalmente grátis, sem precisar cadastrar nenhum cartão." },
              { q: "É muito difícil configurar o cardápio?", a: "Pelo contrário. Nosso painel foi desenhado para ser intuitivo. Você pode cadastrar seus produtos, categorias e adicionais em poucos minutos, direto pelo celular ou computador." },
              { q: "Meus clientes precisam baixar algum aplicativo no celular?", a: "Não. O cardápio abre instantaneamente no navegador de qualquer celular quando o cliente clica no seu link (que pode estar na bio do Instagram ou resposta automática do WhatsApp)." },
              { q: "Como eu recebo o faturamento das minhas vendas?", a: "O dinheiro vai direto para você! Se o cliente pagar via Pix, cai na sua conta na hora. Se for maquininha na entrega, você recebe normalmente. Nós não intermediamos e não cobramos taxas sobre os seus pedidos." }
            ].map((faq, i) => (
              <Accordion.Item key={i} value={`item-${i}`} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                <Accordion.Header>
                  <Accordion.Trigger className="w-full px-6 py-5 flex items-center justify-between text-left group">
                    <span className="font-bold text-zinc-800 group-hover:text-amber-600 transition-colors text-lg">{faq.q}</span>
                    <ChevronDown className="w-5 h-5 text-zinc-400 group-data-[state=open]:rotate-180 transition-transform duration-300" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="px-6 pb-5 pt-0 text-zinc-600 font-medium leading-relaxed">
                    {faq.a}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 grayscale opacity-70">
             <img src="/logo-branca.png" alt="RangoClick Logo" className="h-8 w-auto object-contain hidden" />
             <span className="text-xl font-black tracking-tighter text-white">RangoClick</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-semibold text-zinc-500">
            <Link to="/termos" className="hover:text-white transition">Termos de Uso</Link>
            <Link to="/privacidade" className="hover:text-white transition">Privacidade</Link>
          </div>

          <p className="text-sm font-semibold text-zinc-600">
            &copy; 2026 RangoClick. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes accordion-down {
          from { height: 0; }
          to { height: var(--radix-accordion-content-height); }
        }
        @keyframes accordion-up {
          from { height: var(--radix-accordion-content-height); }
          to { height: 0; }
        }
        .animate-accordion-down {
          animation: accordion-down 0.3s cubic-bezier(0.87, 0, 0.13, 1);
        }
        .animate-accordion-up {
          animation: accordion-up 0.3s cubic-bezier(0.87, 0, 0.13, 1);
        }
      `}</style>
    </div>
  );
}
