const { withDangerousMod } = require('@expo/config-plugins');

const withMyVpn = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      return config;
    },
  ]);
};

module.exports = withMyVpn;
