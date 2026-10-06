import type { ContentAdapter, GetProjectsOptions } from "@/lib/content/adapter";
import type { Project } from "@/lib/content/types";
import { validateProject } from "@/lib/validate";
import { projectA } from "@/content/fixtures/project-a";
import { projectB } from "@/content/fixtures/project-b";
import { projectC } from "@/content/fixtures/project-c";

export function createFixtureAdapter(): ContentAdapter {
  const all: Project[] = [projectA, projectB, projectC].map((p) => validateProject(p));

  return {
    async getProjects(opts: GetProjectsOptions = {}): Promise<Project[]> {
      const { includeDrafts = false } = opts;
      return all
        .filter((p) => includeDrafts || p.status === "published")
        .sort((a, b) => a.displayOrder - b.displayOrder);
    },
    async getProjectBySlug(slug: string): Promise<Project | null> {
      return all.find((p) => p.slug === slug) ?? null;
    },
  };
}
