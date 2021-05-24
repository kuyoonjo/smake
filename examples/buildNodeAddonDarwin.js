const { NODE_ADDON_Darwin } = require('../lib');

const ARCH = 'arm64';

class darwin_node_addon extends NODE_ADDON_Darwin {
  ARCH = ARCH;
  includedirs = [
    ...super.includedirs,
    '../node_modules/nan',
    '../node_modules/node-addon-api',
  ];
  files = ['src/addon.cc', 'src/Greeter.cc'];
}

module.exports = {
  targets:[
    darwin_node_addon,
  ],
};
