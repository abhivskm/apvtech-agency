"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type Img = { id: string; url: string; alt: string };

type Props = {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  description?: string;
  primaryCta?: { label?: string; href?: string };
  secondaryCta?: { label?: string; href?: string };
  images: Img[];
  labels: string[];
};

/* Layer layout for the desktop collage (percentages of the collage box). depth drives cursor parallax. */
const LAYERS = [
  { top: "6%", left: "26%", width: "52%", aspect: "3 / 2", depth: 18 },
  { top: "50%", left: "4%", width: "28%", aspect: "4 / 5", depth: 34 },
  { top: "0%", left: "0%", width: "21%", aspect: "3 / 4", depth: 26 },
  { top: "58%", left: "55%", width: "34%", aspect: "16 / 10", depth: 42 },
  { top: "32%", left: "80%", width: "20%", aspect: "1 / 1", depth: 54 },
];

const CYCLE_MS = 3400;

/**
 * Signature hero: "signal stack". A layered, art-directed collage of the studio's disciplines.
 * - Server-rendered static composition (no layout shift, nothing waits for JS)
 * - Cursor-reactive depth parallax via GSAP quickTo on fine pointers only
 * - Active layer cycles with a clip-path sweep and a live caption ("now showing")
 * - Fully static under prefers-reduced-motion; cycling pauses on hover/focus and when off-screen
 */
