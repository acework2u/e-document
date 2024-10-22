const webpack = require("webpack");

module.exports = (config, env) => {
  const containerEnv = Object.keys(process.env).reduce((acc, curr) => {
    acc[`process.env.${curr}`] = JSON.stringify(process.env[curr]);
    return acc;
  }, {});

  config.plugins.push(new webpack.DefinePlugin(containerEnv));

  return config;
};
