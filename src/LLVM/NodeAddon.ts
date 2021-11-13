import { LLVM } from './LLVM';
import {
  NODEJS_CACHE_DIR,
  downloadNodejs,
  ATOM_SHELL_CACHE_DIR,
} from '../downloadNodejs';
import { join } from '../join';
import { relative } from 'path';
import { quote } from '../quote';
import { SMAKE_LIB_PATH } from '../Toolchain';

export class NodeAddon extends LLVM {
  NODE_VERSION = process.version;
  NODE_TYPE = 'nodejs';
  get type() {
    return 'shared' as any;
  }
  protected _sharedOutPrefix = '';
  protected _sharedOutSuffix = '.node';
  useLldLink = true;

  get cxflags() {
    if (this._cxflags === undefined) {
      switch (this.platform) {
        case 'darwin':
          return [
            '-Qunused-arguments',
            '-Daddon_EXPORTS',
            '-D_DARWIN_USE_64_BIT_INODE=1',
            '-D_LARGEFILE_SOURCE',
            '-D_FILE_OFFSET_BITS=64',
            '-DBUILDING_NODE_EXTENSION',
            '-O3',
            '-fPIC',
            '-DNDEBUG',
          ];
        case 'linux':
          return [
            `--sysroot ${this.sysroot}`,
            '-Qunused-arguments',
            '-Daddon_EXPORTS',
            '-O3',
            '-fPIC',
            '-DNDEBUG',
          ];
        case 'win32':
          return [...super.cxflags, '-Daddon_EXPORTS', '-DNDEBUG'];
        default:
          return super.cxflags;
      }
    }
    return this._cxflags;
  }

  get shflags() {
    if (this._shflags === undefined) {
      switch (this.platform) {
        case 'darwin':
          return [
            `-target ${this.target}`,
            '-fPIC',
            `-install_name @rpath/${this.outputFilename}`,
            '-D_DARWIN_USE_64_BIT_INODE=1',
            '-D_LARGEFILE_SOURCE',
            '-D_FILE_OFFSET_BITS=64',
            '-DBUILDING_NODE_EXTENSION',
            '-O3',
            '-DNDEBUG',
            '-dynamiclib',
            '-Wl,-headerpad_max_install_names',
            '-undefined',
            'dynamic_lookup',
          ];
        case 'win32':
          return ['/DLL', '/DELAYLOAD:NODE.EXE'];
        default:
          return super.shflags;
      }
    }
    return this._shflags;
  }

  get includedirs() {
    if (this._includedirs === undefined) {
      let cacheDir: string;
      switch (this.NODE_TYPE) {
        case 'electron':
          cacheDir = join(ATOM_SHELL_CACHE_DIR, this.NODE_VERSION);
          break;
        default:
          cacheDir = join(NODEJS_CACHE_DIR, this.NODE_VERSION);
      }
      return [...super.includedirs, `${cacheDir}/include/node`];
    }
    return this._includedirs;
  }
  set includedirs(v) {
    this._includedirs = v;
  }

  get linkdirs() {
    if (this._linkdirs === undefined) {
      switch (this.platform) {
        case 'win32':
          let cacheDir: string;
          switch (this.NODE_TYPE) {
            case 'electron':
              cacheDir = join(ATOM_SHELL_CACHE_DIR, this.NODE_VERSION);
              break;
            default:
              cacheDir = join(NODEJS_CACHE_DIR, this.NODE_VERSION);
          }
          return [
            ...super.linkdirs,
            `${cacheDir}/lib/${
              this.target.startsWith('x86_64') ? 'win-x64' : 'win-x86'
            }`,
          ];
        default:
          return super.linkdirs;
      }
    }
    return this._linkdirs;
  }
  set linkdirs(v) {
    this._linkdirs = v;
  }

  get libs() {
    if (this._libs === undefined) {
      switch (this.platform) {
        case 'win32':
          return [
            ...super.libs,
            'node',
            'libcmt',
            'kernel32',
            'user32',
            'gdi32',
            'winspool',
            'shell32',
            'ole32',
            'oleaut32',
            'uuid',
            'comdlg32',
            'advapi32',
            'delayimp',
          ];
        default:
          return super.libs;
      }
    }
    return this._libs;
  }
  set libs(v) {
    this._libs = v;
  }

  async generateCommands(first: boolean, last: boolean) {
    await downloadNodejs(this.NODE_TYPE, this.NODE_VERSION);
    return super.generateCommands(first, last);
  }

  async buildObjs() {
    if (this.platform !== 'win32') return super.buildObjs();
    const outDir = join(this.buildDir, this.cacheDirname, this.objOutDirname);

    const res = [
      ...this.files,
      `${relative(process.cwd(), SMAKE_LIB_PATH).replace(
        /\\/g,
        '/'
      )}/win_delay_load_hook.cc`,
    ].map((f) => {
      const out = join(outDir, f.replace(/\.\./g, '_') + this.objOutSuffix);
      return {
        cmd: `build ${out}: _${this.isCFile(f) ? 'CC' : 'CXX'} ${f}`,
        out,
      };
    });
    const cmd = res.map((x) => x.cmd).join('\n');
    const outs = res.map((x) => x.out);
    return { cmd, outs };
  }

  async buildShared(objFiles: string[], distFile: string) {
    if (this.platform !== 'win32') return super.buildShared(objFiles, distFile);
    const linker = this.prefix + this.sh;
    return [
      `rule _SH`,
      `  command = ${
        [
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
      `build ${distFile}: _SH ${objFiles.join(' ')}`,
    ].join('\n');
  }
}
