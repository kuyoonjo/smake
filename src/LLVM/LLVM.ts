import { execSync } from 'child_process';
import { magenta } from 'colors/safe';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { homedir } from '../homedir';
import { join } from '../join';
import { property } from '../property';
import { quote } from '../quote';
import { ICommand, Toolchain } from '../Toolchain';

const PREBUILD_DIR = homedir() + '/.conan-prebuild';

export class LLVM extends Toolchain {
  files: string[] = [];
  private static __compdb = [];

  target = '';
  type: 'executable' | 'shared' | 'static' = 'executable';

  prefix = process.env.SMAKE_LLVM_PREFIX || '';
  cxx = 'clang++';
  cc = 'clang';
  ld = 'clang++';
  sh = 'clang++';
  ar = 'llvm-ar';

  useClangHeaders = false;

  includedirs: string[] = [];

  @property({
    get: (self, key) => {
      if (self.useClangHeaders && process.env.SMAKE_LLVM_CLANG_PATH)
        return [process.env.SMAKE_LLVM_CLANG_PATH + '/include', ...self[key]];
      return self[key];
    }
  })
  sysIncludedirs: string[] = [];
  linkdirs: string[] = [this.buildDir];
  libs: Array<string | LLVM> = [];
  cflags: string[] = [];
  cxxflags: string[] = [];
  asmflags: string[] = [];
  cxflags: string[] = [];
  ldflags: string[] = [];
  shflags: string[] = [];
  arflags: string[] = [];
  arobjs: string[] = [];

  debugFlags = process.argv.includes('--debug') ? ' -g' : '';

  objOutDirname = 'objs';
  objOutSuffix = '.o';
  executableOutPrefix = '';
  executableOutSuffix = '';
  sharedOutPrefix = 'lib';
  sharedOutSuffix = '.so';
  staticOutPrefix = 'lib';
  staticOutSuffix = '.a';

  outputFileBasename = this.id;

  @property({
    get: self => {
      if (self._outputFilename) return self._outputFilename;
      switch (self.type) {
        case 'executable':
          return (
            self.executableOutPrefix +
            self.outputFileBasename +
            self.executableOutSuffix
          );
        case 'shared':
          return (
            self.sharedOutPrefix + self.outputFileBasename + self.sharedOutSuffix
          );
        case 'static':
          return (
            self.staticOutPrefix + self.outputFileBasename + self.staticOutSuffix
          );
      }
    }
  })
  outputFilename!: string;

  @property({
    get: self => {
      if (self._outputPath) return self._outputPath;
      return join(self.buildDir, self.outputFilename);
    }
  })
  outputPath!: string;

  @property({
    get: self => {
      if (self._ninjaFilePath) return self._ninjaFilePath;
      return join(self.buildDir, self.id + '.ninja');
    }
  })
  ninjaFilePath!: string;

  compdbFilePath = 'compile_commands.json';

  cFileExts = ['.c'];
  cxxFileExts = ['.cc', '.cpp', '.cxx', '.C'];
  asmFileExts = ['.s', '.S', '.asm'];

  isCFile(f: string) {
    for (const ext of this.cFileExts)
      if (f.endsWith(ext))
        return true;
    return false;
  }

  isCXXFile(f: string) {
    for (const ext of this.cxxFileExts)
      if (f.endsWith(ext))
        return true;
    return false;
  }

  isASMFile(f: string) {
    for (const ext of this.asmFileExts)
      if (f.endsWith(ext))
        return true;
    return false;
  }

  async generateCommands(first: boolean, last: boolean): Promise<ICommand[]> {
    const { cmd, outs } = await this.buildObjs();
    const content = [
      await this.buildCCRules(),
      await this.buildCXXRules(),
      await this.buildASMRules(),
      cmd,
    ];
    switch (this.type) {
      case 'executable':
        content.push(await this.buildExecutable(outs, this.outputPath));
        break;
      case 'shared':
        content.push(await this.buildShared(outs, this.outputPath));
        break;
      case 'static':
        content.push(await this.buildStatic(outs, this.outputPath));
        break;
    }

    content.push('');
    return [
      {
        label: magenta(`Generating build.ninja for ${this.id}`),
        cmd: '',
        fn: async () => {
          mkdirSync(this.buildDir, { recursive: true });
          writeFileSync(this.ninjaFilePath, content.join('\n'));
        },
      },
      process.argv.includes('--compdb')
        ? {
          label: magenta(`Compdb ${this.id}`),
          cmd: '',
          fn: async () => {
            try {
              let cmd = `ninja -f ${this.ninjaFilePath} -t compdb`;
              const json = execSync(cmd).toString();
              const arr = JSON.parse(json);
              if (first) LLVM.__compdb = [];
              LLVM.__compdb = LLVM.__compdb.concat(arr);
              if (last)
                writeFileSync(
                  this.compdbFilePath,
                  JSON.stringify(LLVM.__compdb, null, 2)
                );
            } catch {
              throw '';
            }
          },
        }
        : {
          label: magenta(`Building ${this.id}`),
          cmd: '',
          fn: async () => {
            try {
              let cmd = `ninja -f ${this.ninjaFilePath}`;
              if (process.argv.includes('--verbose')) cmd += ' --verbose';
              execSync(cmd, {
                stdio: 'inherit',
              });
            } catch {
              throw '';
            }
          },
        },
    ];
  }

