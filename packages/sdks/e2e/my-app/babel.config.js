module.exports = function (api) {
  console.log('inside babel.config.js');

  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'transform-inline-environment-variables',
        { exclude: ['EXPO_ROUTER_APP_ROOT'] },
      ],
    ],
  };
};
