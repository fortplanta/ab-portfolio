import type { ContentAdapter, GetProjectsOptions } from "@/lib/content/adapter";
import type {
  FocalPoint,
  ImageFit,
  MediaRef,
  Project,
  Section,
  VideoMediaRef,
} from "@/lib/content/types";
import { validateProject } from "@/lib/validate";

/**
 * Talks to a Payload CMS instance's REST API. Written against Payload's
 * documented REST conventions (payloadcms.com/docs/rest-api), but NOT
 * verified against a live instance — none exists yet (CONTENT_SOURCE stays
 * "fixture" until one does). The one assumption baked in throughout this
 * file: a "projects" collection whose fields mirror this project's content
 * model (src/lib/content/types.ts) directly, with an ordered "sections"
 * field using Payload's `blocks` field type (one block per section type:
 * hero/image/video/text/image-grid), where each block's `blockType`
 * matches our `Section["type"]` values. If the real collection schema ends
 * up different, mapPayloadDocToProject is the one place that needs to
 * change — nothing else in the app knows Payload's shape.
 */

interface PayloadMediaDoc {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface PayloadConfig {
  baseUrl: string;
}

function mapMedia(doc: PayloadMediaDoc, fit?: ImageFit, focalPoint?: FocalPoint): MediaRef {
  return {
    src: doc.url,
    alt: doc.alt ?? "",
    width: doc.width ?? 0,
    height: doc.height ?? 0,
    fit,
    focalPoint,
  };
}

function mapVideoMedia(doc: PayloadMediaDoc, posterDoc: PayloadMediaDoc): VideoMediaRef {
  return {
    ...mapMedia(doc),
    poster: mapMedia(posterDoc),
  };
}

function mapSectionBlock(block: any): Section {
  const base = {
    id: block.id,
    heading: block.heading || undefined,
    body: block.body || undefined,
    isFullScreen: Boolean(block.isFullScreen),
    navContrast: block.navContrast === "dark" ? "dark" : "light",
    layout: block.layout || undefined,
  } as const;

  switch (block.blockType) {
    case "hero":
      return { ...base, type: "hero", media: mapMedia(block.media) };
    case "image":
      return {
        ...base,
        type: "image",
        media: mapMedia(block.media),
        caption: block.caption || undefined,
      };
    case "video":
      return {
        ...base,
        type: "video",
        media: mapVideoMedia(block.media, block.poster),
        caption: block.caption || undefined,
      };
    case "text":
      return { ...base, type: "text" };
    case "image-grid":
      return {
        ...base,
        type: "image-grid",
        items: (block.items ?? []).map((item: { media: PayloadMediaDoc; caption?: string }) => ({
          media: mapMedia(item.media),
          caption: item.caption || undefined,
        })),
      };
    default:
      throw new Error(`Unknown Payload block type: ${block.blockType}`);
  }
}

function mapPayloadDocToProject(doc: any): Project {
  return {
    id: doc.id,
    slug: doc.slug,
    client: doc.client,
    title: doc.title,
    shortDescription: doc.shortDescription,
    role: doc.role ?? [],
    year: doc.year,
    displayOrder: doc.displayOrder,
    status: doc._status === "published" ? "published" : "draft",
    sections: (doc.sections ?? []).map(mapSectionBlock),
  };
}

export function createPayloadAdapter(config: PayloadConfig): ContentAdapter {
  async function fetchDocs(includeDrafts: boolean): Promise<unknown[]> {
    const where = includeDrafts ? "" : "&where[_status][equals]=published";
    const res = await fetch(
      `${config.baseUrl}/api/projects?depth=2&limit=100&sort=displayOrder${where}`,
    );
    if (!res.ok) {
      throw new Error(`Payload fetch failed: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    return json.docs ?? [];
  }

  return {
    async getProjects(opts: GetProjectsOptions = {}): Promise<Project[]> {
      const docs = await fetchDocs(opts.includeDrafts ?? false);
      return docs.map((doc) => validateProject(mapPayloadDocToProject(doc)));
    },
    async getProjectBySlug(slug: string): Promise<Project | null> {
      const res = await fetch(
        `${config.baseUrl}/api/projects?where[slug][equals]=${encodeURIComponent(slug)}&depth=2&limit=1`,
      );
      if (!res.ok) {
        throw new Error(`Payload fetch failed: ${res.status} ${res.statusText}`);
      }
      const json = await res.json();
      const doc = json.docs?.[0];
      return doc ? validateProject(mapPayloadDocToProject(doc)) : null;
    },
  };
}
