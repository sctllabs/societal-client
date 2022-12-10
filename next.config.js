const path = require('path');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

console.log(path.join(__dirname, 'icons'));
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, context) => {
    config.module.rules.push({
      test: /\.svg$/i,
      include: path.join(__dirname, 'icons'),
      use: [
        {
          loader: 'svg-sprite-loader',
          options: {
            extract: true,
            outputPath: 'static/',
            publicPath: '_next/static/',
            esModule: false
          }
        }
      ]
    });

    config.module.rules.push({
      test: /\.svg$/i,
      include: path.join(__dirname, 'public', 'images'),
      use: [
        {
          loader: '@svgr/webpack',
          // https://react-svgr.com/docs/options/
          options: {
            prettier: false,
            svgo: true,
            titleProp: true,
            svgoConfig: {
              plugins: [
                {
                  name: 'removeViewBox',
                  active: false
                },
                {
                  name: 'prefixIds',
                  active: false
                }
              ]
            }
          }
        },
        {
          loader: 'url-loader'
        }
      ]
    });

    config.plugins.push(new SpriteLoaderPlugin());

    return config;
  }
};

module.exports = nextConfig;
