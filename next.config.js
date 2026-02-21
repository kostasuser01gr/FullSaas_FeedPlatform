/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow external image domains for post images & avatars
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },

  // Strict mode for dev
  reactStrictMode: true,

  // Serverless function config for Vercel
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Knex bundles all dialects; tell webpack not to resolve unused ones
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "pg-native": "commonjs pg-native",
        "pg-query-stream": "commonjs pg-query-stream",
        oracledb: "commonjs oracledb",
        "better-sqlite3": "commonjs better-sqlite3",
        sqlite3: "commonjs sqlite3",
        tedious: "commonjs tedious",
        mysql: "commonjs mysql",
        mysql2: "commonjs mysql2",
      });
    }
    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
