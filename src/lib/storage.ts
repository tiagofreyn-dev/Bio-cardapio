import type {
  Product,
  Settings,
  CustomerLoyalty,
  DeliveryLocation,
  GlobalAddon,
  Campaign,
  Participant,
  StoreDataJSON,
} from "./types";
import { supabase } from "./supabase";

const KEYS = {
  loyalty: "insano.loyalty.points",
  customers: "insano.loyalty.customers",
  settings: "insano.settings",
  products: "insano.products",
  deliveryLocations: "insano.delivery_locations",
  globalAddons: "insano.global_addons",
  campaigns: "insano.campaigns",
  participants: "insano.participants",
  redemptions: "insano.redemptions",
  campaignWinners: "insano.campaign.winners",
  activeTenant: "insano.tenant.activeId",
};

// Chaves que DEVEM ser isoladas por loja. Sem isso, abrir o admin da
// Loja A e depois o da Loja B no mesmo navegador mistura os dados
// (foi o bug: header mostrava "BrutusPub" mas os campos mostravam
// "Brasa 277", porque settings vinha do localStorage global).
// Fidelidade/resgates/clientes também são por loja: o mesmo celular pode
// ter 5 pontos na Brasa e 0 na Brutus.
const SCOPED_KEYS = new Set([
  KEYS.settings,
  KEYS.products,
  KEYS.deliveryLocations,
  KEYS.globalAddons,
  KEYS.campaigns,
  KEYS.loyalty,
  KEYS.customers,
  KEYS.participants,
  KEYS.redemptions,
  KEYS.campaignWinners,
]);

const SYNCABLE_KEYS = [
  KEYS.settings,
  KEYS.products,
  KEYS.deliveryLocations,
  KEYS.globalAddons,
  KEYS.campaigns,
  KEYS.redemptions,
  KEYS.customers,
  KEYS.campaignWinners,
];

const DEFAULT_SETTINGS: Settings = {
  storeName: "Insano Lanches",
  whatsapp: "5546999999999",
  isOpen: true,
  loyaltyMinOrder: 30,
  loyaltyGoal: 10,
  deliveryFee: 5,
  pixKey: "",
  pixName: "",
  adminPassword: "1234",
  storeAddress: "",
  logoUrl: "",
  bannerUrl: "",
  banners: [],
  coupons: [],
  deliveryTime: "30-60",
  // Promo desligada por padrão: loja ativa quando quiser, sem custo de leitura.
  promoActive: false,
  promoDiscountPct: 10,
  promoMinOrderFreeShipping: 100,
  promoDays: [2, 3],
};

const DEFAULT_PRODUCTS: Product[] = [];

export function getActiveLojaId(): string | null {
  if (typeof window === "undefined") return null;
  // Prioridade por ABA (sessionStorage): admin > cardápio > global.
  // Sem isso, 2 lojas abertas (2 abas ou admin + cardápio) se contaminam:
  // o localStorage é COMPARTILHADO entre abas, então a aba B sobrescrevia
  // o activeId e a aba A passava a ler/escrever no escopo da B
  // (banners da loja A aparecendo na B). Cada aba agora trava o seu escopo.
  // O cardápio público ainda limpa a chave admin (clearAdminScope) para
  // nunca herdar o escopo do admin na mesma aba.
  return (
    sessionStorage.getItem("insano.admin.lojaId") ||
    sessionStorage.getItem("insano.cardapio.lojaId") ||
    localStorage.getItem(KEYS.activeTenant)
  );
}

export function setActiveLojaId(lojaId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.activeTenant, lojaId);
}

/** Trava o escopo do CARDÁPIO PÚBLICO nesta aba (imune a outras abas). */
export function setCardapioLojaId(lojaId: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("insano.cardapio.lojaId", lojaId);
  } catch {}
  setActiveLojaId(lojaId);
}

/** Cardápio público nunca deve herdar o escopo do admin (mesma aba). */
export function clearAdminScope() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("insano.admin.lojaId");
  } catch {}
}

/** Logout do admin: limpa as travas da aba para não vazar para a próxima. */
export function clearTabScope() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("insano.admin.lojaId");
    sessionStorage.removeItem("insano.cardapio.lojaId");
  } catch {}
}

/** Retorna a chave real no localStorage, com sufixo por loja quando aplicável. */
function scopedKey(base: string, forcedLojaId?: string | null): string {
  if (!SCOPED_KEYS.has(base)) return base;
  const lojaId = forcedLojaId ?? getActiveLojaId();
  if (!lojaId) return base;
  return `${base}.${lojaId}`;
}

