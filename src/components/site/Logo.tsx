import Image from "next/image";

type Props = {
  brandName: string;
  logo?: { url: string; alt: string; width: number | null; height: number | null } | null;
  className?: string;
};

/** Brand mark: uploaded logo when configured, otherwise a typographic wordmark from the brand name. */
export function Logo({ brandName, logo, className = "" }: Props) {
  if (logo) {
    const ratio = logo.width && logo.height ? logo.width / logo.height : 4;
    return (
      <Image
        src={logo.url}
        alt={logo.alt || brandName}
        width={Math.round(32 * ratio)}
        height={32}
        className={`h-8 w-auto ${className}`}
        priority
      />
    );
  }
  return (
    <span className={`inline-flex items-center gap-2 font-display text-[1.05rem] font-medium tracking-[-0.02em] ${className}`}>
      <span className="signal-dot" aria-hidden="true" />
      <span>{brandName}</span>
    </span>
  );
}
