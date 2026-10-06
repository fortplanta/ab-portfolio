import type { Project } from "@/lib/content/types";
import { createFixtureAdapter } from "@/lib/content/fixture-adapter";
import { createPayloadAdapter } from "@/lib/content/payload-adapter";

export interface GetProjectsOptions {
  includeDrafts?: boolean;
}

export interface ContentAdapter {
  getProjects(opts?: GetProjectsOptions): Promise<Project[]>;
  getProjectBySlug(slug: string): Promise<Project | null>;
}

let cachedAdapter: ContentAdapter | undefined;

export function getAdapter(): ContentAdapter {
  if (cachedAdapter) return cachedAdapter;

  const source = import.meta.env.CONTENT_SOURCE ?? "fixture";

  switch (source) {
    case "payload": {
      const baseUrl = import.meta.env.PAYLOAD_API_URL;
      if (!baseUrl) {
        throw new Error(
          "CONTENT_SOURCE=payload requires PAYLOAD_API_URL to be set (see .env.example)",
        );
      }
      cachedAdapter = createPayloadAdapter({ baseUrl });
      return cachedAdapter;
    }
    case "fixture":
    default:
      cachedAdapter = createFixtureAdapter();
      return cachedAdapter;
  }
}
