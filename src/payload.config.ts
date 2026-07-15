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
import { Users } from "./collections/Users";
import { SiteSettings } from "./globals/SiteSettings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

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
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "" },
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
