import type { Block } from 'payload'
import { navContrastField, layoutField } from './shared'

export const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'textarea' },
    { name: 'isFullScreen', type: 'checkbox', defaultValue: false },
    navContrastField,
    layoutField,
    { name: 'media', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'mobileMedia',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional: shown instead of media on screens narrower than 768px' },
    },
    { name: 'caption', type: 'text' },
  ],
}
