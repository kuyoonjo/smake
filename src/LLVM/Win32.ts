import { rmSync } from 'fs';
import { join } from 'path';
import { LLVM } from './LLVM';

export abstract class LLVM_Win32 extends LLVM {
  get MSVC_VERSION() {
    return process.env.SMAKE_LLVM_MSVC_VERSION;
  }
  get MSVC_PATH() {
    return process.env.SMAKE_LLVM_MSVC_PATH;
  }
  get WINDOWS_KITS_10_PATH() {
    return process.env.SMAKE_LLVM_WINDOWS_KITS_10_PATH;
  }
  get WINDOWS_KITS_10_VERSION() {
    return process.env.SMAKE_LLVM_WINDOWS_KITS_10_VERSION;
  }

  get ARCH() {
    return 'x86_64';
  }
  get target() {
    switch (this.ARCH) {
      case 'x86_64':
        return 'x86_64-pc-windows-msvc';
      case 'i386':
        return 'i386-pc-win32';
      default:
        return '';
    }
  }
  get name() {
    return 'Win32 LLVM Builder';
  }

  get sysIncludedirs() {
    return [
      `${this.MSVC_PATH}/include`,
      `${this.WINDOWS_KITS_10_PATH}/Include/${this.WINDOWS_KITS_10_VERSION}/ucrt`,
      `${this.WINDOWS_KITS_10_PATH}/Include/${this.WINDOWS_KITS_10_VERSION}/um`,
      `${this.WINDOWS_KITS_10_PATH}/Include/${this.WINDOWS_KITS_10_VERSION}/shared`,
    ];
  }

  get linkdirs() {
    const dir = this.ARCH === 'x86_64' ? 'x64' : 'x86';
    return [
      ...super.linkdirs,
      `${this.MSVC_PATH}/lib/${dir}`,
      `${this.WINDOWS_KITS_10_PATH}/Lib/${this.WINDOWS_KITS_10_VERSION}/ucrt/${dir}`,
      `${this.WINDOWS_KITS_10_PATH}/Lib/${this.WINDOWS_KITS_10_VERSION}/um/${dir}`,
    ];
  }

  get cxflags() {
    const mflag = this.ARCH === 'x86_64' ? '-m64' : '-m32';
    const flags = [
      mflag,
      '-Qunused-arguments',
      `-fmsc-version=${this.MSVC_VERSION}`,
      '-fms-extensions',
      '-fms-compatibility',
      '-fdelayed-template-parsing',
      '-DWIN32',
      '-D_WINDOWS',
    ];
    if (this.type === 'executable')
      flags.push('-fvisibility=hidden  -fvisibility-inlines-hidden');
    return flags;
  }

  get executableOutSuffix() {
    return '.exe';
  }
  get ldflags() {
    const mflag = this.ARCH === 'x86_64' ? '-m64' : '-m32';
    const flags = ['-fuse-ld=lld', `-target ${this.target}`, mflag];
    return flags;
  }

  get sharedOutPrefix() {
    return '';
  }
  get sharedOutSuffix() {
    return '.dll';
  }
  get shflags() {
    const mflag = this.ARCH === 'x86_64' ? '-m64' : '-m32';
    const flags = ['-shared', '-fuse-ld=lld', `-target ${this.target}`, mflag];
    return flags;
  }

  get staticOutPrefix() {
    return '';
  }
  get staticOutSuffix() {
    return '.lib';
  }

  async clean() {
    await super.clean();
    if (this.type === 'shared')
      rmSync(
        join(
          this.buildDir,
          this.sharedOutPrefix + this.outputFileBasename + '.lib'
        ),
        {
          force: true,
        }
      );
  }
}
