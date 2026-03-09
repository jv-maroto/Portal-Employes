const path = require('path');

module.exports = {
  webpack: function override(config, env) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
  jest: function(config) {
    config.moduleNameMapper = {
      ...config.moduleNameMapper,
      '^@/(.*)$': '<rootDir>/src/$1',
    };
    config.transformIgnorePatterns = [
      'node_modules/(?!(axios|date-fns)/)',
    ];
    return config;
  },
};
