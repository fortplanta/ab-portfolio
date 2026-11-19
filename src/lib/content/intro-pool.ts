import type { MediaRef, Project } from "@/lib/content/types";

export interface IntroPoolItem {
  src: string;
  alt: string;
  /** Project slug. The client keeps at most one image per group unless `multi` is set. */
  group: string;
  multi: boolean;
}

function projectImages(project: Project): MediaRef[] {
  const images: MediaRef[] = [];
  if (project.thumbnail) images.push(project.thumbnail);
  for (const section of project.sections) {
    if (section.type === "hero" || section.type === "image") images.push(section.media);
    if (section.type === "image-grid") images.push(...section.items.map((item) => item.media));
  }
  return images;
}

/**
 * Candidate images for the intro preloader's scattered collage. The project
 * that supplies the intro's centre image is left out so it never repeats;
 * SVGs (placeholders, logos) are skipped because the collage is photographic.
 */
export function buildIntroPool(projects: Project[], excludeSlug?: string): IntroPoolItem[] {
  const seen = new Set<string>();
  const pool: IntroPoolItem[] = [];

  for (const project of projects) {
    if (project.status !== "published" || project.slug === excludeSlug) continue;
    for (const media of projectImages(project)) {
      if (media.src.toLowerCase().endsWith(".svg") || seen.has(media.src)) continue;
      seen.add(media.src);
      pool.push({
        src: media.src,
        alt: media.alt,
        group: project.slug,
        multi: Boolean(project.isCollection),
      });
    }
  }
  return pool;
}
