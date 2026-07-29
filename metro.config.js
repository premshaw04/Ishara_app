const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const config = getDefaultConfig(__dirname);

// Tell React Native to completely ignore the backend folder so it doesn't crash the bundler
config.resolver.blockList = exclusionList([
  /backend\/.*/
]);

module.exports = config;
