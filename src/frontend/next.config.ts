import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  async rewrites() {
    // En producción, NEXT_PUBLIC_API_URL está definido y el cliente llama a
    // api.simplefitcr.com directamente — no se necesita ningún rewrite.
    // En desarrollo (sin NEXT_PUBLIC_API_URL), el cliente usa URLs relativas
    // (/api/...) y Next.js las reescribe aquí hacia Express en localhost:4000.
    // Esto funciona para PC y para cualquier dispositivo en la misma red local,
    // ya que el rewrite lo ejecuta el servidor Next.js (no el navegador).
    if (process.env.NEXT_PUBLIC_API_URL) return [];

    const expressUrl =
      process.env.EXPRESS_API_URL ?? "http://localhost:4000";

    return [
      {
        source: "/api/:path*",
        destination: `${expressUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
