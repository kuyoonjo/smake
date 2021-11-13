const { NodeAddon } = require('../lib');

const node_addon = new NodeAddon('node_addon', 'arm64-apple-darwin');
node_addon.includedirs = [
  ...node_addon.includedirs,
  './node_modules/nan',
  './node_modules/node-addon-api',
];
node_addon.files = ['examples/src/addon.cc', 'examples/src/Greeter.cc'];

module.exports = [node_addon];
