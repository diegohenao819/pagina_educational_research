import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Asegura que data/students.json viaje con la función serverless cuando
  // se usa el respaldo en archivo en lugar de la variable de entorno.
  outputFileTracingIncludes: {
    "/api/lookup": ["./data/students.json"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
