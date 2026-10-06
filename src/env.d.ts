/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** "fixture" (default) | "payload" — see src/lib/content/adapter.ts */
  readonly CONTENT_SOURCE?: "fixture" | "payload";
  /** Base URL of the Payload CMS instance; required when CONTENT_SOURCE=payload. */
  readonly PAYLOAD_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
