import { rmSync } from 'fs';
import { join } from '../join';
import { quote } from '../quote';
import { LLVM } from './LLVM';

export abstract class LLVM_Win32 extends LLVM {
  get useLldLink() {
    return false;
  }
  get ld() {
    if (this.useLldLink) return 'lld-link';
    return super.ld;
  }
  get sh() {
    if (this.useLldLink) return 'lld-link';
    return super.sh;
  }
  get libs() {
    if (this.useLldLink) return [...super.libs, 'libcmt'];
    return super.libs;
  }
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
      ...super.sysIncludedirs,
      `${this.MSVC_PATH}/include`,
      `${this.MSVC_PATH}/atlmfc/include`,
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
      `${this.MSVC_PATH}/atlmfc/lib/${dir}`,
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
      `-D_MSC_VER=${this.MSVC_VERSION}`,
    ];
    if (this.type === 'executable')
      flags.push('-fvisibility=hidden  -fvisibility-inlines-hidden');
    return flags;
  }

  get executableOutSuffix() {
    return '.exe';
  }
  get ldflags() {
    if (this.useLldLink) return [];
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
    if (this.useLldLink) return ['/DLL'];
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

  async buildShared(objFiles: string[], distFile: string) {
    if (!this.useLldLink) return super.buildShared(objFiles, distFile);
    const linker = this.prefix + this.sh;
    return [
      `rule ${this.constructor.name}_SH`,
      `  command = ${[
        linker,
        ...this.linkdirs.map((x) => `/libpath:${quote(x)}`),
        ...this.libs.map(
          (x: any) =>
            `${typeof x === 'string' ? x : new x().outputFileBasename}.lib`
        ),
        ...this.shflags,
      ].join(' ')} $in /out:$out`,
      '',
      `build ${distFile}: ${this.constructor.name}_SH ${objFiles.join(' ')}`,
    ].join('\n');
  }

  async buildExecutable(objFiles: string[], distFile: string) {
    if (!this.useLldLink) return super.buildExecutable(objFiles, distFile);
    const linker = this.prefix + this.sh;
    return [
      `rule ${this.constructor.name}_LD`,
      `  command = ${[
        linker,
        ...this.linkdirs.map((x) => `/libpath:${quote(x)}`),
        ...this.libs.map(
          (x: any) =>
            `${typeof x === 'string' ? x : new x().outputFileBasename}.lib`
        ),
        ...this.ldflags,
      ].join(' ')} $in /out:$out`,
      '',
      `build ${distFile}: ${this.constructor.name}_LD ${objFiles.join(' ')}`,
    ].join('\n');
  }
}
