import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Cached Payload local-API client for use inside route handlers (intake,
 * webhooks). `getPayload` already memoizes per-process, so this is a thin,
 * typed accessor.
 */
export function getPayloadClient() {
  return getPayload({ config });
}
