import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/portal/test/user_test',
        destination: '/portal/test/user-test',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
