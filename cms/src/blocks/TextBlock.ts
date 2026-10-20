import type { Block } from 'payload'
import { navContrastField, layoutField } from './shared'

export const TextBlock: Block = {
  slug: 'text',
  labels: { singular: 'Text', plural: 'Text Sections' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'textarea' },
    { name: 'isFullScreen', type: 'checkbox', defaultValue: false },
    navContrastField,
    layoutField,
  ],
}
