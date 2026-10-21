"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/site/ThemeToggle";

export type NavLink = { id: string; label: string; href: string; newTab: boolean; children: { id: string; label: string; href: string; newTab: boolean }[] };

type Props = {
  logo: React.ReactNode;
  items: NavLink[];
  cta: { label: string; href: string };
  whatsappHref: string | null;
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Header({ logo, items, cta, whatsappHref }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const drawerId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setOpen(false);
    setDropdown(null);
  }, [pathname]);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Drawer: scroll lock, Escape, focus trap
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const drawer = drawerRef.current;
    const focusables = () =>
      Array.from(drawer?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const els = focusables();
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Desktop dropdown: close on Escape / outside click
  useEffect(() => {
    if (!dropdown) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDropdown(null);
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-dropdown]")) setDropdown(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [dropdown]);

  const solid = scrolled || open;

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        solid ? "border-b border-line bg-bg/85 backdrop-blur-xl" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="wrap flex h-(--header-h) items-center justify-between gap-6">
        <Link href="/" className="relative z-10 shrink-0" aria-label="Home">
          {logo}
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) =>
              item.children.length ? (
                <li key={item.id} className="relative" data-dropdown>
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      className={`rounded-full px-3 py-2 text-[0.9375rem] transition-colors hover:text-ink ${isActive(pathname, item.href) ? "text-ink" : "text-muted"}`}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      className="-ml-2 flex h-8 w-7 items-center justify-center rounded-full text-muted hover:text-ink"
                      aria-expanded={dropdown === item.id}
                      aria-controls={`dd-${item.id}`}
                      aria-label={`${item.label} menu`}
                      onClick={() => setDropdown((d) => (d === item.id ? null : item.id))}
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${dropdown === item.id ? "rotate-180" : ""}`} aria-hidden />
                    </button>
                  </div>
                  <div
                    id={`dd-${item.id}`}
                    hidden={dropdown !== item.id}
                    className="absolute left-1/2 top-full mt-3 w-[min(720px,80vw)] -translate-x-1/2 border border-line bg-surface p-3 shadow-2xl"
                  >
                    <ul className="grid grid-cols-2 gap-px">
                      {item.children.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={c.href}
                            target={c.newTab ? "_blank" : undefined}
                            rel={c.newTab ? "noopener noreferrer" : undefined}
                            className="group flex items-center justify-between gap-3 px-4 py-3 text-[0.9375rem] text-muted transition-colors hover:bg-elevated hover:text-ink"
                          >
                            {c.label}
                            <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    target={item.newTab ? "_blank" : undefined}
                    rel={item.newTab ? "noopener noreferrer" : undefined}
                    className={`relative rounded-full px-3 py-2 text-[0.9375rem] transition-colors hover:text-ink ${isActive(pathname, item.href) ? "text-ink" : "text-muted"}`}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  >
                    {item.label}
                    {isActive(pathname, item.href) && (
                      <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" aria-hidden />
                    )}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="relative z-10" />
          <Link href={cta.href} className="btn btn-primary hidden min-h-10.5! py-2! sm:inline-flex">
            {cta.label}
            <ArrowUpRight className="btn-arrow h-4 w-4" aria-hidden />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-line lg:hidden"
            aria-expanded={open}
            aria-controls={drawerId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

    </header>
      {/* Mobile drawer — rendered outside <header>: the header's backdrop-filter would otherwise become the containing block for this fixed element */}
      <div
        id={drawerId}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-(--header-h) z-40 overflow-y-auto bg-bg lg:hidden"
      >
        <nav aria-label="Mobile" className="wrap flex min-h-full flex-col pb-10 pt-6">
          <ul className="border-t border-line">
            {items.map((item, i) => (
              <li key={item.id} className="border-b border-line">
                <Link
                  href={item.href}
                  className="flex items-baseline justify-between py-4 font-display text-[2rem] leading-none tracking-[-0.03em]"
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                >
                  <span>{item.label}</span>
                  <span className="t-small text-muted">0{i + 1}</span>
                </Link>
                {item.children.length > 0 && (
                  <ul className="grid grid-cols-1 gap-1 pb-4 sm:grid-cols-2">
                    {item.children.map((c) => (
                      <li key={c.id}>
                        <Link href={c.href} className="block py-1.5 text-[0.9375rem] text-muted hover:text-ink">
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3">
            <Link href={cta.href} className="btn btn-primary w-full">
              {cta.label}
            </Link>
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost w-full">
                WhatsApp us
              </a>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
