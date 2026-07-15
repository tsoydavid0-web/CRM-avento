import config from "@payload-config";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import type { ServerFunctionClient } from "payload";
import type React from "react";

// Pre-compiled admin stylesheet. Import explicitly because Turbopack (Next 16)
// doesn't compile the SCSS imported inside @payloadcms/ui components.
import "@payloadcms/next/css";

import { importMap } from "./admin/importMap.js";

/* Payload admin root layout (renders its own <html>). Generated boilerplate. */
type Args = { children: React.ReactNode };

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

const Layout = ({ children }: Args) => (
  <RootLayout
    config={config}
    importMap={importMap}
    serverFunction={serverFunction}
  >
    {children}
  </RootLayout>
);

export default Layout;
