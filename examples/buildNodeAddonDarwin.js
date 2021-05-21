const { homedir } = require('os');
const { run, NODE_ADDON_Darwin } = require('../lib');

const prefix = '/opt/homebrew/opt/llvm/bin/';
const ARCH = 'arm64';

class darwin_node_addon extends NODE_ADDON_Darwin {
  prefix = prefix;
  ARCH = ARCH;
  includedirs = [
    ...super.includedirs,
    '../node_modules/nan',
    '../node_modules/node-addon-api',
  ];
  files = ['src/addon.cc', 'src/Greeter.cc'];
}

run([
  darwin_node_addon,
], process.argv.slice(2));