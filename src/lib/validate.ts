import { z } from "zod";
import type { Project } from "@/lib/content/types";

const focalPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

const mediaRefSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
  fit: z.enum(["cover", "contain"]).optional(),
  focalPoint: focalPointSchema.optional(),
});

const videoMediaRefSchema = mediaRefSchema.extend({
  poster: mediaRefSchema,
});

const sectionLayoutSchema = z.enum(["default", "split", "centered", "full-bleed"]);

const sectionBaseSchema = z.object({
  id: z.string().min(1),
  heading: z.string().optional(),
  body: z.string().optional(),
  isFullScreen: z.boolean(),
  navContrast: z.enum(["light", "dark"]),
  layout: sectionLayoutSchema.optional(),
});

const heroSectionSchema = sectionBaseSchema.extend({
  type: z.literal("hero"),
  media: mediaRefSchema,
  mobileMedia: mediaRefSchema.optional(),
});

const imageSectionSchema = sectionBaseSchema.extend({
  type: z.literal("image"),
  media: mediaRefSchema,
  mobileMedia: mediaRefSchema.optional(),
  caption: z.string().optional(),
});

const videoSectionSchema = sectionBaseSchema.extend({
  type: z.literal("video"),
  media: videoMediaRefSchema,
  mobileMedia: videoMediaRefSchema.optional(),
  caption: z.string().optional(),
});

const textSectionSchema = sectionBaseSchema.extend({
  type: z.literal("text"),
});

const imageGridSectionSchema = sectionBaseSchema.extend({
  type: z.literal("image-grid"),
  items: z
    .array(
      z.object({
        media: mediaRefSchema,
        caption: z.string().optional(),
      }),
    )
    .min(1),
});

const sectionSchema = z.discriminatedUnion("type", [
  heroSectionSchema,
  imageSectionSchema,
  videoSectionSchema,
  textSectionSchema,
  imageGridSectionSchema,
]);

const projectSchema = z.object({
  id: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be lowercase kebab-case"),
  client: z.string().min(1),
  title: z.string().min(1),
  shortDescription: z.string().min(1),
  role: z.array(z.string().min(1)).min(1),
  year: z.number().int().min(1900).max(2100),
  displayOrder: z.number().int(),
  status: z.enum(["draft", "published"]),
  sections: z.array(sectionSchema).min(1),
});

export function validateProject(raw: unknown): Project {
  const result = projectSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid project content: ${result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")}`,
    );
  }
  return result.data as Project;
}
