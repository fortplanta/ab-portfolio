import type { Project, Section } from "@/lib/content/types";

function video(
  id: string,
  file: string,
  alt: string,
  size: { width: number; height: number },
): Section {
  const portrait = size.height > size.width;
  return {
    id,
    type: "video",
    isFullScreen: !portrait,
    navContrast: "light",
    showControls: false,
    media: { src: `/misc/${file}`, alt, ...size },
  };
}

const landscape = { width: 1920, height: 1080 };
const portrait = { width: 1920, height: 2400 };

export const projectMisc: Project = {
  id: "fixture-project-misc",
  slug: "misc",
  client: "Misc",
  title: "Odds and Ends",
  shortDescription:
    "A loose collection of motion experiments, posters and stills from various projects, in no particular order.",
  role: ["Motion", "Design"],
  year: 2024,
  displayOrder: 4,
  status: "published",
  isFeatured: false,
  isCollection: true,
  thumbnail: {
    src: "/misc/biofibertech-billboard.webp",
    alt: "Billboard in a transit station showing a BioFiberTech campaign",
    width: 2000,
    height: 1333,
  },
  sections: [
    {
      id: "misc-hero",
      type: "hero",
      isFullScreen: true,
      navContrast: "light",
      heading: "Misc",
      media: {
        src: "/misc/biofibertech-billboard.webp",
        alt: "Billboard in a transit station showing a BioFiberTech campaign",
        width: 2000,
        height: 1333,
        fit: "cover",
      },
    },
    video("misc-dior-distorted", "dior-distorted.mp4", "Distorted Dior motion piece", landscape),
    video("misc-motion-poster-1", "motion-poster-1.mp4", "Motion poster 1", portrait),
    video("misc-0001-0120", "0001-0120.mp4", "Motion render 0001–0120", landscape),
    video("misc-motion-poster-2", "motion-poster-2.mp4", "Motion poster 2", portrait),
    video("misc-ava-systems", "ava-systems-desktop.mp4", "Ava Systems desktop animation", landscape),
    video("misc-motion-poster-3", "motion-poster-3.mp4", "Motion poster 3", portrait),
    video("misc-oppo-zoomin", "oppo-zoomin.mp4", "OPPO zoom-in animation", landscape),
    video("misc-motion-poster-4", "motion-poster-4.mp4", "Motion poster 4", portrait),
  ],
};
