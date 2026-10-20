import type { Field } from 'payload'

export const navContrastField: Field = {
  name: 'navContrast',
  type: 'select',
  required: true,
  defaultValue: 'light',
  options: [
    { label: 'Light — dark nav text (over bright sections)', value: 'light' },
    { label: 'Dark — light nav text (over dark sections)', value: 'dark' },
  ],
}

export const layoutField: Field = {
  name: 'layout',
  type: 'select',
  options: [
    { label: 'Default', value: 'default' },
    { label: 'Split', value: 'split' },
    { label: 'Centered', value: 'centered' },
    { label: 'Full Bleed', value: 'full-bleed' },
  ],
}
