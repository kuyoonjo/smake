const { run, LLVM_Linux } = require('../lib');

const prefix = '/opt/homebrew/opt/llvm/bin/';
const target = 'arm64-linux-gnu';
sysroot = '/Users/yu/Projects/coreaiot/sysroots/centos7';

class linux_executable extends LLVM_Linux {
  prefix = prefix;
  target = target;
  sysroot = sysroot;
  files = ['src/main.c'];
  ldflags = super.ldflags.concat([
    `-B${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
    `-L${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
  ]);
}

class linux_static extends LLVM_Linux {
  prefix = prefix;
  target = target;
  sysroot = sysroot;
  type = 'static';
  files = ['src/lib.cpp'];
}
class linux_static_executable extends LLVM_Linux {
  prefix = prefix;
  target = target;
  sysroot = sysroot;
  files = ['src/libmain.cpp'];
  libs = [linux_static];
  ldflags = super.ldflags.concat([
    `-B${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
    `-L${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
  ]);
}

class linux_shared extends LLVM_Linux {
  prefix = prefix;
  target = target;
  sysroot = sysroot;
  type = 'shared';
  files = ['src/dll.cpp'];
  shflags = super.shflags.concat([
    `-B${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
    `-L${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
  ]);
}
class linux_shared_executable extends LLVM_Linux {
  prefix = prefix;
  target = target;
  sysroot = sysroot;
  files = ['src/dllmain.cpp'];
  libs = [linux_shared];
  ldflags = super.ldflags.concat([
    `-B${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
    `-L${this.sysroot}/opt/usr/lib/gcc/aarch64-redhat-linux/7`,
    `-Wl,-rpath='$ORIGIN'`,
  ]);
}

run([
  linux_executable,
  linux_static,
  linux_static_executable,
  linux_shared,
  linux_shared_executable,
], process.argv.slice(2));