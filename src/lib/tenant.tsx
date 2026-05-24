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

const DEFAULT_TENANT: LojaProfile = {
  id: "default-loja",
  user_id: "",
  nome_da_loja: "Insano Lanches",
  slug: "insano-lanches",
  logo_url: null,
  cor_principal: "#EF4444", // Vermelho original
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
            setTenant(data);
            setIsDefault(false);
            applyTheme(data);
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
            setTenant(data);
            setIsDefault(false);
            applyTheme(data);
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

    // Aplica a cor principal dinamicamente no CSS do elemento raiz (:root)
    const color = profile.cor_principal || "#EF4444";
    document.documentElement.style.setProperty("--primary", color);
    document.documentElement.style.setProperty("--accent", color);
    document.documentElement.style.setProperty("--ring", color);

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
