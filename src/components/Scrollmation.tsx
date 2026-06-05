import { useEffect, useRef, useState } from "react";

interface ScrollmationProps {
  frameCount: number;
  folderPath: string;
  filePrefix: string;
  fileExtension: string;
}

export function Scrollmation({
  frameCount = 40,
  folderPath = "/lanche-caindo",
  filePrefix = "ezgif-frame-",
  fileExtension = ".jpg",
}: ScrollmationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Pad numbers with leading zeros (ex: 1 -> "001", 10 -> "010")
  const padNumber = (num: number) => num.toString().padStart(3, "0");

  // Load all images once
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = `${folderPath}/${filePrefix}${padNumber(i)}${fileExtension}`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setImages(loadedImages);
          setLoaded(true);
        }
      };
      loadedImages.push(img);
    }
  }, [frameCount, folderPath, filePrefix, fileExtension]);

  // Handle scroll and render
  useEffect(() => {
    if (!loaded || images.length === 0) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas resolution to match window inner width/height for sharp rendering
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(currentFrameRef.current);
    };

    let currentFrameRef = { current: 0 };

    const renderFrame = (frameIndex: number) => {
      if (images[frameIndex]) {
        const img = images[frameIndex];
        
        // Calculate image aspect ratio to cover canvas (like object-fit: cover)
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;

        if (canvasRatio > imgRatio) {
          drawHeight = canvas.width / imgRatio;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          drawWidth = canvas.height * imgRatio;
          offsetX = (canvas.width - drawWidth) / 2;
        }

        // Fill background to prevent transparent artifacts
        context.fillStyle = "#09090b"; // zinc-950
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    };

    // Initial render
    window.addEventListener("resize", updateCanvasSize);
    updateCanvasSize();
    renderFrame(0);

    // Scroll listener
    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      // The container takes e.g. 300vh space.
      // rect.top goes from 0 (when container hits top of screen)
      // to negative (as we scroll down)
      
      const scrollStart = 0;
      const scrollDistance = rect.height - window.innerHeight;
      
      let scrollProgress = -rect.top / scrollDistance;
      
      // Clamp between 0 and 1
      scrollProgress = Math.max(0, Math.min(1, scrollProgress));
      
      // Map progress to frame index
      const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollProgress * frameCount)
      );
      
      // Render only if frame changed to save performance
      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        // Use requestAnimationFrame for smooth drawing
        requestAnimationFrame(() => renderFrame(frameIndex));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [loaded, images, frameCount]);

  return (
    <div ref={containerRef} className="relative w-full h-[300vh] bg-zinc-950">
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm font-bold z-10">
            Carregando animação...
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
        />
        
        {/* Optional Overlay Text while scrolling */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center z-20">
          <h2 className="text-4xl sm:text-6xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            Construa o Seu Sucesso
          </h2>
          <p className="text-lg sm:text-xl text-zinc-200 font-bold mt-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Camada por camada, ingrediente por ingrediente.
          </p>
        </div>
      </div>
    </div>
  );
}
