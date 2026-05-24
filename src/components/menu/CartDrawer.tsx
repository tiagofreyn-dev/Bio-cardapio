import { useMemo, useState, useEffect } from "react";
import type { CartItem, Campaign, DeliveryLocation } from "@/lib/types";
import { brl } from "@/lib/format";
import { storage } from "@/lib/storage";
import { useStorageSync } from "@/hooks/use-storage";
import { X, Minus, Plus, Trash2, Copy, Check, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/lib/tenant";

type Delivery = "retirada" | "entrega";
type Payment = "Pix" | "Cartão" | "Dinheiro";

export function CartDrawer({
  items,
  onClose,
  onUpdate,
  onRemove,
  onClear,
}: {
  items: CartItem[];
  onClose: () => void;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const settings = useStorageSync(() => storage.getSettings());
  const points = useStorageSync(() => storage.getLoyaltyPoints());
  const products = useStorageSync(() => storage.getProducts());
  const { tenant } = useTenant();
  const isAcaiShop = tenant?.slug.includes("acai") ?? false;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [ref, setRef] = useState("");
  const [delivery, setDelivery] = useState<Delivery>("entrega");
  const [payment, setPayment] = useState<Payment>("Pix");
  const [change, setChange] = useState("");
  const [observation, setObservation] = useState("");
  const [redeem, setRedeem] = useState(false);
  const [isRescuing, setIsRescuing] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<DeliveryLocation | null>(null);

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [rawMessage, setRawMessage] = useState("");
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleCopyOrderText() {
    navigator.clipboard.writeText(rawMessage);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2000);
  }

  function handleCopyPix() {
    if (!settings.pixKey) return;
    navigator.clipboard.writeText(settings.pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    let savedDistrictStr = "";
    try {
      const savedName = localStorage.getItem("insano.user.name");
      const savedPhone = localStorage.getItem("insano.user.phone");
      const savedStreet = localStorage.getItem("insano.user.street");
      const savedNumber = localStorage.getItem("insano.user.number");
      const savedDistrict = localStorage.getItem("insano.user.district");
      const savedRef = localStorage.getItem("insano.user.ref");
      
      if (savedName) setName(savedName);
      if (savedPhone) setPhone(savedPhone);
      if (savedStreet) setStreet(savedStreet);
      if (savedNumber) setNumber(savedNumber);
      if (savedDistrict) {
        setDistrict(savedDistrict);
        savedDistrictStr = savedDistrict;
      }
      if (savedRef) setRef(savedRef);
    } catch {}

    // Buscar campanha ativa no Supabase
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

    // Buscar locais e taxas de entrega dinâmicas
    async function fetchLocations() {
      try {
        if (!supabase) return;
        const { data, error } = await supabase
          .from("delivery_locations")
          .select("*")
          .order("name", { ascending: true });
        if (error) throw error;
        if (data) {
          setLocations(data);
          // Pré-selecionar se já tiver bairro salvo que corresponde a algum cadastrado
          if (savedDistrictStr) {
            const matched = data.find((d: any) => d.name === savedDistrictStr);
            if (matched) {
              setSelectedLocation(matched);
            } else {
              setDistrict("");
            }
          }
        }
      } catch (err) {
        console.error("Erro ao buscar locais de entrega:", err);
      }
    }

    fetchCampaign();
    fetchLocations();
  }, []);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const activeDeliveryFee = selectedLocation ? selectedLocation.fee : 0;
  const deliveryFee = delivery === "entrega" ? activeDeliveryFee : 0;

  const canRedeem = false; // Desativado sistema de fidelidade globalmente
  const cheapest = useMemo(() => (items.length ? Math.min(...items.map((i) => i.price)) : 0), [items]);

  const rewardProd = useMemo(() => {
    return settings.loyaltyRewardId ? products.find((p) => p.id === settings.loyaltyRewardId) : null;
  }, [settings.loyaltyRewardId, products]);

  const hasRewardInCart = useMemo(() => {
    return rewardProd ? items.some((i) => i.productId === rewardProd.id) : false;
  }, [rewardProd, items]);

  const discount = useMemo(() => {
    if (!redeem || !canRedeem) return 0;
    if (rewardProd) {
      return hasRewardInCart ? rewardProd.price : 0;
    }
    return cheapest;
  }, [redeem, canRedeem, rewardProd, hasRewardInCart, cheapest]);

  const total = Math.max(0, subtotal - discount) + deliveryFee;
  const willEarnPoint = false; // Desativado sistema de fidelidade globalmente
  const isCampaignEligible = activeCampaign && subtotal >= activeCampaign.min_value;

  function buildMessage() {
    const lines: string[] = [];
    if (redeem && canRedeem) {
      lines.push("🚨🚨 ATENÇÃO: PEDIDO COM RESGATE DE LANCHE GRÁTIS! O CARTÃO FIDELIDADE DESTE CLIENTE FOI ZERADO NO SISTEMA! 🚨🚨");
      lines.push("");
    }
    const storeHeaderName = tenant ? tenant.nome_da_loja.toUpperCase() : "INSANO LANCHES";
    const headerEmoji = isAcaiShop ? "🟣" : "🍔";
    lines.push(`${headerEmoji} *NOVO PEDIDO - ${storeHeaderName}* ${headerEmoji}`);
    lines.push("");
    lines.push(`*Cliente:* ${name}`);
    lines.push("");
    lines.push("🛒 *ITENS DO PEDIDO:*");
    items.forEach((i) => {
      lines.push(`• ${i.qty}x ${i.name} (${brl(i.price * i.qty)})`);
      const prod = products.find((p) => p.id === i.productId);
      if (prod && prod.category === "hamburgueres" && !isAcaiShop) {
        lines.push(`   _*(Acompanha mini batata e maionese especial)*_`);
      }
      if (i.lettuce) lines.push(`   - Opção: ${i.lettuce}`);
      if (typeof i.ketchup === "number" && i.ketchup > 0) lines.push(`   - Sachês de Ketchup: ${i.ketchup} unidades`);
      if (typeof i.mayo === "number" && i.mayo > 0) lines.push(`   - Potes de Maionese Verde: ${i.mayo} unidades`);
      if (i.toppings && i.toppings.length > 0) {
        i.toppings.forEach((top) => {
          lines.push(`   - ${top}`);
        });
      }
    });
    lines.push("");
    lines.push("📍 *DADOS DE ENTREGA:*");
    lines.push(`*Tipo:* ${delivery === "entrega" ? "Entrega" : "Retirada"}`);
    if (delivery === "entrega") {
      lines.push(`*Endereço:* ${street}, ${number} - ${district}`);
      if (ref) lines.push(`*Ref:* ${ref}`);
    }
    lines.push("");
    lines.push("💰 *PAGAMENTO:*");
    lines.push(`*Forma:* ${payment}${payment === "Dinheiro" && change ? ` (Troco para ${change})` : ""}`);
    if (payment === "Pix" && settings.pixKey) {
      lines.push(`*Chave PIX:* ${settings.pixKey}`);
      lines.push(`*Titular:* ${settings.pixName}`);
    }
    if (redeem && canRedeem) {
      if (rewardProd) {
        lines.push(`🎁 *PEDIDO DE RESGATE: GANHOU 1x ${rewardProd.name.toUpperCase()} DO CARTÃO FIDELIDADE!*`);
      } else {
        lines.push("🎁 *PEDIDO DE RESGATE: GANHOU 1 LANCHE GRÁTIS DO CARTÃO FIDELIDADE!*");
      }
    }
    if (deliveryFee > 0) {
      const regionName = selectedLocation ? ` (${selectedLocation.name})` : "";
      lines.push(`*Taxa de entrega${regionName}:* ${brl(deliveryFee)}`);
    }
    if (discount > 0) lines.push(`*Desconto fidelidade:* -${brl(discount)}`);
    lines.push("");
    lines.push(`*TOTAL GERAL: ${brl(total)}*`);

    if (observation.trim()) {
      lines.push("");
      lines.push("📝 *OBSERVAÇÕES DO PEDIDO:*");
      lines.push(`_${observation.trim()}_`);
    }

    if (isCampaignEligible) {
      lines.push("");
      lines.push("🎟️ *PARABÉNS! Você está participando do Sorteio da Semana! Seu nome e número foram registrados no sistema.*");
    }

    return lines.join("\n");
  }

  async function handleSend() {
    if (!settings.isOpen) {
      alert("A loja está fechada no momento.");
      return;
    }
    if (!name.trim()) return alert("Informe seu nome.");
    if (!phone.trim()) return alert("Informe seu telefone de contato.");
    if (delivery === "entrega") {
      if (!street.trim() || !number.trim() || !district.trim() || !selectedLocation) {
        return alert("Por favor, selecione seu Bairro para entrega.");
      }
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      localStorage.setItem("insano.user.name", name.trim());
      localStorage.setItem("insano.user.phone", phone.trim());
      if (delivery === "entrega") {
        localStorage.setItem("insano.user.street", street.trim());
        localStorage.setItem("insano.user.number", number.trim());
        localStorage.setItem("insano.user.district", district.trim());
        localStorage.setItem("insano.user.ref", ref.trim());
      }
    } catch {}

    // Salvar pedido no histórico geral para o Dashboard Financeiro
    if (supabase) {
      try {
        const itemsSummary = items.map(i => `${i.qty}x ${i.name}`).join(", ") + 
          (observation.trim() ? ` (Obs: ${observation.trim()})` : "");
        const { error } = await supabase.from("orders_history").insert({
          client_name: name.trim(),
          payment_method: payment,
          delivery_type: delivery === "entrega" ? "Entrega" : "Retirada",
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          total_price: total,
          is_fidelidade_resgate: !!(redeem && canRedeem),
          items_summary: itemsSummary
        });
        if (error) throw error;
      } catch (err) {
        console.error("Erro ao salvar histórico de pedidos no Supabase:", err);
      }
    }

    if (isCampaignEligible && supabase) {
      try {
        const { error } = await supabase.from("participants").insert({
          campaign_id: activeCampaign.id,
          client_name: name.trim(),
          client_phone: phone.trim(),
          order_total: total
        });
        if (error) throw error;
      } catch (err) {
        console.error("Erro ao registrar participante no Supabase:", err);
      }
    }
    
    if (redeem && canRedeem) {
      if (rewardProd && !hasRewardInCart) {
        alert(`Para resgatar seu prêmio, você precisa adicionar 1x ${rewardProd.name} na sua sacola!`);
        setIsSubmitting(false);
        return;
      }
      setIsRescuing(true);
      storage.resetLoyalty();
      
      const redeemedItem = rewardProd || items.reduce((prev, curr) => (prev.price < curr.price ? prev : curr), items[0]);
      storage.addRedemption({
        id: crypto.randomUUID(),
        date: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
        name: name.trim(),
        item: redeemedItem ? redeemedItem.name : "Lanche Grátis",
        phone: delivery === "entrega" ? `${street}, ${number}` : "Retirada",
      });

      setTimeout(() => {
        const message = buildMessage();
        const text = encodeURIComponent(message);
        const url = `https://api.whatsapp.com/send?phone=${settings.whatsapp}&text=${text}`;
        setRawMessage(message);
        setRedirectUrl(url);
        setIsRescuing(false);
        setIsRedirecting(true);
        
        try {
          window.location.href = url;
        } catch (err) {
          window.open(url, "_blank");
        }
      }, 2000);
      return;
    } else if (willEarnPoint) {
      storage.addLoyaltyPoint();
    }
    
    const message = buildMessage();
    const text = encodeURIComponent(message);
    const url = `https://api.whatsapp.com/send?phone=${settings.whatsapp}&text=${text}`;
    setRawMessage(message);
    setRedirectUrl(url);
    setIsRedirecting(true);
    
    try {
      window.location.href = url;
    } catch (err) {
      window.open(url, "_blank");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      {isRescuing && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-2xl font-extrabold text-primary">Prêmio resgatado com sucesso!</h2>
          <p className="text-white text-lg">Seu cartão foi reiniciado.<br/>Redirecionando para o WhatsApp...</p>
        </div>
      )}
      {isRedirecting && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center ring-2 ring-emerald-500/30 animate-pulse">
            <span className="text-4xl animate-bounce">📲</span>
          </div>
          
          <div className="space-y-2 max-w-sm">
            <h2 className="text-2xl font-black text-white">Enviando para o WhatsApp</h2>
            <p className="text-sm text-zinc-400">
              Estamos te redirecionando para enviar o seu pedido automaticamente no WhatsApp da lanchonete!
            </p>
          </div>

          <div className="w-full max-w-xs space-y-3 pt-2">
            <a 
              href={redirectUrl}
              onClick={(e) => {
                try {
                  window.location.href = redirectUrl;
                  e.preventDefault();
                } catch {}
              }}
              className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition active:scale-[0.98]"
            >
              <span>Abrir WhatsApp Novamente 📲</span>
            </a>

            <button 
              type="button"
              onClick={handleCopyOrderText}
              className="w-full h-11 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              {copiedOrder ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span>Mensagem Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Texto do Pedido</span>
                </>
              )}
            </button>

            <button 
              type="button"
              onClick={() => {
                onClear();
                onClose();
                setIsRedirecting(false);
                setIsSubmitting(false);
              }}
              className="w-full h-11 rounded-xl bg-zinc-950 border border-red-500/20 hover:bg-red-500/10 text-red-500 font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
            >
              <span>Concluir e Limpar Sacola 🛒</span>
            </button>
          </div>

          <div className="text-[10px] text-zinc-600 max-w-xs leading-relaxed pt-4 border-t border-zinc-900">
            💡 Dica: Se o WhatsApp não abrir sozinho, clique no botão verde ou use a opção de "Copiar Texto" e cole diretamente no chat do estabelecimento!
          </div>
        </div>
      )}
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl ring-1 ring-border max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-extrabold text-lg">Sua Sacola</h3>
          <button onClick={onClose} className="p-2 text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Sua sacola está vazia.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((i) => (
                <li key={i.id} className="p-3 rounded-xl bg-surface ring-1 ring-border">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{i.name}</p>
                      {i.lettuce && <p className="text-[11px] text-muted-foreground">• {i.lettuce}</p>}
                      {typeof i.ketchup === "number" && i.ketchup > 0 && (
                        <p className="text-[11px] text-muted-foreground">• +{i.ketchup} Ketchup</p>
                      )}
                      {typeof i.mayo === "number" && i.mayo > 0 && (
                        <p className="text-[11px] text-muted-foreground">• +{i.mayo} Maionese Verde</p>
                      )}
                      {i.toppings && i.toppings.length > 0 && (
                        <div className="mt-1 text-[11px] text-zinc-400 font-semibold space-y-0.5">
                          {i.toppings.map((top, idx) => (
                            <p key={idx}>• {top}</p>
                          ))}
                        </div>
                      )}
                      <p className="text-primary font-extrabold mt-1">{brl(i.price * i.qty)}</p>
                    </div>
                    <button onClick={() => onRemove(i.id)} className="text-muted-foreground p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => onUpdate(i.id, i.qty - 1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                    <span className="font-bold text-sm w-5 text-center">{i.qty}</span>
                    <button onClick={() => onUpdate(i.id, i.qty + 1)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 && (
            <>
              {willEarnPoint && (
                <div className="rounded-xl bg-success/15 text-success px-3 py-2 text-sm font-semibold">
                  🔥 Esse pedido vai te dar +1 carimbo no Cartão Fidelidade!
                </div>
              )}
              {canRedeem && (
                <label className="flex items-start gap-2 p-3 rounded-xl bg-primary/10 ring-1 ring-primary cursor-pointer">
                  <input type="checkbox" checked={redeem} onChange={(e) => setRedeem(e.target.checked)} className="mt-0.5 w-4 h-4 accent-primary" />
                  <span className="text-sm font-semibold">
                    🎁 Resgatar meu prêmio: {rewardProd ? `1x ${rewardProd.name} Grátis` : "1 Lanche Grátis (Zera o mais barato)"}
                  </span>
                </label>
              )}

              {isCampaignEligible && (
                <div className="rounded-xl bg-red-950/40 text-red-500 border border-red-500/30 p-3 text-sm font-semibold animate-pulse flex items-start gap-2">
                  {activeCampaign.image && (activeCampaign.image.startsWith("http") || activeCampaign.image.startsWith("/")) ? (
                    <img src={activeCampaign.image} className="w-10 h-10 object-cover rounded-lg shrink-0 ring-1 ring-red-500/30 mt-0.5" />
                  ) : (
                    <span className="text-xl shrink-0 mt-0.5">{activeCampaign.image || "🎉"}</span>
                  )}
                  <div>
                    <span className="font-extrabold text-white text-xs uppercase tracking-wider block mb-0.5">Campanha Ativa: {activeCampaign.title}</span>
                    <span className="text-xs text-zinc-300">Finalize este pedido para ganhar seu Número da Sorte e concorrer!</span>
                    {activeCampaign.ends_at && (
                      <span className="text-[10px] text-red-450 block font-black uppercase mt-1">
                        ⚡ Encerra em {new Date(activeCampaign.ends_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}!
                      </span>
                    )}
                  </div>
                </div>
              )}

              <section className="space-y-2">
                <h4 className="font-bold text-sm">Dados de entrega</h4>
                <Input placeholder="Nome" value={name} onChange={setName} />
                <Input placeholder="Telefone de contato (com DDD)" value={phone} onChange={setPhone} />
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setDelivery("entrega")} className={`h-10 rounded-xl text-sm font-semibold ring-1 ${delivery === "entrega" ? "bg-primary text-primary-foreground ring-primary" : "bg-surface ring-border text-muted-foreground"}`}>Entrega (+{brl(activeDeliveryFee)})</button>
                  <button onClick={() => setDelivery("retirada")} className={`h-10 rounded-xl text-sm font-semibold ring-1 ${delivery === "retirada" ? "bg-primary text-primary-foreground ring-primary" : "bg-surface ring-border text-muted-foreground"}`}>Retirada</button>
                </div>
                {delivery === "retirada" && settings.storeAddress && (
                  <div className="p-3 rounded-xl bg-surface ring-1 ring-border text-xs space-y-1 mt-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Endereço para Retirada:</span>
                      <p className="text-white font-bold">{settings.storeAddress}</p>
                    </div>
                  </div>
                )}
                {delivery === "entrega" && (
                  <>
                    <Input placeholder="Rua" value={street} onChange={setStreet} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Número" value={number} onChange={setNumber} />
                      <div className="relative">
                        <select
                          value={district}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDistrict(val);
                            const matched = locations.find((l) => l.name === val);
                            setSelectedLocation(matched || null);
                          }}
                          className="w-full h-11 px-3 rounded-xl bg-input text-foreground ring-1 ring-border focus:ring-primary outline-none text-sm appearance-none cursor-pointer pr-8"
                          required
                        >
                          <option value="" disabled>Bairro...</option>
                          {locations.map((loc) => (
                            <option key={loc.id} value={loc.name} className="bg-zinc-900 text-white">
                              {loc.name} (+{brl(loc.fee)})
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground text-xs">
                          ▼
                        </div>
                      </div>
                    </div>
                    <Input placeholder="Ponto de referência" value={ref} onChange={setRef} />
                  </>
                )}
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-sm">Observações do Pedido</h4>
                <textarea
                  placeholder="Ex: Sem cebola, tirar picles, bem passado, ponto da carne, sachês extras, etc."
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="w-full min-h-[70px] p-3 rounded-xl bg-surface ring-1 ring-border focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground/60 text-sm transition"
                />
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-sm">Forma de pagamento</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(["Pix", "Cartão", "Dinheiro"] as Payment[]).map((p) => (
                    <button key={p} onClick={() => setPayment(p)} className={`h-10 rounded-xl text-sm font-semibold ring-1 ${payment === p ? "bg-primary text-primary-foreground ring-primary" : "bg-surface ring-border text-muted-foreground"}`}>{p}</button>
                  ))}
                </div>
                {payment === "Dinheiro" && (
                  <Input placeholder="Troco para quanto?" value={change} onChange={setChange} />
                )}
                {payment === "Pix" && settings.pixKey && (
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm space-y-3 relative overflow-hidden shadow-inner">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Chave PIX (Copiar e Colar)</span>
                        <span className="font-extrabold text-white text-sm select-all tracking-tight break-all block pr-1">
                          {settings.pixKey}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition active:scale-95 shrink-0 shadow-md ${
                          copied 
                            ? "bg-emerald-500 text-black shadow-emerald-500/20" 
                            : "bg-primary text-primary-foreground hover:bg-primary/95 hover:shadow-primary/10"
                        }`}
                      >
                        {copied ? (
                          <Check className="w-5 h-5 stroke-[3]" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-800/60">
                      <span className="text-zinc-400">Titular da Conta</span>
                      <span className="font-bold text-zinc-200">{settings.pixName || "Insano Lanches"}</span>
                    </div>

                    {copied && (
                      <div className="absolute inset-x-0 bottom-0 bg-emerald-500/10 text-emerald-400 text-center py-1 text-[10px] font-bold tracking-wide uppercase border-t border-emerald-500/20 animate-pulse">
                        ✓ Chave copiada com sucesso!
                      </div>
                    )}
                  </div>
                )}
              </section>

              {!isAcaiShop && (
                <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-center">
                  <p className="text-xs font-semibold text-red-500">🍟 Todos os lanches acompanham mini porção de batata e maionese caseira!</p>
                </div>
              )}

              <section className="rounded-xl bg-surface ring-1 ring-border p-3 space-y-1 text-sm">
                <Row label="Subtotal" value={brl(subtotal)} />
                {discount > 0 && <Row label="Desconto fidelidade" value={`-${brl(discount)}`} success />}
                {deliveryFee > 0 && <Row label="Taxa de entrega" value={brl(deliveryFee)} />}
                <div className="h-px bg-border my-1" />
                <Row label="Total" value={brl(total)} bold />
              </section>

              <button
                onClick={handleSend}
                className="w-full h-14 rounded-2xl bg-success text-success-foreground font-extrabold text-base shadow-[0_6px_25px_oklch(0.68_0.18_145/0.4)] active:scale-[0.99]"
              >
                Enviar Pedido via WhatsApp
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 px-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground ring-1 ring-border focus:ring-primary outline-none text-sm"
    />
  );
}

function Row({ label, value, bold, success }: { label: string; value: string; bold?: boolean; success?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={success ? "text-success" : "text-muted-foreground"}>{label}</span>
      <span className={`${bold ? "font-extrabold text-primary text-base" : ""} ${success ? "text-success font-semibold" : ""}`}>{value}</span>
    </div>
  );
}
