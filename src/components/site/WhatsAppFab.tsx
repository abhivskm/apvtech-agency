import { WhatsAppIcon } from "@/components/site/icons";

/** Floating WhatsApp button. Only rendered when a valid number is configured in settings. */
export function WhatsAppFab({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-[#25D366] pl-4 pr-4 text-[#0A0A0A] shadow-[0_10px_30px_rgba(0,0,0,.45)] transition-transform duration-300 hover:-translate-y-0.5 sm:bottom-7 sm:right-7"
      aria-label="Chat with us on WhatsApp (opens WhatsApp)"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap font-display text-sm font-medium transition-[max-width] duration-500 group-hover:max-w-30 group-focus-visible:max-w-30 sm:inline">
        WhatsApp us
      </span>
    </a>
  );
}
