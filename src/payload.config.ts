import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Activities } from "./collections/Activities";
import { Articles } from "./collections/Articles";
import { Channels } from "./collections/Channels";
import { Contacts } from "./collections/Contacts";
import { Leads } from "./collections/Leads";
import { Media } from "./collections/Media";
import { Messages } from "./collections/Messages";
import { Properties } from "./collections/Properties";
import { Tasks } from "./collections/Tasks";
import { Users } from "./collections/Users";
import { SiteSettings } from "./globals/SiteSettings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Fail closed: in production these MUST be set. Falling back to "" would sign
// auth tokens with an empty secret (forgeable admin sessions) or connect to no
// database — a missing-config bug that must crash the boot, not run silently.
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;
if (process.env.NODE_ENV === "production") {
  if (!PAYLOAD_SECRET) throw new Error("PAYLOAD_SECRET is required in production");
  if (!DATABASE_URL) throw new Error("DATABASE_URL is required in production");
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: "· Avento admin" },
  },
  collections: [
    // CRM — unified inbox
    Leads,
    Contacts,
    Messages,
    Activities,
    Tasks,
    Channels,
    // Catalog / site content (kept from the skeleton for now)
    Properties,
    Articles,
    Media,
    Users,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  // Bilingual catalog: content is entered per-locale to match the RU/EN site.
  localization: {
    locales: [
      { label: "Русский", code: "ru" },
      { label: "English", code: "en" },
    ],
    defaultLocale: "ru",
  },
  secret: PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: DATABASE_URL || "" },
  }),
  sharp,
  plugins: [
    // On Vercel the filesystem is read-only, so property photos go to Vercel
    // Blob. Locally (no token) Payload falls back to disk uploads.
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            enabled: true,
            collections: { media: true },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
});
