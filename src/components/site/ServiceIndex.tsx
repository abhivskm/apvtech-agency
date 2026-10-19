"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

export type ServiceGroup = {
  category: string;
  services: { slug: string; title: string; shortDescription: string; featuredLabel: string | null }[];
  image: { url: string; alt: string } | null;
};

/**
 * Editorial service index. On desktop with a fine pointer, hovering a row reveals that discipline's
 * image which trails the cursor. Keyboard focus shows the same preview, anchored to the row.
 * On touch devices it is a clean, fully readable list.
 */
export function ServiceIndex({ groups }: { groups: ServiceGroup[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches;
    const motion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && motion);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const list = listRef.current;
    const preview = previewRef.current;
    if (!list || !preview) return;
    let raf = 0;
    let tx = 0,
      ty = 0,
      x = 0,
      y = 0;
    const onMove = (e: PointerEvent) => {
      const r = list.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    };
    const tick = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      preview.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    list.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      list.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return (
    <div className="relative">
      <ol ref={listRef} className="relative border-t border-line" onPointerLeave={() => setHovered(null)}>
        {groups.map((g, i) => (
          <li
            key={g.category}
            className="group relative border-b border-line"
            onPointerEnter={() => setHovered(i)}
            onFocusCapture={() => setHovered(i)}
            onBlurCapture={() => setHovered(null)}
          >
            <div className="grid-12 items-baseline gap-y-3 py-7 lg:py-9">
              <span className="col-span-2 font-display text-sm text-muted lg:col-span-1" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3
                className={`t-h2 col-span-10 transition-[color,transform] duration-500 lg:col-span-5 ${
                  hovered === i ? "lg:translate-x-3 lg:text-accent" : ""
                }`}
              >
                {g.category}
              </h3>
              <ul className="col-span-12 flex flex-col gap-3 lg:col-span-6 lg:col-start-7">
                {g.services.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} className="group/link flex items-start justify-between gap-6">
                      <span>
                        <span className="flex flex-wrap items-center gap-3">
                          <span className="t-h4 link-underline">{s.title}</span>
                          {s.featuredLabel && (
                            <span className="rounded-full border border-accent/50 px-2 py-0.5 text-[11px] uppercase tracking-[.1em] text-accent">
                              {s.featuredLabel}
                            </span>
                          )}
                        </span>
                        <span className="mt-1.5 block max-w-[52ch] text-[0.9375rem] text-muted">{s.shortDescription}</span>
                      </span>
                      <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-muted transition-all duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:text-accent" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
      {enabled && (
        <div
          ref={previewRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-10 hidden w-[22vw] max-w-[340px] lg:block"
        >
          {groups.map((g, i) =>
            g.image ? (
              <div
                key={g.category}
                className="absolute inset-x-0 top-0 aspect-[4/5] overflow-hidden transition-[opacity,clip-path] duration-700 ease-[var(--ease-out)]"
                style={{
                  opacity: hovered === i ? 1 : 0,
                  clipPath: hovered === i ? "inset(0 0 0 0)" : "inset(12% 12% 12% 12%)",
                }}
              >
                <Image src={g.image.url} alt="" fill sizes="340px" className="object-cover" />
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
