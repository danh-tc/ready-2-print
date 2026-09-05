export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function pageview(url: string): void {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) {
    return;
  }
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: url });
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function event(name: string, params?: EventParams): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}
