import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        // Optionally, you can specify port and pathname if needed
        // port: '',
        // pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
