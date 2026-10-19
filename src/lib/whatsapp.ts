/**
 * WhatsApp click-to-chat helpers (https://wa.me/<number>?text=...). No paid API required.
 * Numbers are normalised to international format without "+" or separators.
 */
export function normaliseWhatsappNumber(raw: string | null | undefined, defaultCountryCode = "91"): string | null {
  if (!raw) return null;
  let digits = raw.trim();
  const hadPlus = digits.startsWith("+");
  digits = digits.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (!hadPlus) {
    // Indian local formats: 0XXXXXXXXXX or XXXXXXXXXX (10 digits starting 6-9).
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    if (digits.length === 10) digits = defaultCountryCode + digits;
  }
  // E.164 allows up to 15 digits; require a plausible minimum.
  if (digits.length < 8 || digits.length > 15) return null;
  if (digits.startsWith("91") && digits.length === 12 && !/^91[6-9]/.test(digits)) return null;
  return digits;
}

export function whatsappLink(number: string | null | undefined, message?: string): string | null {
  const n = normaliseWhatsappNumber(number);
  if (!n) return null;
  const text = message?.trim();
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function serviceWhatsappMessage(base: string, serviceTitle?: string): string {
  if (!serviceTitle) return base;
  return `Hi, I found your website and would like to discuss ${serviceTitle} for my business.`;
}
