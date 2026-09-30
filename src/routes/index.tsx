import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import * as Accordion from "@radix-ui/react-accordion";
import { 
  Check, ArrowRight, Smartphone, Star, 
  ChevronDown, LayoutDashboard, Shield, Ticket,
  Zap, PieChart, Store, Menu, X, CheckCircle2,
  TrendingUp, Clock, CreditCard, Gift, MessageCircle
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
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
  const [activeWorkflowTab, setActiveWorkflowTab] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 font-sans overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* CABEÇALHO / NAVBAR */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-zinc-950/80 backdrop-blur-xl shadow-2xl border-b border-white/10' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition z-50">
            <span className="text-xl font-black tracking-tighter text-white">Rango<span className="text-amber-500">Click</span></span>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#o-que-e" className="text-sm font-semibold text-zinc-400 hover:text-white transition">O que é?</a>
            <a href="#como-funciona" className="text-sm font-semibold text-zinc-400 hover:text-white transition">Como Funciona</a>
            <a href="#faq" className="text-sm font-semibold text-zinc-400 hover:text-white transition">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/admin" className="text-sm font-bold text-zinc-400 hover:text-white transition">
              Área do Lojista
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
              className="absolute top-full left-0 w-full bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 p-6 flex flex-col gap-4 shadow-2xl md:hidden"
            >
              <a href="#o-que-e" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-zinc-300">O que é?</a>
              <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-zinc-300">Como Funciona</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-zinc-300">FAQ</a>
              <div className="h-px w-full bg-zinc-800 my-2" />
              <Link to="/admin" className="text-lg font-bold text-zinc-300 text-center py-2">Área do Lojista</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 1. SEÇÃO HERO (ULTRA PREMIUM DARK MODE) */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden pt-32 pb-20">
        {/* Glow de Fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-4xl mx-auto flex flex-col items-center">
            
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>A Revolução do Delivery</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl md:text-8xl font-black text-white leading-[1.05] tracking-tight mb-8">
              Esqueça as taxas. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-600">
                Domine suas vendas.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-zinc-400 font-medium leading-relaxed mb-12 max-w-2xl">
              Uma plataforma completa para criar seu cardápio digital, receber pedidos diretamente no WhatsApp e gerenciar seu faturamento com a mesma tecnologia das grandes marcas.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <Link to="/cardapio/burguer-carrg" className="w-full sm:w-auto h-14 px-8 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-black text-base flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                Ver Loja Demo
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. O QUE É O RANGOCLICK (BENTO GRID INTERATIVO) */}
      <section id="o-que-e" className="py-24 relative overflow-hidden bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">O que é a <span className="text-amber-500">RangoClick?</span></h2>
            <p className="text-zinc-400 text-lg font-medium max-w-2xl mx-auto">
              Muito mais que um cardápio em PDF. É uma máquina de conversão desenhada para automatizar o seu atendimento e fidelizar clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Bento 1: Cardápio Digital (Ocupa 2 colunas) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="md:col-span-2 bg-[#121214] border border-white/10 rounded-3xl p-8 sm:p-10 relative overflow-hidden group hover:border-amber-500/30 transition-colors"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full" />
              <div className="relative z-10 md:w-3/5">
                <Smartphone className="w-10 h-10 text-amber-500 mb-6" />
                <h3 className="text-3xl font-black text-white mb-4">Cardápio Inteligente</h3>
                <p className="text-zinc-400 font-medium leading-relaxed mb-8">
                  Crie categorias, insira fotos em altíssima resolução, configure adicionais pagos e gerencie taxas de entrega. O sistema calcula tudo sozinho.
                </p>
              </div>
              {/* Mockup flutuante lateral */}
              <div className="hidden md:block absolute -right-4 -bottom-16 w-[280px] h-[400px] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl transform rotate-[-5deg] group-hover:rotate-[0deg] group-hover:-translate-y-4 transition-all duration-500 p-4">
                <div className="w-full h-full bg-zinc-950 rounded-2xl p-3 flex flex-col gap-3">
                  <div className="w-full h-24 bg-zinc-800 rounded-xl animate-pulse" />
                  <div className="w-3/4 h-6 bg-zinc-800 rounded-md" />
                  <div className="w-full h-12 bg-zinc-800 rounded-lg opacity-50" />
                  <div className="w-full h-12 bg-zinc-800 rounded-lg opacity-50" />
                  <div className="w-full h-12 bg-zinc-800 rounded-lg opacity-50" />
                </div>
              </div>
            </motion.div>

            {/* Bento 2: Integração WhatsApp */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="bg-[#121214] border border-white/10 rounded-3xl p-8 sm:p-10 relative overflow-hidden group hover:border-green-500/30 transition-colors"
            >
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-500/10 blur-[60px] rounded-full" />
              <MessageCircle className="w-10 h-10 text-green-500 mb-6" />
              <h3 className="text-2xl font-black text-white mb-4">Pedido no Zap</h3>
              <p className="text-zinc-400 font-medium leading-relaxed">
                Esqueça os áudios longos e confusos. O cliente monta o lanche e você recebe uma mensagem padronizada no WhatsApp com endereço, troco e PIX.
              </p>
            </motion.div>

            {/* Bento 3: Fidelidade */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="bg-[#121214] border border-white/10 rounded-3xl p-8 sm:p-10 relative overflow-hidden group hover:border-purple-500/30 transition-colors"
            >
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 blur-[60px] rounded-full" />
              <Gift className="w-10 h-10 text-purple-500 mb-6" />
              <h3 className="text-2xl font-black text-white mb-4">Fidelidade & Sorteios</h3>
              <p className="text-zinc-400 font-medium leading-relaxed">
                Cartão fidelidade embutido no navegador do cliente (ex: compre 10, ganhe 1). Mais incentivo para ele voltar a pedir sempre com você.
              </p>
            </motion.div>

            {/* Bento 4: Gestão Financeira (Ocupa 2 colunas) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
              className="md:col-span-2 bg-[#121214] border border-white/10 rounded-3xl p-8 sm:p-10 relative overflow-hidden group hover:border-blue-500/30 transition-colors flex flex-col md:flex-row items-center justify-between gap-8"
            >
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full" />
              <div className="relative z-10 flex-1">
                <PieChart className="w-10 h-10 text-blue-500 mb-6" />
                <h3 className="text-3xl font-black text-white mb-4">Dashboard Financeiro</h3>
                <p className="text-zinc-400 font-medium leading-relaxed">
                  Todo pedido feito no site é automaticamente registrado na sua nuvem. Acompanhe seu faturamento diário, ticket médio e volume de vendas em tempo real.
                </p>
              </div>
              <div className="w-full md:w-[250px] shrink-0 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl transform group-hover:scale-105 transition-transform duration-500">
                <div className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Faturamento Hoje</div>
                <div className="text-2xl font-black text-blue-400 mb-4">R$ 1.248,50</div>
                <div className="flex items-end gap-1.5 h-16">
                  {[30, 45, 20, 60, 35, 80, 50].map((h, i) => (
                    <div key={i} className="flex-1 bg-blue-500/20 rounded-sm" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. COMO FUNCIONA (FLUXO INTERATIVO) */}
      <section id="como-funciona" className="py-32 bg-[#09090b] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">Como funciona na prática?</h2>
            <p className="text-zinc-400 text-lg font-medium">Um fluxo perfeito do clique à entrega.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Tabs List */}
            <div className="space-y-4">
              {[
                { title: "1. O Cliente Pede", desc: "Seu link na bio do Instagram ou resposta automática do WhatsApp abre o cardápio em menos de 1 segundo." },
                { title: "2. O Pedido Chega", desc: "Você recebe uma mensagem organizada no seu WhatsApp com itens, adicionais, troco e chave Pix." },
                { title: "3. O Sistema Analisa", desc: "O Painel Admin computa a venda, atualiza seu faturamento e marca o ponto no cartão fidelidade do cliente." },
              ].map((tab, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveWorkflowTab(i)}
                  className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                    activeWorkflowTab === i 
                      ? "bg-zinc-900 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.1)]" 
                      : "bg-[#121214] border-white/5 hover:border-white/10"
                  }`}
                >
                  <h3 className={`text-xl font-black mb-2 transition-colors ${activeWorkflowTab === i ? "text-white" : "text-zinc-500"}`}>
                    {tab.title}
                  </h3>
                  <p className={`font-medium transition-colors ${activeWorkflowTab === i ? "text-zinc-400" : "text-zinc-600"}`}>
                    {tab.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Visualizer */}
            <div className="relative h-[500px] bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {activeWorkflowTab === 0 && (
                  <motion.div key="tab0" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }} className="relative z-10 w-full max-w-[300px]">
                    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-4 shadow-2xl">
                      <div className="w-full h-32 bg-zinc-800 rounded-2xl mb-4 animate-pulse"></div>
                      <div className="space-y-3">
                        <div className="h-6 w-3/4 bg-zinc-800 rounded"></div>
                        <div className="h-4 w-1/2 bg-zinc-800 rounded opacity-50"></div>
                        <div className="h-10 w-full bg-amber-500/20 border border-amber-500/40 rounded-xl mt-4 flex items-center justify-center text-amber-500 font-bold text-xs">Adicionar à Sacola</div>
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeWorkflowTab === 1 && (
                  <motion.div key="tab1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }} className="relative z-10 w-full max-w-[340px]">
                    <div className="w-full bg-[#efeae2] border-8 border-zinc-950 rounded-[2.5rem] p-4 shadow-2xl h-[400px] flex flex-col justify-end">
                      <div className="bg-[#d9fdd3] text-zinc-900 p-3 rounded-2xl rounded-tr-none text-xs font-mono shadow-sm self-end w-[85%]">
                        *Novo Pedido!* 🚀<br/>
                        --------------------<br/>
                        *Itens:*<br/>
                        - 1x Burger Duplo<br/>
                        - 1x Adicional: Bacon<br/>
                        --------------------<br/>
                        *Total:* R$ 38,00
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeWorkflowTab === 2 && (
                  <motion.div key="tab2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }} className="relative z-10 w-full">
                    <div className="w-full bg-[#121214] border border-zinc-800 rounded-3xl p-6 shadow-2xl">
                       <div className="flex justify-between items-center mb-6">
                         <div className="w-10 h-10 bg-zinc-800 rounded-full"></div>
                         <div className="w-24 h-4 bg-zinc-800 rounded-full"></div>
                       </div>
                       <div className="grid grid-cols-2 gap-4 mb-6">
                         <div className="h-20 bg-zinc-800 rounded-2xl"></div>
                         <div className="h-20 bg-zinc-800 rounded-2xl"></div>
                       </div>
                       <div className="h-32 bg-zinc-800 rounded-2xl"></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Abstract Background Shapes */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-zinc-800/30 rounded-full blur-[80px]" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. VANTAGENS */}
      <section id="vantagens" className="py-24 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">Vantagens Exclusivas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {[
              {
                icon: <PieChart className="w-8 h-8 text-amber-500" />,
                title: "0% taxas, 100% lucros",
                desc: "Marketplaces tradicionais cobram taxas abusivas de até 30% sobre seus pedidos. Aqui, você não paga comissões."
              },
              {
                icon: <Store className="w-8 h-8 text-amber-500" />,
                title: "Autonomia Total",
                desc: "Altere preços, pause produtos esgotados e mude taxas de entrega em tempo real sem depender de suporte."
              },
              {
                icon: <Zap className="w-8 h-8 text-amber-500" />,
                title: "Velocidade Extrema",
                desc: "Construído com tecnologia de ponta (Offline-first JSON) para carregar instantaneamente mesmo no 3G."
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-amber-500" />,
                title: "Aumento do Ticket Médio",
                desc: "Sistemas visuais estimulam o cliente a pedir extras. Um simples botão 'Adicionar Bacon' aumenta o ticket médio em 15%."
              }
            ].map((v, i) => (
              <motion.div 
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="flex gap-6 p-8 rounded-3xl bg-[#121214] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                  {v.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-zinc-400 font-medium leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section id="faq" className="py-24 bg-zinc-950 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white">Dúvidas Frequentes</h2>
          </div>

          <Accordion.Root type="single" collapsible className="space-y-4">
            {[
              { q: "Preciso cadastrar o cartão de crédito para o teste?", a: "Não! O teste de 7 dias é totalmente gratuito e livre de amarras. Você não precisa inserir nenhum cartão de crédito para começar." },
              { q: "O cliente precisa baixar aplicativo?", a: "Nada disso. O cardápio abre no navegador (Google Chrome, Safari) direto do WhatsApp ou Instagram." },
              { q: "Quem cobra do cliente e recebe o dinheiro?", a: "Você! O dinheiro vai direto para você. Se for Pix, cai na sua conta na hora. Nós não pegamos na sua grana e não cobramos % de comissão." },
              { q: "É difícil cadastrar meus lanches?", a: "Extremamente simples. O painel foi desenhado para ser intuitivo, permitindo cadastrar um lanche completo em 30 segundos, direto pelo celular." }
            ].map((faq, i) => (
              <Accordion.Item key={i} value={`item-${i}`} className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
                <Accordion.Header>
                  <Accordion.Trigger className="w-full px-6 py-5 flex items-center justify-between text-left group">
                    <span className="font-bold text-zinc-300 group-hover:text-white transition-colors text-lg">{faq.q}</span>
                    <ChevronDown className="w-5 h-5 text-zinc-500 group-data-[state=open]:rotate-180 transition-transform duration-300" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="px-6 pb-5 pt-0 text-zinc-500 font-medium leading-relaxed">
                    {faq.a}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-[#09090b] border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
             <span className="text-xl font-black tracking-tighter text-white">RangoClick</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-semibold text-zinc-600">
            <Link to="/termos" className="hover:text-zinc-400 transition">Termos de Uso</Link>
            <Link to="/privacidade" className="hover:text-zinc-400 transition">Privacidade</Link>
          </div>

          <p className="text-sm font-semibold text-zinc-700">
            &copy; {new Date().getFullYear()} RangoClick. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Global CSS for Animations */}
      <style>{`
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
