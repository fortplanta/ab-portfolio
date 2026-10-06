import type { Project } from "@/lib/content/types";
import { createFixtureAdapter } from "@/lib/content/fixture-adapter";

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
      // Loaded dynamically so the fixture build never pays for (or requires
      // env vars for) the Payload adapter's fetch calls.
      throw new Error(
        "CONTENT_SOURCE=payload is not wired up yet — see src/lib/content/payload-adapter.ts",
      );
    }
    case "fixture":
    default:
      cachedAdapter = createFixtureAdapter();
      return cachedAdapter;
  }
}
