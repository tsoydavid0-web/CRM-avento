"use client";

import { useEffect } from "react";

/** Registers the PWA service worker so the CRM can be installed to the home
 *  screen. No-op if the browser lacks support. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
