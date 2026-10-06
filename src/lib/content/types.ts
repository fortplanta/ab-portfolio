/** The nav's own treatment while this section sits under it — "dark" = dark nav text, "light" = light nav text. */
export type NavContrast = "light" | "dark";
export type PublicationStatus = "draft" | "published";
export type SectionType = "hero" | "image" | "video" | "text" | "image-grid";
export type ImageFit = "cover" | "contain";

export interface FocalPoint {
  x: number; // 0..1
  y: number; // 0..1
}

export interface MediaRef {
  src: string;
  alt: string;
  width: number;
  height: number;
  fit?: ImageFit;
  focalPoint?: FocalPoint;
}

export interface VideoMediaRef extends MediaRef {
  poster: MediaRef;
}

export type SectionLayout = "default" | "split" | "centered" | "full-bleed";

interface SectionBase {
  id: string;
  heading?: string;
  body?: string;
  isFullScreen: boolean;
  navContrast: NavContrast;
  layout?: SectionLayout;
}

export interface HeroSection extends SectionBase {
  type: "hero";
  media: MediaRef;
  mobileMedia?: MediaRef;
}

export interface ImageSection extends SectionBase {
  type: "image";
  media: MediaRef;
  mobileMedia?: MediaRef;
  caption?: string;
}

export interface VideoSection extends SectionBase {
  type: "video";
  media: VideoMediaRef;
  mobileMedia?: VideoMediaRef;
  caption?: string;
}

export interface TextSection extends SectionBase {
  type: "text";
}

export interface ImageGridItem {
  media: MediaRef;
  caption?: string;
}

export interface ImageGridSection extends SectionBase {
  type: "image-grid";
  items: ImageGridItem[];
}

export type Section =
  | HeroSection
  | ImageSection
  | VideoSection
  | TextSection
  | ImageGridSection;

export interface Project {
  id: string;
  slug: string;
  client: string;
  title: string;
  shortDescription: string;
  role: string[];
  year: number;
  displayOrder: number;
  status: PublicationStatus;
  sections: Section[];
}
