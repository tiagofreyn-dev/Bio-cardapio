import logo from "@/assets/logo-insano.jpg";
import { storage } from "@/lib/storage";
import { useStorageSync } from "@/hooks/use-storage";
import { Link } from "@tanstack/react-router";
import { Settings as SettingsIcon, MapPin } from "lucide-react";

export function MenuHeader({ 
  storeName: propStoreName, 
  isLegacy: propIsLegacy 
}: { 
  storeName?: string; 
  isLegacy?: boolean; 
}) {
  const settings = useStorageSync(() => storage.getSettings());

  const activeId = typeof window !== "undefined" ? localStorage.getItem("insano.tenant.activeId") : null;
  const isLegacy = propIsLegacy !== undefined 
    ? propIsLegacy 
    : (!activeId || activeId === "d3b07384-d113-4ec5-a55d-e0c157855d01");

  const displayName = propStoreName || settings.storeName;

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex items-center gap-3 px-4 py-3">
        {isLegacy ? (
          <img src={logo} alt="Insano Lanches" className="w-12 h-12 rounded-full ring-2 ring-primary/50 object-cover shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-black text-sm flex items-center justify-center ring-2 ring-primary/50 shrink-0 select-none shadow-md">
            {displayName
              ? displayName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "🏪"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-extrabold tracking-tight truncate" translate="no">{displayName}</h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${settings.isOpen ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${settings.isOpen ? "bg-success animate-pulse" : "bg-destructive"}`} />
              {settings.isOpen ? "Aberto agora" : "Fechado"}
            </span>
            <span className="text-[11px] text-muted-foreground">Entrega 30-60 min</span>
            {settings.storeAddress && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground max-w-full">
                <span className="text-muted-foreground/30">•</span>
                <MapPin className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{settings.storeAddress}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
