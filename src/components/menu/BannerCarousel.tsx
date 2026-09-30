import { useEffect, useState } from "react";

// Carrossel ultra-leve de fotos dos pratos (sem lib externa, sem reads extras).
// Recebe até 5 imagens já vindas do settings (store_data JSON).
// Troca sozinha a cada `intervalMs` (padrão 4s), com dots + swipe básico.
export function BannerCarousel({
  images,
  storeName,
  intervalMs = 4000,
}: {
  images: string[];
  storeName: string;
  intervalMs?: number;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIdx(0);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), intervalMs);
    return () => clearInterval(t);
  }, [images.length, intervalMs, paused]);

  if (!images.length) return null;
  if (images.length === 1) {
    return (
      <section className="px-4 pt-3">
        <div className="rounded-2xl overflow-hidden ring-1 ring-border shadow-lg">
          <img
            src={images[0]}
            alt={`Destaque de ${storeName}`}
            className="w-full h-44 sm:h-60 object-cover"
            loading="eager"
          />
        </div>
      </section>
    );
  }

  return (
    <section
      className="px-4 pt-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setTimeout(() => setPaused(false), 3000)}
    >
      <div className="relative rounded-2xl overflow-hidden ring-1 ring-border shadow-lg">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {images.map((src, i) => (
            <img
              key={`${i}-${src.slice(-24)}`}
              src={src}
              alt={`${storeName} — foto ${i + 1}`}
              className="w-full h-44 sm:h-60 object-cover shrink-0"
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          ))}
        </div>
        {/* dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Foto ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
        {/* setas discretas no desktop */}
        <button
          type="button"
          aria-label="Anterior"
          onClick={() => setIdx((idx - 1 + images.length) % images.length)}
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white items-center justify-center hover:bg-black/60"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Próxima"
          onClick={() => setIdx((idx + 1) % images.length)}
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white items-center justify-center hover:bg-black/60"
        >
          ›
        </button>
      </div>
    </section>
  );
}

// Normaliza settings antigos (só bannerUrl) para o formato novo (banners[]).
export function resolveBanners(settings: { bannerUrl?: string; banners?: string[] }): string[] {
  const list = Array.isArray(settings?.banners) ? settings.banners.filter(Boolean) : [];
  if (list.length > 0) return list.slice(0, 5);
  if (settings?.bannerUrl) return [settings.bannerUrl];
  return [];
}
