import { useEffect, useState, useCallback } from "react";

// Carrossel ultra-leve de fotos dos pratos (sem lib externa, sem reads extras).
// Recebe até 5 imagens já vindas do settings (store_data JSON).
// - Foto inteira sem corte (object-contain + fundo desfocado)
// - Troca sozinha a cada `intervalMs` (padrão 4s), com dots + setas + swipe
// - Clique expande em tela cheia (lightbox com anterior/próxima)
// - No PC a largura é limitada (max-w-3xl) pra não ocupar a página inteira
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
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    setIdx(0);
  }, [images.length]);

  // Autoplay lateral (pausa no hover / no lightbox aberto)
  useEffect(() => {
    if (images.length <= 1 || paused || expanded !== null) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), intervalMs);
    return () => clearInterval(t);
  }, [images.length, intervalMs, paused, expanded]);

  const close = useCallback(() => setExpanded(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setExpanded((cur) =>
        cur === null ? cur : (cur + dir + images.length) % images.length,
      ),
    [images.length],
  );

  // Esc fecha, setas navegam no expandido
  useEffect(() => {
    if (expanded === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, close, step]);

  if (!images.length) return null;

  const box =
    "relative rounded-2xl overflow-hidden ring-1 ring-border shadow-lg bg-black aspect-[16/9] max-h-[260px] sm:max-h-[300px] w-full";

  function slide(src: string, i: number, eager: boolean) {
    return (
      <div
        key={`${i}-${src.slice(-32)}`}
        className="relative w-full h-full shrink-0 overflow-hidden"
      >
        {/* fundo desfocado preenche as bordas sem cortar a principal */}
        <img
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
          loading="lazy"
          draggable={false}
        />
        <img
          src={src}
          alt={`${storeName} — foto ${i + 1}`}
          className="relative w-full h-full object-contain"
          loading={eager ? "eager" : "lazy"}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <>
      <section
        className="px-4 pt-3"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setTimeout(() => setPaused(false), 3000)}
      >
        {/* limite de largura no PC: antes ocupava a página inteira */}
        <div className="mx-auto w-full max-w-3xl">
          {images.length === 1 ? (
            <button
              type="button"
              onClick={() => setExpanded(0)}
              title="Clique para ampliar"
              className={`${box} block cursor-zoom-in`}
            >
              {slide(images[0], 0, true)}
              <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/60 text-white px-2 py-1 rounded-lg backdrop-blur">
                ⤢ ampliar
              </span>
            </button>
          ) : (
            <div className={box}>
              <div
                className="flex h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${idx * 100}%)` }}
              >
                {images.map((src, i) => slide(src, i, i === 0))}
              </div>
              {/* clique abre o anúncio por completo */}
              <button
                type="button"
                aria-label="Ampliar foto"
                onClick={() => setExpanded(idx)}
                className="absolute inset-0 cursor-zoom-in"
              />
              {/* dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === idx ? "w-5 bg-white" : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
              {/* dots clicáveis */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1.5 pb-1.5 opacity-0">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Foto ${i + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIdx(i);
                    }}
                    className="w-6 h-4"
                  />
                ))}
              </div>
              {/* setas */}
              <button
                type="button"
                aria-label="Anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx((idx - 1 + images.length) % images.length);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white items-center justify-center hover:bg-black/60 hidden sm:flex"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Próxima"
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx((idx + 1) % images.length);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white items-center justify-center hover:bg-black/60 hidden sm:flex"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox: foto inteira, sem corte, com troca pro lado */}
      {expanded !== null && images[expanded] && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur flex items-center justify-center p-4"
          onClick={close}
        >
          <button
            type="button"
            aria-label="Fechar"
            onClick={close}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white text-xl hover:bg-white/20"
          >
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-2 sm:left-6 w-11 h-11 rounded-full bg-white/10 text-white text-2xl hover:bg-white/20"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Próxima"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-2 sm:right-6 w-11 h-11 rounded-full bg-white/10 text-white text-2xl hover:bg-white/20"
              >
                ›
              </button>
            </>
          )}
          <img
            src={images[expanded]}
            alt={`${storeName} — ampliada`}
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 text-white/60 text-xs font-bold">
            {expanded + 1} / {images.length} — clique fora para fechar
          </p>
        </div>
      )}
    </>
  );
}

// Normaliza settings antigos (só bannerUrl) para o formato novo (banners[]).
export function resolveBanners(settings: { bannerUrl?: string; banners?: string[] }): string[] {
  const raw = Array.isArray(settings?.banners) ? settings.banners.filter(Boolean) : [];
  // Remove URLs duplicadas preservando a ordem (evita banner repetido no carrossel)
  const list = Array.from(new Set(raw.map((s) => s.trim()))).filter(Boolean);
  if (list.length > 0) return list.slice(0, 5);
  if (settings?.bannerUrl) return [settings.bannerUrl];
  return [];
}