function read<T>(key: string, fallback: T, forcedLojaId?: string | null): T {
  if (typeof window === "undefined") return fallback;
  try {
    const realKey = scopedKey(key, forcedLojaId);
    const raw = localStorage.getItem(realKey);
    if (raw) return JSON.parse(raw) as T;
    // Sem migração de chaves globais legadas: copiar o global para o escopo
    // fazia loja NOVA herdar produtos/config de outra loja no mesmo navegador
    // (ex: cadastro novo abria com os lanches do BrutusPub).
    return fallback;
  } catch {
    return fallback;
  }
}

// Aggregates all syncable keys into the StoreDataJSON structure and saves to Supabase
// ULTRA-LEVE: debounce de 2s + coalescência. 50 edições rápidas = 1 upsert,
// não 50. Sem isso, cada tecla digitada no admin reescrevia o JSONB inteiro
// (100KB-1MB) e estourava o limite do Supabase.
let _syncTimer: ReturnType<typeof setTimeout> | null = null;
let _syncPendingLoja: string | null = null;
let _syncInFlight: Promise<void> | null = null;
const SYNC_DEBOUNCE_MS = 2000;

function scheduleSync(lojaId: string | null) {
  if (!lojaId || !supabase) return;
  _syncPendingLoja = lojaId;
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    _syncTimer = null;
    const target = _syncPendingLoja;
    _syncPendingLoja = null;
    if (target) void syncToCloud(target);
  }, SYNC_DEBOUNCE_MS);
}

/** Força o envio imediato e SÓ resolve depois que o banco confirmou.
 * Usado antes de recarregar o preview: sem o await, o iframe buscava
 * o dado velho e sobrescrevia o localStorage compartilhado (o destaque
 * "aparecia 1s e sumia"). */
export async function flushSync() {
  if (_syncTimer) {
    clearTimeout(_syncTimer);
    _syncTimer = null;
  }
  // Espera um upsert em andamento terminar primeiro.
  if (_syncInFlight) {
    try {
      await _syncInFlight;
    } catch {}
    // O voo anterior pode ter reagendado um pendente: traz para agora.
    if (_syncTimer) {
      clearTimeout(_syncTimer);
      _syncTimer = null;
    }
  }
  const target = _syncPendingLoja ?? getActiveLojaId();
  _syncPendingLoja = null;
  if (target) await syncToCloud(target);
}

/** O upsert real (lê o localStorage na hora, sempre fresco). */
async function doSync(lojaId: string) {
  if (!supabase) return;
  const storeData: StoreDataJSON = {
    settings: read<Settings>(KEYS.settings, DEFAULT_SETTINGS, lojaId),
    products: read<Product[]>(KEYS.products, DEFAULT_PRODUCTS, lojaId),
    delivery_locations: read<DeliveryLocation[]>(KEYS.deliveryLocations, [], lojaId),
    global_addons: read<GlobalAddon[]>(KEYS.globalAddons, [], lojaId),
    campaigns: read<Campaign[]>(KEYS.campaigns, [], lojaId),
  };

  try {
    await supabase.from("store_data").upsert(
      {
        loja_id: lojaId,
        data: storeData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "loja_id" },
    );
  } catch (err) {
    console.warn("Erro ao sincronizar com o Supabase:", err);
  }
}

async function syncToCloud(forcedLojaId?: string | null) {
  if (!supabase) return;
  const lojaId = forcedLojaId ?? getActiveLojaId();
  if (!lojaId) return;
  // Evita upserts concorrentes (write durante write = 2x egress):
  // só agenda; o flushSync executa o pendente na hora quando preciso.
  if (_syncInFlight) {
    scheduleSync(lojaId);
    return;
  }
  _syncInFlight = doSync(lojaId).finally(() => {
    _syncInFlight = null;
    // Se chegou escrita durante o voo, agenda uma última sincronização.
    if (_syncPendingLoja) {
      const pending = _syncPendingLoja;
      _syncPendingLoja = null;
      scheduleSync(pending);
    }
  });
  await _syncInFlight;
}

function write<T>(key: string, value: T, skipCloudSync = false) {
  if (typeof window === "undefined") return;
  // Captura o lojaId ANTES de escrever: evita que o iframe de preview
  // ou outra aba troque o activeId no meio do caminho e o sync vá para a loja errada.
  const lojaId = getActiveLojaId();
  const realKey = scopedKey(key, lojaId);
  localStorage.setItem(realKey, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("insano-storage"));
  if (!skipCloudSync && SYNCABLE_KEYS.includes(key)) {
    // ULTRA-LEVE: agenda em vez de disparar na hora.
    scheduleSync(lojaId);
  }
}

