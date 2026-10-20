import type { Block } from 'payload'
import { navContrastField, layoutField } from './shared'

export const ImageGridBlock: Block = {
  slug: 'image-grid',
  labels: { singular: 'Image Grid', plural: 'Image Grids' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'textarea' },
    { name: 'isFullScreen', type: 'checkbox', defaultValue: false },
    navContrastField,
    layoutField,
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'media', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
  ],
}
