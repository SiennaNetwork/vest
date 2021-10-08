require('dotenv').config({ path: `./.env.${process.env.ENVIRON}` });

const webpack = require('webpack');

module.exports = {
  webpack: (config) => {
    config.plugins.push(new webpack.EnvironmentPlugin(process.env));
    return config;
  },
};