export const storage = {
  // ── Fidelidade: 1 cartão por TELEFONE (não mais 1 por aparelho).
  // Chaves fora de SYNCABLE_KEYS: nunca sobem pra nuvem (dado do cliente).
  // Legado (sem telefone) continua lido para migração automática.
  getLoyaltyPhone: (): string => {
    const lojaId = getActiveLojaId();
    return read<string>(`insano.loyalty.phone.${lojaId || "global"}`, "");
  },
  setLoyaltyPhone: (digits: string) => {
    const lojaId = getActiveLojaId();
    write(`insano.loyalty.phone.${lojaId || "global"}`, (digits || "").replace(/\D/g, "").slice(0, 15), true);
  },
  getLoyaltyPoints: (phone?: string) => {
    const lojaId = getActiveLojaId();
    const digits = (phone ?? "").replace(/\D/g, "");
    const key = digits
      ? `insano.loyalty.points.${lojaId || "global"}.${digits}`
      : `insano.loyalty.points.${lojaId || "global"}`;
    return read<number>(key, 0);
  },
  setLoyaltyPoints: (n: number, phone?: string) => {
    const lojaId = getActiveLojaId();
    const digits = (phone ?? "").replace(/\D/g, "");
    const key = digits
      ? `insano.loyalty.points.${lojaId || "global"}.${digits}`
      : `insano.loyalty.points.${lojaId || "global"}`;
    return write(key, Math.max(0, n), true);
  },
  addLoyaltyPoint: (phone?: string) =>
    write(
      (() => {
        const lojaId = getActiveLojaId();
        const digits = (phone ?? "").replace(/\D/g, "");
        return digits
          ? `insano.loyalty.points.${lojaId || "global"}.${digits}`
          : `insano.loyalty.points.${lojaId || "global"}`;
      })(),
      storage.getLoyaltyPoints(phone) + 1,
      true,
    ),
  resetLoyalty: (phone?: string) => storage.setLoyaltyPoints(0, phone),
  // Move o saldo anônimo antigo para o cartão do telefone (1ª vinculação).
  migrateLegacyLoyalty: (phone: string): boolean => {
    const digits = (phone || "").replace(/\D/g, "");
    if (!digits) return false;
    const legacy = storage.getLoyaltyPoints();
    if (legacy <= 0 || storage.getLoyaltyPoints(digits) > 0) return false;
    storage.setLoyaltyPoints(legacy, digits);
    storage.setLoyaltyPoints(0);
    return true;
  },
  // Cooldown anti-fraude (1h) por telefone; respeita o legado do aparelho.
  loyaltyCooldownAt: (phone?: string): number => {
    if (typeof window === "undefined") return 0;
    const lojaId = getActiveLojaId();
    const digits = (phone ?? "").replace(/\D/g, "");
    try {
      const specific = Number(
        localStorage.getItem(
          digits
            ? `insano.loyalty.lastOrderAt.${lojaId}.${digits}`
            : `insano.loyalty.lastOrderAt.${lojaId}`,
        ) || 0,
      );
      const legacy = Number(localStorage.getItem(`insano.loyalty.lastOrderAt.${lojaId}`) || 0);
      return Math.max(specific, legacy);
    } catch {
      return 0;
    }
  },
  markLoyaltyOrder: (phone?: string) => {
    if (typeof window === "undefined") return;
    const lojaId = getActiveLojaId();
    const digits = (phone ?? "").replace(/\D/g, "");
    try {
      const key = digits
        ? `insano.loyalty.lastOrderAt.${lojaId}.${digits}`
        : `insano.loyalty.lastOrderAt.${lojaId}`;
      localStorage.setItem(key, Date.now().toString());
      window.dispatchEvent(new CustomEvent("insano-storage"));
    } catch {}
  },

  getCustomers: () => read<CustomerLoyalty[]>(KEYS.customers, []),
  setCustomers: (c: CustomerLoyalty[]) => write(KEYS.customers, c),

  getSettings: (): Settings => ({
    ...DEFAULT_SETTINGS,
    ...read<Partial<Settings>>(KEYS.settings, {}),
  }),
  setSettings: (s: Settings) => write(KEYS.settings, s),

  getProducts: (): Product[] => read<Product[]>(KEYS.products, DEFAULT_PRODUCTS),
  setProducts: (p: Product[]) => write(KEYS.products, p),

  getDeliveryLocations: (): DeliveryLocation[] =>
    read<DeliveryLocation[]>(KEYS.deliveryLocations, []),
  setDeliveryLocations: (dl: DeliveryLocation[]) => write(KEYS.deliveryLocations, dl),

  getGlobalAddons: (): GlobalAddon[] => read<GlobalAddon[]>(KEYS.globalAddons, []),
  setGlobalAddons: (ga: GlobalAddon[]) => write(KEYS.globalAddons, ga),

  getCampaigns: (): Campaign[] => read<Campaign[]>(KEYS.campaigns, []),
  setCampaigns: (c: Campaign[]) => write(KEYS.campaigns, c),

  getParticipants: (): Participant[] => read<Participant[]>(KEYS.participants, []),
  setParticipants: (p: Participant[]) => write(KEYS.participants, p),

  getRedemptions: () => read<import("./types").Redemption[]>(KEYS.redemptions, []),
  addRedemption: (r: import("./types").Redemption) => {
    const list = storage.getRedemptions();
    write(KEYS.redemptions, [r, ...list]);
  },

  getCampaignWinners: () => read<import("./types").CampaignWinner[]>(KEYS.campaignWinners, []),
  addCampaignWinner: (w: import("./types").CampaignWinner) => {
    const list = storage.getCampaignWinners();
    write(KEYS.campaignWinners, [w, ...list]);
  },

  syncFromCloud: async () => {
    if (!supabase) return;
    const lojaId = getActiveLojaId();
    if (!lojaId) return;

    try {
      const { data, error } = await supabase
        .from("store_data")
        .select("data")
        .eq("loja_id", lojaId)
        .maybeSingle();
      if (error) throw error;

      if (data && data.data) {
        const storeData = data.data as StoreDataJSON;
        let changed = false;

        const syncKey = (key: string, value: any) => {
          const realKey = scopedKey(key, lojaId);
          const localVal = localStorage.getItem(realKey);
          const cloudValStr = JSON.stringify(value ?? []);
          if (localVal !== cloudValStr) {
            localStorage.setItem(realKey, cloudValStr);
            changed = true;
          }
        };

        syncKey(KEYS.settings, storeData.settings);
        syncKey(KEYS.products, storeData.products);
        syncKey(KEYS.deliveryLocations, storeData.delivery_locations);
        syncKey(KEYS.globalAddons, storeData.global_addons);
        syncKey(KEYS.campaigns, storeData.campaigns);

        if (changed) {
          window.dispatchEvent(new CustomEvent("insano-storage"));
        }
      } else {
        // Banco vazio para esta loja, subir dados padrão locais
        await syncToCloud(lojaId);
      }
    } catch (err) {
      console.warn("Erro ao buscar dados do Supabase:", err);
    }
  },
};

