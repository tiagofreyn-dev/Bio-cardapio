import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { storage } from "@/lib/storage";
import { useStorageSync } from "@/hooks/use-storage";
import type { Product, Category, CustomerLoyalty, Campaign, CampaignWinner, Participant, OrderHistory, DeliveryLocation } from "@/lib/types";
import { brl } from "@/lib/format";
import { ArrowLeft, Plus, Pencil, Trash2, Search, Gift, Trophy, Download, DollarSign, TrendingUp, ShoppingCart, Truck, Lock, RefreshCw, Check, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

async function compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.75): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel Administrativo — Bio-Cardápio" }] }),
  component: AdminPage,
});

type Tab = "geral" | "fidelidade" | "produtos" | "sorteios" | "faturamento";

function AdminPage() {
  const [tab, setTab] = useState<Tab>("geral");
  const settings = useStorageSync(() => storage.getSettings());
  const products = useStorageSync(() => storage.getProducts());
  
  // Authentication & Store State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authType, setAuthType] = useState<"pin" | "email" | null>(null);
  const [lojaId, setLojaId] = useState<string | null>(null);
  const [store, setStore] = useState<import("@/lib/types").Loja | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStore, setLoadingStore] = useState(false);
  const [paywallSimulating, setPaywallSimulating] = useState(false);
  const [error, setError] = useState("");

  const [stripeStatus, setStripeStatus] = useState<"sucesso" | "cancelado" | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuthUser() {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || null);
          return;
        }
      }
      if (typeof window !== "undefined") {
        const masterEmail = sessionStorage.getItem("insano.master.email");
        if (masterEmail) {
          setUserEmail(masterEmail);
        }
      }
    }
    checkAuthUser();
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("sucesso") === "true") {
        setStripeStatus("sucesso");
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (searchParams.get("cancelado") === "true") {
        setStripeStatus("cancelado");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    async function verifySession() {
      if (typeof window !== "undefined") {
        const auth = sessionStorage.getItem("insano.admin.auth");
        const savedLojaId = sessionStorage.getItem("insano.admin.lojaId");
        const savedAuthType = sessionStorage.getItem("insano.admin.authType");
        if (auth === "true" && savedLojaId) {
          // Se for login por e-mail, garanta que o Supabase realmente tem uma sessão ativa para que o RLS funcione
          if (supabase && savedAuthType === "email") {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              console.warn("Sessão do Supabase expirada ou nula. Redirecionando para login.");
              sessionStorage.clear();
              setIsAuthenticated(false);
              return;
            }
          }
          setIsAuthenticated(true);
          setLojaId(savedLojaId);
          setAuthType(savedAuthType as "pin" | "email");
        }
      }
    }
    verifySession();
  }, []);

  // Fetch Store and Products scoped to active lojaId
  useEffect(() => {
    if (!isAuthenticated || !lojaId) return;

    async function loadAdminStoreData() {
      setLoadingStore(true);
      try {
        if (!supabase) return;

        // 1. Fetch store info
        const { data: storeData, error: storeError } = await supabase
          .from("lojas")
          .select("*")
          .eq("id", lojaId)
          .maybeSingle();

        if (storeError) throw storeError;
        if (storeData) {
          setStore(storeData);

          // 2. Fetch products for this store
          const { data: productsData, error: productsError } = await supabase
            .from("produtos")
            .select("*")
            .eq("loja_id", lojaId)
            .order("preco", { ascending: true });

          if (productsError) throw productsError;

          // Map products to the frontend interface format
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
            is_featured: p.is_featured,
          }));

          // Map settings
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
            logoUrl: storeData.logo_url || "",
          };

          // Store in localStorage cache
          localStorage.setItem("insano.products", JSON.stringify(mappedProducts));
          localStorage.setItem("insano.settings", JSON.stringify(mappedSettings));
          localStorage.setItem("insano.tenant.activeId", storeData.id);

          // Update browser page title
          document.title = `Admin — ${storeData.nome}`;

          // Dispatch event to force hook update
          window.dispatchEvent(new CustomEvent("insano-storage"));
        }
      } catch (err) {
        console.error("Erro ao carregar dados do admin:", err);
      } finally {
        setLoadingStore(false);
      }
    }

    loadAdminStoreData();
  }, [isAuthenticated, lojaId]);

  async function handleLoginEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setError("");
    setLoading(true);
    try {
      if (!supabase) throw new Error("Supabase não está configurado.");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (error) throw error;
      
      const userId = data.user.id;
      
      // Fetch corresponding store
      const { data: storeData, error: storeError } = await supabase
        .from("lojas")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (storeError) throw storeError;
      let finalStore = storeData;

      if (!finalStore) {
        // Criar automaticamente um registro rascunho de loja para que o usuário não fique preso
        const slug = `loja-${Math.random().toString(36).substring(2, 8)}`;
        const { data: newStore, error: insertError } = await supabase
          .from("lojas")
          .insert({
            user_id: userId,
            nome: "Minha Nova Loja",
            slug: slug,
            tipo: "Lanchonete",
            cor_tema: "Vermelho",
            status_assinatura: "pendente",
          })
          .select()
          .single();

        if (insertError) {
          throw new Error("Nenhum comércio cadastrado para esta conta. Tentamos criar um automático mas houve um erro: " + insertError.message);
        }
        finalStore = newStore;
      }

      setLojaId(finalStore.id);
      setStore(finalStore);
      setAuthType("email");
      setUserEmail(data.user.email || null);
      setIsAuthenticated(true);
      sessionStorage.setItem("insano.admin.auth", "true");
      sessionStorage.setItem("insano.admin.lojaId", finalStore.id);
      sessionStorage.setItem("insano.admin.authType", "email");
      localStorage.setItem("insano.tenant.activeId", finalStore.id);
    } catch (err: any) {
      setError(err.message || "Erro ao realizar login.");
    } finally {
      setLoading(false);
    }
  }

  async function handleActivateSubscription() {
    if (!lojaId) return;
    setPaywallSimulating(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lojaId }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao processar checkout do Stripe");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de Checkout não retornada pelo servidor");
      }
    } catch (err: any) {
      alert("Erro ao iniciar pagamento no Stripe: " + err.message);
    } finally {
      setPaywallSimulating(false);
    }
  }

  function handleLogout() {
    sessionStorage.clear();
    setIsAuthenticated(false);
    setLojaId(null);
    setStore(null);
    setAuthType(null);
    setError("");
    setPassword("");
    setEmail("");
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-950 text-white font-sans">
        <div className="w-full max-w-sm rounded-3xl bg-zinc-900 ring-2 ring-red-500/20 shadow-[0_15px_40px_rgba(239,68,68,0.1)] overflow-hidden flex flex-col">
          {/* Header do Box */}
          <div className="p-6 pb-4 text-center space-y-1 bg-gradient-to-b from-zinc-800/40 to-transparent">
            <span className="text-[10px] tracking-[0.2em] font-black uppercase text-primary">Painel Administrativo</span>
            <h2 className="text-2xl font-black tracking-tight">Bio-Cardápio</h2>
            <p className="text-xs text-zinc-400">Gerencie seu cardápio digital multi-tenant.</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs font-semibold text-red-400 text-center animate-pulse">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLoginEmail} className="space-y-4">
              <label className="block space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">E-mail</span>
                <input
                  type="email"
                  placeholder="dono@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-zinc-950 text-white placeholder:text-zinc-700 ring-1 ring-zinc-800 focus:ring-primary outline-none text-sm transition"
                  required
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Senha</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-zinc-950 text-white placeholder:text-zinc-700 ring-1 ring-zinc-800 focus:ring-primary outline-none text-sm transition"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 rounded-xl bg-primary text-primary-foreground font-black text-sm transition active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Entrando..." : "Entrar no Painel 🚀"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/cadastro" className="text-xs font-bold text-zinc-400 hover:text-primary transition underline">
                Ainda não tem conta? Crie seu cardápio!
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingStore) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-bold text-zinc-400">Sincronizando dados comerciais...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 text-zinc-400 hover:text-white transition"><ArrowLeft className="w-5 h-5" /></Link>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-black">Painel Administrativo</p>
              <h1 className="font-extrabold text-sm sm:text-base">{store?.nome || "Carregando..."}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userEmail && [
              "tiago.freyn@gmail.com",
              "tiagofreyn@gmail.com",
              "tiagofreyn.dev@gmail.com",
              "admin@biocardapio.com"
            ].includes(userEmail) && (
              <Link
                to="/master-admin"
                className="h-9 px-3 rounded-lg bg-indigo-950/40 border border-indigo-900/30 hover:bg-indigo-500 hover:text-black text-indigo-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition duration-150"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Painel Master</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="h-9 px-3 rounded-lg bg-zinc-800 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 text-xs font-bold transition active:scale-95 flex items-center gap-1.5"
            >
              Sair do Painel
            </button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {([["geral", "⚙️ Geral"], ["fidelidade", "🎁 Fidelidade"], ["produtos", "🍔 Produtos"], ["sorteios", "🏆 Sorteios"], ["faturamento", "📊 Faturamento"]] as [Tab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                tab === id 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "bg-zinc-950 text-zinc-400 hover:text-white ring-1 ring-zinc-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Alertas Premium de Retorno de Pagamento do Stripe Checkout */}
      {stripeStatus === "sucesso" && (
        <div className="bg-gradient-to-r from-emerald-950/60 via-emerald-900/50 to-emerald-950/60 border-b border-emerald-500/30 px-4 py-3 flex items-center justify-between gap-3 text-center sm:text-left animate-fade-in shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 shrink-0">
              <Check className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">Pagamento Confirmado! 🎉</h4>
              <p className="text-[11px] text-zinc-300">Sua assinatura foi ativada com sucesso. Seu cardápio digital já está público e pronto para receber pedidos!</p>
            </div>
          </div>
          <button onClick={() => setStripeStatus(null)} className="text-xs font-bold text-zinc-400 hover:text-white transition px-2">Fechar</button>
        </div>
      )}

      {stripeStatus === "cancelado" && (
        <div className="bg-gradient-to-r from-rose-950/60 via-rose-900/50 to-rose-950/60 border-b border-rose-500/30 px-4 py-3 flex items-center justify-between gap-3 text-center sm:text-left animate-fade-in shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">Pagamento Cancelado</h4>
              <p className="text-[11px] text-zinc-300">A operação de assinatura foi cancelada. Caso queira liberar o cardápio público, ative novamente a qualquer momento.</p>
            </div>
          </div>
          <button onClick={() => setStripeStatus(null)} className="text-xs font-bold text-zinc-400 hover:text-white transition px-2">Fechar</button>
        </div>
      )}

      {/* Paywall Banner se pendente e cobrança automática ativa */}
      {store?.status_assinatura === "pendente" && store?.cobranca_automatica !== false && (
        <div className="bg-gradient-to-r from-amber-950/70 via-amber-900/60 to-amber-950/70 border-b border-amber-500/30 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left relative overflow-hidden backdrop-blur shadow-lg shrink-0 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">Seu cardápio está em modo rascunho (Acesso Restrito)</h4>
              <p className="text-[11px] text-zinc-300">Seus clientes não conseguem ver o cardápio público. Ative agora o seu plano por apenas **R$ 99,90/mês** no Stripe para liberar!</p>
            </div>
          </div>
          <button
            onClick={handleActivateSubscription}
            disabled={paywallSimulating}
            className="h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition active:scale-95 shrink-0 flex items-center justify-center gap-1.5 hover:scale-[1.02]"
          >
            {paywallSimulating ? "Redirecionando..." : "Ativar Plano (R$ 99,90/mês) 🚀"}
          </button>
        </div>
      )}

      {/* Banner de Sucesso / Cardápio Liberado com Link Público de Compartilhamento */}
      {store?.status_assinatura === "ativo" && store?.cobranca_automatica !== false && (
        <div className="bg-gradient-to-r from-emerald-950/60 via-emerald-900/50 to-emerald-950/60 border-b border-emerald-500/30 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left relative overflow-hidden backdrop-blur shadow-lg shrink-0 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 shrink-0">
              <Check className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">Seu cardápio está online e liberado! 🚀</h4>
              <p className="text-[11px] text-zinc-300">Sua assinatura do plano recorrente está ativa e o cardápio público está totalmente online para receber pedidos.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto items-center shrink-0">
            <input 
              readOnly 
              value={`${window.location.origin}/cardapio/${store.slug}`}
              className="px-3 h-9 rounded-xl bg-zinc-950 text-zinc-300 text-xs font-bold ring-1 ring-zinc-800 focus:outline-none w-full sm:w-44 truncate"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/cardapio/${store.slug}`);
                alert("Link do cardápio copiado!");
              }}
              className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md transition active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
            >
              Copiar Link
            </button>
          </div>
        </div>
      )}

      {/* Banner Informativo de Cobrança Manual Liberada */}
      {store?.cobranca_automatica === false && (
        <div className="bg-gradient-to-r from-emerald-950/60 via-teal-900/50 to-emerald-950/60 border-b border-emerald-500/30 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left relative overflow-hidden backdrop-blur shadow-lg shrink-0 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 shrink-0">
              <Check className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <span>Link de Cardápio Ativo & Liberado</span>
                <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">Cobrança Manual</span>
              </h4>
              <p className="text-[11px] text-zinc-300">
                Seu comércio está configurado no modo de **Cobrança Manual**. O seu cardápio público está 100% online para receber pedidos!
              </p>
            </div>
          </div>
          <a
            href={store.slug === "insano-lanches" ? "/" : `/cardapio/${store.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md transition active:scale-95 shrink-0 flex items-center justify-center gap-1.5 hover:scale-[1.02]"
          >
            Visualizar Cardápio Público 🌐
          </a>
        </div>
      )}

      {/* Grid Principal de 2 Colunas */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Painel Esquerdo: Tabs de Gerenciamento */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-140px)] no-scrollbar">
          {tab === "geral" && <GeneralTab lojaId={lojaId} slug={store?.slug} />}
          {tab === "fidelidade" && <LoyaltyTab />}
          {tab === "produtos" && <ProductsTab products={products} lojaId={lojaId} />}
          {tab === "sorteios" && <CampaignsTab />}
          {tab === "faturamento" && <FaturamentoTab lojaId={lojaId} />}
        </div>

        {/* Painel Direito: Preview do Smartphone (Apenas Desktop) */}
        {store && (
          <div className="hidden lg:flex w-[290px] xl:w-[310px] border-l border-zinc-800 bg-zinc-950/40 p-4 flex-col items-center justify-center shrink-0 max-h-[calc(100vh-140px)]">
            <div className="w-full max-w-[250px] aspect-[375/812] rounded-[36px] border-[6px] border-zinc-800 bg-zinc-950 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col ring-2 ring-zinc-800/40">
              {/* Entalhe da Câmera (iPhone Notch) */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-3 bg-zinc-800 rounded-full z-50 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 absolute right-3"></div>
              </div>

              {/* Status Bar */}
              <div className="h-5 bg-zinc-950 text-zinc-500 px-6 flex items-center justify-between text-[8px] font-black tracking-wider select-none shrink-0 pt-1 z-40">
                <span>09:41</span>
                <span className="flex items-center gap-1">
                  📶 🔋
                </span>
              </div>

              {/* Iframe Wrapper (Scaled 2/3 to render beautiful 375px mobile view) */}
              <div className="w-full flex-1 relative overflow-hidden bg-zinc-950 rounded-b-[30px]">
                <iframe
                  id="live-cardapio-preview"
                  src={
                    lojaId === "d3b07384-d113-4ec5-a55d-e0c157855d01"
                      ? `${window.location.origin}/`
                      : `${window.location.origin}/cardapio/${store.slug}`
                  }
                  style={{
                    width: "375px",
                    height: "150%",
                    transform: "scale(0.6666)",
                    transformOrigin: "top left",
                    border: "none",
                  }}
                  className="absolute top-0 left-0 bg-zinc-950"
                  title="Preview Cardápio Digital"
                />
              </div>
            </div>
            
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Preview em Tempo Real</span>
              <button
                onClick={() => {
                  const iframe = document.getElementById("live-cardapio-preview") as HTMLIFrameElement;
                  if (iframe) iframe.src = iframe.src;
                }}
                className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white transition active:scale-95"
                title="Recarregar Preview"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GeneralTab({ lojaId, slug }: { lojaId: string | null; slug?: string }) {
  const settings = useStorageSync(() => storage.getSettings());
  const products = useStorageSync(() => storage.getProducts());
  const update = (patch: Partial<typeof settings>) => storage.setSettings({ ...settings, ...patch });

  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [locLoading, setLocLoading] = useState(true);
  const [locError, setLocError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      if (!supabase) {
        throw new Error("Supabase não está configurado.");
      }
      const compressed = await compressImage(file);
      const ext = compressed.name.split('.').pop();
      const fileName = `logo-${lojaId || 'store'}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from('products-images').upload(fileName, compressed);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('products-images').getPublicUrl(data.path);
      
      const updatedSettings = { ...settings, logoUrl: publicUrl };
      update({ logoUrl: publicUrl });
      await autoSave(updatedSettings);
    } catch (err: any) {
      alert("Erro ao enviar imagem do logo: " + err.message);
    } finally {
      setLogoUploading(false);
    }
  }

  async function fetchLocations() {
    setLocLoading(true);
    setLocError(null);
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("delivery_locations")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      setLocations(data || []);
    } catch (err: any) {
      console.error(err);
      setLocError(err.message);
    } finally {
      setLocLoading(false);
    }
  }

  useEffect(() => {
    fetchLocations();
  }, []);

  async function handleSaveLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !fee) return alert("Por favor, preencha todos os campos.");
    if (!supabase) return;

    try {
      if (editingId) {
        const { error } = await supabase
          .from("delivery_locations")
          .update({ name: name.trim(), fee: Number(fee) })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("delivery_locations")
          .insert({ name: name.trim(), fee: Number(fee) });
        if (error) throw error;
      }
      setName("");
      setFee("");
      setEditingId(null);
      await fetchLocations();
    } catch (err: any) {
      alert("Erro ao salvar localização: " + err.message);
    }
  }

  async function handleDeleteLocation(id: string) {
    if (!confirm("Excluir esta taxa de entrega?")) return;
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("delivery_locations")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await fetchLocations();
    } catch (err: any) {
      alert("Erro ao excluir localização: " + err.message);
    }
  }

  function handleStartEdit(loc: DeliveryLocation) {
    setEditingId(loc.id);
    setName(loc.name);
    setFee(loc.fee.toString());
  }

  async function autoSave(nextSettings: typeof settings) {
    if (!supabase || !lojaId) return;
    setAutoSaving(true);
    try {
      const { error } = await supabase
        .from("lojas")
        .update({
          nome: nextSettings.storeName,
          whatsapp: nextSettings.whatsapp,
          endereco: nextSettings.storeAddress,
          taxa_entrega: Number(nextSettings.deliveryFee),
          chave_pix: nextSettings.pixKey,
          titular_pix: nextSettings.pixName,
          fidelidade_ativo: nextSettings.loyaltyActive !== false,
          logo_url: nextSettings.logoUrl,
        })
        .eq("id", lojaId);

      if (error) throw error;

      // Recarregar preview
      const iframe = document.getElementById("live-cardapio-preview") as HTMLIFrameElement;
      if (iframe) iframe.src = iframe.src;
    } catch (err: any) {
      console.error("Erro ao salvar automaticamente no Supabase:", err.message);
    } finally {
      setTimeout(() => setAutoSaving(false), 800);
    }
  }

  return (
    <section className="space-y-4">
      {/* Indicador de Salvamento Automático Premium */}
      <div className="flex items-center justify-between px-1 py-1">
        <div className="space-y-0.5">
          <h4 className="font-extrabold text-sm text-white">Configurações do Estabelecimento</h4>
          <p className="text-[11px] text-zinc-400">Gerencie informações, taxas de entrega e pix da sua loja.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold shrink-0 bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-1.5 shadow-sm">
          {autoSaving ? (
            <span className="text-primary flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
              Salvando...
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Salvo
            </span>
          )}
        </div>
      </div>

      <Card title="Loja">
        <Field label="Nome do Estabelecimento">
          <input 
            value={settings.storeName} 
            onChange={(e) => update({ storeName: e.target.value })} 
            onBlur={() => autoSave(settings)}
            className={inputCls} 
          />
        </Field>
        <Field label="Logo / Imagem do Estabelecimento">
          <div className="space-y-4">
            <div className="flex gap-4 items-center p-3 rounded-2xl bg-zinc-900/40 ring-1 ring-border shadow-inner">
              {settings.logoUrl && (settings.logoUrl.startsWith('http') || settings.logoUrl.startsWith('/')) ? (
                <img src={settings.logoUrl} className="w-16 h-16 object-cover rounded-2xl ring-2 ring-primary/20 shadow-md shrink-0 animate-fade-in" />
              ) : (
                <div className="w-16 h-16 text-3xl flex items-center justify-center bg-primary/10 text-primary rounded-2xl ring-2 ring-primary/20 font-black shadow-md shrink-0">
                  {settings.storeName ? settings.storeName.substring(0, 2).toUpperCase() : "AC"}
                </div>
              )}
              <div className="flex-1 space-y-1">
                <span className="text-xs font-bold text-white block">Logotipo Personalizado</span>
                <span className="text-[10px] text-zinc-400 block max-w-[200px] truncate">
                  {settings.logoUrl || "Nenhuma imagem personalizada"}
                </span>
                {settings.logoUrl && (
                  <button 
                    type="button"
                    onClick={() => {
                      update({ logoUrl: "" });
                      autoSave({ ...settings, logoUrl: "" });
                    }}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-350 transition-colors flex items-center gap-1 mt-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remover Logo
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Escolha uma nova imagem para o logo:</span>
                <button 
                  type="button" 
                  onClick={() => setShowManualUrl(!showManualUrl)}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  {showManualUrl ? "Upload de Arquivo" : "Inserir via Link URL"}
                </button>
              </div>
              
              {showManualUrl ? (
                <input 
                  value={settings.logoUrl || ""} 
                  onChange={(e) => update({ logoUrl: e.target.value })} 
                  onBlur={() => autoSave(settings)}
                  className={inputCls} 
                  placeholder="Ex: https://link-da-imagem.com/logo.png"
                />
              ) : (
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoUpload} 
                    disabled={logoUploading} 
                    className="text-xs w-full file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-primary file:text-primary-foreground hover:file:opacity-90 file:cursor-pointer disabled:opacity-50" 
                  />
                </div>
              )}
              {logoUploading && <p className="text-xs text-primary font-bold mt-1 animate-pulse">Comprimindo e enviando logo para o Supabase...</p>}
            </div>
          </div>
        </Field>
        <Field label="Telefone WhatsApp (com DDI/DDD)">
          <input 
            value={settings.whatsapp} 
            onChange={(e) => update({ whatsapp: e.target.value.replace(/\D/g, "") })} 
            onBlur={() => autoSave(settings)}
            className={inputCls} 
          />
        </Field>
        <Field label="Endereço do comércio">
          <input 
            value={settings.storeAddress || ""} 
            onChange={(e) => update({ storeAddress: e.target.value })} 
            onBlur={() => autoSave(settings)}
            className={inputCls} 
            placeholder="Ex: Av. Brasil, 1234 - Centro" 
          />
        </Field>
        <Field label="Status da loja">
          <button
            onClick={() => {
              const nextVal = !settings.isOpen;
              update({ isOpen: nextVal });
              autoSave({ ...settings, isOpen: nextVal });
            }}
            className={`w-full h-12 rounded-xl font-black text-sm transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md ${
              settings.isOpen 
                ? "bg-emerald-600/15 text-emerald-400 ring-2 ring-emerald-500/30 hover:bg-emerald-600/20" 
                : "bg-rose-600/15 text-rose-400 ring-2 ring-rose-500/30 hover:bg-rose-600/20"
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${settings.isOpen ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-rose-400"}`}></span>
            {settings.isOpen ? "Loja Aberta — Aceitando pedidos" : "Loja Fechada — Bloquear novos pedidos"}
          </button>
        </Field>
      </Card>

      <Card title="📍 Taxas de Entrega por Região">
        <form onSubmit={handleSaveLocation} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end p-4 rounded-xl bg-surface-elevated ring-1 ring-border mb-4">
          <div className="sm:col-span-2 space-y-1">
            <span className="text-xs font-bold text-muted-foreground">Nome da Região / Bairro</span>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Ex: Centro, Bairro Nobre, Interior..." 
              className={inputCls}
              required
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">Taxa de Entrega (R$)</span>
            <div className="flex gap-2">
              <input 
                type="number"
                step="0.01"
                value={fee} 
                onChange={(e) => setFee(e.target.value)} 
                placeholder="5.00" 
                className={`${inputCls} flex-1`}
                required
              />
              <button 
                type="submit"
                className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-black text-xs hover:bg-primary/95 transition shrink-0 animate-fade-in"
              >
                {editingId ? "Salvar" : "Adicionar"}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={() => { setName(""); setFee(""); setEditingId(null); }}
                  className="h-10 px-3 rounded-xl bg-zinc-800 text-white font-bold text-xs hover:bg-zinc-700 transition shrink-0"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </form>

        {locLoading ? (
          <div className="text-center text-xs text-muted-foreground py-4">Carregando taxas de entrega...</div>
        ) : locError ? (
          <div className="text-center text-xs text-rose-500 py-4">Erro ao carregar taxas: {locError}. Certifique-se de executar o script SQL no Supabase.</div>
        ) : locations.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground py-6 bg-surface rounded-xl ring-1 ring-border">Nenhuma região cadastrada ainda. Use o formulário acima para adicionar!</div>
        ) : (
          <div className="overflow-x-auto ring-1 ring-border rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-elevated text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Região / Bairro</th>
                  <th className="px-4 py-2.5 font-bold w-32 text-right">Taxa (R$)</th>
                  <th className="px-4 py-2.5 w-24 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-surface-elevated/50 transition">
                    <td className="px-4 py-3 font-semibold text-white">{loc.name}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-primary">{brl(loc.fee)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button 
                          type="button"
                          onClick={() => handleStartEdit(loc)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDeleteLocation(loc.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Configurações do Cartão Fidelidade">
        <Field label="Habilitar Programa de Fidelidade?">
          <select 
            value={settings.loyaltyActive !== false ? "true" : "false"} 
            onChange={(e) => {
              const nextVal = e.target.value === "true";
              update({ loyaltyActive: nextVal });
              autoSave({ ...settings, loyaltyActive: nextVal });
            }} 
            className={inputCls}
          >
            <option value="true">Sim, oferecer cartão fidelidade aos clientes</option>
            <option value="false">Não, desativar programa de fidelidade</option>
          </select>
        </Field>
        {settings.loyaltyActive !== false && (
          <>
            <Field label="Valor mínimo do pedido para pontuar (R$)">
              <input 
                type="number" 
                step="0.01" 
                value={settings.loyaltyMinOrder} 
                onChange={(e) => update({ loyaltyMinOrder: Number(e.target.value) })} 
                onBlur={() => autoSave(settings)}
                className={inputCls} 
              />
            </Field>
            <Field label="Quantidade de pontos para ganhar o prêmio">
              <input 
                type="number" 
                value={settings.loyaltyGoal} 
                onChange={(e) => update({ loyaltyGoal: Number(e.target.value) })} 
                onBlur={() => autoSave(settings)}
                className={inputCls} 
              />
            </Field>
            <Field label="Prêmio do Cartão Fidelidade (Item Grátis)">
              <select 
                value={settings.loyaltyRewardId || ""} 
                onChange={(e) => {
                  const nextVal = e.target.value;
                  update({ loyaltyRewardId: nextVal });
                  autoSave({ ...settings, loyaltyRewardId: nextVal });
                }} 
                className={inputCls}
              >
                <option value="">Item mais barato do pedido (Padrão)</option>
                {(products || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
          </>
        )}
      </Card>

      <Card title="Pagamento via Pix">
        <Field label="Chave PIX do Estabelecimento">
          <input 
            value={settings.pixKey} 
            onChange={(e) => update({ pixKey: e.target.value })} 
            onBlur={() => autoSave(settings)}
            className={inputCls} 
            placeholder="ex: 12.345.678/0001-90" 
          />
        </Field>
        <Field label="Nome do Titular do Pix">
          <input 
            value={settings.pixName} 
            onChange={(e) => update({ pixName: e.target.value })} 
            onBlur={() => autoSave(settings)}
            className={inputCls} 
            placeholder="ex: Insano Lanches LTDA" 
          />
        </Field>
      </Card>

      <Card title="Compartilhamento">
        <div className="p-3 rounded-xl bg-surface-elevated ring-1 ring-border space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Link para colocar na bio do Instagram:</p>
          <div className="flex gap-2">
            <input 
              readOnly 
              value={
                lojaId === "d3b07384-d113-4ec5-a55d-e0c157855d01"
                  ? `${window.location.origin}/`
                  : `${window.location.origin}/cardapio/${slug || ""}`
              } 
              className={`${inputCls} bg-zinc-950 text-zinc-400`} 
            />
            <button 
              type="button"
              onClick={() => { 
                const url = lojaId === "d3b07384-d113-4ec5-a55d-e0c157855d01"
                  ? `${window.location.origin}/`
                  : `${window.location.origin}/cardapio/${slug || ""}`;
                navigator.clipboard.writeText(url); 
                alert("Link copiado!"); 
              }} 
              className={btnPrimary}
            >
              Copiar Link
            </button>
          </div>
        </div>
      </Card>

      <Card title="Segurança do Painel">
        <Field label="Senha de Acesso (PIN)">
          <input 
            type="password" 
            value={settings.adminPassword || "1234"} 
            disabled 
            className={`${inputCls} opacity-60 cursor-not-allowed`} 
            placeholder="ex: 1234" 
          />
          <p className="text-[10px] text-muted-foreground mt-2">🔒 A alteração da senha do painel administrativo foi bloqueada por motivos de segurança.</p>
        </Field>
      </Card>
    </section>
  );
}

function LoyaltyTab() {
  const redemptions = useStorageSync(() => storage.getRedemptions());

  return (
    <section className="space-y-4">
      <Card title="Histórico de Resgates de Prêmios">
        <div className="overflow-x-auto ring-1 ring-border rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-elevated text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Data/Hora</th>
                <th className="px-4 py-3 font-semibold">Nome do Cliente</th>
                <th className="px-4 py-3 font-semibold">Lanche Resgatado</th>
                <th className="px-4 py-3 font-semibold">Telefone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {redemptions.map((r) => (
                <tr key={r.id} className="hover:bg-surface-elevated/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{r.date}</td>
                  <td className="px-4 py-3 font-bold">{r.name}</td>
                  <td className="px-4 py-3 text-primary font-semibold">{r.item}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.phone || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {redemptions.length === 0 && (
            <p className="text-center text-muted-foreground py-6">Nenhum resgate registrado ainda.</p>
          )}
        </div>
      </Card>
    </section>
  );
}

function ProductsTab({ lojaId }: { lojaId: string | null }) {
  const products = useStorageSync(() => storage.getProducts());
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save(p: Product) {
    if (!supabase || !lojaId) return;
    setLoading(true);
    try {
      const payload = {
        nome: p.name,
        descricao: p.description,
        preco: Number(p.price),
        imagem: p.image,
        category: p.category,
        disponivel: p.available,
        customizavel: (p.adicionais || []).length > 0,
        is_featured: p.is_featured,
        adicionais: p.adicionais || [],
        loja_id: lojaId,
      };

      if (isNew) {
        const { error } = await supabase
          .from("produtos")
          .insert({
            id: p.id,
            ...payload,
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("produtos")
          .update(payload)
          .eq("id", p.id);
        if (error) throw error;
      }

      // Sync local storage
      const list = [...products];
      const idx = list.findIndex((x) => x.id === p.id);
      if (idx >= 0) list[idx] = p;
      else list.push(p);
      storage.setProducts(list);
      
      // Reload preview
      const iframe = document.getElementById("live-cardapio-preview") as HTMLIFrameElement;
      if (iframe) iframe.src = iframe.src;
    } catch (err: any) {
      alert("Erro ao salvar produto: " + err.message);
    } finally {
      setLoading(false);
      setEditing(null);
      setIsNew(false);
    }
  }

  async function toggle(p: Product) {
    if (!supabase) return;
    try {
      const nextVal = !p.available;
      const { data, error } = await supabase
        .from("produtos")
        .update({ disponivel: nextVal })
        .eq("id", p.id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Não foi possível atualizar o produto. Certifique-se de que está autenticado com a conta correta.");
      }

      const list = products.map((x) => x.id === p.id ? { ...x, available: nextVal } : x);
      storage.setProducts(list);
      
      // Reload preview
      const iframe = document.getElementById("live-cardapio-preview") as HTMLIFrameElement;
      if (iframe) iframe.src = iframe.src;
    } catch (err: any) {
      alert("Erro ao alternar disponibilidade: " + err.message);
    }
  }

  async function toggleFeatured(p: Product) {
    if (!supabase) return;
    try {
      const nextVal = !p.is_featured;
      const { data, error } = await supabase
        .from("produtos")
        .update({ is_featured: nextVal })
        .eq("id", p.id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Não foi possível destacar o produto. Certifique-se de que está autenticado com a conta correta.");
      }

      const list = products.map((x) => x.id === p.id ? { ...x, is_featured: nextVal } : x);
      storage.setProducts(list);
      
      // Reload preview
      const iframe = document.getElementById("live-cardapio-preview") as HTMLIFrameElement;
      if (iframe) iframe.src = iframe.src;
    } catch (err: any) {
      alert("Erro ao alternar destaque: " + err.message);
    }
  }

  return (
    <section className="space-y-3">
      <button
        onClick={() => {
          setIsNew(true);
          setEditing({ 
            id: crypto.randomUUID(), 
            name: "", 
            description: "", 
            price: 0, 
            image: "🍔", 
            category: "hamburgueres", 
            available: true, 
            customizable: true,
            hasLettuceOption: true,
            hasKetchupOption: true,
            hasMayoOption: true
          });
        }}
        className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold inline-flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Novo produto
      </button>

      <ul className="space-y-2">
        {(products || []).map((p) => (
          <li key={p.id} className="p-3 rounded-xl bg-surface ring-1 ring-border flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-surface-elevated flex items-center justify-center overflow-hidden text-2xl shrink-0">
              {(p.image.startsWith('http') || p.image.startsWith('/')) ? <img src={p.image} className="w-full h-full object-cover" /> : p.image}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{brl(p.price)} • {p.category}</p>
            </div>
            <label className="flex flex-col items-center justify-center gap-1 cursor-pointer mx-1 shrink-0">
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Destaque</span>
              <input type="checkbox" checked={!!p.is_featured} onChange={() => toggleFeatured(p)} className="w-4 h-4 accent-primary" />
            </label>
            <button 
              type="button"
              onClick={() => toggle(p)} 
              className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.available ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
            >
              {p.available ? "Disponível" : "Esgotado"}
            </button>
            <button type="button" onClick={() => { setIsNew(false); setEditing(p); }} className="p-2 text-muted-foreground"><Pencil className="w-4 h-4" /></button>
            
            {deletingId === p.id ? (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    if (!supabase) return;
                    try {
                      const { error } = await supabase
                        .from("produtos")
                        .delete()
                        .eq("id", p.id);
                      if (error) throw error;
                      
                      storage.setProducts(products.filter((x) => x.id !== p.id));
                      setDeletingId(null);
                      
                      // Reload preview
                      const iframe = document.getElementById("live-cardapio-preview") as HTMLIFrameElement;
                      if (iframe) iframe.src = iframe.src;
                    } catch (err: any) {
                      alert("Erro ao excluir produto: " + err.message);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-destructive text-destructive-foreground text-[10px] font-extrabold shadow-sm active:scale-95 transition"
                >
                  Excluir
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  className="px-2 py-1 rounded-lg bg-surface-elevated ring-1 ring-border text-foreground text-[10px] font-semibold active:scale-95 transition"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDeletingId(p.id);
                  setTimeout(() => {
                    setDeletingId((curr) => (curr === p.id ? null : curr));
                  }, 4000);
                }}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition active:scale-95 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {editing && (
        <ProductModal 
          product={editing} 
          isNew={isNew} 
          existingCategories={Array.from(new Set(products.map((x) => x.category))).filter(Boolean)}
          onClose={() => { setEditing(null); setIsNew(false); }} 
          onSave={save} 
        />
      )}
    </section>
  );
}

function ProductModal({ 
  product, 
  isNew, 
  existingCategories, 
  onClose, 
  onSave 
}: { 
  product: Product; 
  isNew: boolean; 
  existingCategories: string[]; 
  onClose: () => void; 
  onSave: (p: Product) => void 
}) {
  const [p, setP] = useState<Product>(product);
  const [uploading, setUploading] = useState(false);
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      if (!supabase) {
        throw new Error("Supabase não está configurado. Insira VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu ambiente.");
      }
      const compressed = await compressImage(file);
      const ext = compressed.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
      const { data, error } = await supabase.storage.from('products-images').upload(fileName, compressed);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('products-images').getPublicUrl(data.path);
      setP({ ...p, image: publicUrl });
    } catch (err) {
      alert("Erro ao enviar imagem. Verifique se o bucket 'products-images' existe no Supabase e as credenciais do .env.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-end sm:items-center justify-center" 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl ring-1 ring-border max-h-[95vh] overflow-y-auto p-4 space-y-3">
        <h3 className="font-extrabold text-lg">{isNew ? "Novo produto" : "Editar produto"}</h3>
        <Field label="Nome"><input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} className={inputCls} /></Field>
        <Field label="Descrição"><textarea value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} className={`${inputCls} h-20 py-2`} /></Field>
        <Field label="Preço (R$)"><input type="number" step="0.01" value={p.price} onChange={(e) => setP({ ...p, price: Number(e.target.value) })} className={inputCls} /></Field>
        <Field label="Imagem do Produto">
          <div className="flex gap-3 items-center mb-3">
            {p.image && (p.image.startsWith('http') || p.image.startsWith('/')) ? (
              <img src={p.image} className="w-14 h-14 object-cover rounded-xl ring-1 ring-border" />
            ) : (
              <div className="w-14 h-14 text-2xl flex items-center justify-center bg-surface-elevated rounded-xl ring-1 ring-border text-zinc-500 font-bold">📷</div>
            )}
            <div className="flex-1 space-y-1">
              <span className="text-xs font-semibold text-muted-foreground block">Foto Selecionada</span>
              <span className="text-[10px] text-zinc-400 block truncate">{p.image && (p.image.startsWith('http') || p.image.startsWith('/')) ? "Imagem Personalizada Carregada" : "Nenhuma foto selecionada"}</span>
              {p.image && (p.image.startsWith('http') || p.image.startsWith('/')) && (
                <button
                  type="button"
                  onClick={() => setP({ ...p, image: "🍨" })}
                  className="text-[10px] font-bold text-rose-400 hover:text-rose-350 transition-colors flex items-center gap-1 mt-1"
                >
                  Remover Imagem
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Selecione a foto do produto:</span>
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
            {uploading && <p className="text-xs text-primary font-bold mt-1 animate-pulse">Enviando imagem para o Supabase...</p>}
          </div>
        </Field>
        
        <Field label="Categoria (Ex: Pizza, Açaí Turbinado, Bebidas)">
          <div className="space-y-2">
            <input 
              value={p.category} 
              onChange={(e) => setP({ ...p, category: e.target.value })} 
              className={inputCls} 
              placeholder="Digite a categoria do produto..." 
            />
            {existingCategories.length > 0 && (
              <div className="flex gap-1.5 flex-wrap pt-1">
                {existingCategories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setP({ ...p, category: c })}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                      p.category === c 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "bg-surface-elevated ring-1 ring-border text-muted-foreground hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>

        <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] uppercase font-black text-primary tracking-wider block">Adicionais do Produto (Opcionais):</span>
          
          <p className="text-[10px] text-zinc-400 leading-normal">
            Cadastre os itens opcionais que seu cliente pode incluir no lanche (ex: Cheddar extra, Bacon, Ovo). 
            Deixe o preço em <strong>R$ 0,00</strong> se o opcional for gratuito.
          </p>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {(p.adicionais || []).map((addon, index) => (
              <div key={index} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated ring-1 ring-border text-xs">
                <span className="font-bold text-white">{addon.nome} (+ {brl(addon.preco)})</span>
                <button
                  type="button"
                  onClick={() => {
                    const list = (p.adicionais || []).filter((_, i) => i !== index);
                    setP({ ...p, adicionais: list });
                  }}
                  className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {(p.adicionais || []).length === 0 && (
              <p className="text-[10px] text-zinc-500 italic text-center py-2">Nenhum opcional configurado ainda.</p>
            )}
          </div>

          <div className="h-px bg-zinc-800 my-2" />

          {/* Form de Cadastro de Adicional - Stacked Vertical e Super Explicado */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider block pl-1">1. Nome do Opcional:</label>
              <input
                placeholder="Ex: Cheddar Extra, Bacon Fatiado, Duplo Hamburguer"
                value={newAddonName}
                onChange={(e) => setNewAddonName(e.target.value)}
                className={`${inputCls} h-10 text-xs`}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider block pl-1">2. Preço Adicional (R$):</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 4.50 (ou 0.00 para opcional grátis)"
                value={newAddonPrice}
                onChange={(e) => setNewAddonPrice(e.target.value)}
                className={`${inputCls} h-10 text-xs`}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (!newAddonName.trim()) return alert("Por favor, digite o nome do opcional.");
                const priceNum = parseFloat(newAddonPrice) || 0;
                const list = [...(p.adicionais || []), { nome: newAddonName.trim(), preco: priceNum }];
                setP({ ...p, adicionais: list, customizable: true });
                setNewAddonName("");
                setNewAddonPrice("");
              }}
              className="w-full h-10 bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs rounded-xl active:scale-95 transition flex items-center justify-center gap-1 shadow-md"
            >
              + Salvar Adicional na Lista
            </button>
          </div>
        </div>

        <label className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated ring-1 ring-border">
          <span className="text-sm font-semibold">Disponível</span>
          <input type="checkbox" checked={p.available} onChange={(e) => setP({ ...p, available: e.target.checked })} className="w-5 h-5 accent-primary" />
        </label>
        
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className={`flex-1 ${btnSecondary}`}>Cancelar</button>
          <button 
            onClick={() => {
              onSave({
                ...p,
                customizable: (p.adicionais || []).length > 0
              });
            }} 
            className={`flex-1 ${btnPrimary}`}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-surface ring-1 ring-border p-4 space-y-3">
      <h2 className="font-extrabold">{title}</h2>
      {children}
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
function CampaignsTab() {
  const products = useStorageSync(() => storage.getProducts());
  const campaignWinners = useStorageSync(() => storage.getCampaignWinners());
  const [selectedProductId, setSelectedProductId] = useState("");
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [latestCampaign, setLatestCampaign] = useState<Campaign | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [drawTicker, setDrawTicker] = useState("");
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [title, setTitle] = useState("");
  const [minValue, setMinValue] = useState("30.00");
  const [endsAt, setEndsAt] = useState("");
  const [campaignImage, setCampaignImage] = useState("🏆");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  function handleSelectProduct(prodId: string) {
    setSelectedProductId(prodId);
    if (!prodId) return;
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setTitle(`Concorra a 1x ${prod.name}!`);
      setCampaignImage(prod.image);
    }
  }

  // Fetch latest campaign and its participants
  async function fetchData() {
    setLoading(true);
    setSupabaseError(null);
    try {
      if (!supabase) {
        setSupabaseError("Supabase não está configurado. Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu arquivo .env.");
        setLoading(false);
        return;
      }

      // Query latest campaign (active or inactive)
      const { data: campaignData, error: campaignError } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (campaignError) throw campaignError;

      if (campaignData) {
        setLatestCampaign(campaignData);
        if (campaignData.is_active) {
          setActiveCampaign(campaignData);
        } else {
          setActiveCampaign(null);
        }
        
        // Query participants for this campaign (whether active or inactive!)
        const { data: participantsData, error: participantsError } = await supabase
          .from("participants")
          .select("*")
          .eq("campaign_id", campaignData.id)
          .order("created_at", { ascending: false });

        if (participantsError) throw participantsError;
        setParticipants(participantsData || []);
      } else {
        setLatestCampaign(null);
        setActiveCampaign(null);
        setParticipants([]);
      }
    } catch (err: any) {
      console.error(err);
      setSupabaseError(err.message || "Erro de conexão com o Supabase.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return alert("Por favor, preencha o título da campanha.");
    if (!supabase) return;

    setActionLoading(true);
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          title: title.trim(),
          min_value: parseFloat(minValue) || 30.00,
          is_active: true,
          ends_at: endsAt ? new Date(`${endsAt}T23:59:59`).toISOString() : null,
          image: campaignImage || "🏆"
        })
        .select()
        .single();

      if (error) throw error;

      setTitle("");
      setMinValue("30.00");
      setEndsAt("");
      setCampaignImage("🏆");
      setSelectedProductId("");
      await fetchData();
    } catch (err: any) {
      alert("Erro ao criar campanha: " + err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCampaignImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      if (!supabase) {
        throw new Error("Supabase não está configurado.");
      }
      const compressed = await compressImage(file);
      const ext = compressed.name.split('.').pop();
      const fileName = `campaign-${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
      const { data, error } = await supabase.storage.from('products-images').upload(fileName, compressed);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('products-images').getPublicUrl(data.path);
      setCampaignImage(publicUrl);
    } catch (err: any) {
      alert("Erro ao enviar imagem do sorteio: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleDeleteParticipant(pId: string) {
    if (!confirm("Tem certeza que deseja remover este participante da campanha?")) return;
    try {
      if (!supabase) return;
      const { error } = await supabase.from("participants").delete().eq("id", pId);
      if (error) throw error;
      setParticipants(prev => prev.filter(p => p.id !== pId));
    } catch (err: any) {
      alert("Erro ao remover participante: " + err.message);
    }
  }

  function handleDrawWinner() {
    if (participants.length === 0) return alert("Nenhum participante qualificado para sortear.");
    setIsDrawing(true);
    setWinner(null);
    
    let duration = 3000;
    let intervalTime = 80;
    let elapsed = 0;
    
    const interval = setInterval(() => {
      const tempIndex = Math.floor(Math.random() * participants.length);
      setDrawTicker(participants[tempIndex].client_name);
      elapsed += intervalTime;
      
      if (elapsed >= duration) {
        clearInterval(interval);
        const finalWinner = participants[Math.floor(Math.random() * participants.length)];
        setWinner(finalWinner);
        
        if (latestCampaign) {
          storage.addCampaignWinner({
            id: latestCampaign.id,
            campaign_title: latestCampaign.title,
            winner_name: finalWinner.client_name,
            winner_phone: finalWinner.client_phone,
            winner_order_total: finalWinner.order_total,
            drawn_at: new Date().toISOString()
          });
        }
        
        setIsDrawing(false);
      }
    }, intervalTime);
  }

  async function handleEndCampaign() {
    if (!activeCampaign || !supabase) return;
    if (!confirm("Tem certeza que deseja encerrar esta campanha? Ela não aceitará mais novos participantes.")) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ is_active: false })
        .eq("id", activeCampaign.id);

      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      alert("Erro ao encerrar campanha: " + err.message);
    } finally {
      setActionLoading(false);
    }
  }

  function handleExportCSV() {
    if (participants.length === 0) return alert("Nenhum participante para exportar.");
    
    // Create CSV content (Portuguese Excel safe with UTF-8 BOM)
    const headers = "Nome,Telefone,Total do Pedido,Data de Inscrição\n";
    const rows = participants.map(p => {
      const dateStr = p.created_at ? new Date(p.created_at).toLocaleString("pt-BR") : "";
      return `"${p.client_name.replace(/"/g, '""')}","${p.client_phone.replace(/"/g, '""')}",${p.order_total},"${dateStr}"`;
    }).join("\n");
    
    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const campaignTitleClean = activeCampaign ? activeCampaign.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "sorteio";
    link.setAttribute("download", `participantes-${campaignTitleClean}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">Carregando dados dos sorteios...</p>
      </div>
    );
  }

  if (supabaseError) {
    return (
      <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-center space-y-4">
        <div className="text-4xl text-destructive">⚠️</div>
        <h3 className="font-extrabold text-lg text-white">Erro de Configuração</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">{supabaseError}</p>
        <button onClick={fetchData} className={btnSecondary}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {activeCampaign ? (
        // Active Campaign Section
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-zinc-900 border-2 border-red-500/30 shadow-[0_10px_30px_rgba(239,68,68,0.1)] space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-red-500/10 text-red-500 animate-pulse">
                  🟢 Em Andamento
                </span>
                <h3 className="text-xl font-black text-white">{activeCampaign.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Valor mínimo do pedido: <span className="font-bold text-primary">{brl(activeCampaign.min_value)}</span>
                </p>
                {activeCampaign.ends_at && (
                  <p className="text-xs text-zinc-400">
                    🕒 Encerra em: <span className="font-bold text-white">{new Date(activeCampaign.ends_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                  </p>
                )}
              </div>
              {activeCampaign.image && (activeCampaign.image.startsWith("http") || activeCampaign.image.startsWith("/")) ? (
                <img src={activeCampaign.image} className="w-12 h-12 object-cover rounded-xl shrink-0 ring-1 ring-red-500/30" />
              ) : activeCampaign.image ? (
                <span className="text-3xl shrink-0 leading-none">{activeCampaign.image}</span>
              ) : (
                <Trophy className="w-8 h-8 text-primary shrink-0" />
              )}
            </div>

            <div className="pt-2">
              <button 
                onClick={handleEndCampaign}
                disabled={actionLoading}
                className="w-full h-11 rounded-xl bg-destructive hover:bg-destructive/80 text-destructive-foreground font-extrabold text-sm transition active:scale-[0.98] disabled:opacity-50"
              >
                {actionLoading ? "Encerrando..." : "Encerrar Sorteio"}
              </button>
            </div>
          </div>

          {/* Participants Table */}
          <Card title={`Participantes da Campanha (${participants.length})`}>
            <div className="flex justify-end pb-2">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-surface-elevated ring-1 ring-border text-foreground hover:bg-surface-elevated/80 font-bold text-xs transition"
              >
                <Download className="w-3.5 h-3.5" /> Exportar Planilha (CSV)
              </button>
            </div>

            <div className="overflow-x-auto ring-1 ring-border rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-elevated text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Data/Hora</th>
                    <th className="px-4 py-3 font-semibold">Nome</th>
                    <th className="px-4 py-3 font-semibold">Telefone</th>
                    <th className="px-4 py-3 font-semibold text-right">Total</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {participants.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                        {p.created_at ? new Date(p.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "-"}
                      </td>
                      <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{p.client_name}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.client_phone}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-primary whitespace-nowrap">{brl(p.order_total)}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDeleteParticipant(p.id)}
                          className="p-1 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition-all animate-fade-in"
                          title="Remover participante"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {participants.length === 0 && (
                <div className="text-center text-muted-foreground py-8 space-y-2">
                  <div className="text-3xl">🎟️</div>
                  <p className="text-xs">Nenhum participante qualificado registrado ainda.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        // Create Campaign Section AND Last Closed Campaign Panel
        <div className="space-y-6">
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div className="p-6 rounded-2xl bg-zinc-900 ring-1 ring-border space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" /> Criar Novo Sorteio
                </h3>
                <p className="text-xs text-muted-foreground">
                  Inicie uma nova campanha promocional. Os clientes que atingirem o valor mínimo receberão automaticamente um número da sorte e participarão.
                </p>
              </div>

              <div className="space-y-3">
                <Field label="Vincular Lanche do Cardápio como Prêmio (Opcional)">
                  <select 
                    value={selectedProductId} 
                    onChange={(e) => handleSelectProduct(e.target.value)} 
                    className={inputCls}
                  >
                    <option value="">-- Escolher lanche existente do cardápio --</option>
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} ({brl(prod.price)})
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Nome da Campanha (Ex: Sorteio do Super Combo Insano)">
                  <input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Ex: Concorra a um Ano de Burger Grátis!" 
                    className={inputCls} 
                    required
                  />
                </Field>

                <Field label="Valor Mínimo do Pedido para Participar (R$)">
                  <input 
                    type="number"
                    step="0.01"
                    value={minValue} 
                    onChange={(e) => setMinValue(e.target.value)} 
                    placeholder="30.00" 
                    className={inputCls} 
                    required
                  />
                </Field>

                <Field label="Data de Encerramento (Opcional)">
                  <input 
                    type="date"
                    value={endsAt} 
                    onChange={(e) => setEndsAt(e.target.value)} 
                    className={inputCls} 
                  />
                </Field>

                <div className="flex gap-3 items-center p-3 bg-surface-elevated rounded-xl ring-1 ring-border">
                  {campaignImage && (campaignImage.startsWith('http') || campaignImage.startsWith('/')) ? (
                    <img src={campaignImage} className="w-12 h-12 object-cover rounded-xl ring-1 ring-border shrink-0" />
                  ) : (
                    <div className="w-12 h-12 text-2xl flex items-center justify-center bg-surface rounded-xl ring-1 ring-border shrink-0">{campaignImage || "🏆"}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-extrabold text-white block">Visualização do Prêmio</span>
                    <span className="text-[10px] text-muted-foreground block truncate">
                      {campaignImage && (campaignImage.startsWith('http') || campaignImage.startsWith('/')) ? "Foto do Lanche" : `Ícone: ${campaignImage || "Troféu"}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/80 text-primary-foreground font-black text-sm transition active:scale-[0.98] shadow-[0_5px_15px_rgba(239,68,68,0.2)]"
                >
                  {actionLoading ? "Iniciando..." : "🚀 Iniciar Sorteio Ativo"}
                </button>
              </div>
            </div>
          </form>

          {/* Last Closed Campaign Panel with Sortear Button */}
          {latestCampaign && (() => {
            const existingWinner = campaignWinners.find(w => w.id === latestCampaign.id);
            return (
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-zinc-900 border-2 border-emerald-500/30 shadow-[0_10px_30px_rgba(16,185,129,0.05)] space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-zinc-800 text-zinc-400 border border-zinc-700">
                        🏁 Sorteio Encerrado
                      </span>
                      <h3 className="text-xl font-black text-white">{latestCampaign.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {existingWinner 
                          ? "Sorteio finalizado. O ganhador está gravado permanentemente no histórico."
                          : "Último sorteio finalizado. Pronto para realizar o sorteio!"}
                      </p>
                    </div>
                    {latestCampaign.image && (latestCampaign.image.startsWith("http") || latestCampaign.image.startsWith("/")) ? (
                      <img src={latestCampaign.image} className="w-12 h-12 object-cover rounded-xl shrink-0 ring-1 ring-zinc-700" />
                    ) : latestCampaign.image ? (
                      <span className="text-3xl shrink-0 leading-none">{latestCampaign.image}</span>
                    ) : (
                      <Trophy className="w-8 h-8 text-zinc-500 shrink-0" />
                    )}
                  </div>

                  {existingWinner ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-3 animate-fade-in">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-sm">
                        <Trophy className="w-4 h-4 shrink-0" />
                        <span>Ganhador Sorteado!</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Nome</span>
                          <span className="font-extrabold text-white text-sm">{existingWinner.winner_name}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Telefone</span>
                          <span className="font-bold text-zinc-200 text-sm">{existingWinner.winner_phone}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-emerald-500/10 text-xs">
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Total do Pedido</span>
                          <span className="font-extrabold text-emerald-400 text-sm">{brl(existingWinner.winner_order_total)}</span>
                        </div>
                        <a 
                          href={`https://wa.me/55${existingWinner.winner_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Olá ${existingWinner.winner_name}! Você participou do nosso sorteio no Insano Lanches e foi o GANHADOR! 🎉🏆`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold flex items-center gap-1.5 transition active:scale-[0.98]"
                        >
                          Chamar no Whats 📲
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <button 
                        onClick={handleDrawWinner}
                        disabled={participants.length === 0}
                        className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
                      >
                        <span>Realizar Sorteio 🎲</span>
                      </button>
                    </div>
                  )}
                </div>

              {/* Participants Table for Closed Campaign */}
              <Card title={`Participantes do Sorteio Encerrado (${participants.length})`}>
                <div className="flex justify-end pb-2">
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-surface-elevated ring-1 ring-border text-foreground hover:bg-surface-elevated/80 font-bold text-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Exportar Planilha (CSV)
                  </button>
                </div>

                <div className="overflow-x-auto ring-1 ring-border rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-elevated text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Data/Hora</th>
                        <th className="px-4 py-3 font-semibold">Nome</th>
                        <th className="px-4 py-3 font-semibold">Telefone</th>
                        <th className="px-4 py-3 font-semibold text-right">Total</th>
                        <th className="px-4 py-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {participants.map((p) => (
                        <tr key={p.id} className="hover:bg-surface-elevated/50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                            {p.created_at ? new Date(p.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "-"}
                          </td>
                          <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{p.client_name}</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.client_phone}</td>
                          <td className="px-4 py-3 text-right font-extrabold text-primary whitespace-nowrap">{brl(p.order_total)}</td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleDeleteParticipant(p.id)}
                              className="p-1 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition-all"
                              title="Remover participante"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {participants.length === 0 && (
                    <div className="text-center text-muted-foreground py-8 space-y-2">
                      <div className="text-3xl">🎟️</div>
                      <p className="text-xs">Nenhum participante qualificado registrado para este sorteio.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          );
        })()}
        </div>
      )}

      {/* Historical Draws Section */}
      <Card title="🏆 Histórico de Sorteios Realizados">
        <div className="space-y-4">
          {campaignWinners.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 space-y-2">
              <div className="text-3xl text-zinc-600">🏆</div>
              <p className="text-xs">Nenhum sorteio realizado no histórico ainda.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {campaignWinners.map((w) => (
                <div 
                  key={w.id} 
                  className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 space-y-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:border-emerald-500/20 transition-all duration-200"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5 animate-fade-in">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Sorteio</span>
                      <h4 className="font-extrabold text-white text-sm line-clamp-1">{w.campaign_title}</h4>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-semibold shrink-0">
                      {new Date(w.drawn_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface/50 ring-1 ring-border/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                      <Trophy className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Ganhador: {w.winner_name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-zinc-400">
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Telefone</span>
                        <span>{w.winner_phone}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Valor Compra</span>
                        <span className="text-emerald-400 font-bold">{brl(w.winner_order_total)}</span>
                      </div>
                    </div>
                  </div>

                  <a 
                    href={`https://wa.me/55${w.winner_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Olá ${w.winner_name}! Você participou do nosso sorteio no Insano Lanches e foi o GANHADOR! 🎉🏆`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-1 transition active:scale-[0.98]"
                  >
                    Entrar em contato 📲
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Drawing Ticker Modal */}
      {isDrawing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-zinc-950 border border-primary/30 text-center space-y-4 animate-pulse">
            <span className="text-5xl animate-bounce inline-block">🎲</span>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Sorteando Vencedor...</h3>
              <p className="text-xs text-muted-foreground font-medium">Cruzando os dedos! Quem será o sortudo?</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 font-extrabold text-2xl text-emerald-400 tracking-wide min-h-[64px] flex items-center justify-center">
              {drawTicker}
            </div>
          </div>
        </div>
      )}

      {/* Winner Celebration Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-950 border-2 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)] text-center space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20 text-3xl">
              🎉 ✨ 🎊 🥳 🏆 🎁 🍔
            </div>
            
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-bounce">
                🎉 Vencedor Sorteado!
              </span>
              <h3 className="text-2xl font-black text-white">Parabéns ao Ganhador!</h3>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-3xl ring-1 ring-emerald-500/30">
                🏆
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest block">Nome do Sortudo(a)</span>
                <p className="text-2xl font-extrabold text-emerald-400 tracking-tight">{winner.client_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-left text-xs pt-2 border-t border-zinc-800/60">
                <div>
                  <span className="text-zinc-500 block">Telefone</span>
                  <span className="font-bold text-zinc-200">{winner.client_phone}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Valor da Compra</span>
                  <span className="font-bold text-emerald-400">{brl(winner.order_total)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setWinner(null)}
                className="flex-1 h-11 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-extrabold text-sm transition"
              >
                Fechar
              </button>
              <a 
                href={`https://wa.me/55${winner.client_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Olá ${winner.client_name}! Você participou do nosso sorteio promocional no Insano Lanches e acaba de ser o GANHADOR! 🎉🏆`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm flex items-center justify-center gap-1.5 transition"
              >
                Chamar no Whats 📲
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const inputCls = "w-full h-11 px-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground ring-1 ring-border focus:ring-primary outline-none text-sm";
const btnPrimary = "h-11 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm";
const btnSecondary = "h-11 px-4 rounded-xl bg-surface-elevated ring-1 ring-border text-foreground font-bold text-sm";

function FaturamentoTab({ lojaId }: { lojaId: string | null }) {
  type Period = "hoje" | "7d" | "30d" | "tudo";
  const [period, setPeriod] = useState<Period>("hoje");
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchOrders(selectedPeriod: Period = period) {
    try {
      if (!supabase) return;
      
      let query = supabase.from("orders_history").select("*");
      if (lojaId) {
        query = query.eq("loja_id", lojaId);
      }
      
      if (selectedPeriod !== "tudo") {
        const dateLimit = new Date();
        dateLimit.setHours(0, 0, 0, 0);
        if (selectedPeriod === "7d") {
          dateLimit.setDate(dateLimit.getDate() - 7);
        } else if (selectedPeriod === "30d") {
          dateLimit.setDate(dateLimit.getDate() - 30);
        }
        query = query.gte("created_at", dateLimit.toISOString());
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Erro ao buscar histórico de pedidos:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchOrders(period);
  }, [period]);

  useEffect(() => {
    const interval = setInterval(() => fetchOrders(period), 30000);
    return () => clearInterval(interval);
  }, [period]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders(period);
  };

  async function handleResetStats() {
    if (!confirm("Tem certeza que deseja ZERAR todo o histórico de faturamento? Esta ação não pode ser desfeita!")) return;
    setRefreshing(true);
    try {
      if (!supabase || !lojaId) return;
      const { error } = await supabase.from("orders_history").delete().eq("loja_id", lojaId);
      if (error) throw error;
      alert("Histórico de faturamento zerado com sucesso!");
      setOrders([]);
    } catch (err: any) {
      alert("Erro ao zerar estatísticas: " + err.message);
    } finally {
      setRefreshing(false);
    }
  }

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
  const totalOrders = orders.length;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const deliveryCount = orders.filter(o => o.delivery_type === "Entrega").length;
  const pickupCount = orders.filter(o => o.delivery_type === "Retirada").length;
  const deliveryPercent = totalOrders > 0 ? (deliveryCount / totalOrders) * 100 : 0;
  const pickupPercent = totalOrders > 0 ? (pickupCount / totalOrders) * 100 : 0;

  const pixTotal = orders.filter(o => o.payment_method === "Pix").reduce((sum, o) => sum + Number(o.total_price), 0);
  const cardTotal = orders.filter(o => o.payment_method === "Cartão").reduce((sum, o) => sum + Number(o.total_price), 0);
  const cashTotal = orders.filter(o => o.payment_method === "Dinheiro").reduce((sum, o) => sum + Number(o.total_price), 0);

  const pixPercent = totalRevenue > 0 ? (pixTotal / totalRevenue) * 100 : 0;
  const cardPercent = totalRevenue > 0 ? (cardTotal / totalRevenue) * 100 : 0;
  const cashPercent = totalRevenue > 0 ? (cashTotal / totalRevenue) * 100 : 0;

  const freeBurgersCount = orders.filter(o => o.is_fidelidade_resgate).length;

  const periodLabel = period === "hoje" ? "hoje" : period === "7d" ? "nos últimos 7 dias" : period === "30d" ? "nos últimos 30 dias" : "em todo o histórico";
  const periodTitle = period === "hoje" ? "Hoje" : period === "7d" ? "Últimos 7 dias" : period === "30d" ? "Últimos 30 dias" : "Total";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-zinc-400">Carregando métricas financeiras...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6 text-white font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white">Faturamento & Estatísticas</h2>
          <p className="text-xs text-zinc-400">Analise seu desempenho financeiro histórico.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl gap-1">
            {([["hoje", "Hoje"], ["7d", "7 dias"], ["30d", "30 dias"], ["tudo", "Tudo"]] as [Period, string][]).map(([p, label]) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  period === p 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold hover:bg-zinc-800 active:scale-[0.98] transition-all"
          >
            <span className={`w-2 h-2 rounded-full bg-emerald-400 ${refreshing ? "animate-ping" : ""}`}></span>
            {refreshing ? "..." : "Atualizar"}
          </button>
          <button 
            onClick={handleResetStats}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-950/40 border border-red-900/30 text-red-500 hover:bg-red-900/20 text-xs font-bold active:scale-[0.98] transition-all"
            title="Zerar faturamento para demonstração"
          >
            <span>Zerar Estatísticas 🧹</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-md flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Faturamento</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-400">{brl(totalRevenue)}</h3>
            <p className="text-[10px] text-zinc-400 mt-1">Total vendido {periodLabel}</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-md flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Pedidos ({periodTitle})</span>
            <ShoppingCart className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white">{totalOrders}</h3>
            <p className="text-[10px] text-zinc-400 mt-1">Vendas confirmadas {periodLabel}</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-md flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Ticket Médio</span>
            <TrendingUp className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-red-400">{brl(averageTicket)}</h3>
            <p className="text-[10px] text-zinc-400 mt-1">Média por pedido {periodLabel}</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-md flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Logística</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-emerald-400">{deliveryCount}x Entrega</span>
              <span className="text-blue-400">{pickupCount}x Retirada</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden flex">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${deliveryPercent || 50}%` }}></div>
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${pickupPercent || 50}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 p-5 rounded-3xl bg-zinc-950 border border-zinc-900 space-y-4">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Faturamento por Método de Pagamento</h3>
            <p className="text-[11px] text-zinc-400">Quanto entrou por tipo de pagamento {periodLabel}.</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Pix</span>
                <span className="font-extrabold text-emerald-400">{brl(pixTotal)} ({pixPercent.toFixed(0)}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pixPercent}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Cartão</span>
                <span className="font-extrabold text-purple-400">{brl(cardTotal)} ({cardPercent.toFixed(0)}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${cardPercent}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Dinheiro</span>
                <span className="font-extrabold text-blue-400">{brl(cashTotal)} ({cashPercent.toFixed(0)}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${cashPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-900 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-650/10 rounded-full blur-2xl"></div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Monitor de Brindes</h3>
            <p className="text-[11px] text-zinc-400">Resgates gratuitos do Cartão Fidelidade {periodLabel}.</p>
          </div>
          <div className="py-6 flex items-center justify-center gap-4">
            <div className="w-14 h-14 bg-red-600/10 border border-red-500/30 rounded-2xl flex items-center justify-center">
              <Gift className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <span className="text-3xl font-black text-white">{freeBurgersCount}</span>
              <span className="text-xs text-zinc-400 block font-bold">Lanches Grátis entregues</span>
            </div>
          </div>
          <div className="text-[10px] text-center text-zinc-500 border-t border-zinc-900 pt-3">
            Incentivo automático para fidelizar clientes
          </div>
        </div>
      </div>

      <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-900 space-y-4">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Fluxo de Pedidos do Dia</h3>
          <p className="text-[11px] text-zinc-400">Transações e vendas em tempo real ordenadas do mais recente para o antigo.</p>
        </div>

        <div className="overflow-x-auto ring-1 ring-zinc-900 rounded-2xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-900/60 text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-bold">Data/Hora</th>
                <th className="px-4 py-3 font-bold">Cliente</th>
                <th className="px-4 py-3 font-bold">Itens do Pedido</th>
                <th className="px-4 py-3 font-bold">Pagamento</th>
                <th className="px-4 py-3 font-bold">Entrega</th>
                <th className="px-4 py-3 font-bold text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {orders.map((o) => {
                const dateStr = o.created_at 
                  ? new Date(o.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) 
                  : "--/-- --:--";
                return (
                  <tr key={o.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-zinc-400 whitespace-nowrap">{dateStr}</td>
                    <td className="px-4 py-3 font-extrabold text-white whitespace-nowrap">{o.client_name}</td>
                    <td className="px-4 py-3 text-zinc-300 max-w-[200px] truncate" title={o.items_summary}>{o.items_summary || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {o.payment_method === "Pix" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">Pix</span>
                      )}
                      {o.payment_method === "Cartão" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/30">Cartão</span>
                      )}
                      {o.payment_method === "Dinheiro" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30">Dinheiro</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        o.delivery_type === "Entrega" ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30" : "bg-zinc-800 text-zinc-300 ring-1 ring-zinc-700"
                      }`}>
                        {o.delivery_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-white whitespace-nowrap">
                      {o.is_fidelidade_resgate ? (
                        <span className="text-red-400 line-through mr-1 text-[11px]">{brl(o.subtotal + o.delivery_fee)}</span>
                      ) : null}
                      <span className={o.is_fidelidade_resgate ? "text-emerald-400" : ""}>
                        {o.is_fidelidade_resgate ? brl(o.delivery_fee) : brl(o.total_price)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center text-zinc-500 py-10 font-bold">
              Nenhum pedido efetuado no período selecionado.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
