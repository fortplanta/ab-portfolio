import type { CollectionConfig } from 'payload'
import { HeroBlock } from '../blocks/HeroBlock'
import { ImageBlock } from '../blocks/ImageBlock'
import { VideoBlock } from '../blocks/VideoBlock'
import { TextBlock } from '../blocks/TextBlock'
import { ImageGridBlock } from '../blocks/ImageGridBlock'

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'client',
    defaultColumns: ['client', 'title', 'year', 'displayOrder', '_status'],
  },
  versions: {
    drafts: { autosave: true },
  },
  fields: [
    {
      name: 'client',
      type: 'text',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Short label for this project, e.g. "Identity, Website, Campaign"' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'URL-safe identifier used as the section anchor, e.g. "autumn-collection"' },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
    },
    {
      name: 'role',
      type: 'text',
      hasMany: true,
      admin: { description: 'Services provided, e.g. Brand Identity, Web Design' },
    },
    {
      name: 'year',
      type: 'number',
      required: true,
    },
    {
      name: 'displayOrder',
      type: 'number',
      required: true,
      admin: { description: 'Lower numbers appear first on the homepage' },
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: [HeroBlock, ImageBlock, VideoBlock, TextBlock, ImageGridBlock],
    },
  ],
}
