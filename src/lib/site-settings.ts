import "server-only";

import config from "@payload-config";
import { getPayload } from "payload";
import { cache } from "react";

/**
 * Reads the admin `settings` global (see globals/SiteSettings). Memoized per
 * request with React `cache` so the layout + page share one query. Reading it
 * makes the marketing pages render on demand, so an admin toggle takes effect
 * immediately (no cache to wait out). Fails closed (hidden) if the DB is down.
 */
export const getSiteSettings = cache(
  async (): Promise<{ showCatalog: boolean }> => {
    try {
      const payload = await getPayload({ config });
      const s = await payload.findGlobal({ slug: "settings" });
      return {
        showCatalog: Boolean((s as { showCatalog?: boolean })?.showCatalog),
      };
    } catch {
      return { showCatalog: false };
    }
  },
);
