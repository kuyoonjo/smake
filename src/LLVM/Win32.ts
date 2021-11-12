import { rmSync } from 'fs';
import { join } from '../join';
import { property } from '../property';
import { quote } from '../quote';
import { LLVM } from './LLVM';

export class LLVM_Win32 extends LLVM {
  useLldLink = false;

  @property({
    get: self => {
      if (self._ld) return self._ld;
      if (self.useLldLink) return 'lld-link';
      return self.superLd;
    }
  }) ld!: string;
  get superLd() {
    return super.ld;
  }

  @property({
    get: self => {
      if (self._sh) return self._sh;
      if (self.useLldLink) return 'lld-link';
      return self.superSh;
    }
  }) sh!: string;
  get superSh() {
    return super.sh;
  }

  @property({
    get: self => {
      if (self._libs) return self._libs;
      if (self.useLldLink) return [...self.superLibs, 'libcmt'];
      return self.superLibs;
    }
  }) libs!: string[];
  get superLibs() {
    return super.libs;
  }

  MSVC_VERSION = process.env.SMAKE_LLVM_MSVC_VERSION;
  MSVC_PATH = process.env.SMAKE_LLVM_MSVC_PATH;
  WINDOWS_KITS_10_PATH = process.env.SMAKE_LLVM_WINDOWS_KITS_10_PATH;
  WINDOWS_KITS_10_VERSION = process.env.SMAKE_LLVM_WINDOWS_KITS_10_VERSION;

  @property({
    get: (self) => self._target.split('-')[0],
    set: (self, _, value) => {
      self.target = value + '-pc-windows-msvc';
    },
  })
  arch: 'x86_64' | 'i386' = 'x86_64';
  @property()
  target!: 'x86_64-pc-windows-msvc' | 'i386-pc-windows-msvc';

  @property({
    get: self => {
      if (self._sysIncludedirs) return self._sysIncludedirs;
      return [
        ...self.superSysIncludedirs,
        `${self.MSVC_PATH}/include`,
        `${self.MSVC_PATH}/atlmfc/include`,
        `${self.WINDOWS_KITS_10_PATH}/Include/${self.WINDOWS_KITS_10_VERSION}/ucrt`,
        `${self.WINDOWS_KITS_10_PATH}/Include/${self.WINDOWS_KITS_10_VERSION}/um`,
        `${self.WINDOWS_KITS_10_PATH}/Include/${self.WINDOWS_KITS_10_VERSION}/shared`,
      ];
    }
  }) sysIncludedirs!: string[];
  get superSysIncludedirs() {
    return super.sysIncludedirs;
  }
  @property({
    get: self => {
      if (self._linkdirs) return self._linkdirs;
      const dir = self.arch === 'x86_64' ? 'x64' : 'x86';
      return [
        ...self.superLinkdirs,
        `${self.MSVC_PATH}/lib/${dir}`,
        `${self.MSVC_PATH}/atlmfc/lib/${dir}`,
        `${self.WINDOWS_KITS_10_PATH}/Lib/${self.WINDOWS_KITS_10_VERSION}/ucrt/${dir}`,
        `${self.WINDOWS_KITS_10_PATH}/Lib/${self.WINDOWS_KITS_10_VERSION}/um/${dir}`,
      ];
    }
  }) linkdirs!: string[];
  get superLinkdirs() {
    const dir = this.arch === 'x86_64' ? 'x64' : 'x86';
    return [
      ...super.linkdirs,
      `${this.MSVC_PATH}/lib/${dir}`,
      `${this.MSVC_PATH}/atlmfc/lib/${dir}`,
      `${this.WINDOWS_KITS_10_PATH}/Lib/${this.WINDOWS_KITS_10_VERSION}/ucrt/${dir}`,
      `${this.WINDOWS_KITS_10_PATH}/Lib/${this.WINDOWS_KITS_10_VERSION}/um/${dir}`,
    ];
  }

  @property({
    get: self => {
      if (self._cxflags) return self._cxflags;
      const mflag = self.arch === 'x86_64' ? '-m64' : '-m32';
      const flags = [
        mflag,
        '-Qunused-arguments',
        `-fmsc-version=${self.MSVC_VERSION}`,
        '-fms-extensions',
        '-fms-compatibility',
        '-fdelayed-template-parsing',
        '-DWIN32',
        '-D_WINDOWS',
        `-D_MSC_VER=${self.MSVC_VERSION}`,
      ];
      if (self.type === 'executable')
        flags.push('-fvisibility=hidden  -fvisibility-inlines-hidden');
      return flags;
    }
  })
  cxflags!: string[];

  lldLinkDebugFlags = process.argv.includes('--debug') ? ' /DEBUG' : '';
  executableOutSuffix = '.exe';

  @property({
    get: self => {
      if (self._ldflags) return self._ldflags;
      if (self.useLldLink) return [];
      const mflag = self.arch === 'x86_64' ? '-m64' : '-m32';
      const flags = ['-fuse-ld=lld', `-target ${self.target}`, mflag];
      return flags;
    }
  })
  ldflags!: string[];

  sharedOutPrefix = '';
  sharedOutSuffix = '.dll';

  @property({
    get: self => {
      if (self._shflags) return self._shflags;
      if (self.useLldLink) return ['/DLL'];
      const mflag = self.arch === 'x86_64' ? '-m64' : '-m32';
      const flags = ['-shared', '-fuse-ld=lld', `-target ${self.target}`, mflag];
      return flags;
    }
  })
  shflags!: string[];

  staticOutPrefix = '';
  staticOutSuffix = '.lib';

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
      ].join(' ') + this.lldLinkDebugFlags
      } $in /out:$out`,
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
      ].join(' ') + this.lldLinkDebugFlags
      } $in /out:$out`,
      '',
      `build ${distFile}: ${this.constructor.name}_LD ${objFiles.join(' ')}`,
    ].join('\n');
  }
}
