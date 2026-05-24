import type { Product, Settings, CustomerLoyalty, ToppingCategory } from "./types";
import { supabase } from "./supabase";

const KEYS = {
  loyalty: "insano.loyalty.points",
  customers: "insano.loyalty.customers",
  settings: "insano.settings",
  products: "insano.products",
  redemptions: "insano.redemptions",
  campaignWinners: "insano.campaign.winners",
  toppings: "insano.toppings",
};

const SYNCABLE_KEYS = [KEYS.settings, KEYS.products, KEYS.redemptions, KEYS.customers, KEYS.campaignWinners, KEYS.toppings];

export const DEFAULT_TOPPINGS: ToppingCategory[] = [
  {
    category: "Frutas",
    icon: "🍓",
    items: [
      { name: "Banana", price: 3.00 },
      { name: "Maçã", price: 3.00 },
      { name: "Morango", price: 4.80 },
      { name: "Kiwi", price: 5.80 },
      { name: "Abacaxi", price: 4.00 },
      { name: "Manga", price: 3.50 }
    ]
  },
  {
    category: "Derivados do Leite",
    icon: "🥛",
    items: [
      { name: "Leite Condensado", price: 3.80 },
      { name: "Leite em Pó", price: 3.80 }
    ]
  },
  {
    category: "Diversos & Cereais",
    icon: "🥣",
    items: [
      { name: "Amendoim", price: 3.00 },
      { name: "Paçoca", price: 3.00 },
      { name: "Coco Ralado", price: 3.00 },
      { name: "Óreo", price: 3.00 },
      { name: "Granola", price: 3.50 },
      { name: "Sucrilhos", price: 3.50 }
    ]
  },
  {
    category: "Chocolates",
    icon: "🍫",
    items: [
      { name: "Bis Branco", price: 2.90 },
      { name: "Bis Preto", price: 2.80 },
      { name: "Ouro Branco", price: 3.50 },
      { name: "Sonho de Valsa", price: 3.50 },
      { name: "Kit Kat", price: 4.50 },
      { name: "Granulado", price: 3.80 },
      { name: "Raspa de Chocolate", price: 3.80 },
      { name: "Laka", price: 3.80 },
      { name: "Chocoball", price: 3.80 },
      { name: "Nutella", price: 6.00 },
      { name: "Ovomaltine", price: 4.00 },
      { name: "Confete", price: 4.00 }
    ]
  },
  {
    category: "Coberturas",
    icon: "🍯",
    items: [
      { name: "Cobertura de Chocolate", price: 2.80 },
      { name: "Cobertura de Morango", price: 2.80 },
      { name: "Cobertura de Limão", price: 2.80 }
    ]
  },
  {
    category: "Mousses",
    icon: "🍧",
    items: [
      { name: "Mousse de Maracujá", price: 4.80 },
      { name: "Mousse de Morango", price: 4.80 }
    ]
  },
  {
    category: "Cremes",
    icon: "🍦",
    items: [
      { name: "Creme de Ninho", price: 6.00 },
      { name: "Creme de Laka Branco", price: 6.00 },
      { name: "Creme de Trufas", price: 6.00 },
      { name: "Creme de Kinder Bueno", price: 6.00 },
      { name: "Creme de Coco", price: 6.00 },
      { name: "Creme de Prestígio", price: 6.00 },
      { name: "Creme de Ferrero Rocher", price: 8.90 }
    ]
  }
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

  getToppings: (): ToppingCategory[] => read<ToppingCategory[]>(KEYS.toppings, DEFAULT_TOPPINGS),
  setToppings: (t: ToppingCategory[]) => write(KEYS.toppings, t),
  resetToppings: () => write(KEYS.toppings, DEFAULT_TOPPINGS),

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
