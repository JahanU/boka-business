const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// date-fns v4 ships ESM/CJS with package exports; enable Metro to read them.
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['require', 'default', 'node'];

module.exports = config;
