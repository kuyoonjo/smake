const { run, NODE_ADDON_Linux } = require('../lib');

const prefix = '/opt/homebrew/opt/llvm/bin/';
const target = 'arm64-linux-gnu';
sysroot = '/Users/yu/Projects/coreaiot/sysroots/centos7';

class linux_node_addon extends NODE_ADDON_Linux {
  prefix = prefix;
  target = target;
  sysroot = sysroot;
  sysIncludedirs = [
    `${this.sysroot}/opt/usr/include/c++/7`,
    `${this.sysroot}/opt/usr/include/c++/7/aarch64-redhat-linux`,
  ];
  includedirs = [
    ...super.includedirs,
    '../node_modules/nan',
    '../node_modules/node-addon-api',
  ];
  files = ['src/addon.cc', 'src/Greeter.cc'];
  shflags = super.shflags.concat([
    `-B${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
    `-L${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
  ]);
}

run([
  linux_node_addon,
], process.argv.slice(2));