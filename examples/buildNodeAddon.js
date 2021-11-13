const { NodeAddon } = require('../lib');

module.exports = function (target) {
  const node_addon = new NodeAddon('node_addon', target);
  node_addon.includedirs = [
    ...node_addon.includedirs,
    './node_modules/nan',
    './node_modules/node-addon-api',
  ];
  node_addon.files = ['examples/src/addon.cc', 'examples/src/Greeter.cc'];

  return node_addon;
};
