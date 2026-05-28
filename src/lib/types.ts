export type Category = string;

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  available: boolean;
  customizable: boolean;
  hasLettuceOption?: boolean;
  hasKetchupOption?: boolean;
  hasMayoOption?: boolean;
  is_featured?: boolean;
  adicionais?: { nome: string; preco: number }[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
  lettuce?: "Alface Tradicional" | "Alface Americana";
  ketchup?: number;
  mayo?: number;
  adicionaisSelecionados?: { nome: string; preco: number }[];
}

export interface Settings {
  storeName: string;
  whatsapp: string;
  isOpen: boolean;
  loyaltyMinOrder: number;
  loyaltyGoal: number;
  loyaltyRewardId?: string;
  deliveryFee: number;
  pixKey: string;
  pixName: string;
  adminPassword?: string;
  isBlocked?: boolean;
  billingLink?: string;
  storeAddress?: string;
  loyaltyActive?: boolean;
  cobranca_automatica?: boolean;
}

export interface CustomerLoyalty {
  name: string;
  points: number;
}

export interface Redemption {
  id: string;
  date: string;
  name: string;
  item: string;
  phone?: string;
}

export interface Campaign {
  id: string;
  title: string;
  min_value: number;
  is_active: boolean;
  created_at?: string;
  ends_at?: string;
  image?: string;
}

export interface CampaignWinner {
  id: string; // The campaign ID
  campaign_title: string;
  winner_name: string;
  winner_phone: string;
  winner_order_total: number;
  drawn_at: string;
}

export interface Participant {
  id: string;
  campaign_id: string;
  client_name: string;
  client_phone: string;
  order_total: number;
  created_at?: string;
}

export interface OrderHistory {
  id: string;
  client_name: string;
  payment_method: "Pix" | "Cartão" | "Dinheiro";
  delivery_type: "Entrega" | "Retirada";
  subtotal: number;
  delivery_fee: number;
  total_price: number;
  is_fidelidade_resgate: boolean;
  items_summary?: string;
  created_at?: string;
}

export interface DeliveryLocation {
  id: string;
  name: string;
  fee: number;
  created_at?: string;
}

export interface Loja {
  id: string;
  user_id?: string | null;
  nome: string;
  slug: string;
  tipo: string;
  cor_tema: string;
  status_assinatura: 'pendente' | 'ativo';
  whatsapp?: string;
  endereco?: string;
  taxa_entrega: number;
  chave_pix?: string;
  titular_pix?: string;
  criado_em?: string;
  cobranca_automatica?: boolean;
}

