import type { Block } from 'payload'
import { navContrastField, layoutField } from './shared'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'textarea' },
    { name: 'isFullScreen', type: 'checkbox', defaultValue: true },
    navContrastField,
    layoutField,
    { name: 'media', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'mobileMedia',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional: shown instead of media on screens narrower than 768px' },
    },
  ],
}
