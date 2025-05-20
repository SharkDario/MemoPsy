import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para TypeORM
  webpack: (config, { isServer }) => {
    // Solo para el servidor
    if (isServer) {
      config.externals.push({
        'typeorm': 'typeorm',
      });
    }
    
    // Soporte para decoradores de TypeORM
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
      emitDecoratorMetadata: true,
    };
    
    return config;
  },
  // Otras configuraciones
  serverExternalPackages: ['typeorm', 'mysql2'],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/landing.html',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

