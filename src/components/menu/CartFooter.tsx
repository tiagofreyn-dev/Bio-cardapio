import { useState, useEffect } from "react";
import { brl } from "@/lib/format";
import { ShoppingBag } from "lucide-react";

export function CartFooter({ count, subtotal, onOpen }: { count: number; subtotal: number; onOpen: () => void }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (count > 0) {
      // Immediate shake on count change
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 600);
      
      // Trigger Haptic Vibration if supported
      try {
        if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
          navigator.vibrate([60, 40, 60]);
        }
      } catch (err) {
        console.warn("Vibration not supported or blocked by browser policies:", err);
      }

      // Periodic shake every 3 seconds
      const interval = setInterval(() => {
        setAnimate(true);
        setTimeout(() => setAnimate(false), 600);
      }, 3000);

      return () => {
        clearTimeout(t);
        clearInterval(interval);
      };
    }
  }, [count]);

  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 p-3 bg-background/95 backdrop-blur border-t border-border">
      <button
        key={count}
        onClick={onOpen}
        className={`w-full h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-between px-5 font-bold shadow-[0_-4px_30px_oklch(0.62_0.22_22/0.4)] transition-transform duration-100 ${
          animate ? "animate-shake-bounce" : ""
        }`}
      >
        <span className="flex items-center gap-2">
          <span className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-2 -right-3 bg-background text-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-1 ring-primary">
              {count}
            </span>
          </span>
          Ver Sacola
        </span>
        <span>{brl(subtotal)}</span>
      </button>
    </div>
  );
}

