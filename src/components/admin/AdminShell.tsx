"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase, Building2, ExternalLink, FileText, HelpCircle, History, Home, Image, Inbox, Layers, LayoutDashboard,
  LogOut, Menu, Newspaper, Palette, Phone, Quote, Search, Settings, Share2, Tag, Users, X,
} from "lucide-react";
import type { AdminNavGroup } from "@/components/admin/nav";
import { logout } from "@/app/admin/login/actions";

const ICONS = { Briefcase, Building2, FileText, HelpCircle, History, Home, Image, Inbox, Layers, LayoutDashboard, Menu, Newspaper, Palette, Phone, Quote, Search, Settings, Share2, Tag, Users };

type Props = {
  nav: AdminNavGroup[];
  user: { name: string; email: string; roleLabel: string };
  brandName: string;
  newEnquiries: number;
  children: React.ReactNode;
};

export function AdminShell({ nav, user, brandName, newEnquiries, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4">
        <Link href="/admin" className="truncate text-sm font-semibold">
          {brandName} <span className="font-normal text-zinc-500">Admin</span>
        </Link>
        <button type="button" className="a-btn a-btn-ghost a-btn-sm lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {nav.map((g, gi) => (
          <div key={gi} className="mb-4">
            {g.label && <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{g.label}</p>}
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const Icon = ICONS[it.icon as keyof typeof ICONS] ?? FileText;
                const active = isActive(it.href);
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2.5 rounded-md px-2 py-2.5 text-sm lg:py-1.5 lg:text-[13px] ${active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-200/70"}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="flex-1 truncate">{it.label}</span>
                      {it.href === "/admin/enquiries" && newEnquiries > 0 && (
                        <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-white text-zinc-900" : "bg-blue-600 text-white"}`} aria-label={`${newEnquiries} new`}>
                          {newEnquiries}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-zinc-200 p-3">
        <Link href="/admin/account" className="block truncate text-[13px] font-medium hover:underline">
          {user.name}
        </Link>
        <p className="truncate text-xs text-zinc-500">
          {user.email} · {user.roleLabel}
        </p>
        <div className="mt-2 flex gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer" className="a-btn a-btn-secondary a-btn-sm flex-1">
            <ExternalLink className="h-3.5 w-3.5" aria-hidden /> View site
          </a>
          <form action={logout} className="flex-1">
            <button type="submit" className="a-btn a-btn-secondary a-btn-sm w-full">
              <LogOut className="h-3.5 w-3.5" aria-hidden /> Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="admin min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-200 bg-zinc-50 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <button type="button" className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-label="Close navigation" />
          <aside className="relative h-full w-72 bg-zinc-50 shadow-xl">{sidebar}</aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button type="button" className="a-btn a-btn-secondary a-btn-sm" onClick={() => setOpen(true)} aria-label="Open navigation" aria-expanded={open}>
            <Menu className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold">{brandName} Admin</span>
        </header>
        <main id="admin-main" className="mx-auto min-w-0 max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
