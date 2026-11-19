import type { Project } from "@/lib/content/types";

/** Placeholder — replace the hero, sections, role and year once the Tangent Technologies assets arrive. */
export const projectTangent: Project = {
  id: "fixture-project-tangent",
  slug: "tangent-technologies",
  client: "Tangent Technologies",
  title: "Tangent Technologies",
  shortDescription: "Placeholder — assets to come.",
  role: ["TBD"],
  year: 2025,
  displayOrder: 3,
  status: "published",
  isFeatured: true,
  sections: [
    {
      id: "tangent-hero",
      type: "hero",
      isFullScreen: true,
      navContrast: "light",
      heading: "Tangent Technologies",
      media: {
        src: "/fixtures-media/hero-c.svg",
        alt: "Placeholder hero image for Tangent Technologies",
        width: 1600,
        height: 900,
        fit: "cover",
      },
    },
  ],
};
