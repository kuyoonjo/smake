const { NODE_ADDON_Linux } = require('../lib');

class linux_node_addon extends NODE_ADDON_Linux {
  target = 'arm64-linux-gnu';
  sysIncludedirs = [
    `${this.sysroot}/opt/devtoolset-7/root/usr/include/c++/7`,
    `${this.sysroot}/opt/devtoolset-7/root/usr/include/c++/7/aarch64-redhat-linux`,
  ];
  includedirs = [
    ...super.includedirs,
    '../node_modules/nan',
    '../node_modules/node-addon-api',
  ];
  files = ['src/addon.cc', 'src/Greeter.cc'];
  shflags = super.shflags.concat([
    `-B${this.sysroot}/opt/devtoolset-7/root/usr/lib/gcc/aarch64-redhat-linux/7`,
    `-L${this.sysroot}/opt/devtoolset-7/root/usr/lib/gcc/aarch64-redhat-linux/7`,
  ]);
}

class linux_node_addon_x86_64 extends NODE_ADDON_Linux {
  sysIncludedirs = [
    `${this.sysroot}/opt/devtoolset-7/root/usr/include/c++/7`,
    `${this.sysroot}/opt/devtoolset-7/root/usr/include/c++/7/x86_64-redhat-linux`,
  ];
  includedirs = [
    ...super.includedirs,
    '../node_modules/nan',
    '../node_modules/node-addon-api',
  ];
  files = ['src/addon.cc', 'src/Greeter.cc'];
  shflags = super.shflags.concat([
    `-B${this.sysroot}/opt/devtoolset-7/root/usr/lib/gcc/x86_64-redhat-linux/7`,
    `-L${this.sysroot}/opt/devtoolset-7/root/usr/lib/gcc/x86_64-redhat-linux/7`,
  ]);
}

class linux_node_addon_arm extends NODE_ADDON_Linux {
  target = 'arm-linux-gnueabihf';
  sysIncludedirs = [
    // `${this.sysroot}/usr/include/c++/7`,
    `${this.sysroot}/usr/include/arm-linux-gnueabihf`,
  ];
  includedirs = [
    ...super.includedirs,
    '../node_modules/nan',
    '../node_modules/node-addon-api',
  ];
  files = ['src/addon.cc', 'src/Greeter.cc'];
  shflags = super.shflags.concat([
    // `-B${this.sysroot}/opt/devtoolset-7/root/usr/lib/gcc/aarch64-redhat-linux/7`,
    // `-L${this.sysroot}/opt/devtoolset-7/root/usr/lib/gcc/aarch64-redhat-linux/7`,
  ]);
}

module.exports = {
  targets:[
    // linux_node_addon,
    // linux_node_addon_x86_64,
    linux_node_addon_arm,
  ],
};
