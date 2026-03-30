"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { pageview, GA_TRACKING_ID, GTM_ID } from "@/lib/gtag";

import Script from "next/script";

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const hasGa = Boolean(GA_TRACKING_ID);
  const hasGtm = Boolean(GTM_ID);

  useEffect(() => {
    if (!hasGa && !hasGtm) return;
    const url = pathname + (searchString ? `?${searchString}` : "");
    pageview(url);
  }, [pathname, searchString, hasGa, hasGtm]);

  if (!hasGa && !hasGtm) return null;

  if (hasGtm) {
    return (
      <>
        <Script id="google-tag-manager-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
          `}
        </Script>
        <Script
          src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
          strategy="afterInteractive"
        />
      </>
    );
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            page_path: window.location.pathname,
            send_page_view: false,
          });
        `}
      </Script>
    </>
  );
}
