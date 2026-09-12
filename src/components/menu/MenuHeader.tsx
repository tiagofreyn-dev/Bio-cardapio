import logo from "@/assets/logo-insano.jpg";
import { storage, getActiveLojaId } from "@/lib/storage";
import { useStorageSync } from "@/hooks/use-storage";
import { Link } from "@tanstack/react-router";
import { Settings as SettingsIcon, MapPin, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export function MenuHeader({
  storeName: propStoreName,
  isLegacy: propIsLegacy,
}: {
  storeName?: string;
  isLegacy?: boolean;
}) {
  const settings = useStorageSync(() => storage.getSettings());

  const activeId = typeof window !== "undefined" ? getActiveLojaId() : null;
  const isLegacy =
    propIsLegacy !== undefined
      ? propIsLegacy
      : !activeId || activeId === "d3b07384-d113-4ec5-a55d-e0c157855d01";

  const displayName = propStoreName || settings.storeName;

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex items-center gap-3 px-4 py-3">
        {settings.logoUrl ? (
          <img
            src={settings.logoUrl}
            alt={displayName}
            className="w-12 h-12 rounded-full ring-2 ring-primary/50 object-cover shrink-0"
          />
        ) : isLegacy ? (
          <img
            src={logo}
            alt="Insano Lanches"
            className="w-12 h-12 rounded-full ring-2 ring-primary/50 object-cover shrink-0"
          />
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
          <h1 className="text-base font-extrabold tracking-tight truncate" translate="no">
            {displayName}
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${settings.isOpen ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${settings.isOpen ? "bg-success animate-pulse" : "bg-destructive"}`}
              />
              {settings.isOpen ? "Aberto agora" : "Fechado"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Entrega {settings.deliveryTime || "30-60"} min
            </span>
            {settings.storeAddress && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground max-w-full">
                <span className="text-muted-foreground/30">•</span>
                <MapPin className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{settings.storeAddress}</span>
              </span>
            )}
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("insano.theme");
    if (saved === "light") {
      setIsLight(true);
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggleTheme = () => {
    if (isLight) {
      document.documentElement.classList.remove("light");
      localStorage.setItem("insano.theme", "dark");
      setIsLight(false);
    } else {
      document.documentElement.classList.add("light");
      localStorage.setItem("insano.theme", "light");
      setIsLight(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-surface-elevated text-muted-foreground ring-1 ring-border hover:text-foreground transition-colors shrink-0 shadow-sm"
      title="Alternar Modo Claro/Escuro"
    >
      {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {isLight ? "Escuro" : "Claro"}
      </span>
    </button>
  );
}
