"use client";

import createGlobe, { COBEOptions } from "cobe";
import { useMotionValue, useSpring } from "motion/react";
import type { ComponentPropsWithoutRef } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { canCreateWebGLContext } from "@/lib/browser/webgl";
import { cn } from "@/lib/utils";

const MOVEMENT_DAMPING = 1400;

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [196 / 255, 154 / 255, 75 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 },
  ],
};

function getGlobeDarkValue() {
  if (typeof document === "undefined") {
    return 0;
  }

  return document.documentElement.classList.contains("dark") ? 0 : 1;
}

export function GlobeFallback({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden="true"
      {...props}
      className={cn(
        "absolute top-0 left-1/2 aspect-[1/1] w-full max-w-[600px] -translate-x-1/2 overflow-hidden rounded-full border border-black/10 bg-[radial-gradient(circle_at_50%_50%,rgba(196,154,75,0.18),transparent_55%)] dark:border-white/10",
        className,
      )}
    >
      <div className="absolute inset-[18%] rounded-full border border-black/10 dark:border-white/8" />
      <div className="absolute inset-[32%] rounded-full border border-black/10 dark:border-white/8" />
      <div className="absolute inset-[46%] rounded-full border border-black/10 dark:border-white/8" />
    </div>
  );
}

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: COBEOptions;
}) {
  const [globeDark, setGlobeDark] = useState(getGlobeDarkValue);
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);

  const shouldUseFallback =
    typeof window !== "undefined" &&
    (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !canCreateWebGLContext());

  const [renderMode, setRenderMode] = useState<"loading" | "ready" | "fallback">(
    () => (shouldUseFallback ? "fallback" : "loading"),
  );

  const r = useMotionValue(0);
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  });

  useEffect(() => {
    const updateTheme = () => setGlobeDark(getGlobeDarkValue());

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const updatePointerInteraction = useCallback((value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  }, []);

  const updateMovement = useCallback(
    (clientX: number) => {
      if (pointerInteracting.current !== null) {
        const delta = clientX - pointerInteracting.current;
        pointerInteractionMovement.current = delta;
        r.set(r.get() + delta / MOVEMENT_DAMPING);
      }
    },
    [r],
  );

  useEffect(() => {
    setRenderMode(shouldUseFallback ? "fallback" : "loading");
  }, [shouldUseFallback, globeDark]);

  useEffect(() => {
    if (shouldUseFallback) {
      return;
    }

    const onResize = () => {
      if (canvasRef.current) {
        widthRef.current = canvasRef.current.offsetWidth;
      }
    };

    window.addEventListener("resize", onResize);
    onResize();

    let globe: ReturnType<typeof createGlobe> | null = null;
    let idleHandle: number | null = null;
    const idleWindow = window as Window & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions,
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const initGlobe = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const maxDpr = window.innerWidth < 768 ? 1.25 : 1.5;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const initialPhi = config.phi ?? GLOBE_CONFIG.phi;

      phiRef.current = initialPhi;

      try {
        globe = createGlobe(canvas, {
          ...config,
          dark: globeDark,
          devicePixelRatio: dpr,
          width: widthRef.current * dpr,
          height: widthRef.current * dpr,
          onRender: (state) => {
            if (!pointerInteracting.current) {
              phiRef.current += 0.005;
            }

            state.phi = phiRef.current + rs.get();
            state.width = widthRef.current * dpr;
            state.height = widthRef.current * dpr;
          },
        });

        setRenderMode("ready");
      } catch (error) {
        console.warn("Globe initialization failed", error);
        setRenderMode("fallback");
      }
    };

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(initGlobe, { timeout: 1000 });
    } else {
      idleHandle = window.setTimeout(initGlobe, 0);
    }

    return () => {
      if (idleHandle !== null) {
        if (idleWindow.cancelIdleCallback) {
          idleWindow.cancelIdleCallback(idleHandle);
        } else {
          window.clearTimeout(idleHandle);
        }
      }

      globe?.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [rs, config, shouldUseFallback, globeDark]);

  if (renderMode === "fallback") {
    return <GlobeFallback className={className} data-testid="globe-fallback" />;
  }

  return (
    <div
      key={globeDark}
      className={cn(
        "absolute top-0 left-1/2 aspect-[1/1] w-full max-w-[600px] -translate-x-1/2",
        className,
      )}
    >
      <canvas
        key={globeDark}
        className={cn(
          "size-full transition-opacity duration-500 [contain:layout_paint_size]",
          renderMode === "ready" ? "opacity-100" : "opacity-0",
        )}
        ref={canvasRef}
        onPointerDown={(event) => updatePointerInteraction(event.clientX)}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(event) => updateMovement(event.clientX)}
        onTouchMove={(event) =>
          event.touches[0] && updateMovement(event.touches[0].clientX)
        }
      />
    </div>
  );
}
