const { run, NODE_ADDON_Win32 } = require('../lib');

const prefix = '/opt/homebrew/opt/llvm/bin/';
const ARCH = 'x86_64';
const MSVC_PATH = '/Users/yu/Toolchains/MSVC/VC';
const MSVC_VERSION = '1928';
const WINDOWS_KITS_10_PATH = '/Users/yu/Toolchains/MSVC/Kits/10';
const WINDOWS_KITS_10_VERSION = '10.0.19041.0';

class win32_node_addon extends NODE_ADDON_Win32 {
  prefix = prefix;
  ARCH = ARCH;
  MSVC_PATH = MSVC_PATH;
  MSVC_VERSION = MSVC_VERSION;
  WINDOWS_KITS_10_PATH = WINDOWS_KITS_10_PATH;
  WINDOWS_KITS_10_VERSION = WINDOWS_KITS_10_VERSION;
  includedirs = [
    ...super.includedirs,
    '../node_modules/nan',
    '../node_modules/node-addon-api',
  ];
  files = ['src/addon.cc', 'src/Greeter.cc'];
}

run([
  win32_node_addon,
], process.argv.slice(2));