import type { Project } from "@/lib/content/types";

/** Fixture data — see note in project-c.ts. */
export const projectB: Project = {
  id: "fixture-project-b",
  slug: "project-b",
  client: "Fixture Client B",
  title: "Hero, Image, Tall Video",
  shortDescription: "Three sections, the last one deliberately taller than one viewport.",
  role: ["Photography", "Direction"],
  year: 2025,
  displayOrder: 2,
  status: "published",
  sections: [
    {
      id: "project-b-hero",
      type: "hero",
      isFullScreen: true,
      navContrast: "light",
      heading: "Project B",
      media: {
        src: "/fixtures-media/hero-b.svg",
        alt: "Placeholder hero image for Project B",
        width: 1600,
        height: 900,
        fit: "cover",
      },
    },
    {
      id: "project-b-image",
      type: "image",
      isFullScreen: false,
      navContrast: "dark",
      heading: "Photography",
      caption: "A natural-height image section, roughly one viewport tall.",
      media: {
        src: "/fixtures-media/image-b.svg",
        alt: "Placeholder photography image for Project B",
        width: 1440,
        height: 900,
        fit: "cover",
      },
    },
    {
      id: "project-b-video",
      type: "video",
      isFullScreen: false,
      navContrast: "dark",
      heading: "Reel",
      body: "This section is deliberately taller than one viewport: a video, a heading, and enough body copy to push the section's natural height past 100vh, so we can verify scroll-snap doesn't trap the user partway through it.\n\nKeep scrolling — the next project should still feel reachable without the page snapping back.",
      caption: "Placeholder poster; the video src intentionally does not resolve yet (fixture mode).",
      media: {
        src: "/fixtures-media/placeholder-reel.mp4",
        alt: "Placeholder video reel for Project B",
        width: 1440,
        height: 810,
        fit: "cover",
        poster: {
          src: "/fixtures-media/video-b-poster.svg",
          alt: "Placeholder poster frame for Project B's reel",
          width: 1440,
          height: 810,
        },
      },
    },
  ],
};
