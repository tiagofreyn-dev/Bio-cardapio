import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MenuHeader } from "@/components/menu/MenuHeader";
import { HeroBanner } from "@/components/menu/HeroBanner";
import { LoyaltyCard } from "@/components/menu/LoyaltyCard";
import { CategoryBar } from "@/components/menu/CategoryBar";
import { ProductCard } from "@/components/menu/ProductCard";
import { CustomizeModal } from "@/components/menu/CustomizeModal";
import { CartFooter } from "@/components/menu/CartFooter";
import { CartDrawer } from "@/components/menu/CartDrawer";
import type { CartItem, Category, Product, Campaign, Loja } from "@/lib/types";
import { brl } from "@/lib/format";
import { storage } from "@/lib/storage";
import { useStorageSync } from "@/hooks/use-storage";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Lock, ArrowLeft, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/cardapio/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Carregando Cardápio — ${params.slug}` },
    ],
  }),
  component: DynamicCardapio,
});

function DynamicCardapio() {
  const { slug } = Route.useParams();
  const [store, setStore] = useState<Loja | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);

  // Estados locais do menu
  const products = useStorageSync(() => storage.getProducts());
  const settings = useStorageSync(() => storage.getSettings());
  const [category, setCategory] = useState<Category>("todos");
  const [customizing, setCustomizing] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // 1. Carregar Dados do Tenant a partir do Supabase
  useEffect(() => {
    async function loadStore() {
      setLoading(true);
      try {
        if (!supabase) return;

        // Buscar loja por slug
        const { data: storeData, error: storeError } = await supabase
          .from("lojas")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (storeError) throw storeError;
        if (!storeData) {
          setStore(null);
          setLoading(false);
          return;
        }

        setStore(storeData);

        // Se o cardápio estiver ativo ou cobrança automática estiver desabilitada, sincroniza os produtos e configurações
        if (storeData.status_assinatura === "ativo" || storeData.cobranca_automatica === false) {
          // Buscar produtos reais da loja
          const { data: productsData, error: productsError } = await supabase
            .from("produtos")
            .select("*")
            .eq("loja_id", storeData.id)
            .order("preco", { ascending: true });

          if (productsError) throw productsError;

          // Mapear produtos para o formato do frontend
          const mappedProducts: Product[] = (productsData || []).map((p) => ({
            id: p.id,
            name: p.nome,
            description: p.descricao || "",
            price: Number(p.preco),
            image: p.imagem || "🍔",
            category: p.category || "hamburgueres",
            available: p.disponivel,
            customizable: p.customizavel,
            adicionais: p.adicionais || [],
            is_featured: p.is_featured,
          }));

          // Mapear configurações da loja
          const mappedSettings = {
            storeName: storeData.nome,
            whatsapp: storeData.whatsapp || "5546999999999",
            isOpen: true,
            loyaltyMinOrder: 30,
            loyaltyGoal: 10,
            deliveryFee: Number(storeData.taxa_entrega) || 0,
            pixKey: storeData.chave_pix || "",
            pixName: storeData.titular_pix || "",
            storeAddress: storeData.endereco || "",
            loyaltyActive: storeData.fidelidade_ativo !== false,
          };

          // Salvar no localStorage temporário do cliente para reatividade dos componentes locais
          localStorage.setItem("insano.products", JSON.stringify(mappedProducts));
          localStorage.setItem("insano.settings", JSON.stringify(mappedSettings));
          localStorage.setItem("insano.tenant.activeId", storeData.id);

          // Atualizar o titulo da página na aba do navegador
          document.title = `${storeData.nome} — Cardápio Digital`;

          // Disparar evento para recarregar componentes reativos
          window.dispatchEvent(new CustomEvent("insano-storage"));
        }
      } catch (err) {
        console.error("Erro ao carregar cardápio dinâmico:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, [slug]);

  // Aplicar Cor do Tema Dinamicamente
  useEffect(() => {
    if (store?.cor_tema) {
      let hex = "#EF4444"; // Vermelho
      if (store.cor_tema === "Azul") hex = "#3B82F6";
      else if (store.cor_tema === "Verde") hex = "#10B981";
      else if (store.cor_tema === "Roxo") hex = "#8B5CF6";
      else if (store.cor_tema === "Laranja") hex = "#F59E0B";

      document.documentElement.style.setProperty("--primary", hex);
      document.documentElement.style.setProperty("--primary-foreground", "#ffffff");
    }
  }, [store]);

  // Carregar carrinho e campanha
  useEffect(() => {
    try {
      const raw = localStorage.getItem("insano.cart");
      if (raw) setCart(JSON.parse(raw));
    } catch {}

    async function fetchCampaign() {
      try {
        if (!supabase) return;
        const { data, error } = await supabase
          .from("campaigns")
          .select("*")
          .eq("is_active", true)
          .maybeSingle();

        if (error) throw error;
        if (data) setActiveCampaign(data);
      } catch (err) {
        console.error("Erro ao buscar campanha ativa:", err);
      }
    }
    fetchCampaign();
  }, []);

  useEffect(() => {
    localStorage.setItem("insano.cart", JSON.stringify(cart));
  }, [cart]);

  const categoriesList = useMemo(() => {
    const list = products || [];
    return Array.from(new Set(list.map((p) => p.category))).filter(Boolean);
  }, [products]);

  const filtered = useMemo(() => {
    const list = products || [];
    return category === "todos"
      ? list
      : list.filter((p) => p.category === category);
  }, [products, category]);
  const featured = useMemo(() => {
    const list = products || [];
    return list.filter((p) => p.is_featured);
  }, [products]);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  function handleAdd(p: Product) {
    if (!settings.isOpen) {
      alert("Loja fechada no momento.");
      return;
    }
    if (p.customizable) {
      setCustomizing(p);
    } else {
      setCart((c) => [...c, { id: crypto.randomUUID(), productId: p.id, name: p.name, price: p.price, qty: 1 }]);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-bold text-zinc-400">Carregando cardápio digital...</p>
      </div>
    );
  }

  // Se o comércio não existir
  if (!store) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-900/10 flex items-center justify-center border border-red-500/20 text-red-500">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black">Comércio não encontrado</h2>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto">
            O endereço digitado não corresponde a nenhuma loja cadastrada no nosso sistema SaaS.
          </p>
        </div>
        <Link
          to="/"
          className="h-11 px-6 rounded-xl bg-zinc-900 ring-1 ring-border font-bold text-sm inline-flex items-center gap-2 hover:bg-zinc-800 transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Início
        </Link>
      </div>
    );
  }

  // TRAVA DE PAYWALL: Se status_assinatura for 'pendente' e cobrança automática estiver ativa
  if (store.status_assinatura === "pendente" && store.cobranca_automatica !== false) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 animate-pulse">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2 max-w-md">
          <span className="text-[10px] uppercase font-black tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/25">
            Cardápio em Construção
          </span>
          <h2 className="text-3xl font-black tracking-tight pt-2">Acesso Restrito</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Olá! O cardápio digital do estabelecimento **{store.nome}** está sendo configurado e logo estará disponível para novos pedidos!
          </p>
        </div>
        <div className="p-4 bg-zinc-900 ring-1 ring-border rounded-2xl max-w-sm text-xs text-zinc-400 leading-relaxed">
          <p className="font-bold text-white mb-1">Dono do Estabelecimento?</p>
          Acesse a Dashboard Administrativa agora mesmo para configurar seus produtos, visualizar o preview e assinar o plano SaaS por R$ 99,90/mês para liberar o acesso!
        </div>
        <Link
          to="/admin"
          className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-black text-sm inline-flex items-center gap-2 shadow-[0_5px_20px_rgba(239,68,68,0.3)] active:scale-95 transition"
        >
          Entrar na Dashboard Admin
        </Link>
      </div>
    );
  }

  // RENDERIZAÇÃO OFICIAL DO CARDÁPIO ATIVO
  return (
    <div className="min-h-screen pb-28">
      <MenuHeader storeName={store.nome} isLegacy={false} />

      {activeCampaign && (
        <div className="px-4 pt-4">
          <div className="bg-gradient-to-r from-red-950/70 via-red-900/60 to-red-950/70 border-2 border-red-500/50 rounded-2xl p-4 shadow-[0_10px_25px_rgba(239,68,68,0.15)] relative overflow-hidden animate-pulse">
            <div className="relative z-10 flex items-center gap-3">
              {activeCampaign.image && (activeCampaign.image.startsWith("http") || activeCampaign.image.startsWith("/")) ? (
                <img src={activeCampaign.image} className="w-14 h-14 object-cover rounded-xl shrink-0 ring-2 ring-red-500/50" />
              ) : (
                <span className="text-3xl shrink-0">{activeCampaign.image || "🏆"}</span>
              )}
              <div className="text-left">
                <h4 className="font-black text-white text-xs sm:text-sm uppercase tracking-wider">Sorteio Ativo: {activeCampaign.title}</h4>
                <p className="text-[11px] sm:text-xs text-zinc-300 mt-0.5">
                  Faça um pedido a partir de <span className="font-extrabold text-primary">{brl(activeCampaign.min_value)}</span> e participe automaticamente!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner do primeiro Destaque */}
      {featured.length > 0 && <HeroBanner product={featured[0]} />}

      {featured.length > 0 && (
        <section className="pt-4 pb-2">
          <h2 className="px-4 font-extrabold text-lg mb-3" translate="no">🔥 Destaques da Semana</h2>
          <div className="flex gap-3 overflow-x-auto px-4 pb-4 no-scrollbar snap-x">
            {featured.map((p) => {
              const out = !p.available;
              return (
                <article key={p.id} className={`w-[160px] sm:w-[180px] shrink-0 snap-start flex flex-col p-3 rounded-2xl bg-surface ring-1 ring-border ${out ? "opacity-60" : ""} h-[240px]`}>
                  <div className="w-full h-28 rounded-xl bg-gradient-to-br from-primary/20 to-surface-elevated flex items-center justify-center overflow-hidden text-5xl mb-3 shrink-0">
                    {p.image && (p.image.startsWith('http') || p.image.startsWith('/')) ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      p.image
                    )}
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <h4 className="font-bold text-sm leading-tight line-clamp-2">{p.name}</h4>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="text-primary font-extrabold text-sm">{brl(p.price)}</span>
                      <button
                        disabled={out}
                        onClick={() => handleAdd(p)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground disabled:bg-muted disabled:text-muted-foreground shadow-md active:scale-95 transition"
                      >
                        {out ? "✕" : "+"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {settings.loyaltyActive !== false && <LoyaltyCard />}
      <CategoryBar value={category} onChange={setCategory} categories={categoriesList} />
      <main className="px-4 py-4 space-y-3">
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum item nesta categoria.</p>}
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} onAdd={() => handleAdd(p)} disabled={!settings.isOpen} />
        ))}
      </main>

      <footer className="mt-8 mb-4 flex flex-col items-center justify-center gap-1.5 text-center px-4">
        <p className="text-sm font-black text-white">{settings.storeName}</p>
        <p className="text-xs text-zinc-500">📍 {settings.storeAddress || "Endereço não cadastrado"}</p>
        <p className="text-[10px] text-zinc-650 mt-4">Cardápio Digital © 2026. Todos os direitos reservados.</p>
      </footer>

      {customizing && (
        <CustomizeModal 
          product={customizing} 
          onClose={() => setCustomizing(null)} 
          onConfirm={(selectedAdditions) => {
            const additionsText = selectedAdditions.length > 0 
              ? ` (+ ${selectedAdditions.map(a => a.nome).join(", ")})` 
              : "";
            const namePlus = customizing.name + additionsText;
            const extraPrice = selectedAdditions.reduce((sum, a) => sum + a.preco, 0);
            
            setCart((c) => [...c, {
              id: crypto.randomUUID(),
              productId: customizing.id,
              name: namePlus,
              price: customizing.price + extraPrice,
              qty: 1,
              adicionaisSelecionados: selectedAdditions,
            }]);
            setCustomizing(null);
          }} 
        />
      )}

      {count > 0 && <CartFooter qty={count} total={subtotal} onClick={() => setCartOpen(true)} />}

      {cartOpen && (
        <CartDrawer
          items={cart}
          onClose={() => setCartOpen(false)}
          onUpdate={(id, qty) => setCart((c) => (qty <= 0 ? c.filter((i) => i.id !== id) : c.map((i) => (i.id === id ? { ...i, qty } : i))))}
          onRemove={(id) => setCart((c) => c.filter((i) => i.id !== id))}
          onClear={() => setCart([])}
        />
      )}
    </div>
  );
}
