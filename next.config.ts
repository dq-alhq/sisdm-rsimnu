import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb'
        }
    },
    reactCompiler: true,
    images: {
        remotePatterns: [
            { hostname: 'images.unsplash.com' },
            { hostname: 'github.com' },
            { hostname: 'cdn.dummyjson.com' },
            { hostname: '89fnasbstnmof0rn.public.blob.vercel-storage.com' },
            { hostname: 'lqp5jdof0q0s1dkl.private.blob.vercel-storage.com' }
        ]
    }
}

export default nextConfig
