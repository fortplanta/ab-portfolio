import { withPayload } from '@payloadcms/next'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests from the Astro dev server
  allowedDevOrigins: ['localhost:4321'],
}

export default withPayload(nextConfig)
