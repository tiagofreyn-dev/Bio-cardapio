export type Category = string;

export interface GlobalAddon {
  id: string;
  name: string;
  price: number;
}

export interface ChoiceOption {
  id: string;
  name: string;
  price: number;
  description?: string;
  section?: string;
}

export interface ChoiceGroup {
  id: string;
  name: string;
  options: ChoiceOption[];
}

export interface ProductChoiceGroup {
  template_id: string;
  min_choices: number;
  max_choices: number;
  pricing_logic: "sum" | "highest" | "average";
}

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
  is_lancamento?: boolean;
  // Estoque por produto (genérico p/ qualquer segmento).
  // null/undefined = ilimitado (não controla). 0 = esgotado.
  stock?: number | null;
  lowStockThreshold?: number;
  max_sabores?: number;
  adicionais?: { nome: string; preco: number; descricao?: string }[];
  choice_groups?: ProductChoiceGroup[];
  allowed_addons?: string[]; // IDs of GlobalAddons allowed for this product
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
  adicionaisSelecionados?: { nome: string; preco: number; descricao?: string }[];
  selectedChoices?: {
    groupId: string;
    groupName: string;
    optionId: string;
    optionName: string;
    price: number;
  }[];
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
  categoryOrder?: string[];
  categoryEmojis?: Record<string, string>;
  logoUrl?: string;
  deliveryTime?: string;
  // Bannerão de destaque do cardápio (foto enviada pelo dono no admin,
  // comprimida em webp). Vai no topo da página pública, abaixo do cabeçalho.
  bannerUrl?: string;
  // Carrossel de banners (até 5 fotos de pratos/doces). Troca sozinho a cada
  // ~4s no cardápio. bannerUrl antigo vira banners[0] automaticamente.
  banners?: string[];
  // Cupons de desconto da loja — ficam dentro do store_data JSON (zero reads
  // extras na página pública). used/qty controlam estoque; 1 uso por telefone
  // é travado na tabela coupon_uses (1 select minúsculo só ao aplicar cupom).
  coupons?: Coupon[];
  choiceGroupTemplates?: ChoiceGroup[];
  acceptsPix?: boolean;
  acceptsCard?: boolean;
  acceptsCash?: boolean;
  // Motor de promoções por loja (tudo dentro do store_data JSON — zero reads extras).
  // promoDays: 0=Dom..6=Sab. Desconto % só na 1ª compra em dia promo;
  // frete grátis p/ clientes recorrentes acima do mínimo em dia promo.
  promoActive?: boolean;
  promoDiscountPct?: number;
  promoMinOrderFreeShipping?: number;
  promoDays?: number[];
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

export interface Coupon {
  code: string;
  label: string;
  pct: number;
  qty: number;
  used: number;
  active: boolean;
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
  status_assinatura: "pendente" | "ativo" | "bloqueado";
  whatsapp?: string;
  endereco?: string;
  taxa_entrega: number;
  chave_pix?: string;
  titular_pix?: string;
  criado_em?: string;
  cobranca_automatica?: boolean;
}

export interface StoreDataJSON {
  settings: Settings;
  products: Product[];
  delivery_locations: DeliveryLocation[];
  global_addons: GlobalAddon[];
  campaigns: Campaign[];
}
