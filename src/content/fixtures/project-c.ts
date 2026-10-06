import type { Project } from "@/lib/content/types";

/**
 * Fixture data — NOT real client work. Swapped for Payload CMS content via
 * src/lib/content/payload-adapter.ts once a live instance exists (see
 * CONTENT_SOURCE in .env.example).
 */
export const projectC: Project = {
  id: "fixture-project-c",
  slug: "project-c",
  client: "Fixture Client C",
  title: "One Full-Screen Showcase",
  shortDescription: "A single, full-bleed project with exactly one section.",
  role: ["Art Direction"],
  year: 2026,
  displayOrder: 3,
  status: "published",
  sections: [
    {
      id: "project-c-hero",
      type: "hero",
      isFullScreen: true,
      navContrast: "light",
      heading: "Project C",
      media: {
        src: "/fixtures-media/hero-c.svg",
        alt: "Placeholder hero image for Project C",
        width: 1600,
        height: 900,
        fit: "cover",
      },
    },
  ],
};