  async buildCCRules() {
    let compiler = this.prefix + this.cc;
    if (this.target) compiler += ` -target ${this.target}`;
    const flags =
      [
        ...this.sysIncludedirs.map((x) => `-isystem ${quote(x)}`),
        ...this.includedirs.map((x) => `-I${quote(x)}`),
        ...this.cflags,
        ...this.cxflags,
      ].join(' ') + this.debugFlags;
    return [
      `rule ${this.id}_CC`,
      '  depfile = $out.d',
      `  command = ${compiler} -MD -MF $out.d ${flags} -c $in -o $out`,
    ].join('\n');
  }

  async buildCXXRules() {
    let compiler = this.prefix + this.cxx;
    if (this.target) compiler += ` -target ${this.target}`;
    const flags =
      [
        ...this.sysIncludedirs.map((x) => `-isystem ${quote(x)}`),
        ...this.includedirs.map((x) => `-I${quote(x)}`),
        ...this.cxxflags,
        ...this.cxflags,
      ].join(' ') + this.debugFlags;

    return [
      `rule ${this.id}_CXX`,
      '  depfile = $out.d',
      `  command = ${compiler} -MD -MF $out.d ${flags} -c $in -o $out`,
    ].join('\n');
  }

  async buildASMRules() {
    let compiler = this.prefix + this.cc;
    if (this.target) compiler += ` -target ${this.target}`;
    const flags =
      [
        ...this.sysIncludedirs.map((x) => `-isystem ${quote(x)}`),
        ...this.includedirs.map((x) => `-I${quote(x)}`),
        ...this.cflags,
        ...this.asmflags,
      ].join(' ') + this.debugFlags;
    return [
      `rule ${this.id}_ASM`,
      '  depfile = $out.d',
      `  command = ${compiler} -MD -MF $out.d ${flags} -c $in -o $out`,
    ].join('\n');
  }

  async buildObjs() {
    const outDir = join(this.buildDir, this.cacheDirname, this.objOutDirname);

    const res = this.files.map((f) => {
      const out = join(outDir, f.replace(/\.\./g, '_') + this.objOutSuffix);
      return {
        cmd: `build ${out}: ${this.id}_${this.isCXXFile(f) ? 'CXX' : this.isASMFile(f) ? 'ASM' : 'CC'
          } ${f}`,
        out,
      };
    });
    const cmd = res.map((x) => x.cmd).join('\n');
    const outs = res.map((x) => x.out);
    return { cmd, outs };
  }

  async buildExecutable(objFiles: string[], distFile: string) {
    const linker = this.prefix + this.ld;
    return [
      `rule ${this.id}_LD`,
      `  command = ${[
        linker,
        ...this.linkdirs.map((x) => `-L${quote(x)}`),
        ...this.libs.map(
          (x: any) =>
            `-l${typeof x === 'string' ? x : new x().outputFileBasename}`
        ),
        ...this.ldflags,
      ].join(' ') + this.debugFlags
      } $in -o $out`,
      '',
      `build ${distFile}: ${this.id}_LD ${objFiles.join(' ')}`,
    ].join('\n');
  }

  async buildShared(objFiles: string[], distFile: string) {
    const linker = this.prefix + this.sh;
    return [
      `rule ${this.id}_SH`,
      `  command = ${[
        linker,
        ...this.linkdirs.map((x) => `-L${quote(x)}`),
        ...this.libs.map(
          (x: any) =>
            `-l${typeof x === 'string' ? x : new x().outputFileBasename}`
        ),
        ...this.shflags,
        '-shared',
      ].join(' ') + this.debugFlags
      } $in -o $out`,
      '',
      `build ${distFile}: ${this.id}_SH ${objFiles.join(' ')}`,
    ].join('\n');
  }

  async buildStatic(objFiles: string[], distFile: string) {
    const linker = this.prefix + this.ar;
    return [
      `rule ${this.id}_AR`,
      `  command = ${[linker, ...this.arflags].join(
        ' '
      )} crs $out $in ${this.arobjs.join(' ')}`,
      '',
      `build ${distFile}: ${this.id}_AR ${objFiles.join(' ')}`,
    ].join('\n');
  }

  async clean() {
    await super.clean();
    rmSync(this.outputPath, {
      force: true,
    });
    rmSync(this.ninjaFilePath, {
      force: true,
    });
  }

  addPrebuild(lib: string, version: string) {
    const dir = this.target.includes('windows')
      ? this.target + '-MT'
      : this.target;
    const pDir = join(PREBUILD_DIR, lib, version);
    const incDir = join(pDir, dir, 'include');
    const libDir = join(pDir, dir, 'lib');
    if (existsSync(incDir))
      Object.defineProperty(this, 'includedirs', {
        value: [...this.includedirs, incDir],
      });
    if (existsSync(libDir))
      Object.defineProperty(this, 'linkdirs', {
        value: [...this.linkdirs, incDir],
      });
  }
}
