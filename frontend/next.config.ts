import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // No ambiente local, envia para a porta 3333 do backend.
        // No Docker/Deploy, usa a API_URL que pode ser passada no runtime (e não no build).
        destination: `${process.env.API_URL || 'http://localhost:3333'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
