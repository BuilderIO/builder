// process.env.EXPO_ROUTER_APP_ROOT = __dirname + '/app';
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
