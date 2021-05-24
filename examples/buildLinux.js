const { LLVM_Linux } = require('../lib');

const target = 'arm64-linux-gnu';

class linux_executable extends LLVM_Linux {
  target = target;
  files = ['src/main.c'];
  ldflags = super.ldflags.concat([
    `-B${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
    `-L${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
  ]);
}

class linux_static extends LLVM_Linux {
  target = target;
  type = 'static';
  files = ['src/lib.cpp'];
}
class linux_static_executable extends LLVM_Linux {
  target = target;
  files = ['src/libmain.cpp'];
  libs = [linux_static];
  ldflags = super.ldflags.concat([
    `-B${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
    `-L${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
  ]);
}

class linux_shared extends LLVM_Linux {
  target = target;
  type = 'shared';
  files = ['src/dll.cpp'];
  shflags = super.shflags.concat([
    `-B${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
    `-L${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
  ]);
}
class linux_shared_executable extends LLVM_Linux {
  target = target;
  files = ['src/dllmain.cpp'];
  libs = [linux_shared];
  ldflags = super.ldflags.concat([
    `-B${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
    `-L${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
    `-Wl,-rpath='$ORIGIN'`,
  ]);
}

module.exports = {
  targets: [
    linux_executable,
    linux_static,
    linux_static_executable,
    linux_shared,
    linux_shared_executable,
  ],
};
