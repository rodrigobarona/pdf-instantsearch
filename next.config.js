/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the i18n config as we're using middleware for routing
  output: "standalone",
  // Add any other necessary configuration
};

module.exports = nextConfig;
