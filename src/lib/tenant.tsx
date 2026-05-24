import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface LojaProfile {
  id: string;
  user_id: string;
  nome_da_loja: string;
  slug: string;
  logo_url: string | null;
  cor_principal: string;
  banner_url: string | null;
  efeito_ativo: string;
  whatsapp: string | null;
  endereco: string | null;
  created_at: string;
}

interface TenantContextProps {
  tenant: LojaProfile | null;
  isLoading: boolean;
  isDefault: boolean;
  refreshTenant: () => Promise<void>;
  logoutTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextProps | undefined>(undefined);

interface StoreAesthetics {
  cor_principal: string;
  logo_url: string | null;
  banner_url: string | null;
  efeito_ativo: string;
}

const STORE_AESTHETICS_MAP: Record<string, StoreAesthetics> = {
  "acai-do-carlos": {
    cor_principal: "#5c246b", // Roxo Açaí Premium
    logo_url: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=300&h=300&fit=crop", // Foto Premium de Açaí
    banner_url: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=1000&h=500&fit=crop", // Banner lindo de açaí
    efeito_ativo: "queda-neve", // Queda de partículas
  },
  "acai-tropical": {
    cor_principal: "#5c246b", // Roxo Açaí Premium
    logo_url: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=300&h=300&fit=crop", // Foto Premium de Açaí
    banner_url: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=1000&h=500&fit=crop", // Banner lindo de açaí
    efeito_ativo: "queda-neve", // Queda de partículas
  },
  "lanches-baiano": {
    cor_principal: "#F59E0B", // Amarelo/Dourado Laranja
    logo_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop", // Hambúrguer premium
    banner_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1000&h=500&fit=crop", // Banner lanchonete
    efeito_ativo: "neon", // Brilhos neon
  },
};

const DEFAULT_AESTHETICS: StoreAesthetics = {
  cor_principal: "#EF4444", // Vermelho original
  logo_url: null,
  banner_url: null,
  efeito_ativo: "nenhum",
};

function resolveAesthetics(slug: string): StoreAesthetics {
  const cleanSlug = slug.toLowerCase().trim();
  return STORE_AESTHETICS_MAP[cleanSlug] || DEFAULT_AESTHETICS;
}

const DEFAULT_TENANT: LojaProfile = {
  id: "default-loja",
  user_id: "",
  nome_da_loja: "Insano Lanches",
  slug: "insano-lanches",
  logo_url: null,
  cor_principal: "#EF4444", 
  banner_url: null,
  efeito_ativo: "nenhum",
  whatsapp: "5546999999999",
  endereco: "",
  created_at: new Date().toISOString(),
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<LojaProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDefault, setIsDefault] = useState(false);

  async function loadTenant() {
    setIsLoading(true);
    try {
      let slug = "";
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        slug = params.get("loja") || "";
      }

      if (supabase) {
        const withTimeout = <T,>(promise: Promise<T>): Promise<T> => {
          const timeout = new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout de rede no Supabase")), 2500)
          );
          return Promise.race([promise, timeout]);
        };

        // 1. Caso haja slug na URL ?loja=slug, busca pela loja correspondente
        if (slug) {
          const { data, error } = await withTimeout(
            supabase
              .from("lojas")
              .select("*")
              .eq("slug", slug.toLowerCase().trim())
              .maybeSingle()
          );

          if (!error && data) {
            const aesthetics = resolveAesthetics(data.slug);
            const enrichedData: LojaProfile = {
              ...data,
              cor_principal: aesthetics.cor_principal,
              logo_url: aesthetics.logo_url,
              banner_url: aesthetics.banner_url,
              efeito_ativo: aesthetics.efeito_ativo,
            };
            setTenant(enrichedData);
            setIsDefault(false);
            applyTheme(enrichedData);
            setIsLoading(false);
            return;
          }
        }

        // 2. Caso contrário, verifica se o usuário está logado e busca sua loja vinculada
        const authRes = await withTimeout(supabase.auth.getUser());
        const user = authRes?.data?.user;
        
        if (user) {
          const { data, error } = await withTimeout(
            supabase
              .from("lojas")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle()
          );

          if (!error && data) {
            const aesthetics = resolveAesthetics(data.slug);
            const enrichedData: LojaProfile = {
              ...data,
              cor_principal: aesthetics.cor_principal,
              logo_url: aesthetics.logo_url,
              banner_url: aesthetics.banner_url,
              efeito_ativo: aesthetics.efeito_ativo,
            };
            setTenant(enrichedData);
            setIsDefault(false);
            applyTheme(enrichedData);
            setIsLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      console.warn("Erro ao buscar dados do tenant no Supabase:", err);
    }

    // 3. Fallback para loja padrão (Insano Lanches) caso nada seja encontrado
    setTenant(DEFAULT_TENANT);
    setIsDefault(true);
    applyTheme(DEFAULT_TENANT);
    setIsLoading(false);
  }

  function applyTheme(profile: LojaProfile) {
    if (typeof document === "undefined") return;

    const isAcai = profile.slug.includes("acai");

    // Aplica a cor principal dinamicamente no CSS do elemento raiz (:root)
    const color = profile.cor_principal || "#EF4444";
    document.documentElement.style.setProperty("--primary", color);

    if (isAcai) {
      // Verde Limão Tropical para detalhes, anéis, focos
      document.documentElement.style.setProperty("--accent", "#8CD867");
      document.documentElement.style.setProperty("--ring", "#8CD867");
      // Amarelo para os preços
      document.documentElement.style.setProperty("--price-color", "#F59E0B");

      // Menu limpo com degradê suave imersivo que destaca roxo e verde
      document.body.style.background = "radial-gradient(circle at top right, #3c0c4a 0%, #0d0114 65%, #071a07 100%)";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.minHeight = "100vh";
    } else {
      document.documentElement.style.setProperty("--accent", color);
      document.documentElement.style.setProperty("--ring", color);
      document.documentElement.style.setProperty("--price-color", color);
      document.body.style.background = "";
      document.body.style.backgroundAttachment = "";
    }

    // Altera o título da página no navegador de forma bonita
    document.title = `${profile.nome_da_loja} — Cardápio Digital`;
  }

  async function logoutTenant() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    // Remove query string ao deslogar se for a própria loja
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("loja");
      window.history.replaceState({}, "", url.toString());
    }
    await loadTenant();
  }

  useEffect(() => {
    loadTenant();

    if (supabase) {
      // Ouve mudanças de estado de autenticação para recarregar o perfil correto
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        loadTenant();
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  return (
    <TenantContext.Provider
      value={{
        tenant,
        isLoading,
        isDefault,
        refreshTenant: loadTenant,
        logoutTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant deve ser utilizado dentro de um TenantProvider");
  }
  return context;
};
