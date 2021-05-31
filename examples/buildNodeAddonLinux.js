const { NODE_ADDON_Linux } = require('../lib');

class linux_node_addon extends NODE_ADDON_Linux {
  target = 'aarch64-linux-gnu';
  includedirs = [
    ...super.includedirs,
    '../node_modules/nan',
    '../node_modules/node-addon-api',
  ];
  files = ['src/addon.cc', 'src/Greeter.cc'];
}

class linux_node_addon_x86_64 extends NODE_ADDON_Linux {
  includedirs = [
    ...super.includedirs,
    '../node_modules/nan',
    '../node_modules/node-addon-api',
  ];
  files = ['src/addon.cc', 'src/Greeter.cc'];
}

class linux_node_addon_arm extends NODE_ADDON_Linux {
  target = 'arm-linux-gnueabihf';
  includedirs = [
    ...super.includedirs,
    '../node_modules/nan',
    '../node_modules/node-addon-api',
  ];
  files = ['src/addon.cc', 'src/Greeter.cc'];
}

class linux_node_addon_electron extends NODE_ADDON_Linux {
  NODE_TYPE = 'electron';
  NODE_VERSION = 'v12.0.2';
  target = 'aarch64-linux-gnu';
  includedirs = [
    ...super.includedirs,
    '../node_modules/nan',
    '../node_modules/node-addon-api',
  ];
  files = ['src/addon.cc', 'src/Greeter.cc'];
}

module.exports = {
  targets:[
    linux_node_addon,
    linux_node_addon_x86_64,
    linux_node_addon_arm,
    linux_node_addon_electron,
  ],
};
