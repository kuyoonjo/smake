import { relative } from 'path';
import {
  NODEJS_CACHE_DIR,
  downloadNodejs,
  ATOM_SHELL_CACHE_DIR,
} from '../downloadNodejs';
import { join } from '../join';
import { LLVM_Win32 } from '../LLVM/Win32';
import { quote } from '../quote';
import { SMAKE_LIB_PATH } from '../Toolchain';

export abstract class NODE_ADDON_Win32 extends LLVM_Win32 {
  get NODE_VERSION() {
    return process.version;
  }
  get NODE_TYPE() {
    return 'nodejs';
  }
  get type() {
    return 'shared' as any;
  }
  get name() {
    return 'Win32 Node Addon Builder';
  }

  get sh() {
    return 'lld-link';
  }

  get cxflags() {
    const flags = [...super.cxflags, '-Daddon_EXPORTS', '-DNDEBUG'];
    return flags;
  }

  get sharedOutPrefix() {
    return '';
  }
  get sharedOutSuffix() {
    return '.node';
  }
  get shflags() {
    // 'C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\VC\Tools\MSVC\14.26.28801\bin\HostX64\x64\link.exe /ERR
    // ORREPORT:QUEUE /OUT:"C:\Users\yuche\Projects\napiTest\build\Debug\addon.node" /INCREMENTAL /NOLOGO "C:\Users\yuche\.c
    // make-js\node-x64\v12.16.0\win-x64\node.lib" kernel32.lib user32.lib gdi32.lib winspool.lib shell32.lib ole32.lib olea
    // ut32.lib uuid.lib comdlg32.lib advapi32.lib Delayimp.lib /DELAYLOAD:NODE.EXE /MANIFEST /MANIFESTUAC:"level='asInvoker
    // ' uiAccess='false'" /manifest:embed /DEBUG /PDB:"C:/Users/yuche/Projects/napiTest/build/Debug/addon.pdb" /SUBSYSTEM:C
    // ONSOLE /TLBID:1 /DYNAMICBASE /NXCOMPAT /IMPLIB:"C:/Users/yuche/Projects/napiTest/build/Debug/addon.lib" /MACHINE:X64
    // /DLL addon.dir\Debug\Greeter.obj
    // addon.dir\Debug\addon.obj
    // addon.dir\Debug\win_delay_load_hook.obj'
    const flags = ['/DLL', '/DELAYLOAD:NODE.EXE'];
    return flags;
  }

  get includedirs() {
    let cacheDir: string;
    switch (this.NODE_TYPE) {
      case 'electron':
        cacheDir = join(ATOM_SHELL_CACHE_DIR, this.NODE_VERSION);
        break;
      default:
        cacheDir = join(NODEJS_CACHE_DIR, this.NODE_VERSION);
    }
    return super.includedirs.concat([`${cacheDir}/include/node`]);
  }

  get linkdirs() {
    let cacheDir: string;
    switch (this.NODE_TYPE) {
      case 'electron':
        cacheDir = join(ATOM_SHELL_CACHE_DIR, this.NODE_VERSION);
        break;
      default:
        cacheDir = join(NODEJS_CACHE_DIR, this.NODE_VERSION);
    }
    return super.linkdirs.concat([
      `${cacheDir}/lib/${this.ARCH === 'x86_64' ? 'win-x64' : 'win-x86'}`,
    ]);
  }

  get libs() {
    return super.libs.concat([
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
    ]);
  }

  async generateCommands(first: boolean, last: boolean) {
    await downloadNodejs(this.NODE_TYPE, this.NODE_VERSION);
    return super.generateCommands(first, last);
  }

  async buildObjs() {
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
        cmd: `build ${out}: ${this.constructor.name}_${
          this.isCFile(f) ? 'CC' : 'CXX'
        } ${f}`,
        out,
      };
    });
    const cmd = res.map((x) => x.cmd).join('\n');
    const outs = res.map((x) => x.out);
    return { cmd, outs };
  }

  async buildShared(objFiles: string[], distFile: string) {
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
}
