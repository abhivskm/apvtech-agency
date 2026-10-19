"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    __motionReady?: boolean;
  }
}

/**
 * Drives [data-reveal] elements with a single IntersectionObserver.
 * Content is only hidden while html.motion-ok is present (see root layout bootstrap),
 * so if this never runs, everything stays visible.
 */
export function MotionInit() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    window.__motionReady = true;
    if (!root.classList.contains("motion-ok")) return;
    if (!("IntersectionObserver" in window)) {
      root.classList.remove("motion-ok");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    const observe = () => document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
    observe();
    // Catch content streamed in after the initial pass.
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });

    // Fast scrolling (End key, anchor jumps) can skip elements entirely between observer samples.
    // Reveal anything that is already above the bottom of the viewport.
    let raf = 0;
    const sweep = () => {
      raf = 0;
      const limit = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((el) => {
        if (el.getBoundingClientRect().top < limit) {
          el.classList.add("is-in");
          io.unobserve(el);
        }
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sweep);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
