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
      name: 'showControls',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Off (default): video autoplays looped and muted — ambient / atmospheric. On: standard video player with controls and audio.',
      },
    },
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
      admin: { description: 'Still image shown before the video plays (required when controls are on)' },
    },
    { name: 'caption', type: 'text' },
  ],
}
