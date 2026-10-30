import type { Permission } from "@/lib/auth/permissions";

export type AdminNavItem = { label: string; href: string; permission: Permission; icon: string };
export type AdminNavGroup = { label: string | null; items: AdminNavItem[] };

export const ADMIN_NAV: AdminNavGroup[] = [
  { label: null, items: [{ label: "Dashboard", href: "/admin", permission: "dashboard.view", icon: "LayoutDashboard" }] },
  {
    label: "Content",
    items: [
      { label: "Homepage Sections", href: "/admin/homepage", permission: "homepage.manage", icon: "Home" },
      { label: "Pages", href: "/admin/pages", permission: "pages.manage", icon: "FileText" },
      { label: "Navigation", href: "/admin/navigation", permission: "navigation.manage", icon: "Menu" },
      { label: "Services", href: "/admin/services", permission: "services.manage", icon: "Layers" },
      { label: "Portfolio / Projects", href: "/admin/projects", permission: "projects.manage", icon: "Briefcase" },
      { label: "Industries", href: "/admin/industries", permission: "industries.manage", icon: "Building2" },
      { label: "Blog / Insights", href: "/admin/articles", permission: "articles.manage", icon: "Newspaper" },
      { label: "Testimonials", href: "/admin/testimonials", permission: "testimonials.manage", icon: "Quote" },
      { label: "FAQs", href: "/admin/faqs", permission: "faqs.manage", icon: "HelpCircle" },
      { label: "Plans & Pricing", href: "/admin/plans", permission: "plans.manage", icon: "Tag" },
      { label: "Media Library", href: "/admin/media", permission: "media.manage", icon: "Image" },
    ],
  },
  {
    label: "Leads",
    items: [
      { label: "Enquiries", href: "/admin/enquiries", permission: "leads.view", icon: "Inbox" },
      { label: "Analytics", href: "/admin/analytics", permission: "analytics.view", icon: "BarChart3" },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Contact Information", href: "/admin/settings/contact", permission: "contact.manage", icon: "Phone" },
      { label: "Social Media", href: "/admin/settings/social", permission: "social.manage", icon: "Share2" },
      { label: "SEO & Redirects", href: "/admin/settings/seo", permission: "seo.manage", icon: "Search" },
      { label: "Branding & Theme", href: "/admin/settings/branding", permission: "branding.manage", icon: "Palette" },
      { label: "Global Settings", href: "/admin/settings/global", permission: "settings.manage", icon: "Settings" },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Users & Permissions", href: "/admin/users", permission: "users.manage", icon: "Users" },
      { label: "Activity Log", href: "/admin/activity", permission: "activity.view", icon: "History" },
    ],
  },
];
