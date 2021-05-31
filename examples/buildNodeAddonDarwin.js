const { NODE_ADDON_Darwin } = require('../lib');

class darwin_node_addon extends NODE_ADDON_Darwin {
  ARCH = 'arm64';
  includedirs = [
    ...super.includedirs,
    '../node_modules/nan',
    '../node_modules/node-addon-api',
  ];
  files = ['src/addon.cc', 'src/Greeter.cc'];
}

class darwin_node_addon_x86_64 extends NODE_ADDON_Darwin {
  ARCH = 'x86_64';
  includedirs = [
    ...super.includedirs,
    '../node_modules/nan',
    '../node_modules/node-addon-api',
  ];
  files = ['src/addon.cc', 'src/Greeter.cc'];
}

class darwin_node_addon_electron extends NODE_ADDON_Darwin {
  NODE_TYPE = 'electron';
  NODE_VERSION = 'v12.0.2';
  ARCH = 'arm64';
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
    darwin_node_addon_x86_64,
    darwin_node_addon_electron,
  ],
};
