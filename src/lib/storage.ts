import type { Product, Settings, CustomerLoyalty } from "./types";
import { supabase } from "./supabase";

const KEYS = {
  loyalty: "insano.loyalty.points",
  customers: "insano.loyalty.customers",
  settings: "insano.settings",
  products: "insano.products",
  redemptions: "insano.redemptions",
  campaignWinners: "insano.campaign.winners",
};

const SYNCABLE_KEYS = [KEYS.settings, KEYS.products, KEYS.redemptions, KEYS.customers, KEYS.campaignWinners];

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
  mayoPrice: 2,
  storeAddress: "",
};

const DEFAULT_PRODUCTS: Product[] = [
  { id: "p1", name: "X-Insano Duplo", description: "2 burgers 150g, cheddar, bacon, cebola caramelizada", price: 38.9, image: "🍔", category: "hamburgueres", available: true, customizable: true },
  { id: "p2", name: "X-Bacon Smash", description: "Burger smash, muito bacon, cheddar e maionese da casa", price: 32.5, image: "🥓", category: "hamburgueres", available: true, customizable: true },
  { id: "p3", name: "X-Salada Clássico", description: "Burger 150g, queijo, alface, tomate e molho especial", price: 28.0, image: "🍔", category: "hamburgueres", available: true, customizable: true },
  { id: "p4", name: "Insano Monster", description: "3 burgers, triplo cheddar, bacon, onion rings, costela", price: 54.9, image: "👹", category: "hamburgueres", available: true, customizable: true },
  { id: "p5", name: "Batata Frita Grande", description: "Porção generosa crocante por fora, macia por dentro", price: 22.0, image: "🍟", category: "porcoes", available: true, customizable: false },
  { id: "p6", name: "Batata c/ Cheddar e Bacon", description: "Batata coberta com cheddar cremoso e bacon", price: 32.0, image: "🧀", category: "porcoes", available: true, customizable: false },
  { id: "p7", name: "Onion Rings", description: "Anéis de cebola empanados crocantes", price: 24.0, image: "🧅", category: "porcoes", available: true, customizable: false },
  { id: "p8", name: "Coca-Cola Lata 350ml", description: "Gelada", price: 7.0, image: "🥤", category: "bebidas", available: true, customizable: false },
  { id: "p9", name: "Guaraná Lata 350ml", description: "Gelado", price: 6.5, image: "🥤", category: "bebidas", available: true, customizable: false },
  { id: "p10", name: "Suco Natural Laranja", description: "500ml natural", price: 10.0, image: "🍊", category: "bebidas", available: true, customizable: false },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function syncToCloud(key: string, value: any) {
  if (!supabase || !SYNCABLE_KEYS.includes(key)) return;
  try {
    await supabase.from("store_data").upsert({ key, value, updated_at: new Date().toISOString() });
  } catch (err) {
    console.warn("Erro ao sincronizar com o Supabase:", err);
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("insano-storage"));
  syncToCloud(key, value);
}

export const storage = {
  getLoyaltyPoints: () => read<number>(KEYS.loyalty, 0),
  setLoyaltyPoints: (n: number) => write(KEYS.loyalty, Math.max(0, n)),
  addLoyaltyPoint: () => write(KEYS.loyalty, storage.getLoyaltyPoints() + 1),
  resetLoyalty: () => write(KEYS.loyalty, 0),

  getCustomers: () => read<CustomerLoyalty[]>(KEYS.customers, []),
  setCustomers: (c: CustomerLoyalty[]) => write(KEYS.customers, c),

  getSettings: (): Settings => ({ ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEYS.settings, {}) }),
  setSettings: (s: Settings) => write(KEYS.settings, s),

  getProducts: (): Product[] => read<Product[]>(KEYS.products, DEFAULT_PRODUCTS),
  setProducts: (p: Product[]) => write(KEYS.products, p),

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
    try {
      const { data, error } = await supabase.from("store_data").select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        let changed = false;
        for (const row of data) {
          if (SYNCABLE_KEYS.includes(row.key)) {
            const localVal = localStorage.getItem(row.key);
            const cloudValStr = JSON.stringify(row.value);
            if (localVal !== cloudValStr) {
              localStorage.setItem(row.key, cloudValStr);
              changed = true;
            }
          }
        }
        if (changed) {
          window.dispatchEvent(new CustomEvent("insano-storage"));
        }
      } else if (data && data.length === 0) {
        // O banco de dados em nuvem está vazio! Vamos subir os dados locais do administrador!
        for (const key of SYNCABLE_KEYS) {
          const localVal = localStorage.getItem(key);
          if (localVal) {
            await syncToCloud(key, JSON.parse(localVal));
          }
        }
      }
    } catch (err) {
      console.warn("Erro ao buscar dados do Supabase:", err);
    }
  },
};

export function useStorageVersion() {
  // returns a hook helper
  return KEYS;
}