export function HeroSignature({ eyebrow, headline, subheadline, description, primaryCta, secondaryCta, images, labels }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [motion, setMotion] = useState(false);
  const shown = images.slice(0, LAYERS.length);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMotion(!mq.matches);
    const on = () => setMotion(!mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Auto-cycle while visible
  useEffect(() => {
    if (!motion || paused || shown.length < 2) return;
    const el = rootRef.current;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (el) io.observe(el);
    const t = window.setInterval(() => {
      if (visible && !document.hidden) setActive((a) => (a + 1) % shown.length);
    }, CYCLE_MS);
    return () => {
      window.clearInterval(t);
      io.disconnect();
    };
  }, [motion, paused, shown.length]);

  // Cursor parallax (desktop, fine pointer only). GSAP is loaded lazily so it never blocks first paint.
  useEffect(() => {
    if (!motion || !window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches) return;
    const root = rootRef.current;
    if (!root) return;
    let cleanup = () => {};
    let cancelled = false;
    import("gsap").then(({ gsap }) => {
      if (cancelled) return;
      const movers = layerRefs.current.map((el) =>
        el ? { x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" }), y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power3.out" }) } : null,
      );
      const onMove = (e: PointerEvent) => {
        const r = root.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        movers.forEach((m, i) => {
          if (!m) return;
          const d = LAYERS[i].depth;
          m.x(-nx * d);
          m.y(-ny * d);
        });
      };
      const onLeave = () => movers.forEach((m) => (m?.x(0), m?.y(0)));
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerleave", onLeave);
      cleanup = () => {
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
      };
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [motion]);

  const lines = headline.split("\n").filter(Boolean);
  const label = labels[active] ?? "";

  return (
    <section
      ref={rootRef}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-[calc(var(--header-h)+2rem)]"
      aria-labelledby="hero-title"
    >
      {/* Collage */}
      {shown.length > 0 && (
        <div
          className="absolute inset-y-0 right-0 z-0 hidden w-[60%] lg:block"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="absolute inset-x-[4%] bottom-[14%] top-[calc(var(--header-h)+4%)]">
            {shown.map((img, i) => {
              const L = LAYERS[i];
              const isActive = i === active;
              return (
                <div
                  key={img.id}
                  ref={(el) => {
                    layerRefs.current[i] = el;
                  }}
                  className="absolute will-change-transform"
                  style={{ top: L.top, left: L.left, width: L.width, zIndex: isActive ? 10 : i + 1 }}
                >
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onFocus={() => {
                      setPaused(true);
                      setActive(i);
                    }}
                    onBlur={() => setPaused(false)}
                    aria-label={`Show ${labels[i] ?? img.alt}`}
                    aria-pressed={isActive}
                    className="group/layer relative block w-full overflow-hidden bg-surface transition-[transform,filter] duration-[1200ms] ease-[var(--ease-out)]"
                    style={{
                      aspectRatio: L.aspect,
                      transform: isActive ? "scale(1.04)" : "scale(1)",
                      filter: isActive ? "none" : "grayscale(.55) brightness(.62)",
                    }}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      priority={i < 2}
                      sizes="(min-width: 1024px) 32vw, 1px"
                      className="object-cover"
                    />
                    {/* Signal sweep on activation */}
                    <span
                      key={isActive ? `on-${active}` : "off"}
                      aria-hidden
                      className={`pointer-events-none absolute inset-0 bg-accent mix-blend-multiply ${isActive && motion ? "hero-sweep" : "opacity-0"}`}
                    />
                    <span className="absolute left-2 top-2 font-display text-[11px] tracking-[.12em] text-ink/90">0{i + 1}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Copy */}
      <div className="wrap pointer-events-none relative flex flex-1 flex-col justify-center pb-10">
        {eyebrow && (
          <p className="t-eyebrow fade-in mb-8 flex items-center gap-3" style={{ ["--d" as string]: "100ms" }}>
            <span className="signal-dot" aria-hidden />
            {eyebrow}
          </p>
        )}
        <h1 id="hero-title" className="t-mega relative max-w-[11ch] uppercase lg:mix-blend-difference" aria-label={lines.join(" ")}>
          {lines.map((line, i) => (
            <span key={i} className="hero-line" aria-hidden>
              <span style={{ ["--i" as string]: i }}>{line}</span>
            </span>
          ))}
        </h1>

        <div className="mt-10 grid gap-8 lg:mt-14 lg:max-w-[40%]">
          {subheadline && (
            <p className="t-h4 fade-in max-w-[30ch] t-balance" style={{ ["--d" as string]: "450ms" }}>
              {subheadline}
            </p>
          )}
          {description && (
            <p className="fade-in max-w-[46ch] text-muted t-pretty" style={{ ["--d" as string]: "550ms" }}>
              {description}
            </p>
          )}
          <div className="fade-in pointer-events-auto flex flex-wrap gap-3" style={{ ["--d" as string]: "650ms" }}>
            {primaryCta?.href && primaryCta.label && (
              <Link href={primaryCta.href} className="btn btn-primary">
                {primaryCta.label}
                <ArrowUpRight className="btn-arrow h-4 w-4" aria-hidden />
              </Link>
            )}
            {secondaryCta?.href && secondaryCta.label && (
              <Link href={secondaryCta.href} className="btn btn-ghost">
                {secondaryCta.label}
                <ArrowDownRight className="btn-arrow h-4 w-4" aria-hidden />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / tablet composition */}
      {shown.length > 0 && (
        <div className="wrap relative z-10 pb-10 lg:hidden" aria-hidden>
          <div className="grid grid-cols-6 grid-rows-[auto_auto] gap-2">
            {shown.slice(0, 3).map((img, i) => (
              <div
                key={img.id}
                className={`relative overflow-hidden bg-surface ${i === 0 ? "col-span-4 row-span-2 aspect-[4/5]" : "col-span-2 aspect-[3/4]"}`}
              >
                <Image src={img.url} alt="" fill sizes="(max-width: 1023px) 60vw, 1px" className="object-cover" priority={i === 0} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live caption */}
      {shown.length > 0 && labels.length > 0 && (
        <div className="wrap relative z-20 hidden items-center justify-between border-t border-line py-5 text-sm text-muted lg:flex">
          <p aria-live="polite" className="flex items-center gap-3">
            <span className="font-display text-ink">
              0{active + 1}
              <span className="text-muted"> / 0{shown.length}</span>
            </span>
            <span className="h-px w-10 bg-line" aria-hidden />
            <span key={label} className="fade-in text-ink" style={{ ["--d" as string]: "0ms" }}>
              {label}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <span className="hidden xl:inline">One studio for every touchpoint</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line">
              <ArrowDownRight className="h-4 w-4" aria-hidden />
            </span>
          </p>
        </div>
      )}
    </section>
  );
}
