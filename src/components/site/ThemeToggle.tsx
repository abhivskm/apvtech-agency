"use client";

import { Moon, Sun } from "lucide-react";
import { THEME_COLORS, THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * Light / dark switch. The current theme lives on <html data-theme> (set before first paint by the
 * bootstrap script in the root layout), so both icons are rendered and CSS shows the right one —
 * no hydration mismatch and no flash.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* private mode: theme still switches for this page view */
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[next]);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`theme-toggle relative flex h-11 w-11 items-center justify-center rounded-full border border-line transition-colors hover:border-ink ${className}`}
      aria-label="Switch between light and dark mode"
      title="Light / dark mode"
    >
      <Sun className="theme-icon-sun h-4.5 w-4.5" aria-hidden />
      <Moon className="theme-icon-moon h-4.5 w-4.5" aria-hidden />
    </button>
  );
}
