import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { storage } from "@/lib/storage";
import { useStorageSync } from "@/hooks/use-storage";
import type { Product, Category, CustomerLoyalty, Campaign, CampaignWinner, Participant, OrderHistory, DeliveryLocation } from "@/lib/types";
import { brl } from "@/lib/format";
import { ArrowLeft, Plus, Pencil, Trash2, Search, Gift, Trophy, Download, DollarSign, TrendingUp, ShoppingCart, Truck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/lib/tenant";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel — Insano Lanches" }] }),
  component: AdminPage,
});

type Tab = "geral" | "fidelidade" | "produtos" | "sorteios" | "faturamento";

function AdminPage() {
  const [tab, setTab] = useState<Tab>("geral");
  const settings = useStorageSync(() => storage.getSettings());
  const { tenant, refreshTenant, logoutTenant } = useTenant();

  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      let authenticated = false;
      try {
        if (typeof window !== "undefined") {
          const pinAuth = sessionStorage.getItem("insano.admin.auth");
          if (pinAuth === "true") {
            authenticated = true;
          }
        }

        if (!authenticated && supabase) {
          // Timeout de 2.5 segundos para evitar travamento de rede
          const authPromise = supabase.auth.getUser();
          const timeoutPromise = new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout de rede")), 2500)
          );

          const res = await Promise.race([authPromise, timeoutPromise]);
          const user = res?.data?.user;
          const error = res?.error;

          if (!error && user) {
            authenticated = true;
          }
        }
      } catch (err) {
        console.warn("Erro ao verificar autenticação no Supabase:", err);
      }

      if (authenticated) {
        setIsAuthenticated(true);
      }
      setLoadingAuth(false);
    }
    checkAuth();
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const correctPassword = settings.adminPassword || "1234";
    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("insano.admin.auth", "true");
      setError("");
    } else {
      setError("Senha incorreta! Tente novamente.");
    }
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-sans">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-950 text-white font-sans">
        <form onSubmit={handleLogin} className="w-full max-w-sm p-6 rounded-3xl bg-zinc-900 ring-2 ring-red-500/30 shadow-[0_15px_40px_rgba(239,68,68,0.15)] space-y-5">
          <div className="text-center space-y-1">
            <span className="text-[10px] tracking-[0.2em] font-black uppercase text-red-500">Área Exclusiva</span>
            <h2 className="text-2xl font-black tracking-tight">Insano Admin</h2>
            <p className="text-xs text-zinc-400">Digite o PIN de acesso para entrar nas configurações da lanchonete.</p>
          </div>

          <div className="space-y-2">
            <input
              type="password"
              placeholder="••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 text-center tracking-[0.3em] text-xl font-bold rounded-2xl bg-zinc-950 text-white placeholder:text-zinc-700 ring-1 ring-zinc-800 focus:ring-red-500 outline-none transition-all"
              autoFocus
            />
            {error && <p className="text-xs text-red-500 text-center font-bold animate-pulse">{error}</p>}
          </div>

          <button type="submit" className="w-full h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-[0_5px_20px_rgba(220,38,38,0.3)] transition active:scale-[0.98]">
            Liberar Acesso
          </button>
        </form>
      </div>
    );
  }

  if (settings.isBlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-950 text-white font-sans text-center">
        <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-900 ring-2 ring-yellow-500/30 shadow-[0_15px_40px_rgba(234,179,8,0.15)] space-y-6">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-4xl">⚠️</span>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.2em] font-black uppercase text-yellow-500">Assinatura Pendente</span>
            <h2 className="text-3xl font-black tracking-tight text-white">Painel Bloqueado</h2>
            <p className="text-sm text-zinc-400">
              Ops! Parece que o pagamento mensal do seu cardápio digital de R$ 300,00 está pendente ou precisa ser renovado.
            </p>
          </div>
          <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
            <p className="text-xs text-zinc-400">Por favor, regularize sua assinatura para reativar seu acesso.</p>
            {settings.billingLink && (
              <a
                href={settings.billingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center h-12 rounded-2xl bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold text-sm shadow-[0_5px_20px_rgba(234,179,8,0.3)] transition active:scale-[0.98]"
              >
                Pagar Fatura R$ 300,00 💳
              </a>
            )}
          </div>
          <div className="text-xs text-zinc-500">
            Dúvidas? Entre em contato com o administrador do sistema.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 text-muted-foreground"><ArrowLeft className="w-5 h-5" /></Link>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-primary font-bold">Painel do Dono</p>
              <h1 className="font-extrabold">{tenant ? tenant.nome_da_loja : "Insano Admin"}</h1>
            </div>
          </div>
          {isAuthenticated && (
            <button
              onClick={async () => {
                await logoutTenant();
                sessionStorage.removeItem("insano.admin.auth");
                window.location.href = "/";
              }}
              className="px-3 py-1.5 rounded-xl bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-500/20 text-xs font-bold transition active:scale-95 duration-200"
            >
              Sair da Conta
            </button>
          )}
        </div>
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {([["geral", "⚙️ Geral"], ["fidelidade", "🎁 Fidelidade"], ["produtos", "🍔 Produtos"], ["sorteios", "🏆 Sorteios"], ["faturamento", "📊 Faturamento"]] as [Tab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold ${tab === id ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground ring-1 ring-border"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 space-y-4">
        {tab === "geral" && <GeneralTab />}
        {tab === "fidelidade" && <LoyaltyTab />}
        {tab === "produtos" && <ProductsTab />}
        {tab === "sorteios" && <CampaignsTab />}
        {tab === "faturamento" && <FaturamentoTab />}
      </main>
    </div>
  );
}

function GeneralTab() {
  const settings = useStorageSync(() => storage.getSettings());
  const products = useStorageSync(() => storage.getProducts());
  const { tenant, refreshTenant } = useTenant();

  const isTenant = tenant && tenant.id !== "default-loja";

  // Estados locais para a loja do tenant
  const [tName, setTName] = useState("");
  const [tWhatsapp, setTWhatsapp] = useState("");
  const [tAddress, setTAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tenant) {
      setTName(tenant.nome_da_loja || "");
      setTWhatsapp(tenant.whatsapp || "");
      setTAddress(tenant.endereco || "");
    }
  }, [tenant]);

  const update = (patch: Partial<typeof settings>) => storage.setSettings({ ...settings, ...patch });

  async function handleSaveTenant(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant || !supabase) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("lojas")
        .update({
          nome_da_loja: tName.trim(),
          whatsapp: tWhatsapp.trim(),
          endereco: tAddress.trim(),
        })
        .eq("id", tenant.id);

      if (error) throw error;
      alert("Configurações da loja salvas com sucesso!");
      await refreshTenant();
    } catch (err: any) {
      alert("Erro ao salvar configurações da loja: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [locLoading, setLocLoading] = useState(true);
  const [locError, setLocError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function fetchLocations() {
    setLocLoading(true);
    setLocError(null);
    try {
      if (!supabase) return;
      const fetchPromise = supabase
        .from("delivery_locations")
        .select("*")
        .order("name", { ascending: true });
      const timeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout ao carregar taxas de entrega")), 2500)
      );
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
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

  return (
    <section className="space-y-4">
      {isTenant ? (
        <form onSubmit={handleSaveTenant}>
          <Card title="⚙️ Configurações Gerais">
            <Field label="Nome da Loja / Comércio">
              <input value={tName} onChange={(e) => setTName(e.target.value)} className={inputCls} required />
            </Field>
            <Field label="Telefone WhatsApp (para receber pedidos)">
              <input value={tWhatsapp} onChange={(e) => setTWhatsapp(e.target.value.replace(/\D/g, ""))} className={inputCls} placeholder="Ex: 5546999999999" required />
            </Field>
            <Field label="Endereço Completo">
              <input value={tAddress} onChange={(e) => setTAddress(e.target.value)} className={inputCls} placeholder="Ex: Av. Brasil, 123 - Centro" />
            </Field>
            <button type="submit" disabled={saving} className={`${btnPrimary} w-full h-12 rounded-xl mt-3`}>
              {saving ? "Salvando..." : "Salvar Configurações da Loja 💾"}
            </button>
          </Card>
        </form>
      ) : (
        <Card title="Loja">
          <Field label="Nome da lanchonete">
            <input value={settings.storeName} onChange={(e) => update({ storeName: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Telefone WhatsApp (com DDI/DDD)">
            <input value={settings.whatsapp} onChange={(e) => update({ whatsapp: e.target.value.replace(/\D/g, "") })} className={inputCls} />
          </Field>
          <Field label="Endereço do comércio">
            <input 
              value={settings.storeAddress || ""} 
              onChange={(e) => update({ storeAddress: e.target.value })} 
              className={inputCls} 
              placeholder="Ex: Av. Brasil, 1234 - Centro" 
            />
          </Field>
          <Field label="Status da loja">
            <button
              onClick={() => update({ isOpen: !settings.isOpen })}
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
      )}

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
                          onClick={() => handleStartEdit(loc)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
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
        <Field label="Valor mínimo do pedido para pontuar (R$)">
          <input type="number" step="0.01" value={settings.loyaltyMinOrder} onChange={(e) => update({ loyaltyMinOrder: Number(e.target.value) })} className={inputCls} />
        </Field>
        <Field label="Quantidade de pontos para ganhar o prêmio">
          <input type="number" value={settings.loyaltyGoal} onChange={(e) => update({ loyaltyGoal: Number(e.target.value) })} className={inputCls} />
        </Field>
        <Field label="Prêmio do Cartão Fidelidade (Lanche Grátis)">
          <select value={settings.loyaltyRewardId || ""} onChange={(e) => update({ loyaltyRewardId: e.target.value })} className={inputCls}>
            <option value="">Lanche mais barato do pedido (Padrão)</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
      </Card>

      <Card title="🍔 Adicionais de Customização">
        <Field label="Valor Adicional da Maionese Verde (R$)">
          <input 
            type="number" 
            step="0.01" 
            value={settings.mayoPrice ?? 2.00} 
            onChange={(e) => update({ mayoPrice: Number(e.target.value) })} 
            className={inputCls} 
          />
        </Field>
      </Card>

      <Card title="Pagamento via Pix">
        <Field label="Chave PIX do Estabelecimento">
          <input value={settings.pixKey} onChange={(e) => update({ pixKey: e.target.value })} className={inputCls} placeholder="ex: 12.345.678/0001-90" />
        </Field>
        <Field label="Nome do Titular do Pix">
          <input value={settings.pixName} onChange={(e) => update({ pixName: e.target.value })} className={inputCls} placeholder="ex: Insano Lanches LTDA" />
        </Field>
      </Card>

      <Card title="Compartilhamento">
        <div className="p-3 rounded-xl bg-surface-elevated ring-1 ring-border space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Link para colocar na bio do Instagram:</p>
          <div className="flex gap-2">
            <input 
              readOnly 
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/?loja=${isTenant && tenant ? tenant.slug : settings.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} 
              className={`${inputCls} bg-surface`} 
            />
            <button 
              onClick={() => { 
                const link = `${typeof window !== "undefined" ? window.location.origin : ""}/?loja=${isTenant && tenant ? tenant.slug : settings.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
                navigator.clipboard.writeText(link); 
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

function ProductsTab() {
  const products = useStorageSync(() => storage.getProducts());
  const { tenant } = useTenant();

  const isTenant = tenant && tenant.id !== "default-loja";

  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchDbProducts() {
    if (!isTenant || !supabase || !tenant) return;
    setDbLoading(true);
    try {
      const fetchPromise = supabase
        .from("produtos")
        .select("*")
        .eq("loja_id", tenant.id);
      const timeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout ao carregar produtos")), 2500)
      );
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) throw error;
      if (data) {
        const mapped: Product[] = data.map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          price: Number(row.price),
          image: row.image || "🍔",
          category: row.category as any,
          available: row.available,
          customizable: row.customizable,
          hasLettuceOption: row.has_lettuce_option,
          hasKetchupOption: row.has_ketchup_option,
          hasMayoOption: row.has_mayo_option,
        }));
        setDbProducts(mapped);
      }
    } catch (err: any) {
      console.error("Erro ao buscar produtos do inquilino:", err);
    } finally {
      setDbLoading(false);
    }
  }

  useEffect(() => {
    fetchDbProducts();
  }, [tenant]);

  const activeProducts = isTenant ? dbProducts : products;

  async function save(p: Product) {
    if (isTenant && supabase && tenant) {
      try {
        const dbObj = {
          loja_id: tenant.id,
          name: p.name,
          description: p.description,
          price: p.price,
          image: p.image,
          category: p.category,
          available: p.available,
          customizable: p.customizable,
          has_lettuce_option: p.hasLettuceOption,
          has_ketchup_option: p.hasKetchupOption,
          has_mayo_option: p.hasMayoOption,
        };

        if (isNew) {
          const { error } = await supabase.from("produtos").insert(dbObj);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("produtos").update(dbObj).eq("id", p.id);
          if (error) throw error;
        }
        await fetchDbProducts();
      } catch (err: any) {
        alert("Erro ao salvar produto no Supabase: " + err.message);
        return;
      }
    } else {
      const list = [...products];
      const idx = list.findIndex((x) => x.id === p.id);
      if (idx >= 0) list[idx] = p;
      else list.push(p);
      storage.setProducts(list);
    }
    setEditing(null);
    setIsNew(false);
  }

  function toggle(p: Product) {
    save({ ...p, available: !p.available });
  }

  async function handleDeleteProduct(id: string) {
    if (isTenant && supabase) {
      try {
        const { error } = await supabase.from("produtos").delete().eq("id", id);
        if (error) throw error;
        await fetchDbProducts();
      } catch (err: any) {
        alert("Erro ao excluir do Supabase: " + err.message);
      }
    } else {
      storage.setProducts(products.filter((x) => x.id !== id));
    }
    setDeletingId(null);
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

      {dbLoading ? (
        <div className="text-center text-xs text-muted-foreground py-8">Carregando produtos do banco...</div>
      ) : (
        <ul className="space-y-2">
          {activeProducts.map((p) => (
            <li key={p.id} className="p-3 rounded-xl bg-surface ring-1 ring-border flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-surface-elevated flex items-center justify-center overflow-hidden text-2xl shrink-0">
                {(p.image.startsWith('http') || p.image.startsWith('/')) ? <img src={p.image} className="w-full h-full object-cover" /> : p.image}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{brl(p.price)} • {p.category}</p>
              </div>
              <button onClick={() => toggle(p)} className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.available ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                {p.available ? "Disponível" : "Esgotado"}
              </button>
              <button onClick={() => { setIsNew(false); setEditing(p); }} className="p-2 text-muted-foreground"><Pencil className="w-4 h-4" /></button>
              
              {deletingId === p.id ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="px-2.5 py-1 rounded-lg bg-destructive text-destructive-foreground text-[10px] font-extrabold shadow-sm active:scale-95 transition"
                  >
                    Excluir
                  </button>
                  <button
                    onClick={() => setDeletingId(null)}
                    className="px-2 py-1 rounded-lg bg-surface-elevated ring-1 ring-border text-foreground text-[10px] font-semibold active:scale-95 transition"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <button
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
      )}

      {editing && <ProductModal product={editing} isNew={isNew} onClose={() => { setEditing(null); setIsNew(false); }} onSave={save} />}
    </section>
  );
}

function ProductModal({ product, isNew, onClose, onSave }: { product: Product; isNew: boolean; onClose: () => void; onSave: (p: Product) => void }) {
  const [p, setP] = useState<Product>(product);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      if (!supabase) {
        throw new Error("Supabase não está configurado. Insira VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu ambiente.");
      }
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
      const { data, error } = await supabase.storage.from('products-images').upload(fileName, file);
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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-end sm:items-center justify-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl ring-1 ring-border max-h-[95vh] overflow-y-auto p-4 space-y-3">
        <h3 className="font-extrabold text-lg">{isNew ? "Novo produto" : "Editar produto"}</h3>
        <Field label="Nome"><input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} className={inputCls} /></Field>
        <Field label="Descrição"><textarea value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} className={`${inputCls} h-20 py-2`} /></Field>
        <Field label="Preço (R$)"><input type="number" step="0.01" value={p.price} onChange={(e) => setP({ ...p, price: Number(e.target.value) })} className={inputCls} /></Field>
        <Field label="Imagem do Produto">
          <div className="flex gap-3 items-center mb-3">
            {p.image && (p.image.startsWith('http') || p.image.startsWith('/')) ? (
              <img src={p.image} className="w-14 h-14 object-cover rounded-xl ring-1 ring-border" />
            ) : p.image ? (
              <div className="w-14 h-14 text-2xl flex items-center justify-center bg-surface-elevated rounded-xl ring-1 ring-border">{p.image}</div>
            ) : (
              <div className="w-14 h-14 text-2xl flex items-center justify-center bg-surface-elevated rounded-xl ring-1 ring-border">❓</div>
            )}
            <div className="flex-1 space-y-1">
              <span className="text-xs font-semibold text-muted-foreground block">Foto Selecionada</span>
              <span className="text-[10px] text-zinc-400 block truncate">{p.image && (p.image.startsWith('http') || p.image.startsWith('/')) ? "Foto Customizada" : `Ícone: ${p.image || "Nenhum"}`}</span>
            </div>
          </div>

          {/* Grade de Escolha Rápida */}
          <div className="space-y-1.5 mb-3">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Escolha rápida de ícone:</span>
            <div className="grid grid-cols-6 gap-2">
              {[
                { emoji: "🍔", label: "Hambúrguer" },
                { emoji: "🍟", label: "Batata Frita" },
                { emoji: "🍕", label: "Pizza" },
                { emoji: "🌭", label: "Cachorro Quente" },
                { emoji: "🥤", label: "Refrigerante" },
                { emoji: "🍺", label: "Cerveja" },
                { emoji: "🍦", label: "Sorvete" },
                { emoji: "🍰", label: "Sobremesa" },
                { emoji: "🍩", label: "Donuts" },
                { emoji: "🍗", label: "Frango Frito" },
                { emoji: "🥓", label: "Bacon" },
                { emoji: "🥗", label: "Salada" }
              ].map((item) => (
                <button
                  key={item.emoji}
                  type="button"
                  onClick={() => setP({ ...p, image: item.emoji })}
                  title={item.label}
                  className={`h-10 text-xl flex items-center justify-center rounded-xl bg-surface-elevated ring-1 transition active:scale-95 ${
                    p.image === item.emoji ? "ring-primary bg-primary/10" : "ring-border hover:bg-zinc-800"
                  }`}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Ou envie uma foto personalizada:</span>
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            {uploading && <p className="text-xs text-primary font-bold mt-1">Enviando imagem...</p>}
          </div>
        </Field>
        <Field label="Categoria">
          <select value={p.category} onChange={(e) => setP({ ...p, category: e.target.value as Category })} className={inputCls}>
            <option value="hamburgueres">Hambúrgueres</option>
            <option value="porcoes">Porções</option>
            <option value="bebidas">Bebidas</option>
          </select>
        </Field>
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Opções de Customização:</span>
          <label className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated">
            <span className="text-sm font-semibold">Opção de Alface</span>
            <input 
              type="checkbox" 
              checked={p.hasLettuceOption ?? p.customizable} 
              onChange={(e) => setP({ ...p, hasLettuceOption: e.target.checked })} 
              className="w-5 h-5 accent-primary" 
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated">
            <span className="text-sm font-semibold">Opção de Ketchup</span>
            <input 
              type="checkbox" 
              checked={p.hasKetchupOption ?? p.customizable} 
              onChange={(e) => setP({ ...p, hasKetchupOption: e.target.checked })} 
              className="w-5 h-5 accent-primary" 
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated">
            <span className="text-sm font-semibold">Opção de Maionese Verde</span>
            <input 
              type="checkbox" 
              checked={p.hasMayoOption ?? p.customizable} 
              onChange={(e) => setP({ ...p, hasMayoOption: e.target.checked })} 
              className="w-5 h-5 accent-primary" 
            />
          </label>
        </div>
        <label className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated">
          <span className="text-sm font-semibold">Disponível</span>
          <input type="checkbox" checked={p.available} onChange={(e) => setP({ ...p, available: e.target.checked })} className="w-5 h-5 accent-primary" />
        </label>
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className={`flex-1 ${btnSecondary}`}>Cancelar</button>
          <button 
            onClick={() => {
              const finalLettuce = p.hasLettuceOption ?? p.customizable;
              const finalKetchup = p.hasKetchupOption ?? p.customizable;
              const finalMayo = p.hasMayoOption ?? p.customizable;
              onSave({
                ...p,
                hasLettuceOption: finalLettuce,
                hasKetchupOption: finalKetchup,
                hasMayoOption: finalMayo,
                customizable: finalLettuce || finalKetchup || finalMayo
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
      const ext = file.name.split('.').pop();
      const fileName = `campaign-${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
      const { data, error } = await supabase.storage.from('products-images').upload(fileName, file);
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

function FaturamentoTab() {
  type Period = "hoje" | "7d" | "30d" | "tudo";
  const [period, setPeriod] = useState<Period>("hoje");
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchOrders(selectedPeriod: Period = period) {
    try {
      if (!supabase) return;
      
      let query = supabase.from("orders_history").select("*");
      
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
    if (!confirm("Tem certeza que deseja ZERAR todo o histórico de faturamento para a sua demonstração? Esta ação não pode ser desfeita!")) return;
    setRefreshing(true);
    try {
      if (!supabase) return;
      const { error } = await supabase.from("orders_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
      alert("Histórico de faturamento zerado com sucesso! Pronto para a sua demonstração.");
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
