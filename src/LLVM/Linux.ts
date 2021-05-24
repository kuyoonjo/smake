import { LLVM } from './LLVM';

export abstract class LLVM_Linux extends LLVM {
  get sysroot() {
    return process.env[
      'SMAKE_LLVM_SYSROOT_' + this.target.toUpperCase().replace(/-/g, '_')
    ];
  }
  get target() {
    return 'x86_64-linux-gnu';
  }
  get name() {
    return 'Darwin LLVM Builder';
  }
  get cxflags() {
    const flags = [`--sysroot ${this.sysroot}`, '-Qunused-arguments'];
    if (this.type === 'shared') flags.push('-fPIC');
    else if (this.type === 'executable')
      flags.push('-fvisibility=hidden  -fvisibility-inlines-hidden');
    return flags;
  }

  get ldflags() {
    return [
      `--sysroot ${this.sysroot}`,
      '-fuse-ld=lld',
      `-target ${this.target}`,
    ];
  }

  get shflags() {
    return [
      `--sysroot ${this.sysroot}`,
      '-fuse-ld=lld',
      `-target ${this.target}`,
      '-fPIC',
      '-shared',
    ];
  }
}
