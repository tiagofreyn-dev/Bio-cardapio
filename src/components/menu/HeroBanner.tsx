import type { Product } from "@/lib/types";

interface HeroBannerProps {
  product?: Product;
  customBannerUrl?: string | null;
  storeName?: string;
}

export function HeroBanner({ product, customBannerUrl, storeName }: HeroBannerProps) {
  const name = product ? product.name : (storeName || "Insano Monster");
  const desc = product ? (product.description || "O sabor mais incrível da região!") : "Os melhores produtos e ingredientes selecionados.";
  const image = customBannerUrl || (product ? product.image : null);

  return (
    <section className="relative mx-4 mt-4 rounded-2xl overflow-hidden h-44 bg-gradient-to-br from-primary/40 via-background to-background ring-1 ring-primary/30">
      <div className="absolute inset-0 flex items-center justify-between p-5 bg-[radial-gradient(circle_at_70%_30%,oklch(0.62_0.22_22/0.35),transparent_60%)]">
        <div className="relative z-10 flex-1 min-w-0 pr-4">
          <p className="text-xs uppercase tracking-widest text-primary font-bold" translate="no">Destaque da semana</p>
          <h2 className="text-2xl font-black leading-tight mt-1 truncate" translate="no">{name}</h2>
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{desc}</p>
        </div>
        
        {/* Right side graphic/image */}
        <div className="relative shrink-0 flex items-center justify-center">
          {image && (image.startsWith("http") || image.startsWith("/")) ? (
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-primary/30 shadow-2xl">
              <img src={image} alt={name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          ) : (
            <div className="text-6xl opacity-90 drop-shadow-[0_0_30px_oklch(0.62_0.22_22/0.7)] animate-bounce duration-1000">
              {image || "🔥🍔"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

