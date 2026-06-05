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

    // Set canvas resolution to match parent container for sharp rendering
    const updateCanvasSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        renderFrame(currentFrameRef.current);
      }
    };

    let currentFrameRef = { current: 0 };

    const renderFrame = (frameIndex: number) => {
      if (images[frameIndex]) {
        const img = images[frameIndex];
        
        // Calculate image aspect ratio to fit within canvas (like object-fit: contain)
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;

        if (canvasRatio > imgRatio) {
          // Canvas is wider than image. Height is limiting.
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgRatio;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        } else {
          // Canvas is taller than image. Width is limiting.
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgRatio;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
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
    <section ref={containerRef} className="relative w-full h-[300vh] bg-zinc-950">
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col lg:flex-row items-center px-6 lg:px-20">
        
        {/* Left Column: Text */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center h-[40vh] lg:h-full z-20 text-center lg:text-left pt-20 lg:pt-0">
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight drop-shadow-md">
            Construa o Seu Sucesso
          </h2>
          <p className="text-lg sm:text-xl text-zinc-400 font-bold mt-6 max-w-lg mx-auto lg:mx-0 drop-shadow-sm">
            Camada por camada, ingrediente por ingrediente. O seu negócio na palma da mão do seu cliente, sem fricção.
          </p>
        </div>

        {/* Right Column: Canvas Animation */}
        <div className="w-full lg:w-1/2 h-[60vh] lg:h-full relative flex items-center justify-center">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm font-bold z-10">
              Carregando animação...
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
          />
        </div>
        
      </div>
    </section>
  );
}
