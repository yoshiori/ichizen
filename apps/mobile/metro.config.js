const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable Expo Router completely
config.resolver.platforms = ['ios', 'android', 'web'];

// Override the default entry point resolution to use index.ts instead of app directory
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.assetExts = [...config.resolver.assetExts, 'bin'];

module.exports = config;