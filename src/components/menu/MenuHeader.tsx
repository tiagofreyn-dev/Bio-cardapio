import logo from "@/assets/logo-insano.jpg";
import { storage } from "@/lib/storage";
import { useStorageSync } from "@/hooks/use-storage";
import { Link } from "@tanstack/react-router";
import { Settings as SettingsIcon, MapPin } from "lucide-react";
import { useTenant } from "@/lib/tenant";

export function MenuHeader() {
  const settings = useStorageSync(() => storage.getSettings());
  const { tenant } = useTenant();

  const storeName = tenant ? tenant.nome_da_loja : settings.storeName;
  const logoUrl = tenant && tenant.logo_url ? tenant.logo_url : logo;
  const storeAddress = tenant && tenant.endereco ? tenant.endereco : settings.storeAddress;

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img src={logoUrl} alt={storeName} className="w-12 h-12 rounded-full ring-2 ring-primary/50 object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-extrabold tracking-tight truncate" translate="no">{storeName}</h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${settings.isOpen ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${settings.isOpen ? "bg-success animate-pulse" : "bg-destructive"}`} />
                {settings.isOpen ? "Aberto agora" : "Fechado"}
              </span>
              <span className="text-[11px] text-muted-foreground">Entrega 30-60 min</span>
              {storeAddress && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground max-w-full">
                  <span className="text-muted-foreground/30">•</span>
                  <MapPin className="w-3 h-3 text-primary shrink-0" />
                  <span className="truncate">{storeAddress}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <Link
          to="/login"
          className="p-2 text-muted-foreground hover:text-primary transition duration-300 rounded-xl bg-surface-elevated/50 hover:bg-zinc-800 ring-1 ring-border"
          title="Acesso Lojista"
        >
          <SettingsIcon className="w-4.5 h-4.5" />
        </Link>
      </div>
    </header>
  );
}
