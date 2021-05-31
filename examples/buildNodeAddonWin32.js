const { NODE_ADDON_Win32 } = require('../lib');

class win32_node_addon extends NODE_ADDON_Win32 {
  includedirs = [
    ...super.includedirs,
    '../node_modules/nan',
    '../node_modules/node-addon-api',
  ];
  files = ['src/addon.cc', 'src/Greeter.cc'];
}

class win32_node_addon_electron extends NODE_ADDON_Win32 {
  NODE_TYPE = 'electron';
  NODE_VERSION = 'v12.0.2';
  includedirs = [
    ...super.includedirs,
    '../node_modules/nan',
    '../node_modules/node-addon-api',
  ];
  files = ['src/addon.cc', 'src/Greeter.cc'];
}

module.exports = {
  targets:[
    win32_node_addon,
    win32_node_addon_electron,
  ],
};
