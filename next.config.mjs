/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      // O antigo painel público de leads foi integrado no painel protegido.
      { source: "/dashboard", destination: "/admin/leads", permanent: true },
      { source: "/admin/cadastrar", destination: "/admin/login", permanent: true },
    ];
  },
};

export default nextConfig;
