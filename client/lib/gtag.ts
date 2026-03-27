export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID ?? "";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[][];
  }
}

const getGtag = () => {
  if (typeof window === "undefined") return null;

  if (window.gtag) return window.gtag;

  window.dataLayer = window.dataLayer || [];
  return (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
};

export const pageview = (url: string) => {
  if (!GA_TRACKING_ID || typeof window === "undefined") return;
  const gtag = getGtag();
  if (!gtag) return;

  gtag("config", GA_TRACKING_ID, { page_path: url });
};

export const event = ({
  action,
  category,
  label,
  value,
  ...rest
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}) => {
  if (!GA_TRACKING_ID || typeof window === "undefined") return;
  const gtag = getGtag();
  if (!gtag) return;

  gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
    ...rest,
  });
};
