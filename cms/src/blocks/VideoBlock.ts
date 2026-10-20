import type { Block } from 'payload'
import { navContrastField, layoutField } from './shared'

export const VideoBlock: Block = {
  slug: 'video',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'textarea' },
    { name: 'isFullScreen', type: 'checkbox', defaultValue: false },
    navContrastField,
    layoutField,
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Still image shown before the video plays' },
    },
    { name: 'caption', type: 'text' },
  ],
}
