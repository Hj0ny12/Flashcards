"use client";

import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { Component, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useTheme } from "@/hooks/use-theme";

import { GlobeFallback } from "@/components/magicui/globe";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

const LazyGlobe = dynamic(
  () =>
    import("@/components/magicui/globe").then((mod) => ({
      default: mod.Globe,
    })),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0" aria-hidden="true" />,
  },
);

const LazyMeteors = dynamic(
  () =>
    import("@/components/magicui/meteors").then((mod) => ({
      default: mod.Meteors,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

interface Hero216Props {
  className?: string;
  tagline: string;
  headline: string;
  ctaText: string;
  ctaHref: string;
}

class HeroGlobeErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Homepage globe disabled after render failure", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function getIsDarkTheme() {
  if (typeof document === "undefined") {
    return false;
  }

  return document.documentElement.classList.contains("dark");
}

function HeroDecorativeVisuals() {
  const [showEnhancedVisuals, setShowEnhancedVisuals] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(getIsDarkTheme());
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      return;
    }

    const idleWindow = window as Window & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions,
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    let idleHandle: number | null = null;

    const frameHandle = window.requestAnimationFrame(() => {
      if (idleWindow.requestIdleCallback) {
        idleHandle = idleWindow.requestIdleCallback(
          () => setShowEnhancedVisuals(true),
          { timeout: 1200 },
        );
      } else {
        idleHandle = window.setTimeout(() => setShowEnhancedVisuals(true), 0);
      }
    });

    return () => {
      window.cancelAnimationFrame(frameHandle);

      if (idleHandle !== null) {
        if (idleWindow.cancelIdleCallback) {
          idleWindow.cancelIdleCallback(idleHandle);
        } else {
          window.clearTimeout(idleHandle);
        }
      }
    };
  }, []);

  return (
    <>
      {showEnhancedVisuals ? <LazyMeteors number={30} /> : null}

      <div
        className={cn(
          "relative w-full overflow-y-clip transition-[height] duration-500",
          isDark ? "h-[460px]" : "h-[900px]",
        )}
      >
        {showEnhancedVisuals ? (
          <HeroGlobeErrorBoundary
            fallback={
              <GlobeFallback
                className="translate-y-40 scale-[1.75]"
                data-testid="hero-globe-fallback"
              />
            }
          >
            <LazyGlobe className="translate-y-40 scale-[1.75]" />
          </HeroGlobeErrorBoundary>
        ) : (
          <GlobeFallback
            className="translate-y-40 scale-[1.75]"
            data-testid="hero-globe-fallback"
          />
        )}
      </div>
    </>
  );
}

const Hero216 = ({ className, tagline, headline, ctaText, ctaHref }: Hero216Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 overflow-hidden">
        <p className="text-muted-foreground text-lg">{tagline}</p>
        <h1 className="max-w-3xl text-center text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl text-foreground">
          {headline}
        </h1>

        <Button
          variant="glow"
          size="xl"
          className="group mt-10 flex w-fit items-center justify-center gap-2"
          asChild
        >
          <Link href={ctaHref}>
            {ctaText}
            <ArrowRight className="size-5 -rotate-45 transition-all ease-out group-hover:ml-2 group-hover:rotate-0" />
          </Link>
        </Button>
        <HeroDecorativeVisuals />
      </div>
    </section>
  );
};

export { Hero216 };
