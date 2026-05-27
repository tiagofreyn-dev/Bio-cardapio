import { useMemo, useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
 
export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      loja: (search.loja as string) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Insano Lanches — Cardápio Digital" },
      { name: "description", content: "Hambúrgueres premium, porções e bebidas. Peça pelo WhatsApp." },
    ],
  }),
  component: Index,
});
 
function Index() {
  const { loja } = Route.useSearch();
  const navigate = useNavigate();

  // Redirecionamento automático caso seja passado o parâmetro legacy ?loja=
  useEffect(() => {
    if (loja && loja !== "insano-lanches") {
      navigate({ to: "/cardapio/$slug", params: { slug: loja }, replace: true });
    }
  }, [loja]);

  const [loadingStore, setLoadingStore] = useState(true);
  const [store, setStore] = useState<Loja | null>(null);

  // Estados locais do menu
  const products = useStorageSync(() => storage.getProducts());
  const settings = useStorageSync(() => storage.getSettings());
  const [category, setCategory] = useState<Category>("hamburgueres");
  const [customizing, setCustomizing] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);

  // 1. Carregar Hamburgueria Antiga (ID Fixo) a partir do Supabase
  useEffect(() => {
    async function loadLegacyStore() {
      setLoadingStore(true);
      try {
        if (!supabase) {
          setLoadingStore(false);
          return;
        }

        const legacyId = "d3b07384-d113-4ec5-a55d-e0c157855d01";
        
        // Buscar loja legada
        const { data: storeData, error: storeError } = await supabase
          .from("lojas")
          .select("*")
          .eq("id", legacyId)
          .maybeSingle();

        if (storeError) throw storeError;
        if (storeData) {
          setStore(storeData);

          // Buscar produtos reais da loja
          const { data: productsData, error: productsError } = await supabase
            .from("produtos")
            .select("*")
            .eq("loja_id", storeData.id);

          if (productsError) throw productsError;

          // Mapear produtos
          const mappedProducts: Product[] = (productsData || []).map((p) => ({
            id: p.id,
            name: p.nome,
            description: p.descricao || "",
            price: Number(p.preco),
            image: p.imagem || "🍔",
            category: p.category || "hamburgueres",
            available: p.disponivel,
            customizable: p.customizavel,
            hasLettuceOption: p.has_lettuce_option,
            hasKetchupOption: p.has_ketchup_option,
            hasMayoOption: p.has_mayo_option,
          }));

          // Mapear configurações
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
          };

          // Salvar no localStorage temporário para renderização reativa
          localStorage.setItem("insano.products", JSON.stringify(mappedProducts));
          localStorage.setItem("insano.settings", JSON.stringify(mappedSettings));
          localStorage.setItem("insano.tenant.activeId", storeData.id);

          // Disparar evento para atualizar os componentes
          window.dispatchEvent(new CustomEvent("insano-storage"));
        }
      } catch (err) {
        console.error("Erro ao carregar hamburgueria legada do Supabase:", err);
      } finally {
        setLoadingStore(false);
      }
    }
    loadLegacyStore();
  }, []);

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

  useEffect(() => {
    try {
      const savedName = localStorage.getItem("insano.user.name");
      const savedPoints = localStorage.getItem("insano.loyalty.points");
      
      if (savedName && savedPoints) {
        const nameLower = savedName.trim().toLowerCase();
        const pointsNum = parseInt(savedPoints, 10);

        // 1. Correção para Vanessa (deduzir 3 pontos extras)
        const wasVanessaCorrected = localStorage.getItem("insano.loyalty.corrected_vanessa_v1");
        if (nameLower === "vanessa" && !wasVanessaCorrected) {
          if (pointsNum >= 4) {
            const correctedPoints = Math.max(1, pointsNum - 3);
            localStorage.setItem("insano.loyalty.points", JSON.stringify(correctedPoints));
            localStorage.setItem("insano.loyalty.corrected_vanessa_v1", "true");
            window.dispatchEvent(new CustomEvent("insano-storage"));
            console.log("Pontos de fidelidade corrigidos para a cliente Vanessa.");
          }
        }

        // 2. Correção para Jonathan (deduzir 1 ponto extra)
        const wasJonathanCorrected = localStorage.getItem("insano.loyalty.corrected_jonathan_v1");
        if (nameLower.includes("jonathan") && !wasJonathanCorrected) {
          if (pointsNum >= 2) {
            const correctedPoints = Math.max(1, pointsNum - 1);
            localStorage.setItem("insano.loyalty.points", JSON.stringify(correctedPoints));
            localStorage.setItem("insano.loyalty.corrected_jonathan_v1", "true");
            window.dispatchEvent(new CustomEvent("insano-storage"));
            console.log("Pontos de fidelidade corrigidos para o cliente Jonathan.");
          }
        }
      }
    } catch (err) {
      console.error("Erro ao corrigir pontos de fidelidade dos clientes:", err);
    }
  }, []);

  const filtered = useMemo(() => products.filter((p) => p.category === category), [products, category]);
  const featured = useMemo(() => products.filter((p) => p.is_featured), [products]);
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

  return (
    <div className="min-h-screen pb-28">
      <MenuHeader isLegacy={true} />

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
                {activeCampaign.ends_at && (
                  <p className="text-[10px] text-red-450 font-black mt-1 uppercase tracking-wide">
                    ⚡ Compre até {new Date(activeCampaign.ends_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })} para participar!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-4">
        <div className="bg-zinc-900 border border-red-500/50 rounded-xl p-3 text-center shadow-lg">
          <p className="text-sm font-bold text-white">🍟 Todos os lanches acompanham mini porção de batata e maionese caseira!</p>
        </div>
      </div>

      <HeroBanner product={featured[0]} />

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
                        disabled={out || !settings.isOpen}
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

      <LoyaltyCard />
      <CategoryBar value={category} onChange={setCategory} />
      <main className="px-4 py-4 space-y-3">
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum item nesta categoria.</p>}
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} onAdd={() => handleAdd(p)} disabled={!settings.isOpen} />
        ))}
      </main>

      <footer className="mt-8 mb-4 flex flex-col items-center justify-center gap-1.5 text-center px-4">
        <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest block">Desenvolvido por</span>
        <a 
          href="https://www.instagram.com/tiagodefreyn8?igsh=MXQ1ZWFrM2Z1OHJocg==" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-elevated hover:bg-zinc-800 ring-1 ring-border hover:ring-primary/50 transition duration-300 active:scale-95 shadow-md group"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-4 h-4 text-muted-foreground group-hover:text-primary transition duration-300"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
          <span className="text-xs font-extrabold text-foreground group-hover:text-primary transition duration-300">@tiagodefreyn8</span>
        </a>
      </footer>

      <CartFooter count={count} subtotal={subtotal} onOpen={() => setCartOpen(true)} />

      {customizing && (
        <CustomizeModal
          product={customizing}
          onClose={() => setCustomizing(null)}
          onConfirm={(opts) => {
            const addedMayoPrice = (opts.mayo ?? 0) * (settings.mayoPrice ?? 2.00);
            const addedKetchupPrice = (opts.ketchup ?? 0) > 2 ? ((opts.ketchup ?? 0) - 2) * 0.50 : 0;
            setCart((c) => [
              ...c,
              { 
                id: crypto.randomUUID(), 
                productId: customizing.id, 
                name: customizing.name, 
                price: customizing.price + addedMayoPrice + addedKetchupPrice, 
                qty: 1, 
                lettuce: opts.lettuce, 
                ketchup: opts.ketchup,
                mayo: opts.mayo
              },
            ]);
            setCustomizing(null);
          }}
        />
      )}

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
