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
import { storage, setActiveLojaId } from "@/lib/storage";
import { useStorageSync } from "@/hooks/use-storage";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Lock, ArrowLeft, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/cardapio/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `Carregando Cardápio — ${params.slug}` }],
  }),
  component: DynamicCardapio,
});

function safeUUID() {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function DynamicCardapio() {
  const { slug } = Route.useParams();
  const isPreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "true";
  const isDemo =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("demo") === "true";
  const [store, setStore] = useState<Loja | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);

  // Estados locais do menu
  const products = useStorageSync(() => storage.getProducts());
  const settings = useStorageSync(() => storage.getSettings());
  const [category, setCategory] = useState<Category>("");
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

        // Trava o escopo ANTES de escrever no storage. Antes o código escrevia
        // nas chaves globais e só depois setava o activeId, então o cardápio
        // de uma loja sobrescrevia os dados da outra no mesmo navegador.
        setActiveLojaId(storeData.id);

        const isTrialActive = (() => {
          if (!storeData.criado_em) return false;
          const createdDate = new Date(storeData.criado_em).getTime();
          const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
          return Date.now() - createdDate < sevenDaysInMs;
        })();

        // Sincroniza dados e configurações da loja
        if (storeData) {
          // Buscar dados otimizados (JSON único) da loja
          const { data: unifiedData, error: unifiedError } = await supabase
            .from("store_data")
            .select("data")
            .eq("loja_id", storeData.id)
            .maybeSingle();

          if (unifiedError) throw unifiedError;

          if (unifiedData && unifiedData.data) {
            const sd = unifiedData.data;

            // Override settings with dynamic store data for the top-level tenant logic
            const mappedSettings = {
              ...(sd.settings || {}),
              storeName: storeData.nome,
              whatsapp: isDemo
                ? "5546999999999"
                : storeData.whatsapp || sd.settings?.whatsapp || "5546999999999",
              isOpen: storeData.esta_aberta !== false,
              pixKey: isDemo
                ? "demo-pix-key@saas.com"
                : storeData.chave_pix || sd.settings?.pixKey || "",
              pixName: isDemo
                ? "Demonstração Cardápio Digital"
                : storeData.titular_pix || sd.settings?.pixName || "",
              storeAddress: storeData.endereco || sd.settings?.storeAddress || "",
              deliveryFee: Number(storeData.taxa_entrega) || sd.settings?.deliveryFee || 0,
            };

            // Escrita local escopada SEM sync para a nuvem: visitante do
            // cardápio não pode disparar upsert em store_data.
            const lid = storeData.id;
            localStorage.setItem(`insano.settings.${lid}`, JSON.stringify(mappedSettings));
            localStorage.setItem(`insano.products.${lid}`, JSON.stringify(sd.products || []));
            localStorage.setItem(
              `insano.delivery_locations.${lid}`,
              JSON.stringify(sd.delivery_locations || []),
            );
            localStorage.setItem(
              `insano.global_addons.${lid}`,
              JSON.stringify(sd.global_addons || []),
            );
            localStorage.setItem(`insano.campaigns.${lid}`, JSON.stringify(sd.campaigns || []));
          } else {
            // Fallback para fallback vazio caso a loja seja nova e ainda não tenha JSON salvo
            const lid = storeData.id;
            localStorage.setItem(
              `insano.settings.${lid}`,
              JSON.stringify({
                storeName: storeData.nome,
                whatsapp: storeData.whatsapp || "5546999999999",
              }),
            );
            localStorage.setItem(`insano.products.${lid}`, "[]");
            localStorage.setItem(`insano.delivery_locations.${lid}`, "[]");
            localStorage.setItem(`insano.global_addons.${lid}`, "[]");
            localStorage.setItem(`insano.campaigns.${lid}`, "[]");
          }

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

  // Carregar carrinho e campanha (escopados por loja para não misturar pedidos)
  useEffect(() => {
    if (!store?.id) return;
    try {
      const raw = localStorage.getItem(`insano.cart.${store.id}`);
      if (raw) setCart(JSON.parse(raw));
      else setCart([]);
    } catch {}

    // Load active campaign directly from the synced storage
    try {
      const campaignsRaw = localStorage.getItem(`insano.campaigns.${store.id}`);
      if (campaignsRaw) {
        const campaigns = JSON.parse(campaignsRaw) as Campaign[];
        const active = campaigns.find((c) => c.is_active);
        if (active) setActiveCampaign(active);
        else setActiveCampaign(null);
      }
    } catch {}
  }, [store?.id]);

  useEffect(() => {
    if (!store?.id) return;
    localStorage.setItem(`insano.cart.${store.id}`, JSON.stringify(cart));
  }, [cart, store?.id]);

  const categoriesList = useMemo(() => {
    const list = products || [];
    // "🔥 Promoções" não é aba: promoção aparece junto dos Destaques no topo.
    const uniqueCats = Array.from(new Set(list.map((p) => p.category))).filter(
      (c) => Boolean(c) && c !== "🔥 Promoções",
    );

    return uniqueCats.sort((a, b) => {
      // 1. Usa a ordem customizada, se existir
      if (settings?.categoryOrder && settings.categoryOrder.length > 0) {
        const idxA = settings.categoryOrder.indexOf(a);
        const idxB = settings.categoryOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
      }

      // 2. Fallback para a ordenação padrão (promoções, açaí, sorvete, alfabética)
      const normA = a
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      const normB = b
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      const isPromoA = a === "🔥 Promoções";
      const isPromoB = b === "🔥 Promoções";
      if (isPromoA && !isPromoB) return -1;
      if (!isPromoA && isPromoB) return 1;

      const isAcaiA = normA.includes("acai");
      const isAcaiB = normB.includes("acai");
      if (isAcaiA && !isAcaiB) return -1;
      if (!isAcaiA && isAcaiB) return 1;

      const isSorveteA = normA.includes("sorvete");
      const isSorveteB = normB.includes("sorvete");
      if (isSorveteA && !isSorveteB) return -1;
      if (!isSorveteA && isSorveteB) return 1;

      return a.localeCompare(b);
    });
  }, [products, settings?.categoryOrder]);

  // Selecionar automaticamente a primeira categoria ao carregar
  useEffect(() => {
    if (categoriesList.length > 0) {
      if (!category || category === "todos" || !categoriesList.includes(category)) {
        setCategory(categoriesList[0]);
      }
    }
  }, [categoriesList, category]);

  const filtered = useMemo(() => {
    const list = products || [];
    const activeCategory =
      category && category !== "todos"
        ? category
        : categoriesList.length > 0
          ? categoriesList[0]
          : "";
    return activeCategory ? list.filter((p) => p.category === activeCategory) : list;
  }, [products, category, categoriesList]);
  const featured = useMemo(() => {
    const list = products || [];
    // Promoção conta como destaque (inclui as antigas, salvas antes do
    // flag is_featured existir para a aba Promoções).
    return list.filter((p) => p.is_featured || p.category === "🔥 Promoções");
  }, [products]);
  const lancamentos = useMemo(() => {
    const list = products || [];
    return list.filter((p) => p.is_lancamento);
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
      setCart((c) => [
        ...c,
        { id: safeUUID(), productId: p.id, name: p.name, price: p.price, qty: 1 },
      ]);
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

  const isTrialActive = (() => {
    if (!store.criado_em) return false;
    const createdDate = new Date(store.criado_em).getTime();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - createdDate < sevenDaysInMs;
  })();

  // BANNER DE BLOQUEIO (INDISPONÍVEL): se isBlocked ou status_assinatura bloqueado
  if ((store.status_assinatura === "bloqueado" || settings?.isBlocked) && !isPreview) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500 animate-pulse">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2 max-w-md">
          <span className="text-[10px] uppercase font-black tracking-widest text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/25">
            Aviso
          </span>
          <h2 className="text-3xl font-black tracking-tight pt-2">Indisponível no momento</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Este cardápio está temporariamente indisponível. Por favor, tente novamente mais tarde.
          </p>
        </div>
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
              {activeCampaign.image &&
              (activeCampaign.image.startsWith("http") || activeCampaign.image.startsWith("/")) ? (
                <img
                  src={activeCampaign.image}
                  className="w-14 h-14 object-cover rounded-xl shrink-0 ring-2 ring-red-500/50"
                />
              ) : (
                <span className="text-3xl shrink-0">{activeCampaign.image || "🏆"}</span>
              )}
              <div className="text-left">
                <h4 className="font-black text-white text-xs sm:text-sm uppercase tracking-wider">
                  Sorteio Ativo: {activeCampaign.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-zinc-300 mt-0.5">
                  Faça um pedido a partir de{" "}
                  <span className="font-extrabold text-primary">
                    {brl(activeCampaign.min_value)}
                  </span>{" "}
                  e participe automaticamente!
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
          <h2 className="px-4 font-extrabold text-lg mb-3" translate="no">
            🔥 Destaques da Semana
          </h2>
          <div className="flex gap-3 overflow-x-auto px-4 pb-4 no-scrollbar snap-x">
            {featured.map((p) => {
              const out = !p.available;
              return (
                <article
                  key={p.id}
                  className={`w-[160px] sm:w-[180px] shrink-0 snap-start flex flex-col p-3 rounded-2xl bg-surface ring-1 ring-border ${out ? "opacity-60" : ""} h-[240px]`}
                >
                  <div className="w-full h-28 rounded-xl bg-gradient-to-br from-primary/20 to-surface-elevated flex items-center justify-center overflow-hidden text-5xl mb-3 shrink-0">
                    {p.image && (p.image.startsWith("http") || p.image.startsWith("/")) ? (
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
      {lancamentos.length > 0 && (
        <section className="pt-2 pb-2">
          <h2 className="px-4 font-extrabold text-lg mb-3" translate="no">
            🚀 Lançamentos da Semana
          </h2>
          <div className="flex gap-3 overflow-x-auto px-4 pb-4 no-scrollbar snap-x">
            {lancamentos.map((p) => {
              const out = !p.available;
              return (
                <article
                  key={p.id}
                  className={`w-[160px] sm:w-[180px] shrink-0 snap-start flex flex-col p-3 rounded-2xl bg-surface ring-1 ring-border ${out ? "opacity-60" : ""} h-[240px]`}
                >
                  <div className="w-full h-28 rounded-xl bg-gradient-to-br from-primary/20 to-surface-elevated flex items-center justify-center overflow-hidden text-5xl mb-3 shrink-0">
                    {p.image && (p.image.startsWith("http") || p.image.startsWith("/")) ? (
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
      <CategoryBar
        value={category}
        onChange={setCategory}
        categories={categoriesList}
        emojis={settings.categoryEmojis}
      />
      <main className="px-4 py-4 space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhum item nesta categoria.</p>
        )}
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onAdd={() => handleAdd(p)}
            disabled={!settings.isOpen}
          />
        ))}
      </main>

      {products.length <= 3 && (
        <div className="px-4 pb-8 pt-4 flex justify-center">
          <div className="w-full max-w-sm p-6 rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
            <span className="text-3xl mb-1 animate-bounce">🍔</span>
            <h3 className="font-extrabold text-primary text-lg">Novidades em Breve!</h3>
            <p className="text-xs text-muted-foreground font-medium px-4">
              Estamos preparando novos lanches deliciosos para o nosso cardápio. Aguarde!
            </p>
          </div>
        </div>
      )}
      <footer className="mt-8 mb-4 flex flex-col items-center justify-center gap-1.5 text-center px-4">
        <p className="text-sm font-black text-white">{settings.storeName}</p>
        <p className="text-xs text-zinc-500">
          📍 {settings.storeAddress || "Endereço não cadastrado"}
        </p>
        <p className="text-[10px] text-zinc-650 mt-4">
          Cardápio Digital © 2026. Todos os direitos reservados.
        </p>
      </footer>

      {customizing && (
        <CustomizeModal
          product={customizing}
          onClose={() => setCustomizing(null)}
          onConfirm={(finalPrice, additionsText, selectedChoices) => {
            try {
              const namePlus = (customizing.name || "Item") + additionsText;

              setCart((c) => [
                ...c,
                {
                  id: safeUUID(),
                  productId: customizing.id,
                  name: namePlus,
                  price: finalPrice,
                  qty: 1,
                  selectedChoices: selectedChoices,
                },
              ]);
              setCustomizing(null);
            } catch (err) {
              console.error("ERRO COMPLETO NO CARRINHO:", err);
              alert("Erro ao adicionar item ao carrinho. Detalhes salvos no console.");
              setCustomizing(null);
            }
          }}
        />
      )}

      {count > 0 && (
        <CartFooter count={count} subtotal={subtotal} onOpen={() => setCartOpen(true)} />
      )}

      {cartOpen && (
        <CartDrawer
          items={cart}
          onClose={() => setCartOpen(false)}
          onUpdate={(id, qty) =>
            setCart((c) =>
              qty <= 0
                ? c.filter((i) => i.id !== id)
                : c.map((i) => (i.id === id ? { ...i, qty } : i)),
            )
          }
          onRemove={(id) => setCart((c) => c.filter((i) => i.id !== id))}
          onClear={() => setCart([])}
        />
      )}
    </div>
  );
}
