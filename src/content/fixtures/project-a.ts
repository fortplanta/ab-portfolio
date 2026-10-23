import type { Project } from "@/lib/content/types";

/** Fixture data — see note in project-c.ts. */
export const projectA: Project = {
  id: "fixture-project-a",
  slug: "project-a",
  client: "Fixture Client A",
  title: "Identity, Website, Campaign",
  shortDescription: "Five sections spanning a very short outro and a tall image grid.",
  role: ["Brand Identity", "Web Design", "Campaign"],
  year: 2026,
  displayOrder: 1,
  status: "published",
  isFeatured: true,
  sections: [
    {
      id: "project-a-hero",
      type: "hero",
      isFullScreen: true,
      navContrast: "dark",
      heading: "Project A",
      media: {
        src: "/fixtures-media/hero-a.svg",
        alt: "Placeholder hero image for Project A",
        width: 1600,
        height: 900,
        fit: "cover",
      },
    },
    {
      id: "project-a-identity",
      type: "image",
      isFullScreen: false,
      navContrast: "light",
      heading: "Identity",
      caption: "Natural height, slightly taller than one viewport.",
      media: {
        src: "/fixtures-media/image-a-identity.svg",
        alt: "Placeholder identity image for Project A",
        width: 1440,
        height: 1080,
        fit: "cover",
      },
    },
    {
      id: "project-a-website",
      type: "image",
      isFullScreen: false,
      navContrast: "light",
      heading: "Website",
      caption: "Natural height, roughly one viewport.",
      media: {
        src: "/fixtures-media/image-a-website.svg",
        alt: "Placeholder website image for Project A",
        width: 1440,
        height: 900,
        fit: "cover",
      },
    },
    {
      id: "project-a-campaign",
      type: "image-grid",
      isFullScreen: false,
      navContrast: "dark",
      heading: "Campaign",
      items: [
        {
          media: {
            src: "/fixtures-media/grid-a-1.svg",
            alt: "Placeholder campaign image 1 for Project A",
            width: 720,
            height: 620,
          },
        },
        {
          media: {
            src: "/fixtures-media/grid-a-2.svg",
            alt: "Placeholder campaign image 2 for Project A",
            width: 720,
            height: 620,
          },
        },
        {
          media: {
            src: "/fixtures-media/grid-a-3.svg",
            alt: "Placeholder campaign image 3 for Project A",
            width: 720,
            height: 620,
          },
        },
        {
          media: {
            src: "/fixtures-media/grid-a-4.svg",
            alt: "Placeholder campaign image 4 for Project A",
            width: 720,
            height: 620,
          },
        },
      ],
    },
    {
      id: "project-a-outro",
      type: "text",
      isFullScreen: false,
      navContrast: "light",
      heading: "Credits",
      body: "A deliberately short section — under one viewport — to prove the active-line algorithm handles sections on both ends of the height spectrum.",
    },
  ],
};
