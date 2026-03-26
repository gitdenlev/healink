export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID ?? "";

declare global {
  interface Window {
    gtag: any;
  }
}

export const pageview = (url: string) => {
  if (!GA_TRACKING_ID || typeof window === "undefined") return;
  window.gtag("config", GA_TRACKING_ID, { page_path: url });
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
  [key: string]: any;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value,
      ...rest,
    });
  }
};
