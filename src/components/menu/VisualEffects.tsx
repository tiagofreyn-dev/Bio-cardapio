import React, { useEffect, useRef } from "react";
import { useTenant } from "@/lib/tenant";

export function VisualEffects() {
  const { tenant } = useTenant();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const efeito = tenant?.efeito_ativo || "nenhum";
  const corPrincipal = tenant?.cor_principal || "#EF4444";

  useEffect(() => {
    // Caso o efeito seja 'neon' ou 'nenhum', o canvas não é necessário
    if (efeito === "nenhum" || efeito === "neon") {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Ajusta o tamanho do canvas quando a janela é redimensionada
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Configuração de Partículas
    const isAcai = tenant?.slug.includes("acai") ?? false;
    const emojisAcai = ["🍇", "🍌", "🍓", "🟣", "🥝", "🍍"];

    const particleCount = efeito === "queda-neve" ? (isAcai ? 45 : 60) : 50;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      rotation?: number;
      rotationSpeed?: number;
      emoji?: string;
    }> = [];

    // Cores de Açaí/Neve para a queda
    const coresNeve = ["#ffffff", "#f0e6ff", "#4c0519", "#3b0764"]; // Tons brancos e roxos de açaí!
    const coresConfete = ["#FF2E93", "#FF8E53", "#FFD000", "#00FF87", "#00F0FF", "#8500FF"];
    const coresAcaiParticulas = ["#5c246b", "#a855f7", "#8CD867", "#ffffff", "#e9d5ff"];

    for (let i = 0; i < particleCount; i++) {
      if (efeito === "queda-neve") {
        const isEmoji = isAcai && Math.random() < 0.20; // 20% chance of a fruit/açaí emoji
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height - height,
          size: isEmoji ? Math.random() * 8 + 14 : Math.random() * 4 + 1.5,
          speedX: Math.random() * 1 - 0.5,
          speedY: isEmoji ? Math.random() * 0.8 + 0.8 : Math.random() * 1.5 + 0.8,
          color: isAcai 
            ? coresAcaiParticulas[Math.floor(Math.random() * coresAcaiParticulas.length)] 
            : coresNeve[Math.floor(Math.random() * coresNeve.length)],
          emoji: isEmoji ? emojisAcai[Math.floor(Math.random() * emojisAcai.length)] : undefined,
        });
      } else if (efeito === "confete") {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height - height,
          size: Math.random() * 6 + 4,
          speedX: Math.random() * 3 - 1.5,
          speedY: Math.random() * 2 + 2,
          color: coresConfete[Math.floor(Math.random() * coresConfete.length)],
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 4 - 2,
        });
      }
    }

    // Loop de Animação
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Atualiza posição
        p.y += p.speedY;
        p.x += p.speedX;

        // Se passar da tela, reinicia no topo
        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width) p.x = 0;
        if (p.x < 0) p.x = width;

        // Desenha
        ctx.fillStyle = p.color;

        if (efeito === "queda-neve") {
          if (p.emoji) {
            ctx.font = `${p.size}px Arial`;
            ctx.fillText(p.emoji, p.x, p.y);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (efeito === "confete") {
          ctx.save();
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
            p.rotation += p.rotationSpeed;
            ctx.rotate((p.rotation * Math.PI) / 180);
          }
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [efeito]);

  // Se o efeito for neon, injetamos estilos que fazem a logo e botões brilharem
  if (efeito === "neon") {
    return (
      <style>{`
        /* Efeito Brilho Neon Dinâmico */
        header, .btn-primary, button[type="submit"], .price-tag, img {
          transition: all 0.3s ease;
        }
        
        header {
          border-bottom: 2px solid ${corPrincipal} !important;
          box-shadow: 0 4px 20px ${corPrincipal}33 !important;
        }

        .ring-primary\\/50 {
          ring-color: ${corPrincipal} !important;
          box-shadow: 0 0 15px ${corPrincipal}bb, inset 0 0 5px ${corPrincipal} !important;
          border: 1px solid ${corPrincipal} !important;
          animation: neon-pulse-border 2s ease-in-out infinite alternate;
        }

        button.bg-primary {
          background-color: ${corPrincipal} !important;
          box-shadow: 0 0 15px ${corPrincipal}88 !important;
          text-shadow: 0 0 5px rgba(255,255,255,0.8) !important;
        }

        button.bg-primary:hover {
          box-shadow: 0 0 25px ${corPrincipal}cc !important;
        }

        .text-primary, h1, h2 {
          text-shadow: 0 0 8px ${corPrincipal}66 !important;
        }

        @keyframes neon-pulse-border {
          from {
            box-shadow: 0 0 10px ${corPrincipal}66, inset 0 0 4px ${corPrincipal}33;
          }
          to {
            box-shadow: 0 0 20px ${corPrincipal}bb, inset 0 0 8px ${corPrincipal}66;
          }
        }
      `}</style>
    );
  }

  // Se for queda de neve ou confete, exibe o Canvas de fundo
  if (efeito === "queda-neve" || efeito === "confete") {
    return (
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-40 w-full h-full"
        style={{ mixBlendMode: "screen" }}
      />
    );
  }

  return null;
}
