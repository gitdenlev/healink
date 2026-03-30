export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID ?? "";
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<IArguments | unknown[] | Record<string, unknown>>;
  }
}

const isBrowser = () => typeof window !== "undefined";

const ensureDataLayer = () => {
  if (!isBrowser()) return null;
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
};

const pushToDataLayer = (payload: unknown[] | Record<string, unknown>) => {
  const dataLayer = ensureDataLayer();
  if (!dataLayer) return;
  dataLayer.push(payload);
};

const normalizeEventName = (name: string) => {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 40);

  if (!normalized) return "custom_event";
  return /^[a-z]/.test(normalized) ? normalized : `event_${normalized}`;
};

const getGtag = () => {
  if (!isBrowser()) return null;

  if (window.gtag) return window.gtag;
  if (GTM_ID) return null;
  if (!GA_TRACKING_ID) return null;

  return (...args: unknown[]) => {
    pushToDataLayer(args);
  };
};

export const pageview = (url: string) => {
  if (!isBrowser()) return;
  const gtag = getGtag();
  if (gtag && GA_TRACKING_ID) {
    gtag("config", GA_TRACKING_ID, { page_path: url });
    return;
  }

  if (!GTM_ID) return;
  pushToDataLayer({
    event: "page_view",
    page_path: url,
    page_location: `${window.location.origin}${url}`,
    page_title: document.title,
  });
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
  if (!isBrowser()) return;

  const gtag = getGtag();
  const eventName = normalizeEventName(action);
  const payload = {
    event_category: category,
    event_label: label,
    value,
    ...rest,
  };

  if (gtag) {
    gtag("event", eventName, payload);
    return;
  }

  if (!GTM_ID) return;
  pushToDataLayer({
    event: eventName,
    ...payload,
  });
};
