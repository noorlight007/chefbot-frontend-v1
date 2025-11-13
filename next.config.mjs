import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.cache = false; // Disable cache
    config.infrastructureLogging = { level: "verbose" };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "194.164.77.123",
      },
      {
        protocol: "https",
        hostname: "api.chef-bot.de",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
