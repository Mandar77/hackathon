require('dotenv').config();

module.exports = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  env: {
    GMI_API_TOKEN: process.env.GMI_API_TOKEN,
  },
};