export function useStorageVersion() {
  return KEYS;
}

/**
 * Inicializa uma loja NOVA com estado limpo: zera o escopo local, trava o
 * activeId e cria a linha `store_data` vazia no banco. Sem isso, a loja nova
 * herdava produtos/config de outra loja que usou o mesmo navegador
 * (ex: cadastro novo abria com os lanches do BrutusPub) e o primeiro
 * salvamento gravava essa cópia na linha da loja nova.
 */
export async function initCleanStore(lojaId: string, partial?: Partial<Settings>) {
  const settings: Settings = { ...DEFAULT_SETTINGS, ...partial };
  const clean: StoreDataJSON = {
    settings,
    products: [],
    delivery_locations: [],
    global_addons: [],
    campaigns: [],
  };
  if (typeof window !== "undefined") {
    setActiveLojaId(lojaId);
    try {
      sessionStorage.setItem("insano.admin.lojaId", lojaId);
    } catch {}
    localStorage.setItem(`${KEYS.settings}.${lojaId}`, JSON.stringify(clean.settings));
    localStorage.setItem(`${KEYS.products}.${lojaId}`, JSON.stringify(clean.products));
    localStorage.setItem(
      `${KEYS.deliveryLocations}.${lojaId}`,
      JSON.stringify(clean.delivery_locations),
    );
    localStorage.setItem(`${KEYS.globalAddons}.${lojaId}`, JSON.stringify(clean.global_addons));
    localStorage.setItem(`${KEYS.campaigns}.${lojaId}`, JSON.stringify(clean.campaigns));
    window.dispatchEvent(new CustomEvent("insano-storage"));
  }
  if (supabase) {
    const { error } = await supabase
      .from("store_data")
      .upsert(
        { loja_id: lojaId, data: clean, updated_at: new Date().toISOString() },
        { onConflict: "loja_id" },
      );
    if (error) console.warn("Erro ao inicializar store_data da loja nova:", error.message);
  }
}
